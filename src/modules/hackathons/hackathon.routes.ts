import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware.js";
import * as hackathonController from "./hackathon.controller.js";

const router = Router();

router.get("/", hackathonController.getHackathons);
router.get("/:id", hackathonController.getHackathon);
router.post("/", requireAuth, requireAdmin, hackathonController.createHackathon);
router.patch("/:id", requireAuth, requireAdmin, hackathonController.updateHackathon);
router.delete("/:id", requireAuth, requireAdmin, hackathonController.deleteHackathon);

export default router;
