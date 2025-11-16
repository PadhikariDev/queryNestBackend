import express from "express";
import auth from "../middleware/auth.js";
import { registerUsers, getAllUsers, loginUser, userProfile } from "../controllers/userController.js";


import { createQuery, myQueries } from "../controllers/queryController.js";

const router = express.Router();

router.post("/register", registerUsers);
router.get("/allUsers", getAllUsers);
router.post("/login", loginUser);
router.get("/me", auth, userProfile);
router.post("/add-query", auth, createQuery);
router.get("/my-queries", auth, myQueries);

export default router;