const express = require('express');
const multer = require('multer');
const mega = require('megajs');
const fs = require('fs');
const app = express();
const cors = require('cors')
const email = 'kshatriyakabawat@gmail.com';
const password = 'MsNkys@143';

const upload = multer();
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

        const readStream = require('stream').Readable.from(file.buffer);
        const writeStream = storage.upload(uploadOptions, readStream);

        writeStream.on('finish', () => {
            console.log('here')
            res.send('File uploaded successfully');
        });

        writeStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).send('Error uploading file');
        });
    });
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
