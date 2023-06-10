const express = require('express');
const mega = require('megajs');
const fs = require('fs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path')
const email = 'kshatriyakabawat@gmail.com';
const password = 'MsNkys@143';
app.use(cors());
app.use(fileUpload());
app.use('/', express.static(path.join(__dirname, 'public/')))
const rootDir = path.dirname(require.main.filename)
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file uploaded');
    }
    console.log(rootDir)
    const file = req.files.file;
    const tempFilePath = path.join(rootDir, 'uploads', `${file.name}`)

    file.mv(tempFilePath, (error) => {
        if (error) {
            console.error('Error moving file:', error);
            return res.status(500).send('Error uploading file');
        }

        const storage = mega({ email, password, autoload: true });
        storage.on('ready', () => {
            const uploadOptions = {
                name: 'recent-work-' + file.name,
                target: storage.root,
                attributes: { type: 'file' },
                size: file.size // Add the file size to the uploadOptions
            };

            const readStream = fs.createReadStream(tempFilePath);
            const writeStream = storage.upload(uploadOptions, readStream);
            writeStream.on('uploadcomplete', () => {
                fs.unlinkSync(tempFilePath);
            });

            writeStream.on('error', (error) => {
                console.error('Error uploading file:', error);
                res.status(500).send('Error uploading file');
            });
        });

        res.send('File upload initiated successfully');
    });
});

app.get('/file/:filename', (req, res) => {
    const storage = mega({ email, password, autoload: true });
    const filename = req.params.filename;

    storage.on('ready', () => {
        const files = storage.root.children;
        let fileFound = false;
        for (const file of files) {
            console.log(file.name);
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
