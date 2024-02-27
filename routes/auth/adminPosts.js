const express = require('express');
const router = express.Router();
const fs = require('fs');
const client = require('../../config/mongo');
const multer = require('multer');
const upload =multer({dest:"public/images/uploads"});
const sharp = require('sharp');
const upload2 =require('../../plugins/multer/setup');
const uploadIntro = require('../../plugins/multer/setup')
const path = require('path');
const  ObjectId  = require('mongodb').ObjectId;
const config = require('../../config/config');
const { resizeAndCropImage } = require('../../plugins/sharp/sharp');


function isAddy(req,res,next){
    if(!req.user){res.redirect('login')}
  if(req.user.isAdmin==true){
    next()}
      else{res.sendStatus(401)}
    }


    router.post('/updateIntroContent', async (req, res) => {
        try {
            await client.connect();
            
            // Retrieve data from the request body
            const introContentId = req.body.introContentId;
            const introHeader = req.body.introHeader;
            // Update the intro content details
            const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').updateOne(
                { _id: new ObjectId(introContentId) },
                {
                    $set: {
                        introHeader: introHeader
                    }
                }
            );
    
            // Close the MongoDB connection
            await client.close();
    
            console.log('Intro content updated successfully', result);
            res.redirect('admin');
        } catch (error) {
            console.error('Error updating intro content:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    
    router.post('/deleteIntroContent', async (req, res) => {
        try {
            await client.connect();
            const introContentId = req.body.introContentId;
            const icId = new ObjectId(introContentId);
            console.log(icId);
            // Delete the intro content
            const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').deleteOne(
                { _id: icId }
            );
    
            // Close the MongoDB connection
            await client.close();
    
            console.log('Intro content deleted successfully', result);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error deleting intro content:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    



// const uploadIntro = async (req,res)=>{
//     const {introHeader,introDetails} =req.body;
//     console.log(`intro: ${introHeader} introDeets: ${introDetails}`)

// }

router.post('/uploadIntro', upload.single('photo'), async (req, res) => {
    try {
      const { introHeader, introDetails } = req.body;
      const file = req.file;
    if(!file){res.send('no file')}
      const uploadDirectory="./public/images/uploads/"
      const outputDirectory="./public/images/intro/"
      const originalFilePath = path.join(uploadDirectory, file.filename);
     // const filename = file.filename;
      const mimeType = file.mimetype
      const ext = mimeType.split('/')[1]
      const newFileName = "intro_image_"+Date.now();
      // Perform image processing with Sharp
      const sharpRes =await resizeAndCropImage(originalFilePath,outputDirectory,newFileName+"."+ext,500,500) 
  
      // Save the processed image with fs
      fs.writeFileSync(`./public/images/intro/${file.filename}`, sharpRes);      
      // console.log(`intro: ${introHeader} introDeets: ${introDetails} photo: ${file.filename}`);
      const introSet={
          introHeader:introHeader,
          postDate: Date.now(),
          introDetails:introDetails,
          order:99,
          imgName:"images/intro/"+newFileName+"."+ext,
          gallery:[
            {
                galleryImgName:"updateGallery",
                galleryImgDesc:"updateGallery",
                imagegUrl:"updateGallery",
                visible:false,
                rank:99
            }
          ]
    }
    const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').insertOne(introSet)   
console.log(result)
     res.send('Upload successful');

    } catch (error) {
      console.log(error);
      res.send('Internal Server Error',error);
    }
  });
  
  router.post('/galleryImgUpdate', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        const introId0 = req.body.introId;
        const introId = new ObjectId(introId0)
        const galleryIndex = req.body.galleryIndex;

        if (!file || !introId || !galleryIndex) {
            console.log('Missing required fields', `\n introId: ${introId},  index: ${galleryIndex}`);
        }
        
        const uploadDirectory = "./public/images/uploads/";
        const outputDirectory = `./public/images/intro/${introId0}/`;
        const originalFilePath = path.join(uploadDirectory, file.filename);
        const mimeType = file.mimetype;
        const ext = mimeType.split('/')[1];
        const newFileName = "gallery_" + Date.now();
        
        // Perform image processing with Sharp
        const sharpRes = await resizeAndCropImage(originalFilePath, outputDirectory, newFileName + "." + ext,600,375);
        
        console.log('post sharp', `\n originalFP: ${originalFilePath},  outDir: ${outputDirectory}`);
        // Save the processed image with fs
        try {
            // Save the processed image with fs
            fs.writeFileSync(`./public/images/intro/${introId0}/${newFileName}.${ext}`, sharpRes);
        } catch (error) {
            console.error('Error writing file:', error);
            throw new Error('Error writing file');
        }
                
        // Update database in the gallery index
        const imageUrl = "images/intro/"+introId0+"/" + newFileName + "." + ext;

        // Update the database with the new image URL at the specified gallery index
        const updateResult = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').updateOne(
            { _id: introId },
            { $set: { ["gallery." + galleryIndex + ".imageUrl"]: imageUrl } }
        );
console.log(updateResult)
        if (updateResult.modifiedCount === 1) {
           res.redirect('admin')
        } else {
            res.send('Failed to update image in the database');
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

    router.post('/updateGalleryImage', async (req, res) => {
        try {
            await client.connect();
            
            // Retrieve data from the request body
            const introContentId = req.body.introContentId;
            const galleryIndex = parseInt(req.body.galleryIndex);
            const galleryImgName = req.body.galleryImgName;
            const galleryImgDesc = req.body.galleryImgDesc;
            const rank = req.body.rank;
            const visible = req.body.visible === 'true'; // Convert string to boolean
    console.log(`id ${introContentId} index: ${galleryIndex}`)
            // Update the gallery image details
            const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').updateOne(
                { 
                    _id: new ObjectId(introContentId),
                    [`gallery.${galleryIndex}`]: { $exists: true } // Ensure the element at the specified index exists
                },
                {
                    $set: {
                        [`gallery.${galleryIndex}.galleryImgName`]: galleryImgName,
                        [`gallery.${galleryIndex}.galleryImgDesc`]: galleryImgDesc,
                        [`gallery.${galleryIndex}.rank`]: rank,
                        [`gallery.${galleryIndex}.visible`]: visible
                    }
                }
            );
    
            // Close the MongoDB connection
            await client.close();
    
            console.log('Gallery image updated successfully', result);
            res.redirect('admin');
        } catch (error) {
            console.error('Error updating gallery image:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    

    router.post('/deleteGalleryImage', async (req, res) => {
        try {
            await client.connect();
            const introContentId = req.body.introContentId;
            const icId = new ObjectId(introContentId);
            const galleryIndex = parseInt(req.body.galleryIndex);
            console.log(galleryIndex,icId);
            const find = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').find({_id:icId})
            // Delete the image from the gallery array
            const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').findOneAndUpdate(
                { _id: icId },
                { $unset: { [`gallery.${galleryIndex}`]: 1 } }, // Unset the gallery element at the specified index
                { new: true }
            );
    
            // Compact the array after deletion
            const result2 = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').updateOne(
                { _id: icId },
                { $pull: { gallery: null } }
            );
    
            // Close the MongoDB connection
            await client.close();
    
            console.log('Image deleted successfully',find, result, result2);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    

router.post('/uploadGalleryImages', upload.single('photo'), async function(req, res) {
    const { galleryImgName, galleryImgDesc } = req.body;
    const imageData = req.file;
    if(!imageData){return res.redirect('/admin')}
    const str = imageData.originalname;
    const ext = str.split('.')[1];
    const introContentId = req.body.introCat;
    const introId = new ObjectId(introContentId);
    const oldFilepath = "../" + config.IMAGE_FP + "/public/images/uploads/";
    const newDirectory = "../" + config.IMAGE_FP + "/public/images/intro/" + introContentId + "/";
    const newName = 'gallery_' + Date.now() + "." + ext;
    const newFilepath = path.join(newDirectory, newName);
    const bImgName = "images/intro/" + introContentId + "/" + newName;
    const correctOldFP= path.join("/public/images/uploads/",imageData.filename)

    const sharpRes = await resizeAndCropImage(correctOldFP, newDirectory, newName + "." + ext,600,375);
    // Check if the directory exists, create it if not
    if (!fs.existsSync(newDirectory)) {
        fs.mkdirSync(newDirectory, { recursive: true });
    }

    fs.rename(oldFilepath + imageData.filename, sharpRes, (err) => {
        if (err) {
            console.log(err);
        }
    });

    try {
        await saveBlog(bImgName, galleryImgName, galleryImgDesc, introId);

        res.redirect('admin');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

async function saveBlog(bImgName, galleryImgName, galleryImgDesc, introContentId) {
    try {
        await client.connect();
        const newBlog = {
            imgGallery: {
                galleryImgName: galleryImgName,
                galleryImgDesc: galleryImgDesc,
                imageUrl: bImgName,
                visible: true,
                rank: 99
            },
            introContentId: introContentId // Include introContentId as an object ID
        };
        await createBlog(client, newBlog);
    } finally {
        await client.close();
    }
}

async function createBlog(client, newBlog) {
    const response = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').updateOne(
        { _id: newBlog.introContentId },
        { $addToSet: { "gallery": newBlog.imgGallery } }
    );
    console.log(response);
}



module.exports = router;