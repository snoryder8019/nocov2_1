const express = require('express');
const router = express.Router();
const fs = require('fs');
const client = require('../../config/mongo');
const multer = require('multer');
const upload =multer({dest:"public/images/uploads",storage:multer.memoryStorage()});
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


/***********************************************************************/
/************INITIAL UPLOAD TO GALLERY AND INTROS*************/
/*********************************START**************************************/
/***********************************************************************/
router.post('/uploadIntro', upload.single('photo'), async (req, res) => {
    try {
        const { introHeader, introDetails } = req.body;
        const file = req.file;
        // Check if a file was uploaded
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        const imageBuffer = req.file.buffer;
        console.log(imageBuffer)
        const ext = path.extname(file.originalname);
        const newName = "intro_image_" + Date.now() + ext;
        const newDirectory = path.join("../../",config.IMAGE_FP,"/public/images/intro/");
        console.log(newDirectory,newName)
        console.log()
     await resizeAndCropImage(imageBuffer, newDirectory,newName, "horizontal");
           
        const introSet = {
            introHeader: introHeader,
            postDate: Date.now(),
            introDetails: introDetails,
            order: 99,
            imgName: "images/intro/" + newName,
            gallery: [
                {
                    galleryImgName: "updateGallery",
                    galleryImgDesc: "updateGallery",
                    imagegUrl: "updateGallery",
                    visible: false,
                    rank: 99
                }
            ]
        };
        const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH + '_intro_content').insertOne(introSet);
            res.send('Upload successful');
    } catch (error) {
        console.error('Error uploading intro:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/uploadGalleryImages', upload.single('photo'), async function(req, res) {
    try {
        const { galleryImgName, galleryImgDesc, introCat } = req.body;
        const imageData = req.file;        
        // Check if image data exists
        if (!imageData) {
            return res.redirect('/admin');
        }
        const introId = new ObjectId(introCat);
        const ext = path.extname(imageData.originalname);
        const newName = 'gallery_' + Date.now() + ext;
        const newDirectory = path.join(config.IMAGE_FP,  "public", "images", "intro", introCat);
       console.log(newDirectory)
       const newFilepath = path.join(newDirectory, newName);
       console.log(newFilepath)
        const bImgName = path.join("images", "intro", introCat, newName);
        //custom to gallery, must save object ID of the Intro as the subdirectory
        if (!fs.existsSync(newDirectory)) {
            fs.mkdirSync(newDirectory, { recursive: true });
        }
        console.log(req.file.buffer);
        const imageBuffer = req.file.buffer;       
        await resizeAndCropImage(imageBuffer, newDirectory, newName, "vertical");   
        await saveBlog(bImgName, galleryImgName, galleryImgDesc, introId);
        res.redirect('/admin');
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
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*****^^^^^INITIAL UPLOAD TO GALLERY AND INTROS^^^^^^^^*************/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^END^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/







/*****************************************************************/
/************UPDATES TO GALLERY AND INTROS DATA AND IMAGES**********/
/****************************START*********************************/
/*****************************************************************/
router.post('/updateGalleryImage', async (req, res) => {
    try {
      
        
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
     

        console.log('Gallery image updated successfully', result);
        res.redirect('admin');
    } catch (error) {
        console.error('Error updating gallery image:', error);
        res.status(500).send('Internal Server Error');
    }
});


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
        const sharpRes = await resizeAndCropImage(originalFilePath, outputDirectory, newFileName ,600,375);
        
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



/**********^^^^^^^^^^**UPDATES TO GALLERY AND INTROS DATA AND IMAGES^^^^^^^^^^^^^*************/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^END^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/



/****************************************************/
/************DELETES TO GALLERY AND INTROS*************/
/**********************START******************************/
/****************************************************/
router.post('/deleteIntroContent', async (req, res) => {
    try {      
        const introContentId = req.body.id;
        const icId =new ObjectId(introContentId);
        console.log(introContentId);
        console.log(icId);

        const result = await client.db(config.DB_NAME)
          .collection(config.COLLECTION_SUBPATH + '_intro_content')
          .deleteOne({ _id: icId });  
          
        console.log('Intro content deleted successfully', result);
        res.sendStatus(200);
    } catch (error) {
       // console.error('Error deleting intro content:');
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


/************^^^^^^^^^^^^^^DELETES TO GALLERY AND INTROS^^^^********/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^END^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/






module.exports = router;