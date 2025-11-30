// backend/models/Order.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    specialInstructions: {
        type: String
    },
    buyerName: {
        type: String,
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    cropPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);