{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # Or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20 # Keep this in sync with .github/workflows/build.yml
  ];
  # Sets environment variables in the workspace
  env = {};
}
