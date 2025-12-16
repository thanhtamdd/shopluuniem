import { getPool } from "../../../config/db.js";

/* =========================
   GET LIST + PAGINATION
========================= */
export const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const pool = await getPool();

        let whereSql = "";
        if (search) {
            whereSql = "WHERE CAST(S.id AS NVARCHAR) LIKE @search";
        }

        const countResult = await pool.request()
            .input("search", `%${search}%`)
            .query(`
                SELECT COUNT(*) AS total
                FROM Sale S
                ${whereSql}
            `);

        const totalPage = Math.ceil(countResult.recordset[0].total / limit);

        const result = await pool.request()
            .input("search", `%${search}%`)
            .input("limit", limit)
            .input("offset", offset)
            .query(`
                SELECT S.*, P.name_product, P.image
                FROM Sale S
                JOIN Product P ON P.id = S.product_id
                ${whereSql}
                ORDER BY S.id DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            sale: result.recordset,
            totalPage
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   CREATE
========================= */
export const create = async (req, res) => {
    try {
        const { product_id, promotion, describe, status } = req.body;
        const pool = await getPool();

        // check active sale exists
        const check = await pool.request()
            .input("product_id", product_id)
            .query(`
                SELECT *
                FROM Sale
                WHERE product_id = @product_id
                  AND status = 1
            `);

        if (check.recordset.length > 0) {
            return res.send("Sản phẩm này đã có khuyến mãi");
        }

        await pool.request()
            .input("product_id", product_id)
            .input("promotion", promotion)
            .input("describe", describe)
            .input("status", status)
            .query(`
                INSERT INTO Sale (product_id, promotion, describe, status)
                VALUES (@product_id, @promotion, @describe, @status)
            `);

        res.send("Bạn đã thêm thành công");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   DETAIL
========================= */
export const detail = async (req, res) => {
    const pool = await getPool();

    const result = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM Sale WHERE id = @id");

    res.json(result.recordset[0]);
};

/* =========================
   UPDATE
========================= */
export const update = async (req, res) => {
    try {
        const { promotion, describe, status, product_id } = req.body;
        const pool = await getPool();

        await pool.request()
            .input("id", req.params.id)
            .input("promotion", promotion)
            .input("describe", describe)
            .input("status", status)
            .input("product_id", product_id)
            .query(`
                UPDATE Sale
                SET promotion = @promotion,
                    describe = @describe,
                    status = @status,
                    product_id = @product_id
                WHERE id = @id
            `);

        res.json("Bạn đã cập nhật thành công");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   LIST ACTIVE SALE
========================= */
export const list = async (req, res) => {
    const pool = await getPool();

    const result = await pool.query(`
        SELECT S.*, P.name_product, P.image
        FROM Sale S
        JOIN Product P ON P.id = S.product_id
        WHERE S.status = 1
    `);

    res.json(result.recordset);
};

/* =========================
   DETAIL ACTIVE SALE BY PRODUCT
========================= */
export const detailList = async (req, res) => {
    const pool = await getPool();

    const result = await pool.request()
        .input("product_id", req.params.id)
        .query(`
            SELECT TOP 1 S.*, P.name_product, P.image
            FROM Sale S
            JOIN Product P ON P.id = S.product_id
            WHERE S.product_id = @product_id
              AND S.status = 1
        `);

    if (result.recordset.length > 0) {
        res.json({
            msg: "Thanh Cong",
            sale: result.recordset[0]
        });
    } else {
        res.json({ msg: "That Bai" });
    }
};
