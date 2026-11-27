{
  description = "everything-codex の開発環境";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          pnpm = pkgs.writeShellScriptBin "pnpm" ''
            exec ${pkgs.nodejs_24}/bin/corepack pnpm "$@"
          '';
        in
        {
          default = pkgs.mkShell {
            # mise.toml の Node.js のメジャーバージョンと揃える。
            packages = [
              pkgs.nodejs_24
              pnpm
            ];
          };
        }
      );
    };
}
