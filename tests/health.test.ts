import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Health and Root Endpoints", () => {
  it("GET / should return API info and docs link", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Hackathon RSVP API");
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("docs", "/api/docs");
  });

  it("GET /api/health should return ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });
});
