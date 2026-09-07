import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestUser, type TestUser } from "./helpers/auth.helper";

describe("Clubs Endpoints", () => {
  let admin: TestUser;
  let student: TestUser;
  let createdClubId: string;

  beforeAll(async () => {
    admin = await createTestUser("admin");
    student = await createTestUser("student");
  });

  describe("POST /api/clubs", () => {
    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app)
        .post("/api/clubs")
        .send({ name: "Robotics Club" });
      expect(res.status).toBe(401);
    });

    it("should reject non-admin request with 403", async () => {
      const res = await request(app)
        .post("/api/clubs")
        .set("Cookie", student.cookie)
        .send({ name: "Robotics Club" });
      expect(res.status).toBe(403);
    });

    it("should reject admin request with 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/clubs")
        .set("Cookie", admin.cookie)
        .send({ description: "No name provided" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "name is required");
    });

    it("should allow admin to create a new club", async () => {
      const res = await request(app)
        .post("/api/clubs")
        .set("Cookie", admin.cookie)
        .send({ name: "Robotics Club", description: "All things robotics" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Robotics Club");
      expect(res.body.description).toBe("All things robotics");
      createdClubId = res.body.id;
    });
  });

  describe("GET /api/clubs", () => {
    it("should return a list of clubs (public)", async () => {
      const res = await request(app).get("/api/clubs");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((c: { id: string }) => c.id === createdClubId)).toBe(true);
    });
  });

  describe("GET /api/clubs/:id", () => {
    it("should return 404 for non-existent club", async () => {
      const res = await request(app).get("/api/clubs/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("should return club details by ID", async () => {
      const res = await request(app).get(`/api/clubs/${createdClubId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdClubId);
      expect(res.body.name).toBe("Robotics Club");
    });
  });

  describe("PATCH /api/clubs/:id", () => {
    it("should reject student updates with 403", async () => {
      const res = await request(app)
        .patch(`/api/clubs/${createdClubId}`)
        .set("Cookie", student.cookie)
        .send({ name: "Updated by Student" });
      expect(res.status).toBe(403);
    });

    it("should allow admin to update a club", async () => {
      const res = await request(app)
        .patch(`/api/clubs/${createdClubId}`)
        .set("Cookie", admin.cookie)
        .send({ name: "Advanced Robotics Club" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Advanced Robotics Club");
    });
  });

  describe("DELETE /api/clubs/:id", () => {
    it("should reject student deletions with 403", async () => {
      const res = await request(app)
        .delete(`/api/clubs/${createdClubId}`)
        .set("Cookie", student.cookie);
      expect(res.status).toBe(403);
    });

    it("should allow admin to delete a club", async () => {
      const res = await request(app)
        .delete(`/api/clubs/${createdClubId}`)
        .set("Cookie", admin.cookie);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/clubs/${createdClubId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
