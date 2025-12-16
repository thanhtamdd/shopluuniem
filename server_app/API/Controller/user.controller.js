// routes/admin/user.router.js
import express from "express";
import { getPool } from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/* =========================
   GET LIST USER (có pagination)
========================= */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const pool = await getPool();
    const result = await pool.request()
      .input("limit", limit)
      .input("offset", offset)
      .query(`
        SELECT U._id, U.username, U.fullname, U.email, U.phone, P.name AS permission
        FROM UserAccount U
        LEFT JOIN Permission P ON P.id = U.permission_id
        ORDER BY U._id DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request()
      .query("SELECT COUNT(*) AS total FROM UserAccount");

    const total = countResult.recordset[0].total;
    const totalPage = Math.ceil(total / limit);

    res.json({ users: result.recordset, totalPage });
  } catch (err) {
    console.error("GET / error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CREATE USER
========================= */
router.post("/", async (req, res) => {
  try {
    const { username, password, fullname, email, phone, permission_id } = req.body;
    const pool = await getPool();

    // Check username/email đã tồn tại
    const check = await pool.request()
      .input("username", username)
      .input("email", email)
      .query("SELECT _id FROM UserAccount WHERE username=@username OR email=@email");

    if (check.recordset.length > 0) {
      return res.status(400).json({ msg: "Username hoặc email đã tồn tại" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input("username", username)
      .input("password", hash)
      .input("fullname", fullname || null)
      .input("email", email || null)
      .input("phone", phone || null)
      .input("permission_id", permission_id || 1)
      .query(`
        INSERT INTO UserAccount (username, password, fullname, email, phone, permission_id)
        OUTPUT INSERTED.*
        VALUES (@username, @password, @fullname, @email, @phone, @permission_id)
      `);

    const user = result.recordset[0];
    delete user.password;

    res.status(201).json({ msg: "Tạo user thành công", user });
  } catch (err) {
    console.error("POST / error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input("email", email)
      .query("SELECT * FROM UserAccount WHERE username=@email OR email=@email");

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ msg: "Không tìm thấy user" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id, permission: user.permission_id }, JWT_SECRET, { expiresIn: "1d" });
    delete user.password;

    res.json({ msg: "Đăng nhập thành công", user, jwt: token });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET DETAILS USER
========================= */
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT U._id, U.username, U.fullname, U.email, U.phone, P.name AS permission
        FROM UserAccount U
        LEFT JOIN Permission P ON P.id = U.permission_id
        WHERE U._id=@id
      `);

    res.json(result.recordset[0] || null);
  } catch (err) {
    console.error("GET /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE USER
========================= */
router.put("/:id", async (req, res) => {
  try {
    const { fullname, email, phone, password, permission_id } = req.body;
    const pool = await getPool();

    const request = pool.request()
      .input("id", req.params.id)
      .input("fullname", fullname)
      .input("email", email)
      .input("phone", phone)
      .input("permission_id", permission_id);

    let query = `
      UPDATE UserAccount
      SET fullname=@fullname,
          email=@email,
          phone=@phone,
          permission_id=@permission_id
    `;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ", password=@password";
      request.input("password", hash);
    }

    query += " WHERE _id=@id";

    await request.query(query);

    res.json({ msg: "Cập nhật user thành công" });
  } catch (err) {
    console.error("PUT /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE USER
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM UserAccount WHERE _id=@id");

    res.json({ msg: "Xóa user thành công" });
  } catch (err) {
    console.error("DELETE /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
