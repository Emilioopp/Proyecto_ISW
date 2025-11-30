import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
  obtenerEvaluacionesPorAsignatura,
} from "../controllers/evaluacionOral.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:asignaturaId", authMiddleware, crearEvaluacionOral); // http://localhost:3000/api/evaluaciones-orales/:asignaturaId
router.post("/:id/registro", authMiddleware, registrarNota);
router.get("/:id/registros", authMiddleware, obtenerNotasPorEvaluacion);
router.get(
  "/:id/evaluaciones",
  authMiddleware,
  obtenerEvaluacionesPorAsignatura
);

export default router;
