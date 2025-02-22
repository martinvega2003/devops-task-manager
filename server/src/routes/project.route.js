import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject, updateProjectStatus } from '../controllers/project.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isAdminMiddleware } from '../middlewares/isAdminMiddleware.js';
import { checkProjectOwner } from '../middlewares/checkProjectOwner.js';

const router = Router();

// CRUD Routes for Projects:

//Create Project
router.post('/', authMiddleware, isAdminMiddleware, createProject);

//Get All Projects
router.get('/', authMiddleware, isAdminMiddleware, getAllProjects);

//Get A Project By ID
router.get('/:id', authMiddleware, isAdminMiddleware, checkProjectOwner, getProjectById);

//Update Project
router.put('/:id', authMiddleware, isAdminMiddleware, checkProjectOwner, updateProject);

//Delete Project 
router.delete('/:id', authMiddleware, isAdminMiddleware, checkProjectOwner, deleteProject);

//Update Project Status:
router.patch('/:id/status', authMiddleware, isAdminMiddleware, checkProjectOwner, updateProjectStatus);


export default router;
