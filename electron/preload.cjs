const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  versions: process.versions,
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
})

