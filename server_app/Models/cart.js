import sql from "mssql";
import { poolPromise } from "../config/db.js";

const CartModel = {

  // Lấy cart theo user
  async getByUser(id_user) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_user", sql.NVarChar, id_user)
      .query("SELECT * FROM Carts WHERE id_user = @id_user");
    return result.recordset;
  },

  // Thêm cart
  async create(cart) {
    const pool = await poolPromise;
    await pool.request()
      .input("id_user", sql.NVarChar, cart.id_user)
      .input("id_product", sql.NVarChar, cart.id_product)
      .input("name_product", sql.NVarChar, cart.name_product)
      .input("price_product", sql.Int, cart.price_product)
      .input("count", sql.Int, cart.count)
      .input("image", sql.NVarChar, cart.image)
      .input("size", sql.NVarChar, cart.size)
      .query(`
        INSERT INTO Carts
        (id_user, id_product, name_product, price_product, count, image, size)
        VALUES
        (@id_user, @id_product, @name_product, @price_product, @count, @image, @size)
      `);
  },

  // Xóa cart
  async remove(id) {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Carts WHERE id = @id");
  }
};

export default CartModel;
