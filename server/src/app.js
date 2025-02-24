import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import taskRoutes from './routes/task.route.js';
import projectRoutes from "./routes/project.route.js"
import teamRoutes from "./routes/team.route.js"

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

export default app;
