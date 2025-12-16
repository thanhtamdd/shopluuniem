import { getPool, sql } from "../../../config/db.js";

/**
 * GET /api/admin/Order
 * List order + filter status + total money
 */
export const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const status = req.query.status;
        const offset = (page - 1) * limit;

        const pool = await getPool();

        const whereClause = status ? `WHERE o.Status = @status` : "";

        const totalResult = await pool.request()
            .input("status", sql.NVarChar, status)
            .query(`
                SELECT COUNT(*) AS total, SUM(Total) AS totalMoney
                FROM Orders o
                ${whereClause}
            `);

        const totalPage = Math.ceil(totalResult.recordset[0].total / limit);

        const orders = await pool.request()
            .input("status", sql.NVarChar, status)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT o.*, u.FullName, p.Method, n.Content
                FROM Orders o
                LEFT JOIN Users u ON o.UserID = u.UserID
                LEFT JOIN Payments p ON o.PaymentID = p.PaymentID
                LEFT JOIN Notes n ON o.NoteID = n.NoteID
                ${whereClause}
                ORDER BY o.OrderID DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            orders: orders.recordset,
            totalPage,
            totalMoney: totalResult.recordset[0].totalMoney || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Order/detailorder/:id
 */
export const detailOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        const pool = await getPool();

        const count = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT COUNT(*) AS total
                FROM OrderDetails
                WHERE OrderID = @id
            `);

        const totalPage = Math.ceil(count.recordset[0].total / limit);

        const details = await pool.request()
            .input("id", sql.Int, req.params.id)
            .input("search", sql.NVarChar, `%${search}%`)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT *
                FROM OrderDetails
                WHERE OrderID = @id
                  AND (
                      NameProduct LIKE @search OR
                      CAST(PriceProduct AS NVARCHAR) LIKE @search OR
                      CAST(Count AS NVARCHAR) LIKE @search OR
                      Size LIKE @search
                  )
                ORDER BY DetailID DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            details: details.recordset,
            totalPage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Order/detail/:id
 */
export const details = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT o.*, u.FullName, p.Method, n.Content
                FROM Orders o
                LEFT JOIN Users u ON o.UserID = u.UserID
                LEFT JOIN Payments p ON o.PaymentID = p.PaymentID
                LEFT JOIN Notes n ON o.NoteID = n.NoteID
                WHERE o.OrderID = @id
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===== STATUS UPDATE ===== */

export const confirmOrder = async (req, res) => {
    await updateStatus(req, res, "2");
};

export const delivery = async (req, res) => {
    await updateStatus(req, res, "3");
};

export const confirmDelivery = async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input("id", sql.Int, req.query.id)
            .query(`
                UPDATE Orders
                SET Status = '4', Pay = 1
                WHERE OrderID = @id
            `);
        res.json({ msg: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const cancelOrder = async (req, res) => {
    await updateStatus(req, res, "5");
};

const updateStatus = async (req, res, status) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input("id", sql.Int, req.query.id)
            .input("status", sql.NVarChar, status)
            .query(`
                UPDATE Orders SET Status = @status
                WHERE OrderID = @id
            `);
        res.json({ msg: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Order/completeOrder
 */
export const completeOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const getDate = req.query.getDate;
        const offset = (page - 1) * limit;

        const pool = await getPool();

        let whereDate = getDate ? "AND CONVERT(date, CreatedAt) = @date" : "";

        const count = await pool.request()
            .input("date", sql.Date, getDate)
            .query(`
                SELECT COUNT(*) AS total, SUM(Total) AS totalMoney
                FROM Orders
                WHERE Status = '4' ${whereDate}
            `);

        const totalPage = Math.ceil(count.recordset[0].total / limit);

        const orders = await pool.request()
            .input("date", sql.Date, getDate)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT *
                FROM Orders
                WHERE Status = '4' ${whereDate}
                ORDER BY OrderID DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            orders: orders.recordset,
            totalPage,
            totalMoney: count.recordset[0].totalMoney || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
