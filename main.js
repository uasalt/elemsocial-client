const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 600,
        minWidth: 1100,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false
        }
    });
    mainWindow.setMenu(null)
    //mainWindow.webContents.openDevTools();

    mainWindow.loadFile('resources/auth.html');
});
