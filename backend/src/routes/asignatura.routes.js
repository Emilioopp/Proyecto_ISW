import { Router } from "express";
import {
  crearAsignatura,
  getAsignaturas,
  getAsignaturaById,
  updateAsignatura,
  deleteAsignatura,
  getEstudiantesEnAsignatura,
} from "../controllers/asignatura.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAsignaturas); // http://localhost:3000/api/asignaturas
router.get("/:id", getAsignaturaById); // http://localhost:3000/api/asignaturas/:id
router.get("/:id/estudiantes", authMiddleware, getEstudiantesEnAsignatura); // http://localhost:3000/api/asignaturas/:id/estudiantes

// Solo para Admin
router.post("/", authorizeRoles("Admin"), crearAsignatura); // http://localhost:3000/api/asignaturas
router.put("/:id", authorizeRoles("Admin"), updateAsignatura); // http://localhost:3000/api/asignaturas/:id
router.delete("/:id", authorizeRoles("Admin"), deleteAsignatura); // http://localhost:3000/api/asignaturas/:id

export default router;
