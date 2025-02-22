import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject, updateProjectStatus } from '../controllers/project.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// CRUD Routes for Projects:

//Create Project
router.post('/', authMiddleware, createProject);

//Get All Projects
router.get('/', authMiddleware, getAllProjects);

//Get A Project By ID
router.get('/:id', authMiddleware, getProjectById);

//Update Project
router.put('/:id', authMiddleware, updateProject);

//Delete Project 
router.delete('/:id', authMiddleware, deleteProject);

//Update Project Status:
router.patch('/:id/status', authMiddleware, updateProjectStatus);


export default router;
