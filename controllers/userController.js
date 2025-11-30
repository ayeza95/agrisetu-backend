import User from '../models/User.js';
import Crop from '../models/Crop.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
export const signup = async (req, res) => {
    
    const { name, email, password, phone, role, farmerDetails, address } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        
        const user = await User.create({
            name,
            email,
            password, // Assumes your User model has a pre('save') hook to hash this
            phone,
            role,
            address, // Saving the address object containing village, district, etc.
            farmerDetails: role === 'seller' ? farmerDetails : undefined
        });

        if (user) {
            res.status(201).json({
                message: 'User created successfully!',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    // Good practice to return phone/address on signup too so state can update immediately
                    phone: user.phone,
                    address: user.address 
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Signup Error:", error); // Log actual error for debugging
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        // Check if user exists first to avoid crash on null.password access
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                message: 'Logged in successfully!',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    farmerDetails: user.farmerDetails,
                    isVerified: user.isVerified
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user and their associated data (crops)
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // If the user is a farmer, delete all their crops first.
            if (user.role === 'seller') {
                await Crop.deleteMany({ farmer: user._id });
            }

            await user.deleteOne(); 
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            
            // Handle merging nested farmerDetails
            if (user.role === 'seller' && req.body.farmerDetails) {
                user.farmerDetails = { ...user.farmerDetails, ...req.body.farmerDetails };
            }

            const updatedUser = await user.save();
            
            res.json({
                message: 'Profile updated successfully',
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    farmerDetails: updatedUser.farmerDetails
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};