import type { Options } from "swagger-ui-express";

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Hackathon RSVP API",
    description:
      "A backend API for tech clubs to manage events, hackathons, and member RSVPs.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
      },
    },
    schemas: {
      Club: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          ownerId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Hackathon: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          date: { type: "string", format: "date-time" },
          maxAttendees: { type: "integer" },
          clubId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Rsvp: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          hackathonId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ── Clubs ────────────────────────────────────────────────────────────
    "/api/clubs": {
      get: {
        tags: ["Clubs"],
        summary: "List all clubs",
        responses: {
          200: {
            description: "A list of clubs",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Club" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clubs"],
        summary: "Create a new club (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Club created", content: { "application/json": { schema: { $ref: "#/components/schemas/Club" } } } },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
        },
      },
    },
    "/api/clubs/{id}": {
      get: {
        tags: ["Clubs"],
        summary: "Get a club by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Club found", content: { "application/json": { schema: { $ref: "#/components/schemas/Club" } } } },
          404: { description: "Club not found" },
        },
      },
      patch: {
        tags: ["Clubs"],
        summary: "Update a club (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Club updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
          404: { description: "Club not found" },
        },
      },
      delete: {
        tags: ["Clubs"],
        summary: "Delete a club (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Club deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
          404: { description: "Club not found" },
        },
      },
    },
    // ── Hackathons ───────────────────────────────────────────────────────
    "/api/hackathons": {
      get: {
        tags: ["Hackathons"],
        summary: "List all hackathons",
        parameters: [
          { name: "clubId", in: "query", required: false, schema: { type: "string" }, description: "Filter by club" },
        ],
        responses: {
          200: {
            description: "A list of hackathons",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Hackathon" } } } },
          },
        },
      },
      post: {
        tags: ["Hackathons"],
        summary: "Create a new hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "date", "maxAttendees", "clubId"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  maxAttendees: { type: "integer" },
                  clubId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Hackathon created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
        },
      },
    },
    "/api/hackathons/{id}": {
      get: {
        tags: ["Hackathons"],
        summary: "Get a hackathon by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Hackathon found", content: { "application/json": { schema: { $ref: "#/components/schemas/Hackathon" } } } },
          404: { description: "Hackathon not found" },
        },
      },
      patch: {
        tags: ["Hackathons"],
        summary: "Update a hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  maxAttendees: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Hackathon updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
          404: { description: "Hackathon not found" },
        },
      },
      delete: {
        tags: ["Hackathons"],
        summary: "Delete a hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Hackathon deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – Admin only" },
          404: { description: "Hackathon not found" },
        },
      },
    },
    // ── RSVPs ────────────────────────────────────────────────────────────
    "/api/rsvps": {
      post: {
        tags: ["RSVPs"],
        summary: "RSVP to a hackathon",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["hackathonId"],
                properties: {
                  hackathonId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "RSVP created", content: { "application/json": { schema: { $ref: "#/components/schemas/Rsvp" } } } },
          400: { description: "Hackathon is at full capacity" },
          401: { description: "Unauthorized" },
          409: { description: "Already RSVPed to this hackathon" },
        },
      },
    },
    "/api/rsvps/me": {
      get: {
        tags: ["RSVPs"],
        summary: "Get the current user's RSVPs",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "List of RSVPs",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Rsvp" } } } },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/rsvps/{hackathonId}": {
      delete: {
        tags: ["RSVPs"],
        summary: "Cancel an RSVP",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "hackathonId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "RSVP cancelled" },
          401: { description: "Unauthorized" },
          404: { description: "RSVP not found" },
        },
      },
    },
  },
};

export const swaggerUiOptions: Options = {
  customSiteTitle: "Hackathon RSVP API Docs",
};
