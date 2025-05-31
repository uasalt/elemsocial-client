import { api } from "./api.js"

const client = new api()

console.log(await client.loadPosts())
console.log(await client.loadmusic())
console.log(await client.profile('uasalt'))