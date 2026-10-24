import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  chmodSync, closeSync, linkSync, mkdirSync, mkdtempSync, openSync,
  readFileSync, readdirSync, rmSync, statSync, symlinkSync, unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./store.mjs', import.meta.url));

function fixture(t, { homeInRepo = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'record-decision-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const repo = join(directory, 'repo');
  mkdirSync(repo);
  const home = join(homeInRepo ? repo : directory, 'home');
  mkdirSync(home, { mode: 0o700 });
  const env = { ...process.env, HOME: home };
  const init = spawnSync('git', ['init', '--quiet', repo], { env });
  assert.equal(init.status, 0);

  function run(command, input, cwd = repo) {
    const result = spawnSync(process.execPath, [script, ...command], {
      cwd,
      env,
      input: input === undefined ? undefined : JSON.stringify(input),
      encoding: 'utf8',
    });
    return {
      status: result.status,
      output: JSON.parse(result.stdout || result.stderr),
    };
  }

  function runAsync(command, input) {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script, ...command], {
        cwd: repo, env, stdio: ['pipe', 'pipe', 'pipe'],
      });
      let output = '';
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.on('error', reject);
      child.on('close', (status) => {
        resolve({ status, output: JSON.parse(output) });
      });
      child.stdin.on('error', reject);
      child.stdin.end(JSON.stringify(input));
    });
  }

  return { directory, home, repo, env, run, runAsync };
}

test('初回の参照は空の一覧を返し、保存先を作らない', (t) => {
  const { home, run } = fixture(t);
  assert.deepEqual(run(['list']), {
    status: 0,
    output: { version: null, records: [] },
  });
  assert.deepEqual(readdirSync(home), []);
});

function decision(title = '読み込み失敗の扱い') {
  return {
    title,
    decision: '失敗は戻り値で返す',
    reason: '呼び出し側で失敗を扱えるようにする',
    alternatives: '例外',
    scope: '読み込み API',
    reconsiderWhen: '呼び出し側の要件が変わったとき',
    source: '今回の会話で合意',
  };
}

test('保存した判断を一覧から選び、理由と適用範囲を読み返せる', (t) => {
  const { run } = fixture(t);
  const record = decision();
  const saved = run(['save'], { expectedVersion: null, record });
  assert.equal(saved.status, 0);
  assert.match(saved.output.version, /^[a-f0-9]{64}$/);
  const { id } = saved.output;
  const listed = run(['list']);
  assert.equal(listed.status, 0);
  assert.deepEqual(listed.output.records, [{
    id, title: record.title, scope: record.scope, status: '採用',
  }]);
  const read = run(['read', id]);
  assert.equal(read.status, 0);
  for (const [key, value] of Object.entries(record)) {
    assert.equal(read.output.record[key], value);
  }
  assert.equal(read.output.version, saved.output.version);
});

test('読んだ後に記録が変わったら、保存せず競合を返す', (t) => {
  const { run } = fixture(t);
  const first = run(['save'], {
    expectedVersion: null, record: decision('最初の判断'),
  }).output;
  const request = {
    expectedVersion: first.version, record: decision('次の判断'),
  };
  assert.equal(run(['save'], request).status, 0);
  const before = run(['list']).output;
  assert.deepEqual(run(['save'], request), {
    status: 3, output: { error: 'CONFLICT' },
  });
  assert.deepEqual(run(['list']).output, before);
});

test('更新中の記録は別プロセスから読み書きできない', (t) => {
  const { home, run } = fixture(t);
  const first = run(['save'], {
    expectedVersion: null, record: decision(),
  }).output;
  const base = join(home, '.local', 'state', 'record-decision');
  const directory = join(base, readdirSync(base)[0]);
  const lock = openSync(join(directory, '.lock'), 'a+', 0o600);
  try {
    const acquired = spawnSync('flock', ['--exclusive', '3'], {
      stdio: ['ignore', 'pipe', 'pipe', lock],
    });
    assert.equal(acquired.status, 0);
    const busy = { status: 4, output: { error: 'BUSY' } };
    assert.deepEqual(run(['save'], {
      expectedVersion: first.version, record: decision('別の判断'),
    }), busy);
    assert.deepEqual(run(['list']), busy);
  } finally {
    closeSync(lock);
  }
  assert.equal(run(['list']).output.version, first.version);
});

test('同じ判断への並列置換は片方だけ保存される', async (t) => {
  const { run, runAsync } = fixture(t);
  const first = run(['save'], {
    expectedVersion: null, record: decision('元の判断'),
  }).output;
  const results = await Promise.all(['案 A', '案 B'].map((title) =>
    runAsync(['replace'], {
      expectedVersion: first.version, id: first.id,
      record: decision(title),
    })));
  assert.equal(results.filter(({ status }) => status === 0).length, 1);
  assert.equal(results.filter(({ status }) => [3, 4].includes(status))
    .length, 1);
  const winner = results.find(({ status }) => status === 0).output;
  const records = run(['list']).output.records;
  assert.equal(records.length, 2);
  assert.deepEqual(records.map(({ status }) => status).sort(),
    ['採用', '置換済み'].sort());
  const original = run(['read', first.id]).output.record;
  assert.equal(original.replacedBy, winner.id);
  const replacement = run(['read', winner.id]).output.record;
  assert.equal(replacement.replaces, first.id);
});

test('誤記の訂正は元の内容を履歴に残す', (t) => {
  const { run } = fixture(t);
  const content = decision();
  const saved = run(['save'], {
    expectedVersion: null, record: content,
  }).output;
  const corrected = run(['correct'], {
    expectedVersion: saved.version, id: saved.id,
    record: { ...content, reason: '訂正後の理由' },
  });
  assert.equal(corrected.status, 0);
  assert.equal(corrected.output.id, saved.id);
  const record = run(['read', saved.id]).output.record;
  assert.equal(record.reason, '訂正後の理由');
  assert.equal(record.scope, content.scope);
  assert.equal(record.status, '採用');
  assert.deepEqual(record.history[0].previous, { reason: content.reason });
});

test('撤回した判断と理由を残し、採用中の判断として置換しない', (t) => {
  const { run } = fixture(t);
  const original = decision();
  const saved = run(['save'], {
    expectedVersion: null, record: original,
  }).output;
  const retracted = run(['retract'], {
    expectedVersion: saved.version, id: saved.id,
    reason: '前提が変わったため',
  });
  assert.equal(retracted.status, 0);
  const record = run(['read', saved.id]).output.record;
  assert.equal(record.status, '撤回済み');
  assert.equal(record.decision, original.decision);
  assert.equal(record.history[0].reason, '前提が変わったため');
  assert.deepEqual(run(['replace'], {
    expectedVersion: retracted.output.version, id: saved.id,
    record: decision('新しい判断'),
  }), { status: 1, output: { error: 'INACTIVE_RECORD' } });
  assert.equal(run(['list']).output.version, retracted.output.version);
});

test('保存先が Git 作業ツリー内なら何も作らず拒否する', (t) => {
  const { home, run } = fixture(t, { homeInRepo: true });
  assert.deepEqual(run(['save'], {
    expectedVersion: null, record: decision(),
  }), { status: 1, output: { error: 'UNSAFE_LOCATION' } });
  assert.deepEqual(readdirSync(home), []);
});

test('Git の探索範囲が制限されていても保存先の検査は省略しない', (t) => {
  const { home, repo, env, run } = fixture(t, { homeInRepo: true });
  env.GIT_CEILING_DIRECTORIES = repo;
  assert.deepEqual(run(['save'], {
    expectedVersion: null, record: decision(),
  }), { status: 1, output: { error: 'UNSAFE_LOCATION' } });
  assert.deepEqual(readdirSync(home), []);
});

test('記録は本人だけがアクセスでき、権限が緩まったら利用しない', (t) => {
  const { home, run } = fixture(t);
  run(['save'], { expectedVersion: null, record: decision() });
  const base = join(home, '.local', 'state', 'record-decision');
  const directory = join(base, readdirSync(base)[0]);
  const file = join(directory, 'records.json');
  assert.equal(statSync(base).mode & 0o777, 0o700);
  assert.equal(statSync(directory).mode & 0o777, 0o700);
  assert.equal(statSync(file).mode & 0o777, 0o600);
  assert.equal(statSync(join(directory, '.lock')).mode & 0o777, 0o600);
  for (const path of [base, directory, file, join(directory, '.lock')]) {
    const mode = statSync(path).mode & 0o777;
    chmodSync(path, mode | 0o044);
    assert.deepEqual(run(['list']), {
      status: 1, output: { error: 'UNSAFE_STORAGE' },
    });
    chmodSync(path, mode);
  }
});

test('親の 0755 は許容し、他者が書き込める親からは読み書きしない', (t) => {
  const { home, run } = fixture(t);
  const local = join(home, '.local');
  const state = join(local, 'state');
  chmodSync(home, 0o755);
  mkdirSync(local, { mode: 0o755 });
  mkdirSync(state, { mode: 0o755 });
  const saved = run(['save'], {
    expectedVersion: null, record: decision(),
  });
  assert.equal(saved.status, 0);
  const base = join(state, 'record-decision');
  const file = join(base, readdirSync(base)[0], 'records.json');
  const before = readFileSync(file, 'utf8');
  const error = { status: 1, output: { error: 'UNSAFE_STORAGE' } };
  for (const parent of [home, local, state]) {
    for (const mode of [0o775, 0o757]) {
      chmodSync(parent, mode);
      assert.deepEqual(run(['list']), error);
      assert.deepEqual(run(['save'], {
        expectedVersion: saved.output.version,
        record: decision('別の判断'),
      }), error);
      assert.equal(readFileSync(file, 'utf8'), before);
      chmodSync(parent, 0o755);
    }
  }
  assert.equal(run(['list']).output.version, saved.output.version);
});

for (const name of ['records.json', '.lock']) {
  test(`${name} のリンクを欠損扱いせず拒否する`, (t) => {
    const { home, run } = fixture(t);
    run(['save'], { expectedVersion: null, record: decision() });
    const base = join(home, '.local', 'state', 'record-decision');
    const directory = join(base, readdirSync(base)[0]);
    const path = join(directory, name);
    unlinkSync(path);
    symlinkSync(join(directory, 'missing'), path);
    assert.deepEqual(run(['list']), {
      status: 1, output: { error: 'UNSAFE_STORAGE' },
    });
  });
}

for (const name of ['records.json', '.lock']) {
  test(`${name} が本人用領域外とハードリンクで共有されていたら拒否する`, (t) => {
    const { home, repo, run } = fixture(t);
    const saved = run(['save'], {
      expectedVersion: null, record: decision(),
    }).output;
    const base = join(home, '.local', 'state', 'record-decision');
    const file = join(base, readdirSync(base)[0], name);
    const before = readFileSync(file, 'utf8');
    const linked = join(repo, `linked-${name}`);
    linkSync(file, linked);
    assert.equal(statSync(file).nlink, 2);
    const error = { status: 1, output: { error: 'UNSAFE_STORAGE' } };
    assert.deepEqual(run(['list']), error);
    assert.deepEqual(run(['save'], {
      expectedVersion: saved.version, record: decision('別の判断'),
    }), error);
    assert.equal(readFileSync(file, 'utf8'), before);
    assert.equal(readFileSync(linked, 'utf8'), before);
  });
}

test('不正な保存依頼は保存先を作らず、入力内容も出力しない', (t) => {
  const { home, run } = fixture(t);
  const requests = [
    null,
    {},
    { expectedVersion: null, record: { title: '入力の印' } },
    { expectedVersion: '入力の印', record: decision() },
    { expectedVersion: null, record: { ...decision(), scope: [] } },
    { expectedVersion: null, record: { ...decision(), extra: '入力の印' } },
  ];
  for (const request of requests) {
    assert.deepEqual(run(['save'], request), {
      status: 1, output: { error: 'INVALID_INPUT' },
    });
    assert.deepEqual(readdirSync(home), []);
  }
  assert.deepEqual(run(['unknown']), {
    status: 1, output: { error: 'USAGE' },
  });
  assert.deepEqual(readdirSync(home), []);
});

test('壊れた記録や未対応の形式を空の記録として上書きしない', (t) => {
  const { home, run } = fixture(t);
  const saved = run(['save'], {
    expectedVersion: null, record: decision(),
  }).output;
  const base = join(home, '.local', 'state', 'record-decision');
  const file = join(base, readdirSync(base)[0], 'records.json');
  const invalid = [
    JSON.stringify({ schemaVersion: 2, records: [] }),
    JSON.stringify({ schemaVersion: 1, records: [{}] }),
    '{記録の印',
  ];
  for (const content of invalid) {
    writeFileSync(file, content);
    const error = { status: 1, output: { error: 'CORRUPT_STORE' } };
    assert.deepEqual(run(['list']), error);
    assert.deepEqual(run(['save'], {
      expectedVersion: saved.version, record: decision('別の判断'),
    }), error);
    assert.equal(readFileSync(file, 'utf8'), content);
  }
});
