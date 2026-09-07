import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestUser, type TestUser } from "./helpers/auth.helper";

describe("Hackathons Endpoints", () => {
  let admin: TestUser;
  let student: TestUser;
  let clubId: string;
  let hackathonId: string;

  beforeAll(async () => {
    admin = await createTestUser("admin");
    student = await createTestUser("student");

    // Create a club for hackathons
    const clubRes = await request(app)
      .post("/api/clubs")
      .set("Cookie", admin.cookie)
      .send({ name: "AI & Web Club", description: "Hackathon Host Club" });
    clubId = clubRes.body.id;
  });

  describe("POST /api/hackathons", () => {
    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app)
        .post("/api/hackathons")
        .send({
          title: "Winter Hackathon",
          date: new Date(Date.now() + 86400000).toISOString(),
          maxAttendees: 50,
          clubId,
        });
      expect(res.status).toBe(401);
    });

    it("should reject student request with 403", async () => {
      const res = await request(app)
        .post("/api/hackathons")
        .set("Cookie", student.cookie)
        .send({
          title: "Winter Hackathon",
          date: new Date(Date.now() + 86400000).toISOString(),
          maxAttendees: 50,
          clubId,
        });
      expect(res.status).toBe(403);
    });

    it("should reject request with 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/hackathons")
        .set("Cookie", admin.cookie)
        .send({ title: "Incomplete Hackathon" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should allow admin to create a hackathon", async () => {
      const futureDate = new Date(Date.now() + 86400000 * 7).toISOString();
      const res = await request(app)
        .post("/api/hackathons")
        .set("Cookie", admin.cookie)
        .send({
          title: "Hack The Future 2026",
          description: "Build AI-powered developer tools",
          date: futureDate,
          maxAttendees: 30,
          clubId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("Hack The Future 2026");
      expect(res.body.maxAttendees).toBe(30);
      expect(res.body.clubId).toBe(clubId);
      hackathonId = res.body.id;
    });
  });

  describe("GET /api/hackathons", () => {
    it("should list hackathons (public)", async () => {
      const res = await request(app).get("/api/hackathons");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((h: { id: string }) => h.id === hackathonId)).toBe(true);
    });

    it("should filter hackathons by clubId", async () => {
      const res = await request(app).get(`/api/hackathons?clubId=${clubId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((h: { clubId: string }) => h.clubId === clubId)).toBe(true);
    });
  });

  describe("GET /api/hackathons/:id", () => {
    it("should return 404 for non-existent hackathon", async () => {
      const res = await request(app).get("/api/hackathons/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("should return hackathon details including club and rsvp count", async () => {
      const res = await request(app).get(`/api/hackathons/${hackathonId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(hackathonId);
      expect(res.body.title).toBe("Hack The Future 2026");
      expect(res.body).toHaveProperty("club");
      expect(res.body).toHaveProperty("_count");
    });
  });

  describe("PATCH /api/hackathons/:id", () => {
    it("should reject student edits with 403", async () => {
      const res = await request(app)
        .patch(`/api/hackathons/${hackathonId}`)
        .set("Cookie", student.cookie)
        .send({ maxAttendees: 100 });
      expect(res.status).toBe(403);
    });

    it("should allow admin to update hackathon details", async () => {
      const res = await request(app)
        .patch(`/api/hackathons/${hackathonId}`)
        .set("Cookie", admin.cookie)
        .send({ title: "Hack The Future 2026 (Updated)", maxAttendees: 40 });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Hack The Future 2026 (Updated)");
      expect(res.body.maxAttendees).toBe(40);
    });
  });

  describe("DELETE /api/hackathons/:id", () => {
    it("should reject student deletions with 403", async () => {
      const res = await request(app)
        .delete(`/api/hackathons/${hackathonId}`)
        .set("Cookie", student.cookie);
      expect(res.status).toBe(403);
    });

    it("should allow admin to delete hackathon", async () => {
      const res = await request(app)
        .delete(`/api/hackathons/${hackathonId}`)
        .set("Cookie", admin.cookie);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/hackathons/${hackathonId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
