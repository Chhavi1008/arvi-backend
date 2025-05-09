require('dotenv').config();

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// Contact Form Submission
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Input Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    try {
        // Save to Database
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();

    
        // Send Email Notification (Optional)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Form Submission: ${subject}`,
            text: `You received a message from:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
        } catch (error) {
            console.error('Email sending failed:', error);
            return res.status(500).json({ success: false, message: 'Message saved, but email sending failed.' });
        }


        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
