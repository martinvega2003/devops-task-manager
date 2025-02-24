import pool from '../database.js';

const checkUserAdminMiddleware = async (req, res, next) => {
    const { userId } = req.params; // Get the userId from URL parameter
    const adminId = req.user.id; // Assuming `req.user` contains authenticated admin's data

    try {
        // Check if the user exists and belongs to the admin
        const user = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND admin_id = $2',
            [userId, adminId]
        );

        if (user.rowCount === 0) {
            return res.status(404).json({ msg: "User not found or doesn't belong to you" });
        }

        // Proceed if user exists and belongs to the admin
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

export default checkUserAdminMiddleware;
