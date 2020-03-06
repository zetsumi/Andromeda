'use strict'

import { app, autoUpdater, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import os from 'os'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  if (handleSquirrelEvent(app)) {
    return
  }

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1280,
    width: 1280,
    minHeight: 720,
    height: 720,
    frame: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    if (process.env.NODE_ENV === 'production') {
      log.transports.console.level = false
      log.transports.file.level = 'info'
      initializeTaurus()
    } else {
      log.transports.console.level = 'silly'
      log.transports.file.level = false
      log.warn('Andromeda is running in development mode. Taurus services will not be initialized.')
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function initializeTaurus () {
  autoUpdater.setFeedURL(`https://taurus.astral-studio.io/v1/${os.platform()}/${os.arch()}`)

  autoUpdater.on('error', (event, error) => {
    log.error('Update error:', error)
    mainWindow.webContents.send('launcher-update-error', error)
  })

  autoUpdater.on('update-available', () => {
    log.info('Update available.')
    mainWindow.webContents.send('launcher-update-available')
  })

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    log.info('Update downloaded:', releaseName)
    mainWindow.webContents.send('launcher-update-ready', releaseName)
  })

  ipcMain.on('launcher-update-restart', event => {
    event.returnValue = true
    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdates()
}

function handleSquirrelEvent (application) {
  if (process.argv.length === 1) {
    return false
  }

  const ChildProcess = require('child_process')
  const path = require('path')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = function (command, args) {
    let spawnedProcess

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      })
    } catch (error) { }

    return spawnedProcess
  }

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(application.quit, 1000)
      return true
    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(application.quit, 1000)
      return true
    case '--squirrel-obsolete':
      application.quit()
      return true
  }
}
