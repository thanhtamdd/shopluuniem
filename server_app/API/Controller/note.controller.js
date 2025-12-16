import { getPool } from "../../config/db.js";

/* =========================
   POST: TẠO NOTE
========================= */
export const post_note = async (req, res) => {
    try {
        const { content, id_order } = req.body;

        const pool = await getPool();

        const result = await pool.request()
            .input("content", content)
            .input("id_order", id_order)
            .query(`
                INSERT INTO Notes (content, id_order)
                OUTPUT INSERTED.*
                VALUES (@content, @id_order)
            `);

        res.json(result.recordset[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GET: LẤY NOTE THEO ID
========================= */
export const get_note = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input("id", id)
            .query(`
                SELECT * FROM Notes WHERE id = @id
            `);

        res.json(result.recordset[0] || null);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
