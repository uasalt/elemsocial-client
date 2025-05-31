const autoupdate = async () => {
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
                console.log(pathItem.name)
                const fileResponse = await fetch(`https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/update${scanpath}/${pathItem.name}`)
                const buffer = Buffer.from(await fileResponse.arrayBuffer())
                await fsPromises.writeFile(localPath, buffer)
            }
        }
    }
    await scan()
}
