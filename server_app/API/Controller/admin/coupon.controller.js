import { getPool, sql } from "../../../config/db.js";

/**
 * GET /api/admin/Coupon
 * List + search + pagination
 */
export const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        const pool = await getPool();

        const countResult = await pool.request()
            .input("search", sql.NVarChar, `%${search}%`)
            .query(`
                SELECT COUNT(*) AS total
                FROM Coupons
                WHERE Code LIKE @search
                   OR CAST(Promotion AS NVARCHAR) LIKE @search
            `);

        const totalPage = Math.ceil(countResult.recordset[0].total / limit);

        const result = await pool.request()
            .input("search", sql.NVarChar, `%${search}%`)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT *
                FROM Coupons
                WHERE Code LIKE @search
                   OR CAST(Promotion AS NVARCHAR) LIKE @search
                ORDER BY CouponID DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            coupons: result.recordset,
            totalPage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/admin/Coupon
 */
export const create = async (req, res) => {
    try {
        const { code, count, promotion, describe } = req.body;
        const pool = await getPool();

        await pool.request()
            .input("code", sql.NVarChar, code)
            .input("count", sql.Int, count)
            .input("promotion", sql.Int, promotion)
            .input("describe", sql.NVarChar, describe)
            .query(`
                INSERT INTO Coupons(Code, Count, Promotion, Description)
                VALUES (@code, @count, @promotion, @describe)
            `);

        res.json({ msg: "Bạn đã thêm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /api/admin/Coupon/:id
 */
export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { code, count, promotion, describe } = req.body;

        const pool = await getPool();

        await pool.request()
            .input("id", sql.Int, id)
            .input("code", sql.NVarChar, code)
            .input("count", sql.Int, count)
            .input("promotion", sql.Int, promotion)
            .input("describe", sql.NVarChar, describe)
            .query(`
                UPDATE Coupons
                SET Code = @code,
                    Count = @count,
                    Promotion = @promotion,
                    Description = @describe
                WHERE CouponID = @id
            `);

        res.json({ msg: "Bạn đã cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE /api/admin/Coupon/:id
 */
export const deleteCoupon = async (req, res) => {
    try {
        const pool = await getPool();

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`DELETE FROM Coupons WHERE CouponID = @id`);

        res.json("Thành công");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Coupon/:id
 */
export const detail = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`SELECT * FROM Coupons WHERE CouponID = @id`);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Coupon/promotion/checking?code=&id_user=
 */
export const checking = async (req, res) => {
    try {
        const { code, id_user } = req.query;
        const pool = await getPool();

        const couponResult = await pool.request()
            .input("code", sql.NVarChar, code)
            .query(`SELECT * FROM Coupons WHERE Code = @code`);

        if (couponResult.recordset.length === 0)
            return res.json({ msg: "Không tìm thấy" });

        const coupon = couponResult.recordset[0];

        const used = await pool.request()
            .input("userId", sql.Int, id_user)
            .input("couponId", sql.Int, coupon.CouponID)
            .query(`
                SELECT * FROM Orders
                WHERE UserID = @userId
                  AND CouponID = @couponId
            `);

        if (used.recordset.length > 0)
            return res.json({ msg: "Bạn đã sử dụng mã này rồi" });

        res.json({ msg: "Thành công", coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /api/admin/Coupon/promotion/:id
 */
export const createCoupon = async (req, res) => {
    try {
        const pool = await getPool();

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                UPDATE Coupons
                SET Count = Count - 1
                WHERE CouponID = @id AND Count > 0
            `);

        res.json("Thành công");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
