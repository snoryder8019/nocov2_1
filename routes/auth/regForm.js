const express = require('express');
const router = express.Router();
const env = require('dotenv').config();
const client = require('../../config/mongo');
const ObjectId = require('mongodb').ObjectId;
const crypto = require('crypto');
const transporter = require('../../plugins/nodemailer/setup'); // Import the nodemailer transporter setup
const config = require('../../config/config')
router.post('/newContact', async (req, res) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const db = client.db(config.DB_NAME);
        const collection = db.collection(`${config.COLLECTION_SUBPATH}_regForm`);
        const { fname, email, regType, agree, message } = req.body;
        const data = {
            token: token,
            sent: false,
            result: "",
            email: {
                name: fname,
                email: email,
                regType: regType,
                agree: agree,
                message: message
            }
        };
        const response = await collection.insertOne(data);
        const verificationLink = `${process.env.BASE_URL}verify-email?token=${token}`;
        // Send email using nodemailer transporter
        await transporter.sendMail({
            from: config.EMAIL,
            to: email,
            subject: 'Email Verification Link to send your Message to Noco Metalworkz',
            html: `Click <a href="${verificationLink}">here</a> to verify your email.`
        });
       res.redirect('/')
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});
router.get('/verify-email', async (req, res) => {
    try {
        const token = req.query.token;
        const db = client.db(config.DB_NAME);
        const collection = db.collection(`${config.COLLECTION_SUBPATH}_regForm`);
        
        // Find the document with the provided token
        console.log(token)
        const document = await collection.findOne({ "token": token });
        if (!document) {
            return res.status(404).send("Token not found");
        }
        
        // Extract the entire email object from the document
        const email = document.email;

        // Send email to the app owner with the entire email object
        await transporter.sendMail({
            from: config.EMAIL,
            to: config.EMAIL, // Change to the owner's email address
            subject: 'Message Receipt Confirmed from Nocometalworkz.com',
            html: `
            <h2>A website guest has confirmed their email for a New Contact Form!</h2>
                <p>New contact form submission:</p>
                <p>Name: ${email.name}</p>
                <p>Email: ${email.email}</p>
                <p>Registration Type: ${email.regType}</p>
                <p>Agree: ${email.agree}</p>
                <p>Message: ${email.message}</p>
            `
        });

       res.redirect('/')
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
