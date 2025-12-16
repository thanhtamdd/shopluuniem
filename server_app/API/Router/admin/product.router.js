import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

/**
 * Danh sách sản phẩm
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
 * Chi tiết sản phẩm
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Products WHERE ProductID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Tạo sản phẩm
 */
router.post("/create", async (req, res) => {
    try {
        const { name, price, quantity, description, image, categoryId } = req.body;
        const pool = getPool();

        await pool.request()
            .input("name", name)
            .input("price", price)
            .input("quantity", quantity)
            .input("description", description)
            .input("image", image)
            .input("categoryId", categoryId)
            .query(`
                INSERT INTO Products (Name, Price, Quantity, Description, Image, CategoryID)
                VALUES (@name, @price, @quantity, @description, @image, @categoryId)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Cập nhật sản phẩm
 */
router.patch("/update", async (req, res) => {
    try {
        const { id, name, price, quantity, description, image, categoryId } = req.body;
        const pool = getPool();

        await pool.request()
            .input("id", id)
            .input("name", name)
            .input("price", price)
            .input("quantity", quantity)
            .input("description", description)
            .input("image", image)
            .input("categoryId", categoryId)
            .query(`
                UPDATE Products
                SET Name = @name,
                    Price = @price,
                    Quantity = @quantity,
                    Description = @description,
                    Image = @image,
                    CategoryID = @categoryId
                WHERE ProductID = @id
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Xóa sản phẩm
 */
router.delete("/delete", async (req, res) => {
    try {
        const { id } = req.body;
        const pool = getPool();

        await pool.request()
            .input("id", id)
            .query("DELETE FROM Products WHERE ProductID = @id");

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
