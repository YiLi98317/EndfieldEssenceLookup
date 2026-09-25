import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
])

function mimeTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    case '.ttf':
      return 'font/ttf'
    default:
      return 'application/octet-stream'
  }
}

function resolveAppUrlToDistPath(requestUrl, distRoot) {
  const url = new URL(requestUrl)

  // app://index.html  -> hostname=index.html, pathname=/
  // app:///assets/x   -> hostname=, pathname=/assets/x
  const rawPath = url.hostname ? `/${url.hostname}${url.pathname}` : url.pathname
  const decodedPath = decodeURIComponent(rawPath)

  // Vite builds for GitHub Pages with `base: '/EndfieldEssenceLookup/'`, so packaged
  // assets may be requested under that prefix. Strip it for the desktop protocol.
  const pagesBasePrefix = '/EndfieldEssenceLookup'
  let requestPath = decodedPath === '/' ? '/index.html' : decodedPath

  // When we load `app://index.html`, browser-resolved absolute paths like
  // `/EndfieldEssenceLookup/assets/...` can appear as:
  //   app://index.html/EndfieldEssenceLookup/assets/...
  // which we normalize back to:
  //   /EndfieldEssenceLookup/assets/...
  if (requestPath.startsWith('/index.html/')) {
    requestPath = requestPath.slice('/index.html'.length)
  }

  if (requestPath === pagesBasePrefix || requestPath === `${pagesBasePrefix}/`) {
    requestPath = '/index.html'
  } else if (requestPath.startsWith(`${pagesBasePrefix}/`)) {
    requestPath = requestPath.slice(pagesBasePrefix.length)
  }

  // SPA fallback: requests without extensions get index.html
  const finalPath = path.extname(requestPath) ? requestPath : '/index.html'

  const abs = path.join(distRoot, finalPath)
  const normalizedDist = path.resolve(distRoot)
  const normalizedAbs = path.resolve(abs)

  if (!normalizedAbs.startsWith(normalizedDist + path.sep) && normalizedAbs !== normalizedDist) {
    return null
  }

  return normalizedAbs
}

async function registerAppProtocol() {
  const distRoot = path.join(app.getAppPath(), 'dist')

  if (typeof protocol.handle === 'function') {
    protocol.handle('app', async (request) => {
      const targetPath = resolveAppUrlToDistPath(request.url, distRoot)
      if (!targetPath) return new Response('Bad request', { status: 400 })

      try {
        const data = await fs.readFile(targetPath)
        return new Response(data, {
          status: 200,
          headers: { 'Content-Type': mimeTypeForPath(targetPath) },
        })
      } catch {
        return new Response('Not found', { status: 404 })
      }
    })
    return
  }

  // Fallback for older Electron: file protocol without explicit MIME
  protocol.registerFileProtocol('app', (request, callback) => {
    const targetPath = resolveAppUrlToDistPath(request.url, distRoot)
    if (!targetPath) return callback({ error: -324 })
    callback({ path: targetPath })
  })
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => win.show())

  if (app.isPackaged) {
    win.loadURL('app://index.html')
    if (process.env.ELECTRON_DEBUG_PROD === '1') {
      win.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    const devUrl = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
    win.loadURL(devUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  }

  return win
}

ipcMain.handle('app:getVersion', () => app.getVersion())

app.whenReady().then(async () => {
  if (app.isPackaged) {
    await registerAppProtocol()
  }

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

