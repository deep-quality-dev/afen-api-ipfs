const express = require('express')
const {create} = require('ipfs-http-client')

const ipfs = create("http://localhost:5001")
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    return res.send('Welcome to my IPFS app')
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000')
})
