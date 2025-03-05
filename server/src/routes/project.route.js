import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject, updateProjectStatus, getUserProjects } from '../controllers/project.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';
import checkProjectOwner from '../middlewares/checkProjectOwner.js';
import checkProjectAccess from '../middlewares/checkProjectAccess.js';

const router = Router();

// CRUD Routes for Projects:

//Create Project
router.post('/', authMiddleware, isAdminMiddleware, createProject);

//Get All Projects
router.get('/', authMiddleware, isAdminMiddleware, getAllProjects);

//Get A Project By ID
router.get('/:projectId', authMiddleware, checkProjectAccess, getProjectById);

//Update Project
router.put('/:projectId', authMiddleware, isAdminMiddleware, checkProjectOwner, updateProject);

//Delete Project 
router.delete('/:projectId', authMiddleware, isAdminMiddleware, checkProjectOwner, deleteProject);

//Update Project Status:
router.patch('/:projectId/status', authMiddleware, isAdminMiddleware, checkProjectOwner, updateProjectStatus);

// ------------- NON ADMIN SPECIFIC ROUTES

router.get('/user/assigned', authMiddleware, getUserProjects)


export default router;
