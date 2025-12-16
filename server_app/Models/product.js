import sql from "mssql";
import { poolPromise } from "../config/db.js";

const ProductModel = {

  // Lấy tất cả sản phẩm
  async findAll() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT p.*, c.category
      FROM Products p
      JOIN Categories c ON p.id_category = c.id
      ORDER BY p.id DESC
    `);

    return result.recordset;
  },

  // Lấy sản phẩm theo id
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT * FROM Products WHERE id = @id
      `);

    return result.recordset[0];
  },

  // Lấy sản phẩm theo category
  async findByCategory(id_category) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id_category", sql.Int, id_category)
      .query("SELECT * FROM Products WHERE id_category = @id_category");

    return result.recordset;
  },

  // Tạo sản phẩm
  async create(data) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id_category", sql.Int, data.id_category)
      .input("name_product", sql.NVarChar, data.name_product)
      .input("price_product", sql.NVarChar, data.price_product)
      .input("image", sql.NVarChar, data.image)
      .input("describe", sql.NVarChar, data.describe)
      .input("gender", sql.NVarChar, data.gender)
      .query(`
        INSERT INTO Products 
        (id_category, name_product, price_product, image, describe, gender)
        OUTPUT INSERTED.*
        VALUES
        (@id_category, @name_product, @price_product, @image, @describe, @gender)
      `);

    return result.recordset[0];
  },

  // Update sản phẩm
  async update(id, data) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("id_category", sql.Int, data.id_category)
      .input("name_product", sql.NVarChar, data.name_product)
      .input("price_product", sql.NVarChar, data.price_product)
      .input("image", sql.NVarChar, data.image)
      .input("describe", sql.NVarChar, data.describe)
      .input("gender", sql.NVarChar, data.gender)
      .query(`
        UPDATE Products SET
          id_category = @id_category,
          name_product = @name_product,
          price_product = @price_product,
          image = @image,
          describe = @describe,
          gender = @gender
        WHERE id = @id
      `);

    return true;
  },

  // Xóa sản phẩm
  async delete(id) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Products WHERE id = @id");

    return true;
  }
};

export default ProductModel;
