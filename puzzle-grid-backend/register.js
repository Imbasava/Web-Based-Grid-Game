/* // backend/register.js
const express = require('express');
const router = express.Router();
const User = require('./models/User');

// Register a new user
router.post('/register', async (req, res) => {
  const { name, photoUrl } = req.body;
  try {
    let user = new User({ name, photoUrl });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
 */
// backend/register.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Register a new user
router.post('/register', upload.single('photo'), async (req, res) => {
  const { name } = req.body;
  const photoUrl = `/uploads/${req.file.filename}`;

  try {
    let user = new User({ name, photoUrl });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
