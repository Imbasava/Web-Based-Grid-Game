// backend/imageProcessor.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'uploaded-image' + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Slice image into tiles
const sliceImage = async (filePath) => {
  const tiles = [];
  const tileSize = 100; // Size of each tile

  // Read the image
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Process the image into tiles
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const tile = image.extract({ left: x, top: y, width: tileSize, height: tileSize });
      const tilePath = `uploads/tile-${x}-${y}.png`;
      await tile.toFile(tilePath);
      tiles.push(tilePath);
    }
  }

  return tiles;
};

// Route for image upload and slicing
router.post('/upload-image', upload.single('image'), async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  try {
    const tiles = await sliceImage(filePath);
    res.status(201).json({ tiles });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
