# Endfield Essence Lookup

React app built with Vite, deployed to GitHub Pages, with an Electron desktop build.

Use it [Here](https://yili98317.github.io/EndfieldEssenceLookup/)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the URL Vite prints).

Node.js 22.12+ is recommended (CI/workflows use Node 22). This repo includes:
- `.nvmrc` for `nvm`
- `.node-version` for tools like `asdf`

## Desktop (Electron)

### Dev (Vite + Electron)

```bash
npm run dev:desktop
```

### Package installers/zips

```bash
npm run dist
```

Build outputs go to `release/`.

## Build

```bash
npm run build
```

Output is in `dist/`. This is also what GitHub Pages deploys.

## GitHub Pages

The app is deployed via GitHub Actions on every push to `main`.

1. After the first push, open the repo on GitHub → **Settings** → **Pages**.
2. Under **Source**, choose **GitHub Actions**.
3. The site will be available at `https://<username>.github.io/EndfieldEssenceLookup/`.

No need to choose a branch; the workflow builds and deploys automatically.

## Desktop releases (GitHub Releases)

Ship a desktop build by merging a **release PR** into `main`. Do not bump `package.json` or push a git tag yourself.

1. Open a PR into `main` with the app changes.
2. Add labels **`release`** and exactly one of **`patch`**, **`minor`**, or **`major`**.
3. Add `release-notes/vX.Y.Z.md` for the **next** version (from current `package.json`: `patch` bumps 0.1.2 → 0.1.3, `minor` → 0.2.0, `major` → 1.0.0).
4. Merge. GitHub Actions bumps the version, pushes tag `vX.Y.Z`, builds Windows/macOS installers, and attaches them to the GitHub Release using that notes file.

PRs without the `release` label only update GitHub Pages. They do not publish Electron installers.
