import sql from "mssql";
import { poolPromise } from "../config/db.js";

const OrderModel = {

  // Tạo order
  async create(data) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id_user", sql.Int, data.id_user)
      .input("id_payment", sql.Int, data.id_payment)
      .input("id_note", sql.Int, data.id_note)
      .input("address", sql.NVarChar, data.address)
      .input("total", sql.Float, data.total)
      .input("status", sql.NVarChar, data.status)
      .input("pay", sql.Bit, data.pay)
      .input("feeship", sql.Float, data.feeship)
      .input("id_coupon", sql.NVarChar, data.id_coupon)
      .query(`
        INSERT INTO Orders
        (id_user, id_payment, id_note, address, total, status, pay, feeship, id_coupon)
        OUTPUT INSERTED.*
        VALUES
        (@id_user, @id_payment, @id_note, @address, @total, @status, @pay, @feeship, @id_coupon)
      `);

    return result.recordset[0];
  },

  // Lấy order theo user
  async findByUser(id_user) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id_user", sql.Int, id_user)
      .query(`
        SELECT * FROM Orders WHERE id_user = @id_user
      `);

    return result.recordset;
  },

  // Chi tiết order
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM Orders
        WHERE id = @id
      `);

    return result.recordset[0];
  }
};

export default OrderModel;
