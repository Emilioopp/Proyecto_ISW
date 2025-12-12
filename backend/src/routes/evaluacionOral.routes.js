import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
  obtenerEvaluacionesPorAsignatura,
  eliminarNota,
  actualizarNota,
} from "../controllers/evaluacionOral.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:asignaturaId", authMiddleware, crearEvaluacionOral); // http://localhost:3000/api/evaluaciones-orales/:asignaturaId
router.post("/:id/registro", authMiddleware, registrarNota);
router.get("/:id/registros", authMiddleware, obtenerNotasPorEvaluacion);
router.get(
  "/:asignaturaId/evaluaciones",
  authMiddleware,
  obtenerEvaluacionesPorAsignatura
);
router.put("/notas/:id", authMiddleware, actualizarNota);
router.delete("/notas/:id", authMiddleware, eliminarNota);
// api/evaluaciones-orales/notas/:id

export default router;
