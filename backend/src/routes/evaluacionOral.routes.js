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
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/:id", authMiddleware, crearEvaluacionOral); // http://localhost:3000/api/evaluaciones-orales/:asignaturaId
router.post("/:id/registro", authMiddleware, registrarNota);
router.get("/:id/registros", authMiddleware, obtenerNotasPorEvaluacion);
router.get(
  "/:id/evaluaciones",
  authMiddleware,
  obtenerEvaluacionesPorAsignatura
);

// Actualizar evaluación (solo profesores)
router.put("/update/:id", authorizeRoles("Profesor"), actualizarEvaluacionController);

// Eliminar evaluación (solo profesores)
router.delete("/delete/:id", authorizeRoles("Profesor"), eliminarEvaluacionController);

router.put("/notas/:id", authMiddleware, actualizarNota);
router.delete("/notas/:id", authMiddleware, eliminarNota);
// api/evaluaciones-orales/notas/:id

export default router;
