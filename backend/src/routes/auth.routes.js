import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login); // http://localhost:3000/api/auth/login
router.post("/register", register); // http://localhost:3000/api/auth/register

export default router;