import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login); // http://localhost:3000/api/auth/login

export default router;