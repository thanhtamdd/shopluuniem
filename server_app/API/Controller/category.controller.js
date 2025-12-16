import { getPool } from "../../config/db.js";

/* =========================
   GET ALL CATEGORY
========================= */
export const index = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT * FROM Category
            ORDER BY id DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
