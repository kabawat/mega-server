const express = require('express');
const multer = require('multer');
const mega = require('megajs');
const fs = require('fs');
const cors = require('cors')
const app = express();
const upload = multer({ dest: 'uploads/' });

const email = 'kshatriyakabawat@gmail.com';
const password = 'MsNkys@143';
app.use(cors())

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    const storage = mega({ email, password, autoload: true });

    storage.on('ready', () => {
        const uploadOptions = {
            name: "recent-work-" + file.originalname,
            target: storage.root,
            attributes: { type: 'file' },
            size: file.size // Add the file size to the uploadOptions
        };

        const readStream = fs.createReadStream(file.path);
        const writeStream = storage.upload(uploadOptions, readStream);

        writeStream.on('uploadcomplete', () => {
            fs.unlinkSync(file.path);
        });

        writeStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).send('Error uploading file');
        });
    });
    res.send('File upload initiated successfully');
});


app.get('/file/:filename', (req, res) => {
    const storage = mega({ email, password, autoload: true });
    const filename = req.params.filename;

    storage.on('ready', () => {
        const files = storage.root.children;
        let fileFound = false;
        for (const file of files) {
            console.log(file.name)
            if (file.name === filename) {
                const downloadStream = file.download();
                downloadStream.pipe(res);
                fileFound = true;
                break;
            }
        }

        if (!fileFound) {
            res.status(404).send('File not found');
        }
    });
});




app.listen(2917, () => {
    console.log('Server is running on port 2917');
});
