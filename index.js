const express = require('express')
const bodyParser = require('body-parser')
const {create} = require('ipfs-http-client')
const fileUpload = require('express-fileupload')
const fs = require('fs')

const ipfs = create("http://localhost:5002")
const app = express()

app.use(express.json())
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(fileUpload())

app.get('/', (req, res) => {
    res.render('home')
    // return res.send('Welcome to my IPFS app')
})

const uploadFile = ({file, fileName}) => {
    const filePath = 'files/' + fileName
    
    return new Promise(res => {
        file.mv(filePath, async (err) => {
            if (err) {
                console.log('Error: failed to download the file');
                return res.status(500).send(err)
            }

            const fileHash = await addFile({fileName, filePath})
            fs.unlink(filePath, (err) => {
                if (err) console.log(err)
            })

            
            res(`https://gateway.ipfs.io/ipfs/${fileHash}`)
        })
    })
    // return res.send("Thanks for submitting");
}

const addFile = async ({fileName, filePath}) => {
    const fileContent = fs.readFileSync(filePath)
    const file = {path: fileName, content: Buffer.from(fileContent)}
    const filesAdded = await ipfs.add(file)
    // console.log(filesAdded)
    // QmYarjYDXfwcCBFmrk9RKAEfZ9NGYHokrtXRJkw1bkbsJv
    return filesAdded.cid
}

app.post('/upload', async (req, res) => {
    const data = req.query
    const file = req.files.file
    const fileName = req.files.file.name

    const imageHash = await uploadFile({file, fileName})

    data.imageHash = imageHash
    // console.log(data)

    const nftHash = await addProfile(data)
    return res.send(`https://gateway.ipfs.io/ipfs/${nftHash}`)
})

const addProfile = async (data) => {
    const nft = {path: data.path, content: JSON.stringify(data)}
    const filesAdded = await ipfs.add(nft)
    console.log(filesAdded)
    // QmYarjYDXfwcCBFmrk9RKAEfZ9NGYHokrtXRJkw1bkbsJv
    return filesAdded.cid
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000')
})
