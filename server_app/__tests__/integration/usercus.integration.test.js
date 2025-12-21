import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * MOCK config/db.js
 * Router import: ../../config/db.js
 * => test nằm trong __tests__/integration
 * => mock path phải đúng: ../../config/db.js
 */
jest.unstable_mockModule("../../config/db.js", () => ({
  getPool: jest.fn(async () => ({
    request: () => ({
      input() {
        return this;
      },
      query: async (sql) => {
        // GET ALL USERS
        if (sql.includes("FROM [User]") && sql.includes("ORDER BY")) {
          return {
            recordset: [
              {
                _id: 1,
                username: "testuser",
                fullname: "Test User",
                email: "test@test.com",
                id_permission: 0,
              },
            ],
          };
        }

        // GET USER BY ID
        if (sql.includes("WHERE _id = @id")) {
          return {
            recordset: [
              {
                _id: 1,
                username: "testuser",
                fullname: "Test User",
                email: "test@test.com",
                id_permission: 0,
              },
            ],
          };
        }

        // CHECK USERNAME EXIST
        if (sql.includes("SELECT _id FROM [User] WHERE username")) {
          return { recordset: [] };
        }

        // LOGIN
        if (sql.includes("SELECT * FROM [User]")) {
          return {
            recordset: [
              {
                _id: 1,
                username: "testuser",
                password: "123456",
                email: "test@test.com",
                id_permission: 0,
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
const { default: userRouter } = await import(
  "../../API/Router/user.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

/**
 * TEST CASES
 */
describe("User API Integration Test", () => {
  test("GET /api/users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].username).toBe("testuser");
  });

  test("GET /api/users/:id", async () => {
    const res = await request(app).get("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(1);
  });

  test("POST /api/users (create)", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "newuser",
        password: "123456",
        fullname: "New User",
        email: "new@test.com",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/users/login", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        identifier: "testuser",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test("PUT /api/users/:id", async () => {
    const res = await request(app)
      .put("/api/users/1")
      .send({
        username: "updateduser",
        fullname: "Updated User",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/users/:id", async () => {
    const res = await request(app).delete("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
