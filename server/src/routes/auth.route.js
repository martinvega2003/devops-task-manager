import { Router } from 'express';
import { registerUser, loginUser, registerTeamMember, getTeamMembers } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';

const router = Router();

// Register user
router.post('/register/', registerUser);

// Login user
router.post('/login', loginUser);

//ADMIN-SPECIFIC ENDPOINTS

// Invite a new team member (Admin only)
router.post('/invite', authMiddleware, isAdminMiddleware, registerTeamMember);

// Get All Team Members
router.get('/team-members', authMiddleware, isAdminMiddleware, getTeamMembers);

export default router;
