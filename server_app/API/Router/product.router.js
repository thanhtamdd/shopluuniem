import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * GET /api/Product
 */
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Products ORDER BY CreatedAt DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/Product/category?id=1
 */
router.get("/category", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("categoryId", req.query.id)
            .query(`
                SELECT *
                FROM Products
                WHERE CategoryID = @categoryId
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/Product/category/gender?gender=male
 */
router.get("/category/gender", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("gender", req.query.gender)
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

/**
 * GET /api/Product/category/pagination?page=1&limit=8
 */
router.get("/category/pagination", async (req, res) => {
    try {
        const { page = 1, limit = 8 } = req.query;
        const offset = (page - 1) * limit;

        const pool = getPool();
        const result = await pool.request()
            .input("limit", Number(limit))
            .input("offset", Number(offset))
            .query(`
                SELECT *
                FROM Products
                ORDER BY CreatedAt DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/Product/scoll/page?page=2&limit=8
 */
router.get("/scoll/page", async (req, res) => {
    try {
        const { page = 1, limit = 8 } = req.query;
        const offset = (page - 1) * limit;

        const pool = getPool();
        const result = await pool.request()
            .input("limit", Number(limit))
            .input("offset", Number(offset))
            .query(`
                SELECT *
                FROM Products
                ORDER BY CreatedAt DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ CHI TIẾT SẢN PHẨM
 * GET /api/Product/detail/:id
 */
router.get("/detail/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query(`
                SELECT p.*, c.Name AS CategoryName
                FROM Products p
                JOIN Categories c ON p.CategoryID = c.CategoryID
                WHERE p.ProductID = @id
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
