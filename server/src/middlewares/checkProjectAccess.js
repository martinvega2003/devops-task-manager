import pool from "../database.js";

const checkProjectAccess = async (req, res, next) => {
  const { projectId } = req.params; // Get project ID from request parameters
  const userId = req.user.id; // Get the authenticated user's ID

  try {
    // Check if the user is the admin of the project
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND admin_id = $2', 
      [projectId, userId]
    );

    if (project.rows.length > 0) {
      return next(); // User is the admin, grant access
    }

    // If not an admin, check if the user has any assigned tasks in the project
    const userTask = await pool.query(
      `SELECT t.id 
       FROM tasks t
       JOIN task_users tu ON t.id = tu.task_id
       WHERE t.project_id = $1 AND tu.user_id = $2`,
      [projectId, userId]
    );

    if (userTask.rows.length > 0) {
      return next(); // User has tasks assigned in the project, grant access
    }

    // If neither, deny access
    return res.status(403).json({ msg: 'You do not have permission to access this project.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export default checkProjectAccess;
