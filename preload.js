const { contextBridge, ipcRenderer } = require('electron')

const fs = require("fs")

contextBridge.exposeInMainWorld('ipc', {
  channel1: (arg1) => ipcRenderer.invoke('channel1', arg1),
  readFile: (file) => ipcRenderer.invoke('readFile', file),
  writeFile: (file, content) => ipcRenderer.invoke('writeFile', file, content),
  readDir: (file) => ipcRenderer.invoke('readDir', file),
  isDir: (file) => ipcRenderer.invoke('isDir', file),
  fileExplorer: () => ipcRenderer.invoke('fileExplorer'),
  deleteFile: (file) => ipcRenderer.invoke('deleteFile', file),
  renameFile: (old_name, new_name) => ipcRenderer.invoke('renameFile', old_name, new_name),
  createDir: (file) => ipcRenderer.invoke('createDir', file),
  rootDir: () => ipcRenderer.invoke('rootDir'),
  loadingDone: () => ipcRenderer.invoke('loadingDone')
})



contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping'),
    bleh: () => ipcRenderer.invoke('bleh'),
    fs: () => fs
  })


