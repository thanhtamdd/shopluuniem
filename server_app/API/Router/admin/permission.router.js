import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

/**
 * Lấy danh sách permission (giống index)
 */
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Permissions ORDER BY CreatedAt DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Lấy toàn bộ permission (giống all)
 */
router.get("/all", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Permissions");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Chi tiết permission
 */
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Permissions WHERE PermissionID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Tạo permission mới
 */
router.post("/create", async (req, res) => {
    try {
        const { name, description } = req.body;
        const pool = getPool();

        await pool.request()
            .input("name", name)
            .input("description", description)
            .query(`
                INSERT INTO Permissions (Name, Description)
                VALUES (@name, @description)
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Xóa permission
 */
router.delete("/delete", async (req, res) => {
    try {
        const { id } = req.body;
        const pool = getPool();

        await pool.request()
            .input("id", id)
            .query("DELETE FROM Permissions WHERE PermissionID = @id");

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Cập nhật permission
 */
router.put("/update", async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const pool = getPool();

        await pool.request()
            .input("id", id)
            .input("name", name)
            .input("description", description)
            .query(`
                UPDATE Permissions
                SET Name = @name,
                    Description = @description
                WHERE PermissionID = @id
            `);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
