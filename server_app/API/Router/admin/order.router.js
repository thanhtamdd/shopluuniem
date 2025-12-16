import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

/**
 * Lấy tất cả đơn hàng
 */
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Orders ORDER BY CreatedAt DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Chi tiết đơn hàng (Orders)
 */
router.get("/detail/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Orders WHERE OrderID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Chi tiết sản phẩm trong đơn hàng (OrderDetails)
 */
router.get("/detailorder/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("orderId", req.params.id)
            .query(`
                SELECT od.*, p.Name AS ProductName
                FROM OrderDetails od
                JOIN Products p ON od.ProductID = p.ProductID
                WHERE od.OrderID = @orderId
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Xác nhận đơn hàng
 */
router.patch("/confirmorder", async (req, res) => {
    try {
        const { orderId } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", orderId)
            .query("UPDATE Orders SET Status = 'confirmed' WHERE OrderID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Hủy đơn hàng
 */
router.patch("/cancelorder", async (req, res) => {
    try {
        const { orderId } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", orderId)
            .query("UPDATE Orders SET Status = 'cancelled' WHERE OrderID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Giao hàng
 */
router.patch("/delivery", async (req, res) => {
    try {
        const { orderId } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", orderId)
            .query("UPDATE Orders SET Status = 'delivery' WHERE OrderID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Xác nhận đã giao
 */
router.patch("/confirmdelivery", async (req, res) => {
    try {
        const { orderId } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", orderId)
            .query("UPDATE Orders SET Status = 'delivered' WHERE OrderID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Danh sách đơn hoàn tất
 */
router.get("/completeOrder", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Orders WHERE Status = 'completed'");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
