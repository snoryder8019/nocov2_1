const express =require('express');
const router = express.Router();



const {resizeAndCropImage}  = require('./sharp/sharp')



module.exports={resizeAndCropImage}