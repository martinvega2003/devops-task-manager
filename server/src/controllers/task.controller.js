import pool from '../database.js';

// Create a new task
export const createTask = async (req, res) => {
  const { title, description, priority, deadline, status = 'Pending' } = req.body;  // Default status to 'Pending'
  const user_id = req.user.id; // Get user ID from the authenticated user

  try {
    // Insert the new task into the database, including status
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, user_id, priority, deadline, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, user_id, priority, deadline, status]
    );

    // Respond with the created task
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
  

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM tasks');
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (task.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, deadline, status } = req.body;

  try {
    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, priority = $3, deadline = $4, status = $5 WHERE id = $6 RETURNING *',
      [title, description, priority, deadline, status, id]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (deletedTask.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task status (New feature)
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;  // Status can be 'Pending', 'Completed', etc.

  try {
    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};