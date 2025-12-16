import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Lấy comment theo product
 * GET /api/Comment/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("productId", req.params.id)
            .query(`
                SELECT c.CommentID, c.Content, c.CreatedAt, u.FullName
                FROM Comments c
                JOIN Users u ON c.UserID = u.UserID
                WHERE c.ProductID = @productId
                ORDER BY c.CreatedAt DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Thêm comment
 * POST /api/Comment/:id
 */
router.post("/:id", async (req, res) => {
    try {
        const { userId, content } = req.body;
        const pool = getPool();

        await pool.request()
            .input("productId", req.params.id)
            .input("userId", userId)
            .input("content", content)
            .query(`
                INSERT INTO Comments (ProductID, UserID, Content)
                VALUES (@productId, @userId, @content)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
