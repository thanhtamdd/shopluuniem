import sql from "mssql";
import { poolPromise } from "../config/db.js";

const CategoryModel = {

  // Lấy tất cả category
  async findAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT * FROM Categories");
    return result.recordset;
  },

  // Lấy category theo id
  async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Categories WHERE id = @id");
    return result.recordset[0];
  },

  // Thêm category
  async create(category) {
    const pool = await poolPromise;
    await pool.request()
      .input("category", sql.NVarChar, category)
      .query("INSERT INTO Categories (category) VALUES (@category)");
  },

  // Xóa category
  async remove(id) {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Categories WHERE id = @id");
  },

  // Update category
  async update(id, category) {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .input("category", sql.NVarChar, category)
      .query(`
        UPDATE Categories 
        SET category = @category 
        WHERE id = @id
      `);
  }
};

export default CategoryModel;
