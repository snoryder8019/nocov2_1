const express = require('express');
const router = express.Router();
const env = require('dotenv').config()
const client = require('../../config/mongo');
const ObjectId = require('mongodb').ObjectId;
const request = require('request')
const fs = require('fs');
const multer = require('multer');
const upload =multer({dest:"uploads/"});
//////////////////middleware
function isAddy(req,res,next){
  if(!req.user){res.redirect('login')}
if(req.user.isAdmin==true){
  next()}
    else{res.sendStatus(401)}
  }
////////////////////////////////////

//////////////////////////////////
router.get('/admin', isAddy,(req,res) =>{
    // eslint-disable-next-line no-inner-declarations
    async function gettingEmails(){
      try {
        await client.connect();
        await getEmails(client);
      }
      catch(error){
        console.log(error);
      }
      finally{
      //  await client.close();
      }}    
      gettingEmails().catch(console.error);
      // eslint-disable-next-line no-inner-declarations
      async function getEmails(client){
       const user = req.user
        const blogs= await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_blogs').find().toArray();
        const catagory = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_categories').find().toArray();
        const introContent = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_intro_content').find().toArray();
  
        return  res.render('admin',{title:'Admin Page', blogs:blogs,catagory:catagory, user:user, introContent:introContent})
  } 
  })
//////////////////////////////////
router.get('/inventory', (req,res) =>{ 
    // eslint-disable-next-line no-inner-declarations
    async function gettingEmails(){
     try {
      await client.connect();
      await getEmails(client);
     }
     catch(error){
       console.log(error);
     }
     finally{
     await client.close();
   }}
   ///////
  gettingEmails().catch(console.error);
   // eslint-disable-next-line no-inner-declarations
   async function getEmails(client){
     const user = req.user
   const inventory = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_inventory').find().toArray();
    const catagory = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_catagories').find().toArray();   
    res.render('inventory', {title:'Inventory Page', inventory:inventory,catagory:catagory , user:req.user});      
   } 
   })
///////////////
router.post('/deleteInv', (req,res)=>{
  async function deleteInventory(){
    try{
      await client.connect()
      await invGetter(client)
    }catch(error){
      console.log(error)
    }finally{
   console.log('complete')
   await client.close()
    }
  }
  deleteInventory().catch(console.error);
  async function invGetter(client){
    const newId = ObjectId(req.body.invId)
     const results = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_inventory').deleteOne({"_id":newId})
    console.log(results)
  return res.redirect('inventory')
  }
})
///////////////
router.post('/updateInv', (req,res)=>{
  console.log('update'+req.body.invId)
  async function updateInventory(){
    try{await client.connect()
    await invUpdater(client,{
name:req.body.name,
originalPost:req.body.ogPost,
price:req.body.price,
catRef:req.body.catRef,
    })}
    catch(error){console.log(error)}
    finally{await client.close()}
  }
  updateInventory().catch(console.error);
  async function invUpdater(client,updateInfo){
    const newId=ObjectId(req.body.invId)
const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_inventory').updateOne({"_id":newId},{$set:updateInfo},{upsert:true})
return res.redirect('inventory')
}
})
//////////
 router.post('/upload',upload.single('photo'), function(req,res){
  /*isolate file extention*/
  const imageData= req.file;
  const ogStr=0;
  const str = imageData.originalname;
  const str2 = imageData.filename;
  const strSplit= str.split('.');
  const ext = strSplit[1];
  const oldFilepath = "../"+config.IMAGE_FP+"/uploads/";
  const newFilepath = "../"+config.IMAGE_FP+"/public/images/blog/"
  const newName = 'blog_Image_'+ Date.now()+"."+ext;
/*^^end^^*/
  const bImgName = "images/blog/"+newName;
  fs.rename(oldFilepath+str2,newFilepath+newName,(error)=>{
if(err){
  console.log(error);
}
 })
  async function saveBlog(bImgName,data){
    try {
      await client.connect();
      await createBlog(client,{
        bTitle:req.body.title,
        postDate:Date.now(),
        bSubtitle:req.body.subtitle,
        bDetails:req.body.details,
        imgName:bImgName
      });
     }
     catch(error){
       console.log(error);
     }
     finally{
     await client.close();
   }}
 saveBlog(bImgName).catch(console.error);
   async function createBlog(client,newBlog){
    const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_blogs').insertOne(newBlog);
    res.redirect('admin');
    }
   }
)
//////////

//////////DELETE BLOGS
router.post('/delBlog',(req,res)=>{
  async function deleteBlog(){
    try{
      await client.connect();
      await getBlog(client);  
    }
    catch(error){
      console.log(error);
    }
    finally{
      await client.close();
    }
  }
  deleteBlog().catch(console.error);
  async function getBlog(client){
    const newID =ObjectId(req.body.blogDelete);
  const deleteIt = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_blogs').deleteOne({"_id":newID});
  const data = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_registry').find().toArray();
  const blogs= await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_blogs').find().toArray();
  res.redirect('admin');
  }
})

/////////////INVENTORY UPLOADS
router.post('/newItem',upload.single('photo'), function(req,res){
  //isolate file extention
  const imageData= req.file;
  const ogStr=0;
  const str = imageData.originalname;
  const str2 = imageData.filename;
  const strSplit= str.split('.');
  const ext = strSplit[1];
  const oldFilepath = "../"+config.IMAGE_FP+"/uploads/";
  const newFilepath = "../"+config.IMAGE_FP+"/public/images/inventory/"
  const newName = 'inventory_image_'+ Date.now()+"."+ext;
/*^^end^^*/

  const bImgName = "images/inventory/"+newName;

  fs.rename(oldFilepath+str2,newFilepath+newName,(err)=>{
if(err){
  console.log(err);
}
 })
  async function saveBlog(bImgName,data){
    const pplInfo =req.body.paypalcode; 
    console.log(pplInfo);
    try {
      await client.connect();
      await createBlog(client,{
        name:req.body.inventoryName,
        postDate:Date.now(),
        price:req.body.inventoryPrice,
        details:req.body.inventoryDetails,
        catRef:req.body.catSelect,
        imgName:bImgName,
        shipping:{
        height:req.body.inventoryHeight,
        width:req.body.inventoryWidth,
        depth:req.body.inventoryDepth,
        weight:req.body.inventoryWeight,        
        }
     
      });
     }
     catch(error){
       console.log(error);
     }
     finally{
     await client.close();
   }}
 saveBlog(bImgName).catch(console.error);
   async function createBlog(client,newBlog){
    const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_inventory').insertOne(newBlog);
    res.redirect('admin');
    }
   }
)
/////////SAVE COLORS
router.post('/newColor', function(req,res){
  async function saveColor(){
    try {
      await client.connect();
      await createColor(client,{
       postDate:Date.now(),
       colorHex:req.body.clrHex,
      colorTag:req.body.clrTag,
      });
     }
     catch(error){
       console.log(error);
     }
     finally{
     await client.close();
   }}
 saveColor().catch(console.error);
   async function createColor(client,newColor){
    const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_colors').insertOne(newColor);
    res.redirect('admin');
    }
   }
)

////DELETE COLORS
router.post('/delColor',(req,res)=>{
  async function deleteColor(){
    try{
      await client.connect();
      await getColor(client);  
    }
    catch(error){
      console.log(error);
    }
    finally{
      await client.close();
    }
  }
  deleteColor().catch(console.error);
  async function getColor(client){
    const newID =ObjectId(req.body.colorDel);
  const deleteIt = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_colors').deleteOne({"_id":newID});
return  res.redirect('admin');
  }
})


//////CATEGOREIS
/////////SAVE CATAGORIES
router.post('/newCat', function(req,res){
  async function saveCat(){
    try {
      await client.connect();
      await createCat(client,{
       postDate:Date.now(),
       catName:req.body.catName,
      
      });
     }
     catch(error){
       console.log(error);
     }
     finally{
     await client.close();
   }}
 saveCat().catch(console.error);
   async function createCat(client,newCat){

    const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_categories').insertOne(newCat);
  return  res.redirect('admin');
    }
   }
)

////DELETE CATAGORIES
router.post('/delCat',(req,res)=>{
  async function deleteCat(){
    try{
      await client.connect();
      await getCat(client,{
"catRef":"Not_Categorized"
      });  
    }
    catch(error){
      console.log(error);
    }
    finally{
      await client.close();
    }
  }
  deleteCat().catch(console.error);
  async function getCat(client, updateInfo){
    const newID =req.body.catDel;
   const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_catagories').deleteOne({"catName":newID})
  const result2 = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_inventory').updateMany({"catRef":newID},{$set:updateInfo},{upsert:true})
    console.log(result+' modded '+ "Deleting Category Name "+ newID+"\n\n result2: "+ result2)
 return res.redirect('admin');
  }
})
router.get('/options2', (req,res)=>{
  console.log(config.COLLECTION_SUBPATH)
  const options = {
    url:config.DB_URL+"/api/read",
    method:'GET',
    json:{
      subpath:config.COLLECTION_SUBPATH,
      dbName:config.DB_NAME,
      findParam:"_faqs"
    }
  }
  request(options, (error,response, body)=>{
    if (error){
      console.log(error)
    }else{
      console.log(body)
    }
  })
  
})

router.get('/options',(req,res)=>{
  async function faqGetter(){
    try{
      await client.connect()
    await faqPopulate(client)}
    catch(error){console.log(error)}
    finally{client.close}
  }
  faqGetter().catch(console.error);
  async function faqPopulate(client){
    const faqs = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_faqs').find().toArray()
    console.log(faqs)
    res.render('options',{title:"options", faqs:faqs})
  }
})

router.post('/newFAQ',(req,res)=>{
async function newFAQs(){
  try{
    await client.connect()
    await faqAdd(client,{
      faqQ:req.body.faq,
      faqA:req.body.faqAnswer
    })
  }
  catch(err){console.log(err)}
  finally{await client.close()}
}
newFAQs().catch(console.error);
async function faqAdd(client,faqOptions){
  const result = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_faqs').insertOne(faqOptions)
  console.log(result)
}
res.redirect('options')
})

router.post('/delFaq', (req,res)=>{
  async function delFaqs(){
    try{
      await client.connect()
      await faqDeleter(client)
    }
    catch(error){console.log(error)}
    finally{await client.close()}
  }
  delFaqs().catch(console.error);
  async function faqDeleter(client){
    const newID =ObjectId(req.body.faqId);
  const deleteIt = await client.db(config.DB_NAME).collection(config.COLLECTION_SUBPATH+'_faqs').deleteOne({"_id":newID});
  console.log(deleteIt)
  res.redirect('options')
}
})

//first graph api to facebook
//refactor in its own file and build out from w2 mongo microsvc
router.get('/ptf', (req, res) => { 
  const ahref = req.body.ahref
  const headline = req.body.headline
  const accessToken = process.env.FBPAT
  const message = `heres a message`;
 const imgUrl = req.body.imgUrl
 let image = null;
  const options = {
    method: 'POST',
    url: `https://graph.facebook.com/v16.0/115893380202482/photos`,
    qs: {access_token: 'EAAHWXokkDBABAEpWhAvZAMY12JPMMe81pE5qCyvR0olHbyZARgfeoE9vtuWbhb3oz1JcfPJOJUXGRdbm299esSt5r1Jsik9wLfWKT4HRFYA3FkRZBZBE9DpqZA5FrtwnUUozSkfPeGOBQnZBiOZAgg5i02XoXQVaCtUrao1OeAbtpFBmwQqCzfdzx2DJlZCDfVlmR989Grv6ZCuZCHQmwqRPvJP1sgzMkZClzgZD'},  
  message:"message to graph api with photo"
  };

  request(options, (error, response, body) => {
    if (error) {
      console.log(`Error: ${error}`);
      res.status(500).send(`Error: ${error}`);
    } else {
      console.log(`Response: ${response.statusCode} ${response.statusMessage}`);
      console.log(`Body: ${JSON.stringify(body)}`);
    
      res.redirect('admin')
    }
  });
  
});


module.exports = router;