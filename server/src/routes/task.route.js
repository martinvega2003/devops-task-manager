import { Router } from 'express';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new task
router.post('/', authMiddleware, createTask);

// Get all tasks
router.get('/', authMiddleware, getAllTasks);

// Get task by ID
router.get('/:id', authMiddleware, getTaskById);

// Update task
router.put('/:id', authMiddleware, updateTask);

// Delete task
router.delete('/:id', authMiddleware, deleteTask);

export default router;
