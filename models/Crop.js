// backend/models/crop.model.js

import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['vegetables', 'fruits', 'grains', 'spices']
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL or file path
        default: ''
    },
    quality: {
        type: String,
        enum: ['Premium', 'Grade A', 'Grade B', 'Standard'],
        default: 'Standard'
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending_approval', 'available', 'sold_out', 'rejected'],
        default: 'pending_approval'
    }
}, { timestamps: true });

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;