import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import {
    getIntentoById,
    postSubmitIntento,
} from "../controllers/intentoEvaluacion.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:id", authorizeRoles("Estudiante", "Profesor", "Admin"), getIntentoById);
router.post("/:id/submit", authorizeRoles("Estudiante", "Admin"), postSubmitIntento);

export default router;