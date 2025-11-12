import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
} from "../controllers/evaluacionOral.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, crearEvaluacionOral);
router.post("/:id/registro", authMiddleware, registrarNota);
router.get("/:id/registros", authMiddleware, obtenerNotasPorEvaluacion);

export default router;
