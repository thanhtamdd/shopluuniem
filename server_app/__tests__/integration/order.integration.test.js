import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * MOCK DB
 * router dùng: "../../../config/db.js"
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
        // GET all orders
        if (sql.includes("FROM Orders") && sql.includes("ORDER BY")) {
          return {
            recordset: [
              {
                OrderID: 1,
                Status: "pending",
                CreatedAt: new Date(),
              },
            ],
          };
        }

        // GET order detail
        if (sql.includes("FROM Orders WHERE OrderID")) {
          return {
            recordset: [
              {
                OrderID: 1,
                Status: "pending",
                Total: 100000,
              },
            ],
          };
        }

        // GET order details (products)
        if (sql.includes("FROM OrderDetails")) {
          return {
            recordset: [
              {
                OrderDetailID: 1,
                ProductID: 2,
                ProductName: "Test Product",
                Quantity: 2,
              },
            ],
          };
        }

        // Complete orders
        if (sql.includes("Status = 'completed'")) {
          return {
            recordset: [
              {
                OrderID: 2,
                Status: "completed",
              },
            ],
          };
        }

        // UPDATE / PATCH
        return { recordset: [] };
      },
    }),
  })),
}));

/**
 * IMPORT ROUTER (SAU KHI MOCK)
 */
const { default: orderRouter } = await import(
  "../../API/Router/admin/order.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/orders", orderRouter);

/**
 * TEST
 */
describe("Order API Integration Test", () => {
  test("GET /api/orders", async () => {
    const res = await request(app).get("/api/orders");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].OrderID).toBe(1);
  });

  test("GET /api/orders/detail/:id", async () => {
    const res = await request(app).get("/api/orders/detail/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.OrderID).toBe(1);
  });

  test("GET /api/orders/detailorder/:id", async () => {
    const res = await request(app).get("/api/orders/detailorder/1");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].ProductName).toBe("Test Product");
  });

  test("PATCH /api/orders/confirmorder", async () => {
    const res = await request(app)
      .patch("/api/orders/confirmorder")
      .send({ orderId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/orders/cancelorder", async () => {
    const res = await request(app)
      .patch("/api/orders/cancelorder")
      .send({ orderId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/orders/delivery", async () => {
    const res = await request(app)
      .patch("/api/orders/delivery")
      .send({ orderId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/orders/confirmdelivery", async () => {
    const res = await request(app)
      .patch("/api/orders/confirmdelivery")
      .send({ orderId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/orders/completeOrder", async () => {
    const res = await request(app).get("/api/orders/completeOrder");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].Status).toBe("completed");
  });
});
