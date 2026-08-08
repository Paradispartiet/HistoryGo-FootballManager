# Repository instructions

## GitHub CLI

`gh` is already part of this repository's declared development environment through `.devcontainer/devcontainer.json` and `ghcr.io/devcontainers/features/github-cli:1`.

Never tell the user that this project does not have GitHub CLI merely because the current assistant sandbox cannot resolve the `gh` executable. That only describes the sandbox, not the repository's Codespace/devcontainer.

If the current runtime lacks `gh`:

- verify the devcontainer declaration;
- treat the devcontainer configuration as the source of truth;
- use the connected GitHub API/connector for the current operation when available;
- do not ask the user to reinstall GitHub CLI unless the repository configuration itself no longer installs it.

## Product direction

Before designing major HG Football Manager features, read `docs/PRODUCT_PRINCIPLES_CLUB_SIMULATION.md`.

The product is a football-club learning simulation. History Go owns discovery/unlocking of historical players; the manager layer should teach how football and club work are actually performed. Do not copy economy, transfer, contract or facility-upgrade mechanics from commercial manager games without a clear educational and simulation purpose.
