import bcrypt from 'bcryptjs';
import pool from '../database.js';

// Creating a Team Member Account
export const registerTeamMember = async (req, res) => {
  const { name, email, password, role } = req.body;
  const adminId = req.user.id; // The logged-in admin's ID

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide name, email, password, and role" });
  }

  // Allowed roles (you can modify this list)
  const allowedRoles = ["developer", "designer", "administrative", "manager"];
  
  if (!allowedRoles.includes(role.toLowerCase())) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new team member with admin_id
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, role, adminId]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        adminId: user.admin_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get All Team Members From An Admin ID
export const getTeamMembers = async (req, res) => {
  const adminId = req.user.id; // Get the logged-in admin's ID

  try {
    const result = await pool.query(
      `SELECT 
          u.id AS user_id,
          u.username,
          u.email,
          u.role,
          u.active,
          COUNT(DISTINCT t.id) AS tasks_count,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status <> 'Completed') AS pending_tasks_count,
          COUNT(DISTINCT ta.project_id) AS projects_count
      FROM 
          users u
      LEFT JOIN 
          task_users tu ON u.id = tu.user_id
      LEFT JOIN 
          tasks t ON tu.task_id = t.id
      LEFT JOIN 
          tasks ta ON ta.id = tu.task_id
      WHERE 
          u.admin_id = $1
      GROUP BY 
          u.id;`,
      [adminId]
    );

    res.status(200).json({
      message: 'Team members fetched successfully',
      teamMembers: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeamMemberById = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user details
    const userQuery = await pool.query("SELECT id, username, email, active, role, created_at FROM users WHERE id = $1", [userId]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    const user = userQuery.rows[0];

    // Fetch active tasks assigned to the user
    const activeTasksQuery = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN task_users tu ON t.id = tu.task_id
       WHERE tu.user_id = $1 AND t.status IN ('Pending', 'In Progress')`,
      [userId]
    );
    
    const activeTasks = activeTasksQuery.rows;

    // Fetch active projects based on the active tasks
    const activeProjectsQuery = await pool.query(
      `SELECT DISTINCT p.id, p.name
       FROM projects p
       JOIN tasks t ON p.id = t.project_id
       WHERE t.id = ANY($1) AND p.status = 'Active'`,
      [activeTasks.map(task => task.id)]
    );
    
    // Structure response
    const activeProjects = activeProjectsQuery.rows.map(project => {
      return {
        title: project.name,
        tasks: activeTasks.filter(task => task.project_id === project.id)
      };
    });

    res.json({
      ...user,
      active_projects: activeProjects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error." });
  }
};

// Deactivate Team Member Account (Soft Delete):
export const toggleUserActiveStatus = async (req, res) => {
  const { userId } = req.params;

  try {
      // Fetch the current active status of the user
      const userResult = await pool.query(
          'SELECT active FROM users WHERE id = $1',
          [userId]
      );

      // If the user doesn't exist
      if (userResult.rowCount === 0) {
          return res.status(404).json({ msg: 'User not found' });
      }

      // Get the current active status
      const currentActiveStatus = userResult.rows[0].active;

      // Toggle the active status
      const newActiveStatus = !currentActiveStatus;

      // Update the user with the new active status
      await pool.query(
          'UPDATE users SET active = $1 WHERE id = $2',
          [newActiveStatus, userId]
      );

      res.json({
          msg: `User ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
  }
};

// Permanently Delete Team Member From Database:
export const deleteUser = async (req, res) => {
	const { userId } = req.params;

	try {
			// Delete user
			await pool.query(
					'DELETE FROM users WHERE id = $1',
					[userId]
			);

			res.json({ msg: 'User deleted successfully' });
	} catch (error) {
			console.error(error);
			res.status(500).json({ msg: 'Internal server error' });
	}
};