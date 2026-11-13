import { Router } from "express";
import { chatQuery } from "../controllers/chatController.js";

const router = Router();

router.post("/chat", chatQuery);

export default router;

