import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { inscribirEstudiante, getEstudiantesByAsignatura } from "../controllers/estudiante.controller.js";

const router = Router();

router.use(authMiddleware);

/*   Solo Profesores   */

router.post("/inscribir", authorizeRoles("Profesor"), inscribirEstudiante);     
// http:localhost:3000/api/estudiantes/inscribir

router.get("/asignatura/:id", authorizeRoles("Profesor"), getEstudiantesByAsignatura); 
// http:localhost:3000/api/estudiantes/asignatura/:id

export default router;