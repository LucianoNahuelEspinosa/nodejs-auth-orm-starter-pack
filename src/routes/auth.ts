import { Router } from "express";
import authMiddleware from "@/middlewares/auth";
import Auth from "@/controllers/auth";

const controller = new Auth();
const router = Router();

router.post("/login", controller.login);
router.get("/get-user", authMiddleware, controller.getUser);
router.delete("/logout", controller.logout);

export default router;