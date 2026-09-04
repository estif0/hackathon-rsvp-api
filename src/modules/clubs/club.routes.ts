import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware";
import * as clubController from "./club.controller";

const router = Router();

router.get("/", clubController.getClubs);
router.get("/:id", clubController.getClub);
router.post("/", requireAuth, requireAdmin, clubController.createClub);
router.patch("/:id", requireAuth, requireAdmin, clubController.updateClub);
router.delete("/:id", requireAuth, requireAdmin, clubController.deleteClub);

export default router;
