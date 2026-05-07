const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow
let lastClipboardContent = ''
let currentShortcut = null

const configPath = path.join(app.getPath('userData'), 'config.json')

const DEFAULT_SHORTCUT = process.platform === 'darwin' ? 'Command+Space' : 'Control+Space'

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8')
            const config = JSON.parse(data)
            return config.shortcut || DEFAULT_SHORTCUT
        }
    } catch (err) {
        console.error('Failed to load config:', err)
    }
    return DEFAULT_SHORTCUT
}

function saveConfig(shortcut) {
    try {
        const config = { shortcut }
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    } catch (err) {
        console.error('Failed to save config:', err)
    }
}

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

function registerShortcut(shortcut) {
    if (currentShortcut) {
        globalShortcut.unregister(currentShortcut)
    }
    
    const success = globalShortcut.register(shortcut, () => {
        toggleWindow()
    })
    
    if (success) {
        currentShortcut = shortcut
        return true
    }
    return false
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
    const savedShortcut = loadConfig()
    createWindow()
    startClipboardMonitoring()
    
    const success = registerShortcut(savedShortcut)
    if (!success) {
        console.log('Failed to register shortcut, using default')
        registerShortcut(DEFAULT_SHORTCUT)
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

ipcMain.on('get-current-shortcut', (event) => {
    event.returnValue = currentShortcut || DEFAULT_SHORTCUT
})

ipcMain.on('set-shortcut', (event, shortcut) => {
    const success = registerShortcut(shortcut)
    if (success) {
        saveConfig(shortcut)
    }
    event.returnValue = success
})
