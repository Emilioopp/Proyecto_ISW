import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import {
    getIntentoById,
    postSubmitIntento,
    getMisIntentosFinalizados,
} from "../controllers/intentoEvaluacion.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Listar intentos finalizados del estudiante autenticado
router.get("/mis-finalizados",authorizeRoles("Estudiante", "Admin"),getMisIntentosFinalizados);

router.get("/:id", authorizeRoles("Estudiante", "Profesor", "Admin"), getIntentoById);
router.post("/:id/submit", authorizeRoles("Estudiante", "Admin"), postSubmitIntento);

export default router;