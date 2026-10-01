import { Router } from "express";
import authMiddleware from "@/middlewares/auth";

const router = Router();
import userRoutes from "./user";
import authRoutes from "./auth";

// Public
router.get("/health", (req, res) => {
    res.status(200).send("Server is working!!");
});

// Hibrid
router.use("/user", userRoutes);
router.use("/auth", authRoutes);

// Private

export default router;