import bcrypt from 'bcryptjs';
import pool from '../database.js';

// Creating a Team Member Account
export const registerTeamMember = async (req, res) => {
  console.log('Register endpoint hit');

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
        admin_id: user.admin_id
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
      // Fetch all team members created by this admin
      const result = await pool.query('SELECT id, username, email, role, active FROM users WHERE admin_id = $1', [adminId]);

      res.status(200).json({
          teamMembers: result.rows
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
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