const { app, BrowserWindow } = require('electron');

let mainWindow;

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
            contextIsolation: false,
            enableRemoteModule: false
        }
    });
    mainWindow.setMenu(null)
    mainWindow.webContents.openDevTools();

    mainWindow.loadFile('resources/auth.html');
});
