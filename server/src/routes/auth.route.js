import { Router } from 'express';
import { registerUser, loginUser, registerTeamMember } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';

const router = Router();

// Register user
router.post('/register/', registerUser);

// Login user
router.post('/login', loginUser);

// Invite a new team member (Admin only)
router.post('/invite', authMiddleware, isAdminMiddleware, registerTeamMember);

export default router;
