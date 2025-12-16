import sql from "mssql";
import { poolPromise } from "../config/db.js";

const CommentModel = {

  // Lấy comment theo sản phẩm (có JOIN user)
  async findByProduct(id_product) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_product", sql.Int, id_product)
      .query(`
        SELECT 
          c.id,
          c.content,
          c.star,
          c.created_at,
          u.id AS user_id,
          u.fullname,
          u.email
        FROM Comments c
        JOIN Users u ON c.id_user = u.id
        WHERE c.id_product = @id_product
        ORDER BY c.created_at DESC
      `);
    return result.recordset;
  },

  // Thêm comment
  async create(data) {
    const pool = await poolPromise;
    await pool.request()
      .input("id_product", sql.Int, data.id_product)
      .input("id_user", sql.Int, data.id_user)
      .input("content", sql.NVarChar, data.content)
      .input("star", sql.Int, data.star)
      .query(`
        INSERT INTO Comments (id_product, id_user, content, star)
        VALUES (@id_product, @id_user, @content, @star)
      `);
  }
};

export default CommentModel;
