import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

// Client-side routes that need a real index.html so static hosts (GitHub Pages)
// serve the app on refresh / deep link instead of a 404.
const spaRoutes = ['version-calendar']

function spaFallback() {
  let outDir
  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const indexHtml = path.join(outDir, 'index.html')
      await fs.copyFile(indexHtml, path.join(outDir, '404.html'))
      for (const route of spaRoutes) {
        const routeDir = path.join(outDir, route)
        await fs.mkdir(routeDir, { recursive: true })
        await fs.copyFile(indexHtml, path.join(routeDir, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/EndfieldEssenceLookup/',
  plugins: [react(), spaFallback()],
})
