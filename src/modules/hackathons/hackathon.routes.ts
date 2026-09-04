import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware";
import * as hackathonController from "./hackathon.controller";

const router = Router();

router.get("/", hackathonController.getHackathons);
router.get("/:id", hackathonController.getHackathon);
router.get("/:id/rsvps", requireAuth, requireAdmin, hackathonController.getHackathonAttendees);
router.post("/", requireAuth, requireAdmin, hackathonController.createHackathon);
router.patch("/:id", requireAuth, requireAdmin, hackathonController.updateHackathon);
router.delete("/:id", requireAuth, requireAdmin, hackathonController.deleteHackathon);

export default router;

