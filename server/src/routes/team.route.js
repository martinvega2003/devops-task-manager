import { Router } from 'express';
import { registerTeamMember, getTeamMembers, deactivateUser, deleteUser } from '../controllers/team.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';
import checkUserAdminMiddleware from '../middlewares/checkUserAdminMiddleware.js';

const router = Router();

// Invite a new team member (Admin only)
router.post('/invite', authMiddleware, isAdminMiddleware, registerTeamMember);

// Get All Team Members
router.get('/team-members', authMiddleware, isAdminMiddleware, getTeamMembers);

// Deactivate a team member
router.put('/deactivate/:userId', authMiddleware, checkUserAdminMiddleware, deactivateUser);

// Delete a team member
router.delete('/delete/:userId', authMiddleware, checkUserAdminMiddleware, deleteUser);

export default router;