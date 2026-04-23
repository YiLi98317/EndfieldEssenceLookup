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

Output is in `dist/`. To preview the production build locally:

```bash
npm run preview
```

## GitHub Pages

The app is deployed via GitHub Actions on every push to `main`.

1. After the first push, open the repo on GitHub → **Settings** → **Pages**.
2. Under **Source**, choose **GitHub Actions**.
3. The site will be available at `https://<username>.github.io/EndfieldEssenceLookup/`.

No need to choose a branch; the workflow builds and deploys automatically.

## Desktop releases (GitHub Releases)

Push a tag like `v0.1.0` to trigger the release workflow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds Windows/macOS artifacts and uploads them to the GitHub Release for that tag.
