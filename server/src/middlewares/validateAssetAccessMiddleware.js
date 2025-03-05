import pool from "../database.js";

const validateAssetAccess = async (req, res, next) => {
  const { assetId } = req.params;
  const userId = req.user.id;

  try {
    // Check if task exists !) Join projects Table to have admin_id value
    const asset = await pool.query("SELECT ta.uploaded_by, p.admin_id FROM task_assets ta JOIN tasks t ON ta.task_id = t.id JOIN projects p ON t.project_id = p.id WHERE ta.id = $1", [assetId]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ msg: "Asset not found." });
    }

    if (asset.rows[0].admin_id !== userId && asset.rows[0].uploaded_by !== userId) {
      return res.status(403).json({ msg: "Access denied. You cannot delete this asset." });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export default validateAssetAccess
