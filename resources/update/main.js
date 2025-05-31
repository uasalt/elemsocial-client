const { app, BrowserWindow, ipcMain } = require('electron')
const fetch = require('node-fetch')
const fs = require('fs')

let mainWindow

const autoupdate = async () => {
    var stats = fs.statSync(app.getAppPath())
    if (stats.isFile()) { return }
    async function scan(scanpath='') {
        fetch("https://api.github.com/repositories/938380151/contents/resources/update" + scanpath)
            .then(r => {
                return r.json()
            })
            .then(async r => {
                await r.forEach(async path => {
                    if (path.type == 'dir') {
                        fs.mkdir(`${app.getAppPath()}\\${scanpath}\\${path.name}`)
                        await scan(`/${scanpath}/${path.name}`)
                    } else if (path.type == 'file') {
                        await fetch(`https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/update/${scanpath}/${path.name}`)
                            .then(r => {
                                return r.buffer()
                            })
                            .then(r => {
                                fs.writeFileSync(`${app.getAppPath()}/${scanpath}/${path.name}`, r)
                            })
                    }
                })
            })
    }
    scan()
}

app.whenReady().then( async () => {
    await autoupdate()
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
