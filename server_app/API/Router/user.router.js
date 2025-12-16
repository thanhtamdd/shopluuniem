// routes/admin/user.router.js
import express from "express";
import { getPool } from "../../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/**
 * GET: Danh sách user
 */
router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT _id, username, fullname, email, id_permission
        FROM [User]
        ORDER BY _id DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET / error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET: User theo id
 */
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT _id, username, fullname, email, id_permission
        FROM [User]
        WHERE _id = @id
      `);
    res.json(result.recordset[0] || null);
  } catch (err) {
    console.error("GET /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST: Tạo user
 */
router.post("/", async (req, res) => {
  try {
    const { username, password, fullname, email, id_permission } = req.body;
    const pool = await getPool();

    // Kiểm tra username đã tồn tại
    const check = await pool.request()
      .input("username", username)
      .query("SELECT _id FROM [User] WHERE username = @username");

    if (check.recordset.length > 0) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    // Không hash password
    await pool.request()
      .input("username", username)
      .input("password", password)
      .input("fullname", fullname || null)
      .input("email", email || null)
      .input("id_permission", id_permission || 0)
      .query(`
        INSERT INTO [User] (username, password, fullname, email, id_permission)
        VALUES (@username, @password, @fullname, @email, @id_permission)
      `);

    res.status(201).json({ success: true, message: "Tạo user thành công" });
  } catch (err) {
    console.error("POST / error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST: Login (username hoặc email)
 */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username hoặc email
    const pool = await getPool();

    const result = await pool.request()
      .input("identifier", identifier)
      .query("SELECT * FROM [User] WHERE username = @identifier OR email = @identifier");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: "Username hoặc Email không tồn tại" });

    // So sánh trực tiếp
    if (user.password !== password) return res.status(401).json({ error: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, username: user.username, id_permission: user.id_permission },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    delete user.password; // không trả về password
    res.json({ success: true, user, token });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT: Cập nhật user
 */
router.put("/:id", async (req, res) => {
  try {
    const { username, password, fullname, email, id_permission } = req.body;
    const pool = await getPool();

    const request = pool.request()
      .input("id", req.params.id)
      .input("username", username)
      .input("fullname", fullname || null)
      .input("email", email || null)
      .input("id_permission", id_permission || 0);

    let query = `
      UPDATE [User]
      SET username = @username,
          fullname = @fullname,
          email = @email,
          id_permission = @id_permission
    `;

    if (password) {
      query += ", password = @password";
      request.input("password", password); // không hash
    }

    query += " WHERE _id = @id";

    await request.query(query);
    res.json({ success: true, message: "Cập nhật user thành công" });
  } catch (err) {
    console.error("PUT /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE: Xóa user
 */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM [User] WHERE _id = @id");

    res.json({ success: true, message: "Xóa user thành công" });
  } catch (err) {
    console.error("DELETE /:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
