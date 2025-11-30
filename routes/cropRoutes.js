// backend/routes/cropRoutes

import express from "express";
import Crop from "../models/Crop.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/crops - Get all available crops (for buyers)
router.get("/", async (req, res) => {
    try {
        console.log("[API] Fetching all available crops");
        const crops = await Crop.find({ status: 'available' }).populate({path: 'farmer', select: 'name phone'});
        res.json(crops);
    } catch (err) {
        console.error("[API] Error fetching crops:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/crops/pending - Get all pending crops (for admin)
router.get("/pending", async (req, res) => {
    try {
        console.log("[API] Fetching all pending crops for admin approval");
        // You might want to add middleware here later to ensure only admins can access this
        const pendingCrops = await Crop.find({ status: 'pending_approval' }).populate('farmer', 'name');
        res.json(pendingCrops);
    } catch (err) {
        console.error("[API] Error fetching pending crops:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/crops - Add new crop (for farmers)
router.post("/", async (req, res) => {
    try {
        console.log("[API] Received POST request for /api/crops");
        const { 
            name, category, price, quantity, description, location, 
            quality, farmerId, farmerName, imageUrl
        } = req.body; 

        // Validate required fields
        if (!name || !category || !price || !quantity || !location || !farmerId || !farmerName) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const crop = new Crop({
            name,
            category,
            price,
            quantity,
            description,
            location,
            quality: quality || 'Standard',
            farmer: farmerId,
            farmerName,
            status: 'pending_approval', 
            image: imageUrl 
        });

        await crop.save();
        
        console.log(`[API] Crop '${name}' added successfully by farmer '${farmerName}'`);
        res.status(201).json({ 
            message: "Crop added successfully!", 
            crop 
        });
    } catch (err) {
        console.error("[API] Error adding crop:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/crops/farmer/:farmerId - Get crops by specific farmer
router.get("/farmer/:farmerId", async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log(`[API] Fetching crops for farmer: ${farmerId}`);
        
        const crops = await Crop.find({ farmer: farmerId });
        res.json(crops);
    } catch (err) {
        console.error("[API] Error fetching farmer crops:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/crops/:id - Update crop
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const crop = await Crop.findByIdAndUpdate(id, updates, { new: true });
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }
        
        console.log(`[API] Crop '${crop.name}' updated successfully`);
        res.json({ message: "Crop updated successfully!", crop });
    } catch (err) {
        console.error("[API] Error updating crop:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/crops/:id - Delete crop
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const crop = await Crop.findByIdAndDelete(id);
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }
        
        console.log(`[API] Crop '${crop.name}' deleted successfully`);
        res.json({ message: "Crop deleted successfully!" });
    } catch (err) {
        console.error("[API] Error deleting crop:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;