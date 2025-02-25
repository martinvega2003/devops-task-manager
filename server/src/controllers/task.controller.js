import pool from '../database.js';

// Create Task Controller
export const createTask = async (req, res) => {
  const { title, description, priority, deadline, status = 'Pending', projectId, assignedUsers } = req.body;
  const adminId = req.user.id; // Assuming req.user.id contains the logged-in user's ID

  if (!title || !description || !priority || !deadline || !projectId) {
    return res.status(400).json({ msg: 'All fields (title, description, priority, deadline, project_id) are required.' });
  }

  try {
    // Check if project exists and belongs to the user
    const project = await pool.query('SELECT * FROM projects WHERE id = $1 AND admin_id = $2', [projectId, adminId]);

    if (project.rows.length === 0) {
      return res.status(403).json({ msg: 'Project not found or you do not have permission to add tasks to this project.' });
    }

    // Get Users registered by this Admin (Their IDs)
    const registeredUsers = await pool.query('SELECT id FROM users WHERE admin_id = $1', [adminId]);
    const validUserIds = registeredUsers.rows.map(user => user.id);

    // Filter assignedUsers to include just the ones registered by the Admin.
    const filteredAssignedUsers = assignedUsers?.filter(userId => validUserIds.includes(Number(userId))) || [];

    // Create the task
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, project_id, priority, deadline, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, projectId, priority, deadline, status]
    );

    // Assign users to the task if the Admin assigned them using the task_users Database table
    if (filteredAssignedUsers && filteredAssignedUsers.length > 0) {
      const values = filteredAssignedUsers.map(userId => `(${newTask.rows[0].id}, ${userId})`).join(", "); //Pass the task id and the id of all assigned users in differnet rows in the task_users table
      await pool.query(`INSERT INTO task_users (task_id, user_id) VALUES ${values}`);
    }

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get all tasks for a specific project with filtering and sorting
export const getAllTasks = async (req, res) => {
  const { projectId } = req.params; // Get project ID from URL params
  const { status, priority, deadline, sortBy, order } = req.query; // Get query parameters

  if (!projectId) {
    return res.status(400).json({ msg: 'Project ID is required.' });
  }

  try {
    // Base query: Get tasks for the specified project
    let query = 'SELECT * FROM tasks WHERE project_id = $1';
    const queryParams = [projectId];

    // Add filters based on the query parameters
    if (status) {
      query += ' AND status = $' + (queryParams.length + 1);
      queryParams.push(status);
    }

    if (priority) {
      query += ' AND priority = $' + (queryParams.length + 1);
      queryParams.push(priority);
    }

    if (deadline) {
      query += ' AND deadline = $' + (queryParams.length + 1);
      queryParams.push(deadline);
    }

    // Add sorting
    const validSortFields = ['created_at', 'deadline'];
    if (sortBy && validSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order?.toUpperCase() || 'ASC'}`;
    } else {
      query += ' ORDER BY created_at ASC'; // Default sorting by created_at
    }

    // Execute query
    const tasks = await pool.query(query, queryParams);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


// Get task by ID (User-specific)
export const getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Fetch task by ID
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1', 
      [taskId]
    );

    res.json(task.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task (User-specific)
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, deadline, status } = req.body;

  try {
    // Update the task
    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, priority = $3, deadline = $4, status = $5 WHERE id = $6 RETURNING *', 
      [title, description, priority, deadline, status, taskId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete task (User-specific)
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Delete the task
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update task status (User-specific)
export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    // Update task status
    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', 
      [status, taskId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
