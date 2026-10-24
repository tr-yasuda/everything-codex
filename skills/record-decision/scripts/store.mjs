import { execFileSync, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync, constants, fstatSync, lstatSync, mkdirSync,
  openSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

const contentFields = [
  'title', 'decision', 'reason', 'alternatives', 'scope',
  'reconsiderWhen', 'source',
];
const mutationCommands = ['save', 'replace', 'correct', 'retract'];

function objectWithAllowedKeys(value, keys) {
  return value !== null && typeof value === 'object'
    && !Array.isArray(value)
    && Object.keys(value).every((key) => keys.includes(key));
}

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseMutation(command) {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    throw new Error('INVALID_INPUT');
  }
  const keys = ['expectedVersion'];
  if (command !== 'save') keys.push('id');
  keys.push(command === 'retract' ? 'reason' : 'record');
  if (!objectWithAllowedKeys(input, keys)
    || !Object.hasOwn(input, 'expectedVersion')
    || (input.expectedVersion !== null
      && (typeof input.expectedVersion !== 'string'
        || !/^[a-f0-9]{64}$/.test(input.expectedVersion)))
    || (command !== 'save' && !nonemptyString(input.id))) {
    throw new Error('INVALID_INPUT');
  }
  if (command === 'retract') {
    input.reason ??= '記録なし';
    if (!nonemptyString(input.reason)) throw new Error('INVALID_INPUT');
  } else {
    if (!objectWithAllowedKeys(input.record, contentFields)) {
      throw new Error('INVALID_INPUT');
    }
    for (const key of ['reason', 'alternatives', 'reconsiderWhen']) {
      input.record[key] ??= '記録なし';
    }
    if (!contentFields.every((key) => nonemptyString(input.record[key]))) {
      throw new Error('INVALID_INPUT');
    }
  }
  return input;
}

function versionOf(content) {
  return createHash('sha256').update(content).digest('hex');
}

function metadataAt(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function storeDirectory() {
  const common = execFileSync('git', [
    'rev-parse', '--path-format=absolute', '--git-common-dir',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .replace(/\n$/, '');
  const id = versionOf(realpathSync(common));
  return join(realpathSync(process.env.HOME), '.local', 'state',
    'record-decision', id);
}

function assertOutsideGit(directory) {
  let existing = directory;
  while (!metadataAt(existing)) existing = dirname(existing);
  if (metadataAt(existing).isSymbolicLink()) {
    throw new Error('UNSAFE_STORAGE');
  }
  const env = { ...process.env, LC_ALL: 'C' };
  // Discovery overrides can hide a containing repository from this check.
  for (const key of Object.keys(env)) {
    if (key.startsWith('GIT_')) delete env[key];
  }
  env.GIT_OPTIONAL_LOCKS = '0';
  const location = spawnSync('git', [
    '-C', realpathSync(existing), 'rev-parse', '--absolute-git-dir',
  ], { env, encoding: 'utf8' });
  if (location.error) throw new Error('STORE_ERROR');
  if (location.status === 0
    || !location.stderr.includes('not a git repository')) {
    throw new Error('UNSAFE_LOCATION');
  }
}

function assertPrivate(metadata, directory) {
  const correctType = directory ? metadata.isDirectory() : metadata.isFile();
  if (!correctType || metadata.uid !== process.getuid()
    || (metadata.mode & 0o077) !== 0) {
    throw new Error('UNSAFE_STORAGE');
  }
}

function prepareDirectory(directory, readOnly) {
  assertOutsideGit(directory);
  const base = dirname(directory);
  const directories = [dirname(dirname(base)), dirname(base), base, directory];
  for (const path of directories) {
    if (!metadataAt(path)) {
      if (readOnly) return;
      try {
        mkdirSync(path, { mode: 0o700 });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
    const metadata = lstatSync(path);
    if (!metadata.isDirectory()) throw new Error('UNSAFE_STORAGE');
    if (path === base || path === directory) assertPrivate(metadata, true);
  }
}

function openPrivateFile(path, flags) {
  const metadata = metadataAt(path);
  if (metadata) assertPrivate(metadata, false);
  const descriptor = openSync(path, flags | constants.O_NOFOLLOW, 0o600);
  try {
    assertPrivate(fstatSync(descriptor), false);
    return descriptor;
  } catch (error) {
    closeSync(descriptor);
    throw error;
  }
}

function readStore(directory) {
  const path = join(directory, 'records.json');
  if (!metadataAt(path)) {
    return { version: null, records: [] };
  }
  const descriptor = openPrivateFile(path, constants.O_RDONLY);
  let content;
  try {
    content = readFileSync(descriptor, 'utf8');
  } finally {
    closeSync(descriptor);
  }
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('CORRUPT_STORE');
  }
  const statuses = ['採用', '置換済み', '撤回済み'];
  if (data?.schemaVersion !== 1 || !Array.isArray(data.records)
    || !data.records.every((record) => record
      && nonemptyString(record.id) && nonemptyString(record.recordedAt)
      && statuses.includes(record.status) && Array.isArray(record.history)
      && contentFields.every((key) => nonemptyString(record[key])))) {
    throw new Error('CORRUPT_STORE');
  }
  return {
    version: versionOf(content),
    records: data.records,
  };
}

function writeStore(directory, records) {
  const content = JSON.stringify({ schemaVersion: 1, records }, null, 2)
    + '\n';
  const temporary = join(directory, `.write-${randomUUID()}`);
  try {
    writeFileSync(temporary, content, {
      flag: 'wx', mode: 0o600, flush: true,
    });
    renameSync(temporary, join(directory, 'records.json'));
  } finally {
    rmSync(temporary, { force: true });
  }
  return versionOf(content);
}

function withLock(directory, readOnly, operation) {
  if (readOnly && !metadataAt(directory)) return operation();
  const flags = readOnly ? constants.O_RDONLY
    : constants.O_RDWR | constants.O_CREAT;
  const lock = openPrivateFile(join(directory, '.lock'), flags);
  try {
    // The inherited descriptor keeps the lock after flock exits. Closing it
    // before operation() would allow concurrent updates.
    const acquired = spawnSync('flock', [
      '--nonblock', '--conflict-exit-code', '75',
      readOnly ? '--shared' : '--exclusive', '3',
    ], { stdio: ['ignore', 'pipe', 'pipe', lock] });
    if (acquired.status === 75) throw new Error('BUSY');
    if (acquired.error || acquired.status !== 0) {
      throw new Error('LOCK_ERROR');
    }
    return operation();
  } finally {
    closeSync(lock);
  }
}

function newRecord(content) {
  return {
    ...Object.fromEntries(contentFields.map((key) => [key, content[key]])),
    id: randomUUID(),
    recordedAt: new Date().toISOString(),
    status: '採用',
    history: [],
  };
}

function requireRecord(records, id) {
  const record = records.find((item) => item.id === id);
  if (!record) throw new Error('NOT_FOUND');
  return record;
}

function execute(command, id, input, directory) {
  const snapshot = readStore(directory);
  if (command === 'list') {
    return {
      version: snapshot.version,
      records: snapshot.records.map(({ id, title, scope, status }) =>
        ({ id, title, scope, status })),
    };
  }
  if (command === 'read') {
    const record = requireRecord(snapshot.records, id);
    return { version: snapshot.version, record };
  }
  if (input.expectedVersion !== snapshot.version) {
    throw new Error('CONFLICT');
  }
  let record;
  if (command === 'retract') {
    record = requireRecord(snapshot.records, input.id);
    if (record.status !== '採用') throw new Error('INACTIVE_RECORD');
    record.status = '撤回済み';
    record.history.push({
      type: '撤回', date: new Date().toISOString(),
      reason: input.reason ?? '記録なし',
    });
  } else if (command === 'correct') {
    record = requireRecord(snapshot.records, input.id);
    const previous = {};
    for (const key of contentFields) {
      if (record[key] !== input.record[key]) previous[key] = record[key];
      record[key] = input.record[key];
    }
    record.history.push({
      type: '訂正', date: new Date().toISOString(), previous,
    });
  } else {
    record = newRecord(input.record);
    snapshot.records.push(record);
  }
  if (command === 'replace') {
    const original = requireRecord(snapshot.records, input.id);
    if (original.status !== '採用') throw new Error('INACTIVE_RECORD');
    original.status = '置換済み';
    original.replacedBy = record.id;
    original.history.push({
      type: '置換', date: record.recordedAt, replacedBy: record.id,
    });
    record.replaces = original.id;
  }
  const version = writeStore(directory, snapshot.records);
  return { version, id: record.id, status: record.status };
}

try {
  const args = process.argv.slice(2);
  const [command, id] = args;
  const readOnly = command === 'list' || command === 'read';
  if ((!readOnly && !mutationCommands.includes(command))
    || args.length !== (command === 'read' ? 2 : 1)) {
    throw new Error('USAGE');
  }
  const input = readOnly ? undefined : parseMutation(command);
  const directory = storeDirectory();
  prepareDirectory(directory, readOnly);
  const result = withLock(directory, readOnly,
    () => execute(command, id, input, directory));
  console.log(JSON.stringify(result));
} catch (error) {
  const known = [
    'NOT_FOUND', 'USAGE', 'CONFLICT', 'BUSY', 'LOCK_ERROR', 'INACTIVE_RECORD',
    'UNSAFE_LOCATION', 'UNSAFE_STORAGE',
    'INVALID_INPUT', 'CORRUPT_STORE',
  ];
  const code = known.includes(error.message) ? error.message : 'STORE_ERROR';
  console.error(JSON.stringify({ error: code }));
  process.exitCode = { CONFLICT: 3, BUSY: 4 }[code] ?? 1;
}
