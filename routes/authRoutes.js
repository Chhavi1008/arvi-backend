const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Import User Model

const router = express.Router();

// ✅ Register a new user
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ firstName, lastName, email, password: hashedPassword });

        await user.save();
        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
        res.json({ success: true, token, user: { firstName: user.firstName, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Logout User
router.post('/logout', (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;