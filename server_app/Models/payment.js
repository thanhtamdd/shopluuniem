import sql from "mssql";
import { poolPromise } from "../config/db.js";

const PaymentModel = {

  // Lấy toàn bộ payment
  async findAll() {
    const pool = await poolPromise;

    const result = await pool.request()
      .query("SELECT * FROM Payments");

    return result.recordset;
  },

  // Lấy payment theo id
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Payments WHERE id = @id");

    return result.recordset[0];
  },

  // Tạo payment mới
  async create(pay_name) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("pay_name", sql.NVarChar, pay_name)
      .query(`
        INSERT INTO Payments (pay_name)
        OUTPUT INSERTED.*
        VALUES (@pay_name)
      `);

    return result.recordset[0];
  },

  // Cập nhật payment
  async update(id, pay_name) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("pay_name", sql.NVarChar, pay_name)
      .query(`
        UPDATE Payments
        SET pay_name = @pay_name
        WHERE id = @id
      `);

    return true;
  },

  // Xóa payment
  async delete(id) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Payments WHERE id = @id");

    return true;
  }
};

export default PaymentModel;
