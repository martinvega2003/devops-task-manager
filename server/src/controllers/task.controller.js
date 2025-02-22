import pool from '../database.js';

// Create Task Controller
export const createTask = async (req, res) => {
  const { title, description, priority, deadline, status = 'Pending', project_id } = req.body;
  const userId = req.user.id; // Assuming req.user.id contains the logged-in user's ID

  if (!title || !description || !priority || !deadline || !project_id) {
    return res.status(400).json({ msg: 'All fields (title, description, priority, deadline, project_id) are required.' });
  }

  try {
    // Check if project exists and belongs to the user
    const project = await pool.query('SELECT * FROM projects WHERE id = $1 AND admin_id = $2', [project_id, userId]);

    if (project.rows.length === 0) {
      return res.status(403).json({ msg: 'Project not found or you do not have permission to add tasks to this project.' });
    }

    // Create the task
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, project_id, priority, deadline, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, project_id, priority, deadline, status]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get all tasks with filtering and sorting
export const getAllTasks = async (req, res) => {
  const { status, priority, deadline, sortBy, order } = req.query; // Get query parameters

  let query = 'SELECT * FROM tasks WHERE user_id = $1'; // Start with user filter

  const queryParams = [req.user.id]; // User ID as a parameter

  // Add filters based on the query parameters
  if (status) {
    query += ' AND status = $' + (queryParams.length + 1); // Add status filter
    queryParams.push(status);
  }

  if (priority) {
    query += ' AND priority = $' + (queryParams.length + 1); // Add priority filter
    queryParams.push(priority);
  }

  if (deadline) {
    query += ' AND deadline = $' + (queryParams.length + 1); // Add deadline filter
    queryParams.push(deadline);
  }

  // Add sorting
  if (sortBy) {
    const validSortFields = ['created_at', 'deadline'];
    if (validSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order || 'ASC'}`; // Default to ascending order
    }
  } else {
    query += ' ORDER BY created_at ASC'; // Default sorting by created_at
  }

  try {
    const tasks = await pool.query(query, queryParams);
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
