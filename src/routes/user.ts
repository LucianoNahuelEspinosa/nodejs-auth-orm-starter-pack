import { Router } from "express";
import authMiddleware from "@/middlewares/auth";
import User from "@/controllers/user";

const controller = new User();
const router = Router();

router.post("/create", controller.create);
router.put("/update", authMiddleware, controller.update);
router.put("/block", authMiddleware, controller.block);
router.put("/unblock", authMiddleware, controller.unblock);
router.delete("/delete", authMiddleware, controller.delete);
router.put("/restore", authMiddleware, controller.restore);
router.put("/delete-hard", authMiddleware, controller.deleteHard);

export default router;