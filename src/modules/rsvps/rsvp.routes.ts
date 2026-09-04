import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import * as rsvpController from "./rsvp.controller";

const router = Router();

router.use(requireAuth);

router.post("/", rsvpController.createRsvp);
router.get("/me", rsvpController.getMyRsvps);
router.delete("/:hackathonId", rsvpController.deleteRsvp);

export default router;
