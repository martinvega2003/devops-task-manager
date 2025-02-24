import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

// Register new user
export const registerUser = async (req, res) => {
    console.log('Register endpoint hit');
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user in database
      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
      );
  
      const user = result.rows[0];
  
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.rows[0].id,
        role: user.rows[0].role,  // Add the role to the payload
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//ADMIN-SPECIFIC CONTROLLERS:

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
        role: user.role
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
      const result = await pool.query('SELECT id, username, email, role FROM users WHERE admin_id = $1', [adminId]);

      res.status(200).json({
          teamMembers: result.rows
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

