import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestUser, type TestUser } from "./helpers/auth.helper";

describe("RSVPs Endpoints", () => {
  let admin: TestUser;
  let student1: TestUser;
  let student2: TestUser;
  let clubId: string;
  let hackathonId: string;
  let limitedHackathonId: string;

  beforeAll(async () => {
    admin = await createTestUser("admin");
    student1 = await createTestUser("student");
    student2 = await createTestUser("student");

    const clubRes = await request(app)
      .post("/api/clubs")
      .set("Cookie", admin.cookie)
      .send({ name: "RSVP Test Club" });
    clubId = clubRes.body.id;

    // Normal hackathon with capacity 50
    const h1 = await request(app)
      .post("/api/hackathons")
      .set("Cookie", admin.cookie)
      .send({
        title: "Large Hackathon",
        date: new Date(Date.now() + 86400000 * 5).toISOString(),
        maxAttendees: 50,
        clubId,
      });
    hackathonId = h1.body.id;

    // Limited hackathon with capacity 1
    const h2 = await request(app)
      .post("/api/hackathons")
      .set("Cookie", admin.cookie)
      .send({
        title: "Exclusive Hackathon",
        date: new Date(Date.now() + 86400000 * 10).toISOString(),
        maxAttendees: 1,
        clubId,
      });
    limitedHackathonId = h2.body.id;
  });

  describe("POST /api/rsvps", () => {
    it("should reject unauthenticated RSVP with 401", async () => {
      const res = await request(app)
        .post("/api/rsvps")
        .send({ hackathonId });
      expect(res.status).toBe(401);
    });

    it("should reject with 400 when hackathonId is missing", async () => {
      const res = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student1.cookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "hackathonId is required");
    });

    it("should reject with 404 for non-existent hackathon", async () => {
      const res = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student1.cookie)
        .send({ hackathonId: "non-existent-hackathon" });
      expect(res.status).toBe(404);
    });

    it("should successfully create an RSVP", async () => {
      const res = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student1.cookie)
        .send({ hackathonId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.hackathonId).toBe(hackathonId);
      expect(res.body.userId).toBe(student1.id);
    });

    it("should reject duplicate RSVP with 409", async () => {
      const res = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student1.cookie)
        .send({ hackathonId });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "You have already RSVPed to this hackathon");
    });

    it("should enforce capacity limit when max attendees reached", async () => {
      // First student takes the only slot
      const res1 = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student1.cookie)
        .send({ hackathonId: limitedHackathonId });
      expect(res1.status).toBe(201);

      // Second student tries to RSVP to full hackathon
      const res2 = await request(app)
        .post("/api/rsvps")
        .set("Cookie", student2.cookie)
        .send({ hackathonId: limitedHackathonId });

      expect(res2.status).toBe(400);
      expect(res2.body).toHaveProperty("message", "Hackathon is at full capacity");
    });
  });

  describe("GET /api/rsvps/me", () => {
    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/rsvps/me");
      expect(res.status).toBe(401);
    });

    it("should list current user's RSVPs", async () => {
      const res = await request(app)
        .get("/api/rsvps/me")
        .set("Cookie", student1.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r: { hackathonId: string }) => r.hackathonId === hackathonId)).toBe(true);
    });
  });

  describe("GET /api/hackathons/:id/rsvps (Admin)", () => {
    it("should reject student request with 403", async () => {
      const res = await request(app)
        .get(`/api/hackathons/${hackathonId}/rsvps`)
        .set("Cookie", student1.cookie);
      expect(res.status).toBe(403);
    });

    it("should allow admin to view attendees with user info", async () => {
      const res = await request(app)
        .get(`/api/hackathons/${hackathonId}/rsvps`)
        .set("Cookie", admin.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const attendee = res.body.find((r: { userId: string }) => r.userId === student1.id);
      expect(attendee).toBeDefined();
      expect(attendee.user).toHaveProperty("email", student1.email);
    });
  });

  describe("DELETE /api/rsvps/:hackathonId", () => {
    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app).delete(`/api/rsvps/${hackathonId}`);
      expect(res.status).toBe(401);
    });

    it("should return 404 when trying to cancel non-existent RSVP", async () => {
      const res = await request(app)
        .delete(`/api/rsvps/${hackathonId}`)
        .set("Cookie", student2.cookie);
      expect(res.status).toBe(404);
    });

    it("should allow student to cancel their RSVP", async () => {
      const res = await request(app)
        .delete(`/api/rsvps/${hackathonId}`)
        .set("Cookie", student1.cookie);
      expect(res.status).toBe(204);

      // Verify RSVP is gone
      const meRes = await request(app)
        .get("/api/rsvps/me")
        .set("Cookie", student1.cookie);
      expect(meRes.body.some((r: { hackathonId: string }) => r.hackathonId === hackathonId)).toBe(false);
    });
  });
});
