import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * Hiển thị danh sách đơn hàng theo user
 * GET /api/Order/order/:id
 */
router.get("/order/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("userId", req.params.id)
            .query(`
                SELECT *
                FROM Orders
                WHERE UserID = @userId
                ORDER BY CreatedAt DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Hiển thị chi tiết đơn hàng
 * GET /api/Order/order/detail/:id
 */
router.get("/order/detail/:id", async (req, res) => {
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
 * Đặt hàng – tạo Order
 * POST /api/Order/order
 */
router.post("/order", async (req, res) => {
    const transaction = new (require("mssql").Transaction)(getPool());

    try {
        const { userId, totalAmount, items } = req.body;
        await transaction.begin();

        // Tạo Order
        const order = await transaction.request()
            .input("userId", userId)
            .input("total", totalAmount)
            .query(`
                INSERT INTO Orders (UserID, Status, TotalAmount)
                OUTPUT INSERTED.OrderID
                VALUES (@userId, 'pending', @total)
            `);

        const orderId = order.recordset[0].OrderID;

        // Thêm OrderDetails
        for (const item of items) {
            await transaction.request()
                .input("orderId", orderId)
                .input("productId", item.productId)
                .input("quantity", item.quantity)
                .input("price", item.price)
                .query(`
                    INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
                    VALUES (@orderId, @productId, @quantity, @price)
                `);
        }

        await transaction.commit();

        res.json({ success: true, orderId });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
});

/**
 * Thanh toán MoMo (stub)
 * POST /api/Order/momo
 */
router.post("/momo", async (req, res) => {
    // Giữ API cho frontend – chưa tích hợp thật
    res.json({
        success: true,
        message: "MoMo payment stub – chưa tích hợp"
    });
});

/**
 * Gửi email (stub)
 * POST /api/Order/email
 */
router.post("/email", async (req, res) => {
    // Giữ API cho frontend – chưa tích hợp thật
    res.json({
        success: true,
        message: "Send email stub – chưa tích hợp"
    });
});

export default router;
