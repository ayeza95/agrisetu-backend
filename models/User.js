import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer' 
    },
    
    address: {
        village: { type: String },
        district: { type: String },
        state: { type: String },
        pincode: { type: String },
        street: { type: String }
    },
    isVerified: { type: Boolean, default: false },
    
    
    farmerDetails: {
        farmName: String,
        landSize: String, // Or Number, depending on your preference
        landType: String,
        soilType: String,
        farmingExperience: String,
        averageYield: String,
        organicCertified: Boolean,
        
        // Document URLs
        profilePhotoUrl: String,
        aadharCardUrl: String,
        landDocumentsUrl: String,
        bankPassbookUrl: String,

        // Crops (Arrays of Strings)
        primaryCrops: [String],
        secondaryCrops: [String]
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;