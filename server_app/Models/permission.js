import sql from "mssql";
import { poolPromise } from "../config/db.js";

const PermissionModel = {

  // Lấy tất cả quyền
  async findAll() {
    const pool = await poolPromise;

    const result = await pool.request()
      .query("SELECT * FROM Permissions ORDER BY id DESC");

    return result.recordset;
  },

  // Lấy quyền theo id
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Permissions WHERE id = @id");

    return result.recordset[0];
  },

  // Tạo quyền mới
  async create(permission) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("permission", sql.NVarChar, permission)
      .query(`
        INSERT INTO Permissions (permission)
        OUTPUT INSERTED.*
        VALUES (@permission)
      `);

    return result.recordset[0];
  },

  // Cập nhật quyền
  async update(id, permission) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("permission", sql.NVarChar, permission)
      .query(`
        UPDATE Permissions
        SET permission = @permission
        WHERE id = @id
      `);

    return true;
  },

  // Xóa quyền
  async delete(id) {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Permissions WHERE id = @id");

    return true;
  }
};

export default PermissionModel;
