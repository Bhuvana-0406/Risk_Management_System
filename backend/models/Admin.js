import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true, 
        trim: true,
        lowercase: true, 
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ] 
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Prevents password from being returned in queries
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    refreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash password before saving
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

AdminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

AdminSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS)/1000 }
    );
};
AdminSchema.methods.generateRefreshToken = function() {
   
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS)/1000 } 
    );
};

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
