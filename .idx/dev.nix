
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # Or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20 # Keep this in sync with .github/workflows/build.yml
  ];
  # Sets environment variables in the workspace
  env = {};
  # Fast way to see what's going on in the workspace
  previews = [
    {
      command = "npm run dev";
      manager = "web";
    }
  ];
  # Defines script that runs on workspace startup
  start = {
    # Example usage:
    # command = "npm install && npm run dev";
    #
    # But since we have previews, we don't need to specify a start command
    # for the dev server here. We can just use the pre-existing npm install.
  };
}
