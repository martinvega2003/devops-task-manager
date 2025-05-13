import pool from "../database.js";

const checkTaskOwner = async (req, res, next) => {
    const { taskId } = req.params; 
    const adminId = req.user.id;
  
    try {
      // Check if task exists and belongs to an admin's project
      const task = await pool.query(
        'SELECT t.id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1 AND p.admin_id = $2',
        [taskId, adminId]
      );
  
      if (task.rows.length === 0) {
        return res.status(403).json({ msg: 'Task not found or you do not have permission to access this task.' });
      }
  
      next(); // Move to the next middleware/controller if check passes
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
};

export default checkTaskOwner
  