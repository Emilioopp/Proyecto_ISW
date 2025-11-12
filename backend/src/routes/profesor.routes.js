import { Router } from "express";
import {
  crearProfesor,
  asignarProfesorAsignatura,
  desasignarProfesorAsignatura,
  getProfesores,
  getProfesorById,
  updateProfesor,
  deleteProfesor,
} from "../controllers/profesor.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router();

router.use(authMiddleware);

// Solo Admin
router.post("/", authorizeRoles("Admin"), crearProfesor); // http://localhost:3000/api/profesores
router.post("/asignar", authorizeRoles("Admin"), asignarProfesorAsignatura); // http://localhost:3000/api/profesores/asignar
router.delete(
  "/desasignar",
  authorizeRoles("Admin"),
  desasignarProfesorAsignatura
); // http://localhost:3000/api/profesores/desasignar
router.get("/", authorizeRoles("Admin"), getProfesores); // http://localhost:3000/api/profesores
router.get("/:id", authorizeRoles("Admin"), getProfesorById); // http://localhost:3000/api/profesores/:id
router.put("/:id", authorizeRoles("Admin"), updateProfesor); // http://localhost:3000/api/profesores/:id
router.delete("/:id", authorizeRoles("Admin"), deleteProfesor); // http://localhost:3000/api/profesores/id

export default router;
