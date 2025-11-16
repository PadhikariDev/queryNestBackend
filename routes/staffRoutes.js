import express from "express";
import { staffController } from "../controllers/staffController.js";

const router = express.Router();

router.post("/login", staffController);

export default router;
