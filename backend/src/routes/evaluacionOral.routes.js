import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
  obtenerEvaluacionesPorAsignatura,
  eliminarNota,
  actualizarNota,
  actualizarEvaluacionController,
  eliminarEvaluacionController,
} from "../controllers/evaluacionOral.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = express.Router();

router.post("/:asignaturaId", authMiddleware, crearEvaluacionOral); // http://localhost:3000/api/evaluaciones-orales/:asignaturaId
router.post("/:id/registro", authMiddleware, registrarNota);
router.get("/:id/registros", authMiddleware, obtenerNotasPorEvaluacion);
router.get(
  "/:id/evaluaciones-orales",
  authMiddleware,
  obtenerEvaluacionesPorAsignatura
);

// Actualizar evaluación (solo profesores)
router.put(
  "/:id", 
  authMiddleware,
  authorizeRoles('Profesor', 'Admin'),
  actualizarEvaluacionController
); // PUT http://localhost:3000/api/evaluaciones-orales/:id

// Eliminar evaluación (solo profesores y admins)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('Profesor', 'Admin'),
  eliminarEvaluacionController
); // DELETE http://localhost:3000/api/evaluaciones-orales/:asignaturaId

router.put("/notas/:id", authMiddleware, actualizarNota);
router.delete("/notas/:id", authMiddleware, eliminarNota);
// api/evaluaciones-orales/notas/:id

export default router;
