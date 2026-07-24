import express from 'express';
import {
  login,
  logout,
  refreshAccessToken,
  registerAdmin
} from "../controllers/authController.js";
import validate from '../middleware/validateMiddleware.js';
import { adminLoginSchema, adminRegisterSchema } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', validate(adminLoginSchema, 'body'), login);

// router.post('/register', validate(adminRegisterSchema, 'body'), registerAdmin);

router.post('/refresh-token', refreshAccessToken);


router.post('/logout', protect, logout);

export default router;
