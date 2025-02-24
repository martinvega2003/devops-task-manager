import { Router } from 'express';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask, updateTaskStatus } from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isAdminMiddleware } from '../middlewares/isAdminMiddleware.js';
import { checkTaskOwner } from '../middlewares/checkTaskOwner.js';
import { checkProjectOwner } from '../middlewares/checkProjectOwner.js';

const router = Router();

// Create a new task
router.post('/', authMiddleware, isAdminMiddleware, createTask);

// Get all tasks from an specific project
router.get('/project/:id', authMiddleware, isAdminMiddleware, checkProjectOwner, getAllTasks);

// Get task by ID
router.get('/:id', authMiddleware, isAdminMiddleware, checkTaskOwner, getTaskById);

// Update task
router.put('/:id', authMiddleware, isAdminMiddleware, checkTaskOwner, updateTask);

// Delete task
router.delete('/:id', authMiddleware, isAdminMiddleware, checkTaskOwner, deleteTask);

// Route for updating task status
router.patch('/:id/status', authMiddleware, isAdminMiddleware, checkTaskOwner, updateTaskStatus);

export default router;
