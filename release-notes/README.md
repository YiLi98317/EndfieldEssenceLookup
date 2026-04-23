# Release notes

Each release note is stored as a markdown file in this folder, named by tag:

- `vX.Y.Z.md`

When cutting a release, paste the contents into GitHub Releases, or use the GitHub CLI:

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file "release-notes/vX.Y.Z.md"
```

