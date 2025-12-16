import sql from "mssql";
import { poolPromise } from "../config/db.js";

const SaleModel = {

  // Lấy tất cả sale (admin)
  async findAll() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT s.*, p.name_product, p.price_product, p.image
      FROM Sales s
      JOIN Products p ON s.id_product = p.id
      ORDER BY s.id DESC
    `);

    return result.recordset;
  },

  // Lấy sale theo id
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Sales WHERE id = @id");

    return result.recordset[0];
  },

  // Lấy sale đang active theo product
  async findActiveByProduct(id_product) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id_product", sql.Int, id_product)
      .query(`
        SELECT * FROM Sales
        WHERE id_product = @id_product
          AND status = 1
          AND GETDATE() BETWEEN start_date AND end_date
      `);

    return result.recordset[0];
  },

  // Danh sách sale đang hoạt động
  async findActive() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT s.*, p.name_product, p.image
      FROM Sales s
      JOIN Products p ON s.id_product = p.id
      WHERE s.status = 1
    `);

    return result.recordset;
  },

  // Tạo sale
  async create(data) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("promotion", sql.Int, data.promotion)
      .input("describe", sql.NVarChar, data.describe)
      .input("status", sql.Bit, data.status)
      .input("start_date", sql.DateTime, data.start)
      .input("end_date", sql.DateTime, data.end)
      .input("id_product", sql.Int, data.id_product)
      .query(`
        INSERT INTO Sales
        (promotion, describe, status, start_date, end_date, id_product)
        OUTPUT INSERTED.*
        VALUES
        (@promotion, @describe, @status, @start_date, @end_date, @id_product)
      `);

    return result.recordset[0];
  },

  // Update sale
  async update(id, data) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("promotion", sql.Int, data.promotion)
      .input("describe", sql.NVarChar, data.describe)
      .input("status", sql.Bit, data.status)
      .input("start_date", sql.DateTime, data.start)
      .input("end_date", sql.DateTime, data.end)
      .input("id_product", sql.Int, data.id_product)
      .query(`
        UPDATE Sales SET
          promotion = @promotion,
          describe = @describe,
          status = @status,
          start_date = @start_date,
          end_date = @end_date,
          id_product = @id_product
        WHERE id = @id
      `);

    return true;
  },

  // Xóa sale
  async delete(id) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Sales WHERE id = @id");

    return true;
  }
};

export default SaleModel;
