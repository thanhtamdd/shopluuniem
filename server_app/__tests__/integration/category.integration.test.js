import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * MOCK DB
 * Router dùng: "../../../config/db.js"
 * Test nằm ở: __tests__/integration
 * => mock path: ../../config/db.js
 */
jest.unstable_mockModule("../../config/db.js", () => ({
  getPool: jest.fn(() => ({
    request: () => ({
      input() {
        return this;
      },
      query: async (sql) => {
        // GET all categories
        if (sql.includes("SELECT * FROM Categories") && !sql.includes("WHERE")) {
          return {
            recordset: [
              {
                CategoryID: 1,
                Name: "Laptop",
                Description: "Laptop category",
              },
            ],
          };
        }

        // GET category by ID
        if (sql.includes("FROM Categories WHERE CategoryID")) {
          return {
            recordset: [
              {
                CategoryID: 1,
                Name: "Laptop",
                Description: "Laptop category",
              },
            ],
          };
        }

        // GET products by category
        if (sql.includes("FROM Products WHERE CategoryID")) {
          return {
            recordset: [
              {
                ProductID: 10,
                Name: "Macbook Pro",
                CategoryID: 1,
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
const { default: categoryRouter } = await import(
  "../../API/Router/admin/category.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/categories", categoryRouter);

/**
 * TEST
 */
describe("Category API Integration Test", () => {
  test("GET /api/categories", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].Name).toBe("Laptop");
  });

  test("GET /api/categories/:id", async () => {
    const res = await request(app).get("/api/categories/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.CategoryID).toBe(1);
  });

  test("GET /api/categories/detail/:id", async () => {
    const res = await request(app).get("/api/categories/detail/1");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].Name).toBe("Macbook Pro");
  });

  test("POST /api/categories/create", async () => {
    const res = await request(app)
      .post("/api/categories/create")
      .send({
        name: "Phone",
        description: "Phone category",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/categories/update", async () => {
    const res = await request(app)
      .put("/api/categories/update")
      .send({
        id: 1,
        name: "Updated Category",
        description: "Updated desc",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/categories/delete", async () => {
    const res = await request(app)
      .delete("/api/categories/delete")
      .send({ id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
