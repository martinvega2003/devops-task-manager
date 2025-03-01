import { Router } from 'express';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask, updateTaskStatus, getAllAssets, deleteAsset, uploadAsset, getUserTasks } from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';
import checkProjectOwner from '../middlewares/checkProjectOwner.js';
import checkTaskOwner from '../middlewares/checkTaskOwner.js';
import { validateTaskAccess } from '../middlewares/validateTaskAccessMiddleware.js';
import { validateAssetAccess } from '../middlewares/validateAssetAccessMiddleware.js';

const router = Router();

// Create a new task
router.post('/', authMiddleware, isAdminMiddleware, createTask);

// Get all tasks from an specific project
router.get('/project/:projectId', authMiddleware, isAdminMiddleware, checkProjectOwner, getAllTasks);

// Get task by ID
router.get('/:taskId', authMiddleware, validateTaskAccess, getTaskById);

// Update task
router.put('/:taskId', authMiddleware, isAdminMiddleware, checkTaskOwner, updateTask);

// Delete task
router.delete('/:taskId', authMiddleware, isAdminMiddleware, checkTaskOwner, deleteTask);

// Route for updating task status
router.patch('/:taskId/status', authMiddleware, validateTaskAccess, updateTaskStatus);

// TASK ASSETS ROUTES:

// get all assets 
router.get('/:taskId/assets', authMiddleware, validateTaskAccess, getAllAssets)

// update assets 
router.post('/:taskId/assets', authMiddleware, validateTaskAccess, uploadAsset)

// delete assets 
router.delete('/:taskId/assets/:assetId', authMiddleware, validateTaskAccess, validateAssetAccess, deleteAsset)

// ------------- NON ADMIN SPECIFIC ROUTES

router.get('/user/assigned', authMiddleware, getUserTasks)

export default router;
