import sql from "mssql";
import { poolPromise } from "../config/db.js";
import bcrypt from "bcrypt";

const UserModel = {
  // Lấy tất cả user
  async findAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT _id, username, fullname, email, id_permission
        FROM [User]
        ORDER BY _id DESC
      `);
    return result.recordset;
  },

  // Lấy user theo id
  async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT _id, username, fullname, email, id_permission
        FROM [User]
        WHERE _id = @id
      `);
    return result.recordset[0];
  },

  // Lấy user theo username (dùng cho login)
  async findByUsername(username) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query(`
        SELECT *
        FROM [User]
        WHERE username = @username
      `);
    return result.recordset[0];
  },

  // Tạo user (register) có hash password
  async create(data) {
    const pool = await poolPromise;
    const hashPassword = await bcrypt.hash(data.password, 10);

    const result = await pool.request()
      .input("id_permission", sql.Int, data.id_permission || 0)
      .input("username", sql.NVarChar, data.username)
      .input("password", sql.NVarChar, hashPassword)
      .input("fullname", sql.NVarChar, data.fullname || null)
      .input("email", sql.NVarChar, data.email || null)
      .query(`
        INSERT INTO [User] (id_permission, username, password, fullname, email)
        OUTPUT INSERTED.*
        VALUES (@id_permission, @username, @password, @fullname, @email)
      `);

    const user = result.recordset[0];
    delete user.password;
    return user;
  },

  // Cập nhật thông tin user
  async update(id, data) {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .input("fullname", sql.NVarChar, data.fullname)
      .input("email", sql.NVarChar, data.email)
      .input("id_permission", sql.Int, data.id_permission || 0)
      .query(`
        UPDATE [User] SET
          fullname = @fullname,
          email = @email,
          id_permission = @id_permission
        WHERE _id = @id
      `);
    return true;
  },

  // Đổi mật khẩu
  async updatePassword(id, password) {
    const pool = await poolPromise;
    const hashPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("id", sql.Int, id)
      .input("password", sql.NVarChar, hashPassword)
      .query("UPDATE [User] SET password = @password WHERE _id = @id");

    return true;
  },

  // Xóa user
  async delete(id) {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM [User] WHERE _id = @id");
    return true;
  }
};

export default UserModel;
