import { getPool } from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";

/* =========================
   LẤY DANH SÁCH USER (PAGINATION + SEARCH)
========================= */
export const index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const permission = req.query.permission;

    const pool = await getPool();

    let whereSql = "WHERE 1=1";
    if (permission) whereSql += " AND U.id_permission = @permission";
    if (search) whereSql += " AND (U.fullname LIKE @search OR U.username LIKE @search)";

    const countResult = await pool.request()
      .input("permission", sql.Int, permission || 0)
      .input("search", sql.NVarChar, `%${search}%`)
      .query(`SELECT COUNT(*) AS total FROM UserAccount U ${whereSql}`);

    const totalPage = Math.ceil(countResult.recordset[0].total / limit);

    const result = await pool.request()
      .input("permission", sql.Int, permission || 0)
      .input("search", sql.NVarChar, `%${search}%`)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset)
      .query(`
        SELECT U.*, P.name AS permission_name
        FROM UserAccount U
        LEFT JOIN Permission P ON P.id = U.id_permission
        ${whereSql}
        ORDER BY U._id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    res.json({ users: result.recordset, totalPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   TẠO USER
========================= */
export const create = async (req, res) => {
  try {
    const { username, password, fullname, email, id_permission } = req.body;
    const pool = await getPool();

    const check = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .query(`SELECT * FROM UserAccount WHERE username = @username OR email = @email`);

    if (check.recordset.length > 0) {
      return res.status(400).json({ error: "Username hoặc email đã tồn tại" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hash)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email)
      .input("id_permission", sql.Int, id_permission || 1)
      .query(`
        INSERT INTO UserAccount (username, password, fullname, email, id_permission)
        VALUES (@username, @password, @fullname, @email, @id_permission)
      `);

    res.status(201).json({ message: "Tạo user thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input("usernameOrEmail", sql.NVarChar, usernameOrEmail)
      .query(`
        SELECT U.*, P.name AS permission_name
        FROM UserAccount U
        LEFT JOIN Permission P ON P.id = U.id_permission
        WHERE U.username = @usernameOrEmail OR U.email = @usernameOrEmail
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Không tìm thấy user" });
    }

    const user = result.recordset[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, id_permission: user.id_permission },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE USER
========================= */
export const update = async (req, res) => {
  try {
    const { _id, username, password, fullname, email, id_permission } = req.body;
    const pool = await getPool();

    let query = `
      UPDATE UserAccount
      SET username = @username,
          fullname = @fullname,
          email = @email,
          id_permission = @id_permission
    `;

    const request = pool.request()
      .input("_id", sql.Int, _id)
      .input("username", sql.NVarChar, username)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email)
      .input("id_permission", sql.Int, id_permission);

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ", password = @password";
      request.input("password", sql.NVarChar, hash);
    }

    query += " WHERE _id = @_id";

    await request.query(query);
    res.json({ message: "Cập nhật user thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE USER
========================= */
export const remove = async (req, res) => {
  try {
    const { _id } = req.body;
    const pool = await getPool();

    await pool.request()
      .input("_id", sql.Int, _id)
      .query("DELETE FROM UserAccount WHERE _id = @_id");

    res.json({ message: "Xóa user thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
