import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Lấy sản phẩm theo giới tính
 * /api/Product/category/gender?gender=male
 */
router.get("/category/gender", async (req, res) => {
    try {
        const { gender } = req.query;
        const pool = getPool();

        const result = await pool.request()
            .input("gender", gender)
            .query(`
                SELECT *
                FROM Products
                WHERE Gender = @gender
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
