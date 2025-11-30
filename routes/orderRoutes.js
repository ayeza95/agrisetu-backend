// backend/Routes/orderRoutes.js

import express from "express";
import Order from "../models/Order.js";
import Crop from "../models/Crop.js";

const router = express.Router();

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
    try {
        console.log("[API] Creating new order");
        const { cropId, quantity, deliveryAddress, specialInstructions, buyerId, buyerName } = req.body;

        // Validate required fields
        if (!cropId || !quantity || !deliveryAddress || !buyerId || !buyerName) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Get crop details
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        // Check if enough quantity is available
        if (crop.quantity < quantity) {
            return res.status(400).json({ message: "Not enough quantity available" });
        }

        // Calculate total amount
        const totalAmount = crop.price * quantity;

        // Create order
        const order = new Order({
            crop: cropId,
            buyer: buyerId,
            farmer: crop.farmer,
            quantity,
            totalAmount,
            deliveryAddress,
            specialInstructions: specialInstructions || '',
            buyerName,
            farmerName: crop.farmerName,
            cropName: crop.name,
            cropPrice: crop.price
        });

        await order.save();

        // Update crop quantity
        crop.quantity -= quantity;
        if (crop.quantity === 0) {
            crop.status = 'sold_out'; // Standardize status to 'sold_out'
        }
        await crop.save();

        console.log(`[API] Order created successfully for ${buyerName}`);
        res.status(201).json({ 
            message: "Order placed successfully!", 
            order 
        });

    } catch (err) {
        console.error("[API] Error creating order:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/buyer/:buyerId - Get orders by buyer
router.get("/buyer/:buyerId", async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyer: buyerId })
            .populate('crop', 'name category image')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/farmer/:farmerId - Get orders by farmer
router.get("/farmer/:farmerId", async (req, res) => {
    try {
        const { farmerId } = req.params;
        const orders = await Order.find({ farmer: farmerId })
            .populate('buyer', 'name phone')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders - Get all orders (for admin)
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('crop', 'name category')
            .populate('buyer', 'name email')
            .populate('farmer', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated successfully!", order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;