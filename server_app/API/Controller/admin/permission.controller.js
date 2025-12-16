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
            whereSql = "WHERE permission LIKE @search OR CAST(id AS NVARCHAR) LIKE @search";
        }

        // count
        const countResult = await pool.request()
            .input("search", `%${search}%`)
            .query(`
                SELECT COUNT(*) AS total
                FROM Permission
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
                FROM Permission
                ${whereSql}
                ORDER BY id
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            permission: result.recordset,
            totalPage
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GET: all
========================= */
export const all = async (req, res) => {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM Permission");
    res.json(result.recordset);
};

/* =========================
   CREATE
========================= */
export const create = async (req, res) => {
    let name = req.query.name;
    if (!name) return res.json({ msg: "Thiếu tên quyền" });

    const pool = await getPool();

    const check = await pool.request()
        .input("name", name)
        .query(`
            SELECT * FROM Permission
            WHERE UPPER(permission) = UPPER(@name)
        `);

    if (check.recordset.length > 0) {
        return res.json({ msg: "Quyền đã tồn tại" });
    }

    name = name
        .toLowerCase()
        .replace(/^.|\s\S/g, a => a.toUpperCase());

    await pool.request()
        .input("permission", name)
        .query(`
            INSERT INTO Permission(permission)
            VALUES (@permission)
        `);

    res.json({ msg: "Bạn đã thêm thành công" });
};

/* =========================
   DELETE
========================= */
export const remove = async (req, res) => {
    const id = req.query.id;
    if (!id) return res.json({ msg: "Thiếu id" });

    const pool = await getPool();
    await pool.request()
        .input("id", id)
        .query("DELETE FROM Permission WHERE id = @id");

    res.json({ msg: "Thanh Cong" });
};

/* =========================
   DETAILS
========================= */
export const details = async (req, res) => {
    const id = req.params.id;
    const pool = await getPool();

    const result = await pool.request()
        .input("id", id)
        .query("SELECT * FROM Permission WHERE id = @id");

    res.json(result.recordset[0]);
};

/* =========================
   UPDATE
========================= */
export const update = async (req, res) => {
    let { id, name } = req.query;
    if (!id || !name) return res.json({ msg: "Thiếu dữ liệu" });

    const pool = await getPool();

    const check = await pool.request()
        .input("id", id)
        .input("name", name)
        .query(`
            SELECT *
            FROM Permission
            WHERE UPPER(permission) = UPPER(@name)
              AND id <> @id
        `);

    if (check.recordset.length > 0) {
        return res.json({ msg: "Quyền đã tồn tại" });
    }

    name = name
        .toLowerCase()
        .replace(/^.|\s\S/g, a => a.toUpperCase());

    await pool.request()
        .input("id", id)
        .input("permission", name)
        .query(`
            UPDATE Permission
            SET permission = @permission
            WHERE id = @id
        `);

    res.json({ msg: "Bạn đã update thành công" });
};
