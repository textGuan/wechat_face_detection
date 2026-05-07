const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 60,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('blur', () => {
    mainWindow.hide()
  })
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    const { screen } = require('electron')
    const { x, y, width } = screen.getPrimaryDisplay().bounds
    mainWindow.setPosition(Math.floor((width - 700) / 2), Math.floor(y + 100))
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('focus-search')
  }
}

app.whenReady().then(() => {
  createWindow()

  const accelerator = process.platform === 'darwin' ? 'Command+Space' : 'Control+Space'
  const ret = globalShortcut.register(accelerator, () => {
    toggleWindow()
  })

  if (!ret) {
    console.log('快捷键注册失败')
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('resize-window', (event, height) => {
  mainWindow.setSize(700, height)
})

ipcMain.on('hide-window', () => {
  mainWindow.hide()
})
