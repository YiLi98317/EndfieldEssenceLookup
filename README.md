# Endfield Essence Lookup

React app built with Vite, deployed to GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the URL Vite prints).

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
