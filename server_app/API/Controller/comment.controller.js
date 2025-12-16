import { getPool } from "../../config/db.js";

/* =========================
   GET COMMENTS BY PRODUCT
========================= */
export const index = async (req, res) => {
    try {
        const id_product = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input("id_product", id_product)
            .query(`
                SELECT 
                    c.id,
                    c.content,
                    c.star,
                    c.created_at,
                    u.id AS user_id,
                    u.fullname
                FROM Comments c
                JOIN Users u ON c.id_user = u.id
                WHERE c.id_product = @id_product
                ORDER BY c.created_at DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   POST COMMENT
========================= */
export const post_comment = async (req, res) => {
    try {
        const id_product = req.params.id;
        const { id_user, content, star } = req.body;
        const pool = await getPool();

        await pool.request()
            .input("id_product", id_product)
            .input("id_user", id_user)
            .input("content", content)
            .input("star", star)
            .query(`
                INSERT INTO Comments (id_product, id_user, content, star)
                VALUES (@id_product, @id_user, @content, @star)
            `);

        res.json({ msg: "Thành Công" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
