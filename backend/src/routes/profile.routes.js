import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getPublicProfile,
  getPrivateProfile,
  updatePrivateProfile,
  deletePrivateProfile,
} from "../controllers/profile.controller.js";

const router = Router();

router.get("/public", getPublicProfile); // http://localhost:3000/api/profile/public

router.get("/private", authMiddleware, getPrivateProfile); // http://localhost:3000/api/profile/private

// Endpoints requeridos
router.patch("/private", authMiddleware, updatePrivateProfile); // http://localhost:3000/api/profile/private
router.delete("/private", authMiddleware, deletePrivateProfile); // http://localhost:3000/api/profile/private
export default router;
