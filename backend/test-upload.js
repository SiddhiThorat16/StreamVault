// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\test-upload.js

const multer = require('multer');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

app.post('/test-upload', upload.array('files'), (req, res) => {
  console.log('Files received:', req.files);
  res.json({ success: true, files: req.files });
});

app.listen(8081, () => console.log('Test upload on :8081'));
