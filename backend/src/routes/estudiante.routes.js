import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import {
  inscribirEstudiante,
  getEstudiantesByAsignatura,
  getEstudiantePerfil,
  editarEstudiante,
  desasignarEstudianteAsignatura,
  deleteEstudiante,
  buscarEstudiantePorEmail,
  verNotasAsignatura,
  verHistorial,
  verEstadisticas,
} from "../controllers/estudiante.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/mis-notas/historial", authMiddleware, verHistorial);
// http:localhost:3000/api/estudiantes/mis-notas/historial

router.get("/mis-notas/:asignaturaId", authMiddleware, verNotasAsignatura);
// http:localhost:3000/api/estudiantes/mis-notas/:asignaturaId

router.get("/mis-estadisticas", authMiddleware, verEstadisticas);
// http:localhost:3000/api/estudiantes/mis-estadisticas

router.post(
  "/inscribir",
  authorizeRoles("Profesor", "Admin"),
  inscribirEstudiante
);
// http:localhost:3000/api/estudiantes/inscribir

router.get(
  "/buscar-por-email/:email",
  authorizeRoles("Profesor", "Admin"),
  buscarEstudiantePorEmail
);
// http:localhost:3000/api/estudiantes/buscar-por-email/:email

router.get(
  "/asignatura/:id",
  authorizeRoles("Profesor", "Admin"),
  getEstudiantesByAsignatura
);
// http:localhost:3000/api/estudiantes/asignatura/:id

router.get(
  "/:id",
  authorizeRoles("Profesor", "Estudiante", "Admin"),
  getEstudiantePerfil
);
// http:localhost:3000/api/estudiantes/:id

router.put("/:id", authorizeRoles("Admin"), editarEstudiante);
// http:localhost:3000/api/estudiantes/:id

router.delete(
  "/desasignar",
  authorizeRoles("Profesor", "Admin"),
  desasignarEstudianteAsignatura
);
// http:localhost:3000/api/estudiantes/desasignar

router.delete("/:id", authorizeRoles("Admin"), deleteEstudiante);
// http:localhost:3000/api/estudiantes/:id

export default router;
