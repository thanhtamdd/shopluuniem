import { getPool } from '../../config/db.js';

/* ======================
   GET: TẤT CẢ SẢN PHẨM
====================== */
export const index = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .query(`SELECT * FROM Products`);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ======================
   GET: CATEGORY THEO GENDER
====================== */
export const gender = async (req, res) => {
    try {
        const pool = await getPool();
        const gender = req.query.gender;

        const result = await pool.request()
            .input("gender", gender)
            .query(`SELECT * FROM Categories WHERE gender = @gender`);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ======================
   GET: SẢN PHẨM THEO CATEGORY
====================== */
export const category = async (req, res) => {
    try {
        const pool = await getPool();
        const id_category = req.query.id_category;

        let query = `SELECT * FROM Products`;
        if (id_category !== 'all') {
            query += ` WHERE id_category = @id_category`;
        }

        const request = pool.request();
        if (id_category !== 'all') {
            request.input("id_category", id_category);
        }

        const result = await request.query(query);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ======================
   GET: CHI TIẾT SẢN PHẨM
====================== */
export const detail = async (req, res) => {
    try {
        const pool = await getPool();
        const id = req.params.id;

        const result = await pool.request()
            .input("id", id)
            .query(`SELECT * FROM Products WHERE id = @id`);

        res.json(result.recordset[0] || null);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ======================
   PAGINATION + SEARCH + CATEGORY
====================== */
export const pagination = async (req, res) => {
    try {
        const pool = await getPool();

        const page = parseInt(req.query.page) || 1;
        const count = parseInt(req.query.count) || 1;
        const search = req.query.search;
        const category = req.query.category;

        const offset = (page - 1) * count;

        let sql = `
            SELECT *
            FROM Products
            WHERE 1 = 1
        `;

        if (category !== 'all') {
            sql += ` AND id_category = @category`;
        }

        if (search) {
            sql += `
                AND (
                    UPPER(name_product) LIKE '%' + UPPER(@search) + '%'
                    OR CAST(price_product AS NVARCHAR) LIKE '%' + @search + '%'
                )
            `;
        }

        sql += `
            ORDER BY id
            OFFSET @offset ROWS
            FETCH NEXT @count ROWS ONLY
        `;

        const request = pool.request()
            .input("offset", offset)
            .input("count", count);

        if (category !== 'all') request.input("category", category);
        if (search) request.input("search", search);

        const result = await request.query(sql);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ======================
   SCROLL SEARCH
====================== */
export const scoll = async (req, res) => {
    try {
        const pool = await getPool();

        const page = parseInt(req.query.page) || 1;
        const count = parseInt(req.query.count) || 1;
        const search = req.query.search;

        const offset = (page - 1) * count;

        const result = await pool.request()
            .input("search", search)
            .input("offset", offset)
            .input("count", count)
            .query(`
                SELECT *
                FROM Products
                WHERE UPPER(name_product) LIKE '%' + UPPER(@search) + '%'
                ORDER BY id
                OFFSET @offset ROWS
                FETCH NEXT @count ROWS ONLY
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
