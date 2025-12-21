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
        // GET list / all
        if (sql.includes("FROM Permissions") && !sql.includes("WHERE")) {
          return {
            recordset: [
              {
                PermissionID: 1,
                Name: "ADMIN",
                Description: "Admin permission",
              },
            ],
          };
        }

        // GET detail
        if (sql.includes("WHERE PermissionID = @id")) {
          return {
            recordset: [
              {
                PermissionID: 1,
                Name: "ADMIN",
                Description: "Admin permission",
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
const { default: permissionRouter } = await import(
  "../../API/Router/admin/permission.router.js"
);

/**
 * SETUP APP
 */
const app = express();
app.use(express.json());
app.use("/api/permissions", permissionRouter);

/**
 * TEST
 */
describe("Permission API Integration Test", () => {
  test("GET /api/permissions", async () => {
    const res = await request(app).get("/api/permissions");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].Name).toBe("ADMIN");
  });

  test("GET /api/permissions/all", async () => {
    const res = await request(app).get("/api/permissions/all");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/permissions/:id", async () => {
    const res = await request(app).get("/api/permissions/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.PermissionID).toBe(1);
  });

  test("POST /api/permissions/create", async () => {
    const res = await request(app)
      .post("/api/permissions/create")
      .send({
        name: "USER",
        description: "User permission",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/permissions/update", async () => {
    const res = await request(app)
      .put("/api/permissions/update")
      .send({
        id: 1,
        name: "ADMIN_UPDATED",
        description: "Updated permission",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/permissions/delete", async () => {
    const res = await request(app)
      .delete("/api/permissions/delete")
      .send({ id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
