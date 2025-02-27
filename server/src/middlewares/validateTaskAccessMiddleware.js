import pool from "../database.js";

export const validateTaskAccess = async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    // Check if task exists !) Join projects Table to have admin_id value
    const task = await pool.query("SELECT t.*, p.admin_id FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.id = $1", [taskId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ msg: "Task not found." });
    }

    // Check if user is assigned to the task or is the admin
    const userTask = await pool.query(
      "SELECT * FROM task_users WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );

    if (task.rows[0].admin_id !== userId && userTask.rows.length === 0) {
      return res.status(403).json({ msg: "Access denied. You are not assigned to this task." });
    }

    // Attach task to request for further processing
    req.task = task.rows[0];
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
