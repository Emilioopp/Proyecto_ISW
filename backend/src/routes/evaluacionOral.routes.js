import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
  obtenerEvaluacionesPorAsignatura,
  eliminarNota,
  actualizarNota,
  actualizarEvaluacion,
  eliminarEvaluacion,
} from "../controllers/evaluacionOral.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = express.Router();

router.post(
  "/:asignaturaId",
  authMiddleware,
  authorizeRoles("Profesor", "Admin"),
  crearEvaluacionOral
); // http://localhost:3000/api/evaluaciones-orales/:asignaturaId
router.post(
  "/:id/notas",
  authMiddleware,
  authorizeRoles("Profesor", "Admin"),
  registrarNota
); // http://localhost:3000/api/evaluaciones-orales/:id/notas

router.put("/notas/:id", authMiddleware, actualizarNota);
// http://localhost:3000/api/evaluaciones-orales/notas/:id
router.delete("/notas/:id", authMiddleware, eliminarNota);
// http://localhost:3000/api/evaluaciones-orales/notas/:id
router.get("/:id/notas", authMiddleware, obtenerNotasPorEvaluacion);
// http://localhost:3000/api/evaluaciones-orales/:id/notas
router.get(
  "/:id/evaluaciones",
  authMiddleware,
  obtenerEvaluacionesPorAsignatura
); // http://localhost:3000/api/evaluaciones-orales/:id/evaluaciones

router.put(
  "/evaluacion/:id",
  authMiddleware,
  authorizeRoles("Profesor", "Admin"),
  actualizarEvaluacion
); // http://localhost:3000/api/evaluaciones-orales/evaluacion/:id

router.delete(
  "/evaluacion/:id",
  authMiddleware,
  authorizeRoles("Profesor", "Admin"),
  eliminarEvaluacion
); // http://localhost:3000/api/evaluaciones-orales/evaluacion/:id

export default router;
