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
        // GET list
        if (sql.includes("FROM Products") && sql.includes("ORDER BY")) {
          return {
            recordset: [
              {
                ProductID: 1,
                Name: "Product Test",
                Price: 100,
                Quantity: 10,
              },
            ],
          };
        }

        // GET detail
        if (sql.includes("WHERE ProductID = @id")) {
          return {
            recordset: [
              {
                ProductID: 1,
                Name: "Product Test",
                Price: 100,
                Quantity: 10,
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
 * IMPORT ROUTER SAU KHI MOCK
 */
const { default: productRouter } = await import(
  "../../API/Router/admin/product.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/products", productRouter);

/**
 * TEST
 */
describe("Product API Integration Test", () => {
  test("GET /api/products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].Name).toBe("Product Test");
  });

  test("GET /api/products/:id", async () => {
    const res = await request(app).get("/api/products/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.ProductID).toBe(1);
  });

  test("POST /api/products/create", async () => {
    const res = await request(app)
      .post("/api/products/create")
      .send({
        name: "Product Test",
        price: 100,
        quantity: 10,
        description: "test",
        image: "img.png",
        categoryId: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/products/update", async () => {
    const res = await request(app)
      .patch("/api/products/update")
      .send({
        id: 1,
        name: "Updated Product",
        price: 200,
        quantity: 5,
        description: "updated",
        image: "img2.png",
        categoryId: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/products/delete", async () => {
    const res = await request(app)
      .delete("/api/products/delete")
      .send({ id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
