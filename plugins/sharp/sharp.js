const sharp = require('sharp');
const path = require('path');

const resizeAndCropImage = async (imageBuffer, outputDirectory, filename, orientation) => {
    try {
        const outputPath = path.join(outputDirectory, filename);

        let resizeOptions;
        if (orientation === "horizontal") {
            resizeOptions = { width: 500, height: 500, fit: 'cover' };
        } else if (orientation === "vertical") {
            resizeOptions = { width: 375, height: 600, fit: 'cover' };
        } else {
            throw new Error("Invalid orientation");
        }

        await sharp(imageBuffer)
            .resize(resizeOptions)
            .toFormat('jpeg', { quality: 80 })
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        console.error('Error resizing and cropping image:', error);
        throw error;
    }
};

module.exports = {
    resizeAndCropImage,
};
