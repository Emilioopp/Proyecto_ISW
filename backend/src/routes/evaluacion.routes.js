import { Router } from "express";
import {
  crearEvaluacionController,
  obtenerEvaluacionesController,
  obtenerEvaluacionPorIdController,
  obtenerEvaluacionesPorAsignaturaController,
  actualizarEvaluacionController,
  eliminarEvaluacionController,
  inscribirseEvaluacionController,
  obtenerInscripcionesPorEstudianteController,
  desinscribirseEvaluacionController,
} from "../controllers/evaluacion.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router();

router.use(authMiddleware);

// Crear evaluación para una asignatura (solo profesores)
router.post("/:asignaturaId", authorizeRoles("Profesor"), crearEvaluacionController);

// Obtener todas las evaluaciones
router.get("/", obtenerEvaluacionesController);

// Obtener inscripciones del estudiante por asignatura
router.get("/mis-inscripciones/:asignaturaId", authorizeRoles("Estudiante"), obtenerInscripcionesPorEstudianteController);

// Obtener evaluaciones de una asignatura
router.get("/asignatura/:asignaturaId", obtenerEvaluacionesPorAsignaturaController);

// Inscribirse a evaluación (solo estudiantes)
router.post("/:id/inscribir", authorizeRoles("Estudiante"), inscribirseEvaluacionController);

// Desinscribirse de evaluación (solo estudiantes)
router.delete("/:id/desinscribir", authorizeRoles("Estudiante"), desinscribirseEvaluacionController);

// Obtener evaluación por ID
router.get("/:id", obtenerEvaluacionPorIdController);

// Actualizar evaluación (solo profesores)
router.put("/:id", authorizeRoles("Profesor"), actualizarEvaluacionController);

// Eliminar evaluación (solo profesores)
router.delete("/:id", authorizeRoles("Profesor"), eliminarEvaluacionController);

export default router;
