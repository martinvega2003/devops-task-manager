import pool from '../database.js';

// ------ Admin Specific Functions ---------------

// Create a new project (Admin only)
export const createProject = async (req, res) => {
  const { name, description, deadline } = req.body;
  const adminId = req.user.id;  // Admin ID from the authenticated user

  try {
    // Insert new project, associating with admin who created it
    const newProject = await pool.query(
      'INSERT INTO projects (name, description, deadline, admin_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, deadline, adminId]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all projects (Admin-specific)
export const getAllProjects = async (req, res) => {
  const { status, sortBy, order } = req.query; // Get query parameters
  const adminId = req.user.id;  // Get user ID from the authenticated user
  
  let query = 'SELECT * FROM projects WHERE admin_id = $1'; // Start with admin filter
  
  const queryParams = [adminId]; // User ID as a parameter
  
  // Add filters based on the query parameters
  if (status) {
    query += ' AND status = $' + (queryParams.length + 1); // Add status filter's number after the '$' symbol
    queryParams.push(status); // Add status as query parameter
  }
  
  // Add sorting
  if (sortBy) {
    const validSortFields = ['created_at', 'deadline'];
    if (validSortFields.includes(sortBy)) { //Execute only if sortBy value = created_at or deadline
      query += ` ORDER BY ${sortBy} ${order || 'ASC'}`; // Default to ascending order
    }
  } else {
    query += ' ORDER BY created_at ASC'; // Default sorting by created_at and ASC order (If no sortBt value was passed in the query params)
  }
  
  try {
    const projects = await pool.query(query, queryParams); // Make the SQL query to the Database
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a project by ID (Admin can only access their projects)
export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Return the project with the ID
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    res.json(project.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a project (Admin only, and only their own projects)
export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, deadline } = req.body;

  try {
    // Update project details
    const updatedProject = await pool.query(
      'UPDATE projects SET name = $1, description = $2, deadline = $3 WHERE id = $4 RETURNING *',
      [name, description, deadline, projectId]
    );

    res.json(updatedProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a project (Admin only, and only their own projects)
export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Delete the project
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Project Status (Admin-specific)
export const updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  try {
    // Update project status
    const updatedProject = await pool.query(
      'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *', 
      [status, projectId]
    );

    res.json(updatedProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

