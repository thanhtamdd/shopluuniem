import sql from "mssql";
import { poolPromise } from "../config/db.js";

const DetailOrderModel = {

  // Tạo chi tiết hóa đơn
  async create(data) {
    const pool = await poolPromise;
    await pool.request()
      .input("id_order", sql.NVarChar, data.id_order)
      .input("id_product", sql.NVarChar, data.id_product)
      .input("name_product", sql.NVarChar, data.name_product)
      .input("price_product", sql.Decimal(10, 2), data.price_product)
      .input("quantity", sql.Int, data.count)
      .input("size", sql.NVarChar, data.size)
      .query(`
        INSERT INTO Detail_Orders 
        (id_order, id_product, name_product, price_product, quantity, size)
        VALUES 
        (@id_order, @id_product, @name_product, @price_product, @quantity, @size)
      `);
  },

  // Lấy chi tiết hóa đơn theo id_order
  async findByOrderId(id_order) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_order", sql.NVarChar, id_order)
      .query(`
        SELECT * FROM Detail_Orders WHERE id_order = @id_order
      `);

    return result.recordset;
  }
};

export default DetailOrderModel;
