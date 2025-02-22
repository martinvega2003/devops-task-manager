import { Router } from 'express';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask, updateTaskStatus } from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isAdminMiddleware } from '../middlewares/isAdminMiddleware.js';

const router = Router();

// Create a new task
router.post('/', authMiddleware, isAdminMiddleware, createTask);

// Get all tasks
router.get('/', authMiddleware, isAdminMiddleware, getAllTasks);

// Get task by ID
router.get('/:id', authMiddleware, isAdminMiddleware, getTaskById);

// Update task
router.put('/:id', authMiddleware, isAdminMiddleware, updateTask);

// Delete task
router.delete('/:id', authMiddleware, isAdminMiddleware, deleteTask);

// Route for updating task status
router.patch('/:id/status', authMiddleware, isAdminMiddleware, updateTaskStatus);

export default router;
