import sql from "mssql";
import { poolPromise } from "../config/db.js";

const CouponModel = {

  // Lấy tất cả coupon
  async findAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT * FROM Coupons`);
    return result.recordset;
  },

  // Tìm coupon theo code
  async findByCode(code) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("code", sql.NVarChar, code)
      .query(`SELECT * FROM Coupons WHERE code = @code`);
    return result.recordset[0];
  },

  // Tạo coupon
  async create(data) {
    const pool = await poolPromise;
    await pool.request()
      .input("code", sql.NVarChar, data.code)
      .input("count", sql.Int, data.count)
      .input("promotion", sql.NVarChar, data.promotion)
      .input("description", sql.NVarChar, data.describe)
      .query(`
        INSERT INTO Coupons (code, count, promotion, description)
        VALUES (@code, @count, @promotion, @description)
      `);
  },

  // Giảm lượt sử dụng coupon
  async decreaseCount(code) {
    const pool = await poolPromise;
    await pool.request()
      .input("code", sql.NVarChar, code)
      .query(`
        UPDATE Coupons 
        SET count = count - 1 
        WHERE code = @code AND count > 0
      `);
  }
};

export default CouponModel;
