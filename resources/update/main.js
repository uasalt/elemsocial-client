const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

const autoupdate = () => {

}

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 600,
        minWidth: 536,
        minHeight: 600,
        icon: "resources/assets/images/logo.png",
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.setMenu(null)
    ipcMain.on('devtools', () => {
        mainWindow.webContents.openDevTools()
    })

    mainWindow.loadFile('resources/auth.html')
})