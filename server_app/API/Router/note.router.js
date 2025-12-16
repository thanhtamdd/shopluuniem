import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Tạo ghi chú cho đơn hàng
 * POST /api/Note
 */
router.post("/", async (req, res) => {
    try {
        const { orderId, content } = req.body;
        const pool = getPool();

        await pool.request()
            .input("orderId", orderId)
            .input("content", content)
            .query(`
                INSERT INTO Notes (OrderID, Content)
                VALUES (@orderId, @content)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Lấy ghi chú theo đơn hàng
 * GET /api/Note/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("orderId", req.params.id)
            .query(`
                SELECT NoteID, Content, CreatedAt
                FROM Notes
                WHERE OrderID = @orderId
                ORDER BY CreatedAt DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
