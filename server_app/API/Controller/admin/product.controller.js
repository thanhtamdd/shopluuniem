import { getPool } from "../../../config/db.js";

/* =========================
   GET: list + pagination + search
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
            whereSql = `
                WHERE name_product LIKE @search
                   OR CAST(price_product AS NVARCHAR) LIKE @search
                   OR CAST(id AS NVARCHAR) LIKE @search
            `;
        }

        // count
        const countResult = await pool.request()
            .input("search", `%${search}%`)
            .query(`
                SELECT COUNT(*) AS total
                FROM Product
                ${whereSql}
            `);

        const totalPage = Math.ceil(countResult.recordset[0].total / limit);

        // data
        const result = await pool.request()
            .input("search", `%${search}%`)
            .input("limit", limit)
            .input("offset", offset)
            .query(`
                SELECT *
                FROM Product
                ${whereSql}
                ORDER BY id DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            products: result.recordset,
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
        const { name, price, category, description, gender } = req.body;
        const pool = await getPool();

        // check duplicate
        const check = await pool.request()
            .input("name", name)
            .query(`
                SELECT *
                FROM Product
                WHERE UPPER(name_product) = UPPER(@name)
            `);

        if (check.recordset.length > 0) {
            return res.json({ msg: "Sản phẩm đã tồn tại" });
        }

        let image = "http://localhost:8000/img/nophoto.jpg";

        if (req.files && req.files.file) {
            const fileImage = req.files.file;
            const fileName = fileImage.name;

            image = "http://localhost:8000/img/" + fileName;
            await fileImage.mv("./public/img/" + fileName);
        }

        const formatName = name
            .toLowerCase()
            .replace(/^.|\s\S/g, a => a.toUpperCase());

        await pool.request()
            .input("name", formatName)
            .input("price", price)
            .input("category", category)
            .input("description", description)
            .input("gender", gender)
            .input("image", image)
            .query(`
                INSERT INTO Product
                (name_product, price_product, category_id, description, gender, image)
                VALUES
                (@name, @price, @category, @description, @gender, @image)
            `);

        res.json({ msg: "Bạn đã thêm thành công" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   DELETE
========================= */
export const remove = async (req, res) => {
    const id = req.query.id;
    const pool = await getPool();

    await pool.request()
        .input("id", id)
        .query("DELETE FROM Product WHERE id = @id");

    res.json({ msg: "Thanh Cong" });
};

/* =========================
   DETAILS
========================= */
export const details = async (req, res) => {
    const pool = await getPool();

    const result = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM Product WHERE id = @id");

    res.json(result.recordset[0]);
};

/* =========================
   UPDATE
========================= */
export const update = async (req, res) => {
    try {
        const { id, name, price, category, description, gender } = req.body;
        const pool = await getPool();

        const check = await pool.request()
            .input("id", id)
            .input("name", name)
            .query(`
                SELECT *
                FROM Product
                WHERE UPPER(name_product) = UPPER(@name)
                  AND id <> @id
            `);

        if (check.recordset.length > 0) {
            return res.json({ msg: "Sản phẩm đã tồn tại" });
        }

        let imageSql = "";
        if (req.files && req.files.file) {
            const fileImage = req.files.file;
            const fileName = fileImage.name;

            imageSql = ", image = @image";

            await fileImage.mv("./public/img/" + fileName);
            req.body.image = "http://localhost:8000/img/" + fileName;
        }

        const formatName = name
            .toLowerCase()
            .replace(/^.|\s\S/g, a => a.toUpperCase());

        await pool.request()
            .input("id", id)
            .input("name", formatName)
            .input("price", price)
            .input("category", category)
            .input("description", description)
            .input("gender", gender)
            .input("image", req.body.image)
            .query(`
                UPDATE Product
                SET name_product = @name,
                    price_product = @price,
                    category_id = @category,
                    description = @description,
                    gender = @gender
                    ${imageSql}
                WHERE id = @id
            `);

        res.json({ msg: "Bạn đã update thành công" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
