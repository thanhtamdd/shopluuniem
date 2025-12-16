import { getPool } from "../../config/db.js";

/* =========================
   GET: CHI TIẾT HÓA ĐƠN
========================= */
export const detail = async (req, res) => {
    try {
        const id_order = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input("id_order", id_order)
            .query(`
                SELECT 
                    d.*,
                    p.name_product,
                    p.price_product,
                    p.image
                FROM Detail_Orders d
                JOIN Products p ON d.id_product = p.id
                WHERE d.id_order = @id_order
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   POST: THÊM CHI TIẾT HÓA ĐƠN
========================= */
export const post_detail_order = async (req, res) => {
    try {
        const {
            id_order,
            id_product,
            quantity,
            price
        } = req.body;

        const pool = await getPool();

        await pool.request()
            .input("id_order", id_order)
            .input("id_product", id_product)
            .input("quantity", quantity)
            .input("price", price)
            .query(`
                INSERT INTO Detail_Orders (id_order, id_product, quantity, price)
                VALUES (@id_order, @id_product, @quantity, @price)
            `);

        res.send("Thanh Cong");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
