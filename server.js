require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB 
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); 
});

// Import routes
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');  // ✅ Added authentication routes

// Use routes
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);  // ✅ Authentication route

// Default route
app.get('/', (req, res) => {
    res.send('✅ Server is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));