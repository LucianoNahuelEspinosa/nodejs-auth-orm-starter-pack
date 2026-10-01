import { Router } from "express";
import authMiddleware from "@/middlewares/auth";
import User from "@/controllers/user";

const controller = new User();
const router = Router();

router.post("/create", controller.create);
router.put("/update", authMiddleware, controller.update);

export default router;