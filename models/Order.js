const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    items: [
        {
            title: String,   
            price: Number,
            quantity: Number,
            imgSrc: String   
        }
    ],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { collection: "orders" });

module.exports = mongoose.model("Order", orderSchema);
