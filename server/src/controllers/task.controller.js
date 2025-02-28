import pool from '../database.js';
import { upload, deleteFile } from '../middlewares/multerConfig.js';
import multer from 'multer';

// Create Task Controller
export const createTask = async (req, res) => {
  const { title, description, priority, status = 'Pending', projectId, assignedUsers, startTime, endTime } = req.body;
  const adminId = req.user.id; // Assuming req.user.id contains the logged-in user's ID

  if (!title || !description || !priority || !startTime || !endTime || !projectId) {
    return res.status(400).json({ msg: 'All fields (title, description, priority, start_time, end_time, project_id) are required.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = (end - start) / (1000 * 60); // Duration in minutes

  if (duration < 15 || duration > 480) {
    return res.status(400).json({ msg: 'Task duration must be between 15 minutes and 8 hours.' });
  }

  try {
    // Check if project exists and belongs to the user - checkProjectOwner uses projectId from req.params, which is not available in this controller
    const project = await pool.query('SELECT * FROM projects WHERE id = $1 AND admin_id = $2', [projectId, adminId]);

    if (project.rows.length === 0) {
      return res.status(403).json({ msg: 'Project not found or you do not have permission to add tasks to this project.' });
    }

    // Get Users registered by this Admin (Their IDs)
    const registeredUsers = await pool.query('SELECT id FROM users WHERE admin_id = $1', [adminId]);
    const validUserIds = registeredUsers.rows.map(user => user.id);

    // Filter assignedUsers to include just the ones registered by the Admin.
    const filteredAssignedUsers = assignedUsers?.filter(userId => validUserIds.includes(Number(userId))) || [];

    // Check for overlapping tasks
    if (filteredAssignedUsers.length > 0) {
      const overlappingUsers = await pool.query(
        `SELECT DISTINCT u.id, u.email, u.username, u.role, 
                t.id AS task_id, t.title AS task_title, t.start_time, t.end_time, 
                p.name AS project_name
         FROM task_users tu
         JOIN tasks t ON tu.task_id = t.id
         JOIN users u ON tu.user_id = u.id
         JOIN projects p ON t.project_id = p.id
         WHERE tu.user_id = ANY($1)
         AND t.end_time > $2
         AND t.start_time < $3`,
        [filteredAssignedUsers, start, end]
      );

      if (overlappingUsers.rows.length > 0) {
        return res.status(400).json({
          msg: 'One or more assigned users already have a task during this time block.',
          conflictingUsers: overlappingUsers.rows,
        });
      }
    }

    // Create the task
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, project_id, priority, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, projectId, priority, start, end, status]
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
    // Base query: Get tasks with user count and assigned users
    let query = `
      SELECT 
        t.*,
        COUNT(tu.user_id) AS assigned_users_count,
        JSON_AGG(
          JSON_BUILD_OBJECT('id', u.id, 'name', u.username, 'email', u.email)
        ) AS assigned_users
      FROM tasks t
      LEFT JOIN task_users tu ON t.id = tu.task_id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE t.project_id = $1
    `;
    const queryParams = [projectId];

    // Add filters based on the query parameters
    if (status) {
      query += ' AND t.status = $' + (queryParams.length + 1);
      queryParams.push(status);
    }

    if (priority) {
      query += ' AND t.priority = $' + (queryParams.length + 1);
      queryParams.push(priority);
    }

    if (deadline) {
      query += ' AND t.deadline = $' + (queryParams.length + 1);
      queryParams.push(deadline);
    }

    // Group by task ID
    query += ' GROUP BY t.id';

    // Add sorting
    const validSortFields = ['created_at', 'deadline'];
    if (sortBy && validSortFields.includes(sortBy)) {
      query += ` ORDER BY t.${sortBy} ${order?.toUpperCase() || 'ASC'}`;
    } else {
      query += ' ORDER BY t.created_at ASC'; // Default sorting by created_at
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
    // Fetch task by ID with assigned users
    const task = await pool.query(
      `
      SELECT 
        t.*, 
        COUNT(tu.user_id) AS assigned_users_count,
        JSON_AGG(
          JSON_BUILD_OBJECT('id', u.id, 'name', u.username, 'email', u.email)
        ) AS assigned_users
      FROM tasks t
      LEFT JOIN task_users tu ON t.id = tu.task_id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE t.id = $1
      GROUP BY t.id
      `,
      [taskId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(task.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Update task (User-specific)
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, status, assignedUsers, startTime, endTime } = req.body;
  const adminId = req.user.id;

  try {
    // Ensure the task exists and belongs to the admin
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);

    if (task.rows.length === 0) {
      return res.status(404).json({ msg: 'Task not found.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / (1000 * 60); // Duration in minutes

    if (duration < 15 || duration > 480) {
      return res.status(400).json({ msg: 'Task duration must be between 15 minutes and 8 hours.' });
    }

    // Get Users registered by this Admin (Their IDs)
    const registeredUsers = await pool.query('SELECT id FROM users WHERE admin_id = $1', [adminId]);
    const validUserIds = registeredUsers.rows.map(user => user.id);

    // Filter assignedUsers to include just the ones registered by the Admin
    const filteredAssignedUsers = assignedUsers?.filter(userId => validUserIds.includes(Number(userId))) || [];

    // Check for overlapping tasks
    if (filteredAssignedUsers.length > 0) {
      const overlappingUsers = await pool.query(
        `SELECT DISTINCT u.id, u.email, u.username, u.role, 
                t.id AS task_id, t.title AS task_title, t.start_time, t.end_time, 
                p.name AS project_name
         FROM task_users tu
         JOIN tasks t ON tu.task_id = t.id
         JOIN users u ON tu.user_id = u.id
         JOIN projects p ON t.project_id = p.id
         WHERE tu.user_id = ANY($1)
         AND t.end_time > $2
         AND t.start_time < $3
         AND t.id <> $4  -- Exclude the task being updated`,
        [filteredAssignedUsers, start, end, taskId]
      );

      if (overlappingUsers.rows.length > 0) {
        return res.status(400).json({
          msg: 'One or more assigned users already have a task during this time block.',
          conflictingUsers: overlappingUsers.rows,
        });
      }
    }

    // Remove all current assignments
    await pool.query('DELETE FROM task_users WHERE task_id = $1', [taskId]);

    // Assign users to the task if the Admin assigned them
    if (filteredAssignedUsers.length > 0) {
      const values = filteredAssignedUsers.map(userId => `(${taskId}, ${userId})`).join(", ");
      await pool.query(`INSERT INTO task_users (task_id, user_id) VALUES ${values}`);
    }

    // Update the task
    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, priority = $3, start_time = $4, end_time = $5, status = $6 WHERE id = $7 RETURNING *', 
      [title, description, priority, startTime, endTime, status, taskId]
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

// TASK ASSETS CONTROLLERS:

// Get All Assets
export const getAllAssets = async (req, res) => {
  const { taskId } = req.params;

  try {
    const assets = await pool.query(
      `SELECT ta.*, 
              u.id AS user_id, u.username, u.email, u.role 
       FROM task_assets ta
       JOIN users u ON ta.uploaded_by = u.id
       WHERE ta.task_id = $1`,
      [taskId]
    );

    const formattedAssets = assets.rows.map(asset => ({
      id: asset.id,
      task_id: asset.task_id,
      filename: asset.filename,
      file_url: asset.file_url,
      uploaded_by: {
        id: asset.user_id,
        name: asset.username,
        email: asset.email,
        role: asset.role,
      },
    }));

    res.json(formattedAssets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload an Asset
export const uploadAsset = async (req, res) => {
  upload.single("file")(req, res, async (err) => {
    try {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ msg: `Multer error: ${err.field}` });
        }
        return res.status(500).json({ msg: "File upload failed. Please try again." });
      }

      const { taskId } = req.params;
      const userId = req.user.id; // Assuming req.user is set in auth middleware
      const file = req.file;

      if (!file) {
        return res.status(400).json({ msg: "No file uploaded." });
      }

      // Store file details in the database
      const result = await pool.query(
        `INSERT INTO task_assets (task_id, uploaded_by, filename, file_url)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [taskId, userId, file.filename, `/uploads/${file.filename}`]
      );

      res.status(201).json({
        msg: "File uploaded successfully.",
        asset: result.rows[0],
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ msg: "Server error." });
    }
  });
};

// Delete an Asset
export const deleteAsset = async (req, res) => {
  const { assetId } = req.params;

  try {
    // Get the asset details
    const asset = await pool.query("SELECT * FROM task_assets WHERE id = $1", [assetId]);

    if (asset.rows.length === 0) {
      return res.status(404).json({ msg: "Asset not found." });
    }

    // Delete the file from the uploads folder
    deleteFile(asset.rows[0].filename);
    
    // Delete the asset
    await pool.query("DELETE FROM task_assets WHERE id = $1", [assetId]);

    res.json({ msg: "Asset deleted successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
}