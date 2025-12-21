import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";


jest.unstable_mockModule("../../config/db.js", () => ({
  getPool: jest.fn(() => ({
    request: () => ({
      input() {
        return this;
      },
      query: async (sql) => {
        // GET /sale
        if (sql.includes("FROM Sales")) {
          return {
            recordset: [
              {
                SaleID: 1,
                Name: "Sale Test",
                DiscountPercent: 20,
              },
            ],
          };
        }

        // INSERT sale
        if (sql.includes("OUTPUT INSERTED.SaleID")) {
          return {
            recordset: [{ SaleID: 1 }],
          };
        }

        // default
        return { recordset: [] };
      },
    }),
  })),
}));

/**
 * IMPORT ROUTER SAU KHI MOCK
 */
const { default: saleRouter } = await import(
  "../../API/Router/admin/sale.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/sale", saleRouter);

/**
 * TEST
 */
describe("Sale API Integration Test", () => {
  test("GET /api/sale", async () => {
    const res = await request(app).get("/api/sale");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].Name).toBe("Sale Test");
  });

  test("POST /api/sale", async () => {
    const res = await request(app)
      .post("/api/sale")
      .send({
        name: "Sale Test",
        discountPercent: 20,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        productIds: [1, 2],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.saleId).toBe(1);
  });
});
