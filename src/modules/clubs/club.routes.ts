import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware.js";
import * as clubController from "./club.controller.js";

const router = Router();

router.get("/", clubController.getClubs);
router.get("/:id", clubController.getClub);
router.post("/", requireAuth, requireAdmin, clubController.createClub);
router.patch("/:id", requireAuth, requireAdmin, clubController.updateClub);
router.delete("/:id", requireAuth, requireAdmin, clubController.deleteClub);

export default router;
