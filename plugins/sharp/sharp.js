const sharp = require('sharp');
const path = require('path');

const resizeAndCropImage = async (imageBuffer, outputDirectory, filename, orientation) => {
   
   
   
    try {
        const meta = await sharp(imageBuffer).metadata();
        console.log(meta)
        const outputPath = path.join(outputDirectory, filename);

        let resizeOptions;
        if(orientation ==='horizontal'){
            resizeOptions={width:500,height:500,fit:'cover'}
            if(meta.width>meta.height){
                rotateOption=0;
             }else{      
                rotateOption=90;
              }         
        }else if(orientation==='vertical'){
            resizeOptions={width:375,height:600,fit:'cover'}
            if(meta.width>meta.height){
                rotateOption=0;
            }else{      
                rotateOption=0;
            }
          
        }else {
  
            throw new Error("Invalid orientation");
        }

        await sharp(imageBuffer)
          .rotate(rotateOption)
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
