import sql from "mssql";
import { poolPromise } from "../config/db.js";

const DeliveryModel = {

  // Tạo delivery
  async create(data) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_delivery", sql.NVarChar, data.id_delivery)
      .input("from_location", sql.NVarChar, data.from)
      .input("to_location", sql.NVarChar, data.to)
      .input("distance", sql.NVarChar, data.distance)
      .input("duration", sql.NVarChar, data.duration)
      .input("price", sql.Decimal(10, 2), data.price)
      .query(`
        INSERT INTO Deliveries 
        (id_delivery, from_location, to_location, distance, duration, price)
        VALUES 
        (@id_delivery, @from_location, @to_location, @distance, @duration, @price)
      `);

    return result;
  },

  // Lấy delivery theo id_delivery (y chang Mongo findOne)
  async findByDeliveryId(id_delivery) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_delivery", sql.NVarChar, id_delivery)
      .query(`
        SELECT * FROM Deliveries WHERE id_delivery = @id_delivery
      `);

    return result.recordset[0];
  },

  // Lấy tất cả delivery
  async findAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT * FROM Deliveries`);
    return result.recordset;
  }
};

export default DeliveryModel;
