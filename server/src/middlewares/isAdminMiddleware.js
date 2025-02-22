import pool from "../database.js";

export const isAdminMiddleware = async (req, res, next) => {
    try {
      const user = await pool.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
  
      if (user.rows.length === 0 || user.rows[0].role !== 'Admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
      }
  
      next(); // Continue if user is an admin
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  