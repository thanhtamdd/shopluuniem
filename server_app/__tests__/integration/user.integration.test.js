import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * MOCK DB – PHẢI ĐẶT TRƯỚC IMPORT ROUTER
 * PHẢI TRÙNG PATH TRONG ROUTER
 */
jest.unstable_mockModule("../../config/db.js", () => ({

  getPool: jest.fn(async () => ({
    request: () => ({
      input() {
        return this;
      },
      query: async () => ({
        recordset: [
          {
            _id: 1,
            username: "testuser",
            fullname: "Test User",
            email: "test@test.com",
            id_permission: 1,
          },
        ],
      }),
    }),
  })),
}));

/**
 * IMPORT ROUTER SAU MOCK
 */
const { default: userRouter } = await import(
  "../../API/Router/admin/user.router.js"
);

/**
 * APP
 */
const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

/**
 * TEST
 */
describe("User API Integration Test", () => {
  test("GET /api/users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.users[0].username).toBe("testuser");
  });
});
