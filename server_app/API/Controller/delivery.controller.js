import { getPool } from "../../config/db.js";

/* =========================
   CREATE DELIVERY
========================= */
export const post_delivery = async (req, res) => {
    try {
        const {
            id_delivery,
            id_order,
            address,
            status
        } = req.body;

        const pool = await getPool();

        await pool.request()
            .input("id_delivery", id_delivery)
            .input("id_order", id_order)
            .input("address", address)
            .input("status", status)
            .query(`
                INSERT INTO Deliveries (id_delivery, id_order, address, status)
                VALUES (@id_delivery, @id_order, @address, @status)
            `);

        res.json({ msg: "Tạo delivery thành công" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GET DELIVERY BY ID
========================= */
export const get_delivery = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input("id_delivery", id)
            .query(`
                SELECT *
                FROM Deliveries
                WHERE id_delivery = @id_delivery
            `);

        res.json(result.recordset[0] || null);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
