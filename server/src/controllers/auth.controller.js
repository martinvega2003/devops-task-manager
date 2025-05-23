import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

// Register new user
export const registerUser = async (req, res) => {
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
      const payload = {
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
        },
      }
  
      // Generate JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role
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
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND active = true', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials or deactivated account' });
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    const user = result.rows[0];
    const payload = {
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,  // Add the role to the payload
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'User Logged successfully',
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role
      },
      token
    }); // Return just the user information, success message and login Token
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};