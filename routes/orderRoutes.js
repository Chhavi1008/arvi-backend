require('dotenv').config();
const express = require("express");
const router = express.Router();
const Order = require("../models/order"); // Import the order model
const User = require("../models/user");
const nodemailer = require("nodemailer"); // Import nodemailer
const authMiddleware = require('../middleware/authMiddleware');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// Place Order Route
router.post("/place-order", authMiddleware, async (req, res) => {
    try {
        console.log("🛒 Order Route Reached"); // Debug log

        const { items, total } = req.body;
        const userId = req.user.userId; // Extracted from the token via middleware

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order." });
        }

        // Fetch user's email from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create new order document
        const newOrder = new Order({
            userId: userId, // Storing order linked to the authenticated user
            items: items, // List of purchased items
            total: total,
            date: new Date()
        });

        await newOrder.save(); // Save order to MongoDB
        console.log("✅ Order saved successfully:", newOrder);

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, 
            subject: "Order Confirmation - ARVI Fashion",
            text: `Dear ${user.name},\n\nThank you for your order!\n\nOrder Details:\n- Total: $${total}\n- Items: ${items.map(item => `${item.title} (x${item.quantity})`).join(", ")}\n\nYour order has been received and is being processed.\n\nBest regards,\nARVI Fashion`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Email sending failed:", error);
            } else {
                console.log("📧 Order confirmation email sent:", info.response);
            }
        });
        
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;