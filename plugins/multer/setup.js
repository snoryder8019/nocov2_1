const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = './public/images/uploads/'; // Destination folder for uploaded files
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keeping the original filename
  }
});

const upload2 = multer({
  storage: storage,
  limits: { fileSize: 8000000 }, // Limiting file size to 8MB
}).fields([
  { name: 'introHeader', maxCount: 1 }, // Expecting a field named 'introHeader'
  { name: 'introDetails', maxCount: 1 }, // Expecting a field named 'introDetails'
]);

module.exports = upload2; // Exporting the Multer upload middleware
