import sql from "mssql";
import { poolPromise } from "../config/db.js";

const NoteModel = {

  // Tạo note
  async create(data) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("fullname", sql.NVarChar, data.fullname)
      .input("phone", sql.NVarChar, data.phone)
      .query(`
        INSERT INTO Notes (fullname, phone)
        OUTPUT INSERTED.*
        VALUES (@fullname, @phone)
      `);

    return result.recordset[0];
  },

  // Lấy note theo id
  async findById(id) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT * FROM Notes WHERE id = @id
      `);

    return result.recordset[0];
  }

};

export default NoteModel;
