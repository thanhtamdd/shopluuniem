import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * MOCK DB
 * router import: "../../../config/db.js"
 * test nằm ở: __tests__/integration
 * => mock path: ../../config/db.js
 */
jest.unstable_mockModule("../../config/db.js", () => ({
  getPool: jest.fn(() => ({
    request: () => ({
      input() {
        return this;
      },
      query: async (sql) => {
        // GET all coupons
        if (sql.includes("SELECT * FROM Coupons") && !sql.includes("WHERE")) {
          return {
            recordset: [
              {
                CouponID: 1,
                Code: "SALE10",
                Discount: 10,
                IsActive: 1,
              },
            ],
          };
        }

        // GET coupon by ID
        if (sql.includes("WHERE CouponID")) {
          return {
            recordset: [
              {
                CouponID: 1,
                Code: "SALE10",
                Discount: 10,
                Description: "Test coupon",
              },
            ],
          };
        }

        // promotion checking
        if (sql.includes("IsActive = 1")) {
          return {
            recordset: [
              {
                CouponID: 2,
                Code: "PROMO20",
                Discount: 20,
              },
            ],
          };
        }

        // INSERT / UPDATE / DELETE
        return { recordset: [] };
      },
    }),
  })),
}));

/**
 * IMPORT ROUTER (SAU MOCK)
 */
const { default: couponRouter } = await import(
  "../../API/Router/admin/coupon.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/coupons", couponRouter);

/**
 * TEST
 */
describe("Coupon API Integration Test", () => {
  test("GET /api/coupons", async () => {
    const res = await request(app).get("/api/coupons");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].Code).toBe("SALE10");
  });

  test("GET /api/coupons/:id", async () => {
    const res = await request(app).get("/api/coupons/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.CouponID).toBe(1);
  });

  test("POST /api/coupons", async () => {
    const res = await request(app).post("/api/coupons").send({
      Code: "NEW10",
      Discount: 10,
      Description: "New coupon",
      IsActive: 1,
      StartDate: "2025-01-01",
      EndDate: "2025-12-31",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/coupons/:id", async () => {
    const res = await request(app).patch("/api/coupons/1").send({
      Code: "UPDATE10",
      Discount: 15,
      Description: "Updated coupon",
      IsActive: 1,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/coupons/:id", async () => {
    const res = await request(app).delete("/api/coupons/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/coupons/promotion/checking", async () => {
    const res = await request(app).get("/api/coupons/promotion/checking");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].Code).toBe("PROMO20");
  });

  test("PATCH /api/coupons/promotion/:id", async () => {
    const res = await request(app)
      .patch("/api/coupons/promotion/1")
      .send({
        IsActive: 1,
        StartDate: "2025-01-01",
        EndDate: "2025-12-31",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
