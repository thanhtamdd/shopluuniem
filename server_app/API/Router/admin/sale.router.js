import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

/**
 * Danh sách sale
 */
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Sales ORDER BY CreatedAt DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Tạo sale
 */
router.post("/", async (req, res) => {
    try {
        const { name, discountPercent, startDate, endDate, productIds } = req.body;
        const pool = getPool();

        const sale = await pool.request()
            .input("name", name)
            .input("discount", discountPercent)
            .input("start", startDate)
            .input("end", endDate)
            .query(`
                INSERT INTO Sales (Name, DiscountPercent, StartDate, EndDate)
                OUTPUT INSERTED.SaleID
                VALUES (@name, @discount, @start, @end)
            `);

        const saleId = sale.recordset[0].SaleID;

        if (Array.isArray(productIds)) {
            for (const productId of productIds) {
                await pool.request()
                    .input("saleId", saleId)
                    .input("productId", productId)
                    .query(`
                        INSERT INTO SaleProducts (SaleID, ProductID)
                        VALUES (@saleId, @productId)
                    `);
            }
        }

        res.json({ success: true, saleId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Chi tiết sale
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Sales WHERE SaleID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Cập nhật sale
 */
router.patch("/:id", async (req, res) => {
    try {
        const { name, discountPercent, startDate, endDate } = req.body;
        const pool = getPool();

        await pool.request()
            .input("id", req.params.id)
            .input("name", name)
            .input("discount", discountPercent)
            .input("start", startDate)
            .input("end", endDate)
            .query(`
                UPDATE Sales
                SET Name = @name,
                    DiscountPercent = @discount,
                    StartDate = @start,
                    EndDate = @end
                WHERE SaleID = @id
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Danh sách sản phẩm đang sale
 */
router.get("/list/product", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT p.*, s.DiscountPercent
            FROM SaleProducts sp
            JOIN Products p ON sp.ProductID = p.ProductID
            JOIN Sales s ON sp.SaleID = s.SaleID
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Chi tiết sale + sản phẩm
 */
router.get("/list/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query(`
                SELECT p.*
                FROM SaleProducts sp
                JOIN Products p ON sp.ProductID = p.ProductID
                WHERE sp.SaleID = @id
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
