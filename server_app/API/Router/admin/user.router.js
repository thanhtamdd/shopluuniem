import express from "express";
import { getPool } from "../../config/db.js";

const router = express.Router();

/**
 * GET /api/admin/user
 * Lấy danh sách user kèm permission, phân trang + search
 * Query params: page, limit, search
 */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const pool = await getPool();

    // Tổng số user
    const countResult = await pool.request()
      .input("search", `%${search}%`)
      .query(`
        SELECT COUNT(*) AS total
        FROM [User]
        WHERE fullname LIKE @search OR email LIKE @search OR username LIKE @search
      `);
    const total = countResult.recordset[0].total;
    const totalPage = Math.ceil(total / limit);

    // Lấy danh sách user kèm permission
    const result = await pool.request()
      .input("search", `%${search}%`)
      .input("limit", limit)
      .input("offset", offset)
      .query(`
        SELECT u._id, u.fullname, u.username, u.email,
               p.permission AS permission_name
        FROM [User] u
        LEFT JOIN [Permission] p ON u.id_permission = p._id
        WHERE u.fullname LIKE @search OR u.email LIKE @search OR u.username LIKE @search
        ORDER BY u._id
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      users: result.recordset,
      totalPage,
      currentPage: page
    });
  } catch (err) {
    console.error("GET /admin/user error:", err.message);
    res.status(500).json({ users: [], totalPage: 0, currentPage: 1 });
  }
});

/**
 * DELETE /api/admin/user?id=...
 */
router.delete("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ msg: "Thiếu ID user" });

    const pool = await getPool();
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM [User] WHERE _id = @id`);

    res.json({ msg: "Thanh Cong" });
  } catch (err) {
    console.error("DELETE /admin/user error:", err.message);
    res.status(500).json({ msg: "Server lỗi, thử lại sau" });
  }
});

export default router;
