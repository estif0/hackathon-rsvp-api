import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as rsvpController from "./rsvp.controller.js";

const router = Router();

// All RSVP routes require authentication
router.use(requireAuth);

router.post("/", rsvpController.createRsvp);
router.get("/me", rsvpController.getMyRsvps);
router.delete("/:hackathonId", rsvpController.deleteRsvp);

export default router;
