import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Hiển thị danh sách chi tiết đơn hàng
 * GET /api/DetailOrder/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("orderId", req.params.id)
            .query(`
                SELECT od.OrderDetailID,
                       od.Quantity,
                       od.Price,
                       p.ProductID,
                       p.Name,
                       p.Image
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
 * Thêm chi tiết đơn hàng
 * POST /api/DetailOrder
 */
router.post("/", async (req, res) => {
    try {
        const { orderId, productId, quantity, price } = req.body;
        const pool = getPool();

        await pool.request()
            .input("orderId", orderId)
            .input("productId", productId)
            .input("quantity", quantity)
            .input("price", price)
            .query(`
                INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
                VALUES (@orderId, @productId, @quantity, @price)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
