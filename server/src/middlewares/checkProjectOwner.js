import pool from "../database.js";

const checkProjectOwner = async (req, res, next) => {
  const { projectId } = req.params; // Get project ID from request body (or params if needed)
  const adminId = req.user.id; // Assuming `req.user.id` contains the logged-in user's ID

  try {
    // Check if project exists and belongs to the admin user
    const project = await pool.query('SELECT * FROM projects WHERE id = $1 AND admin_id = $2', [projectId, adminId]);

    if (project.rows.length === 0) {
      return res.status(403).json({ msg: 'Project not found or you do not have permission to access this project.' });
    }

    next(); // Move to the next middleware/controller if check passes
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export default checkProjectOwner
