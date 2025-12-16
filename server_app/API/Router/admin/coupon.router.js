import express from "express";
import { getPool } from "../../../config/db.js";

const router = express.Router();

// Lấy tất cả coupon
router.get("/", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query("SELECT * FROM Coupons");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy coupon theo ID
router.get("/:id", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input("id", req.params.id)
            .query("SELECT * FROM Coupons WHERE CouponID = @id");
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tạo coupon mới
router.post("/", async (req, res) => {
    try {
        const { Code, Discount, Description, IsActive, StartDate, EndDate } = req.body;
        const pool = getPool();
        await pool.request()
            .input("Code", Code)
            .input("Discount", Discount)
            .input("Description", Description)
            .input("IsActive", IsActive)
            .input("StartDate", StartDate)
            .input("EndDate", EndDate)
            .query(`INSERT INTO Coupons (Code, Discount, Description, IsActive, StartDate, EndDate) 
                    VALUES (@Code,@Discount,@Description,@IsActive,@StartDate,@EndDate)`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật coupon
router.patch("/:id", async (req, res) => {
    try {
        const { Code, Discount, Description, IsActive, StartDate, EndDate } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", req.params.id)
            .input("Code", Code)
            .input("Discount", Discount)
            .input("Description", Description)
            .input("IsActive", IsActive)
            .input("StartDate", StartDate)
            .input("EndDate", EndDate)
            .query(`UPDATE Coupons 
                    SET Code=@Code, Discount=@Discount, Description=@Description, 
                        IsActive=@IsActive, StartDate=@StartDate, EndDate=@EndDate
                    WHERE CouponID=@id`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa coupon
router.delete("/:id", async (req, res) => {
    try {
        const pool = getPool();
        await pool.request()
            .input("id", req.params.id)
            .query("DELETE FROM Coupons WHERE CouponID = @id");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kiểm tra coupon promotion
router.get("/promotion/checking", async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .query("SELECT * FROM Coupons WHERE IsActive = 1 AND StartDate <= GETDATE() AND EndDate >= GETDATE()");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tạo coupon promotion
router.patch("/promotion/:id", async (req, res) => {
    try {
        const { IsActive, StartDate, EndDate } = req.body;
        const pool = getPool();
        await pool.request()
            .input("id", req.params.id)
            .input("IsActive", IsActive)
            .input("StartDate", StartDate)
            .input("EndDate", EndDate)
            .query(`UPDATE Coupons SET IsActive=@IsActive, StartDate=@StartDate, EndDate=@EndDate
                    WHERE CouponID=@id`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
