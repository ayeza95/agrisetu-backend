//backend/server.js file

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

if (!process.env.MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not set. Server cannot start.");
    process.exit(1);
}
const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://127.0.0.1:5502'
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1); 
    });
