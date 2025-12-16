import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

// Lấy tất cả danh mục
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query("SELECT * FROM Categories");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh mục theo ID
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Categories WHERE CategoryID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy sản phẩm theo danh mục (detailProduct)
router.get("/detail/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("categoryId", req.params.id)
            .query("SELECT * FROM Products WHERE CategoryID = @categoryId");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tạo danh mục mới
router.post("/create", async (req, res) => {
    try {
        const { name, description } = req.body;
        const pool = getPool();
        await pool.request()
            .input("name", name)
            .input("description", description)
            .query("INSERT INTO Categories (Name, Description) VALUES (@name, @description)");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa danh mục
router.delete("/delete", async (req, res) => {
    try {
        const { id } = req.body; // gửi id trong body
        const pool = getPool();
        await pool.request()
            .input("id", id)
            .query("DELETE FROM Categories WHERE CategoryID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật danh mục
router.put("/update", async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", id)
            .input("name", name)
            .input("description", description)
            .query("UPDATE Categories SET Name=@name, Description=@description WHERE CategoryID=@id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
