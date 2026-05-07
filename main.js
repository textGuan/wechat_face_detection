const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, nativeImage } = require('electron')
const path = require('path')

let mainWindow
let lastClipboardContent = ''

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

function startClipboardMonitoring() {
  setInterval(() => {
    const currentText = clipboard.readText()
    if (currentText && currentText !== lastClipboardContent) {
      lastClipboardContent = currentText
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('clipboard-update', currentText)
      }
    }
  }, 1000)
}

app.whenReady().then(() => {
  createWindow()
  startClipboardMonitoring()

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
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSize(700, height)
  }
})

ipcMain.on('hide-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
})

ipcMain.on('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text)
})

ipcMain.on('insert-text', (event, text) => {
  clipboard.writeText(text)
  const oldContent = lastClipboardContent
  lastClipboardContent = text
  
  setTimeout(() => {
    const { clipboard } = require('electron')
    clipboard.writeText(oldContent)
    lastClipboardContent = oldContent
  }, 100)
})
