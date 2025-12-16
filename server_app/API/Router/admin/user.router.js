// routes/admin/user.router.js
import express from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../../config/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/**
 * POST /api/admin/user/login
 * Login bằng username hoặc email – không dùng hash
 */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // username hoặc email
    const pool = await getPool();

    // Lấy user kèm tên quyền
    const result = await pool.request()
      .input("identifier", identifier)
      .query(`
        SELECT u._id, u.username, u.fullname, u.email, u.password, u.id_permission,
               p.permission AS permission_name
        FROM [User] u
        LEFT JOIN [Permission] p ON u.id_permission = p._id
        WHERE u.username = @identifier OR u.email = @identifier
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.json({ success: false, msg: "Username hoặc email không tồn tại" });
    }

    // So sánh password trực tiếp
    if (password !== user.password) {
      return res.json({ success: false, msg: "Sai mật khẩu" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, id_permission: user.id_permission },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    delete user.password; // không trả password

    // Trả về dữ liệu đầy đủ
    return res.json({
      success: true,
      user,
      jwt: token,
    });

  } catch (err) {
    console.error("POST /login error:", err.message);
    return res.json({
      success: false,
      msg: "Server lỗi, thử lại sau"
    });
  }
});

export default router;
