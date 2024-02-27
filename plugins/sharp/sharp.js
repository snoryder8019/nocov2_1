const sharp = require('sharp');
const path = require('path');


const resizeAndCropImage = async (originalFilePath, outputDirectory, filename,width,height) => {
  try {
    const outputPath = path.join(outputDirectory, filename);
    
    await sharp(originalFilePath)
      .resize({ width: width, height: height, fit: 'cover' }) // Resize and crop to 500x500
      .toFormat('jpeg', { quality: 80 }) // Convert to jpeg and reduce file size
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error resizing and cropping image:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

module.exports = {
  resizeAndCropImage,
};
