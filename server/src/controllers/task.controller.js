import pool from '../database.js';

// Create a new task
export const createTask = async (req, res) => {
  const { title, description, priority, deadline, status = 'Pending' } = req.body;
  const user_id = req.user.id;  // Get user ID from the authenticated user

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

// Get all tasks (User-specific)
export const getAllTasks = async (req, res) => {
  const user_id = req.user.id;  // Get user ID from the authenticated user

  try {
    // Fetch tasks only for the authenticated user
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1', 
      [user_id]
    );
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get task by ID (User-specific)
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;  // Get user ID from the authenticated user

  try {
    // Fetch task by ID and ensure it belongs to the authenticated user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', 
      [id, user_id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found or you do not have access' });
    }

    res.json(task.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task (User-specific)
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, deadline, status } = req.body;
  const user_id = req.user.id;  // Get user ID from the authenticated user

  try {
    // Check if task belongs to the user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', 
      [id, user_id]
    );

    if (task.rows.length === 0) {
      return res.status(403).json({ msg: 'You cannot update a task that you did not create' });
    }

    // Update the task
    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, priority = $3, deadline = $4, status = $5 WHERE id = $6 RETURNING *', 
      [title, description, priority, deadline, status, id]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete task (User-specific)
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;  // Get user ID from the authenticated user

  try {
    // Check if task belongs to the user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', 
      [id, user_id]
    );

    if (task.rows.length === 0) {
      return res.status(403).json({ msg: 'You cannot delete a task that you did not create' });
    }

    // Delete the task
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task status (User-specific)
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;  // Get user ID from the authenticated user

  try {
    // Check if task belongs to the user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', 
      [id, user_id]
    );

    if (task.rows.length === 0) {
      return res.status(403).json({ msg: 'You cannot update the status of a task that you did not create' });
    }

    // Update task status
    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', 
      [status, id]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
