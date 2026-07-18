import express from 'express';
import { adminLogin, logoutAdmin, refreshAccessToken, registerAdmin } from '../controllers/authController.js';
import validate from '../middleware/validateMiddleware.js';
import { adminLoginSchema, adminRegisterSchema } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/login', validate(adminLoginSchema, 'body'), adminLogin);

router.post('/refresh-token', refreshAccessToken);


router.post('/logout', protect, logoutAdmin);

// Optional: Route for admin registration (use with caution, e.g., for initial setup)
router.post('/register', validate(adminRegisterSchema, 'body'), registerAdmin);

export default router;
