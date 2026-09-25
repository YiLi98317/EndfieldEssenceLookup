# Release notes

Each release note is stored as a markdown file in this folder, named by the **next** tag:

- `vX.Y.Z.md`

Include this file in a PR labeled `release` plus exactly one of `patch`, `minor`, or `major`. The filename must match the bump from `package.json` (do not edit the version in `package.json` yourself).

After merge, GitHub Actions tags `vX.Y.Z` and uses this file as the GitHub Release body.
