import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getMiPerfil, cambiarMiPassword } from "../controllers/profile.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMiPerfil);             // http://localhost:3000/api/profile/me  
router.put("/password", cambiarMiPassword); // http://localhost:3000/api/profile/password

export default router;