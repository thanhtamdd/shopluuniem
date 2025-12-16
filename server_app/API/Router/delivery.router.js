import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Tạo thông tin giao hàng
 * POST /api/Delivery
 */
router.post("/", async (req, res) => {
    try {
        const { orderId, receiverName, phone, address, note } = req.body;
        const pool = getPool();

        await pool.request()
            .input("orderId", orderId)
            .input("receiverName", receiverName)
            .input("phone", phone)
            .input("address", address)
            .input("note", note)
            .query(`
                INSERT INTO Deliveries (OrderID, ReceiverName, Phone, Address, Note)
                VALUES (@orderId, @receiverName, @phone, @address, @note)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Lấy thông tin giao hàng theo đơn
 * GET /api/Delivery/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("orderId", req.params.id)
            .query(`
                SELECT *
                FROM Deliveries
                WHERE OrderID = @orderId
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
