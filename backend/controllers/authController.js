import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    console.log('🔐 Login attempt for:', emailOrUsername);

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required'
      });
    }

    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    }).select('+password');
    if (!admin) {
      console.log('❌ Admin not found:', emailOrUsername);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', emailOrUsername);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/' // Important: set path
    };

    console.log('🍪 Setting refresh token cookie with options:', cookieOptions);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    console.log('✅ Login successful for:', emailOrUsername);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    });

 } catch (error) {
  console.error("========== LOGIN ERROR ==========");
  console.error(error);
  console.error(error.stack);

  return res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack
  });
}
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingAdmin = await Admin.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      message: 'An admin with this email or username already exists'
    });
  }

  const admin = await Admin.create({ username, email, password, role });

  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    }
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Refresh token request received');
    console.log('🍪 All cookies:', req.cookies);
    console.log('🍪 Refresh token from cookie:', req.cookies?.refreshToken);

    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.log('❌ No refresh token in cookies');
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('🔍 Decoded refresh token:', decoded);

    // Find admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      console.log('❌ Admin not found for refresh token');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    console.log('✅ New access token generated for:', admin.email);

    res.status(200).json({
  success: true,
  data: {
    accessToken,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    }
  }
});

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

export const logout = asyncHandler(async (req, res) => {
  console.log('🚪 Logout request received');
  
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});