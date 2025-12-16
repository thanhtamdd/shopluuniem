import { getPool, sql } from "../../../config/db.js";

/**
 * GET /api/admin/Category
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
                FROM Categories
                WHERE Category LIKE @search
            `);

        const totalPage = Math.ceil(countResult.recordset[0].total / limit);

        const result = await pool.request()
            .input("search", sql.NVarChar, `%${search}%`)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT CategoryID, Category
                FROM Categories
                WHERE Category LIKE @search
                ORDER BY Category
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            categories: result.recordset,
            totalPage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/admin/Category/create?name=
 */
export const create = async (req, res) => {
    try {
        let name = req.query.name?.trim();
        if (!name) return res.json({ msg: "Tên category không hợp lệ" });

        name = name.toLowerCase().replace(/^.|\s\S/g, a => a.toUpperCase());

        const pool = await getPool();

        const exist = await pool.request()
            .input("name", sql.NVarChar, name)
            .query(`SELECT * FROM Categories WHERE Category = @name`);

        if (exist.recordset.length > 0) {
            return res.json({ msg: "Loại đã tồn tại" });
        }

        await pool.request()
            .input("name", sql.NVarChar, name)
            .query(`INSERT INTO Categories(Category) VALUES (@name)`);

        res.json({ msg: "Bạn đã thêm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE /api/admin/Category/delete?id=
 */
export const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const pool = await getPool();

        await pool.request()
            .input("id", sql.Int, id)
            .query(`DELETE FROM Categories WHERE CategoryID = @id`);

        res.json({ msg: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Category/detail/:id
 */
export const detail = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT CategoryID, Category
                FROM Categories
                WHERE CategoryID = @id
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/admin/Category/update?id=&name=
 */
export const update = async (req, res) => {
    try {
        let name = req.query.name?.trim();
        const id = req.query.id;

        name = name.toLowerCase().replace(/^.|\s\S/g, a => a.toUpperCase());

        const pool = await getPool();

        const exist = await pool.request()
            .input("name", sql.NVarChar, name)
            .input("id", sql.Int, id)
            .query(`
                SELECT * FROM Categories 
                WHERE Category = @name AND CategoryID <> @id
            `);

        if (exist.recordset.length > 0) {
            return res.json({ msg: "Loại đã tồn tại" });
        }

        await pool.request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .query(`
                UPDATE Categories SET Category = @name
                WHERE CategoryID = @id
            `);

        res.json({ msg: "Bạn đã update thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/Category/detail/:name
 * Lấy sản phẩm theo category
 */
export const detailProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        const pool = await getPool();

        const category = await pool.request()
            .input("name", sql.NVarChar, req.params.id)
            .query(`SELECT CategoryID FROM Categories WHERE Category = @name`);

        if (category.recordset.length === 0)
            return res.json({ products: [], totalPage: 0 });

        const categoryId = category.recordset[0].CategoryID;

        const count = await pool.request()
            .input("id", sql.Int, categoryId)
            .query(`
                SELECT COUNT(*) AS total
                FROM Products
                WHERE CategoryID = @id
            `);

        const totalPage = Math.ceil(count.recordset[0].total / limit);

        const products = await pool.request()
            .input("id", sql.Int, categoryId)
            .input("search", sql.NVarChar, `%${search}%`)
            .input("limit", sql.Int, limit)
            .input("offset", sql.Int, offset)
            .query(`
                SELECT *
                FROM Products
                WHERE CategoryID = @id
                  AND NameProduct LIKE @search
                ORDER BY ProductID DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({ products: products.recordset, totalPage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
