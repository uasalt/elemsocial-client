const { app, BrowserWindow, ipcMain } = require('electron')
const fsPromises = require('fs').promises
const pathModule = require('path')

let mainWindow

function Version(v1, v2) {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const x = a[i] || 0;
        const y = b[i] || 0;
        if (x > y) return 1;
        if (x < y) return -1;
    }
    return 0;
}

const autoupdate = async () => {
    const cfgR = await fetch('https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/config.json')
    const cfg = await cfgR.json()
    if (Version(cfg.ver, app.getVersion()) <= 0) { return }
    var stats = await fsPromises.stat(app.getAppPath())
    if (stats.isFile()) { return }
    async function scan(scanpath = '') {
        const url = `https://api.github.com/repositories/938380151/contents/resources/update${scanpath}`
        const response = await fetch(url)
        if (response.status === 404) return

        const r = await response.json()

        for (const pathItem of r) {
            const localPath = pathModule.join(app.getAppPath(), scanpath, pathItem.name)

            if (pathItem.type === 'dir') {
                await fsPromises.mkdir(localPath, { recursive: true })
                await scan(`${scanpath}/${pathItem.name}`)
            } else if (pathItem.type === 'file') {
                const fileResponse = await fetch(`https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/update${scanpath}/${pathItem.name}`)
                const buffer = Buffer.from(await fileResponse.arrayBuffer())
                await fsPromises.writeFile(localPath, buffer)
            }
        }
    }
    await scan()
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
