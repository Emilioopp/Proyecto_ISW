import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { 
    crearTema, 
    obtenerTemas, 
    obtenerTemaPorId, 
    actualizarTema, 
    eliminarTema,
    obtenerTemasPorAsignatura 
} from "../controllers/temaEvaluacion.controller.js";

const router = Router();

router.use(authMiddleware);

// Crear y Listar todo
router.post("/", authorizeRoles("Admin", "Profesor"), crearTema);
router.get("/", obtenerTemas);

// Ruta por Asignatura (Para el Frontend)
router.get("/asignatura/:asignaturaId", obtenerTemasPorAsignatura);

// Operaciones por ID de Tema
router.get("/:id", obtenerTemaPorId);
router.put("/:id", authorizeRoles("Admin", "Profesor"), actualizarTema);
router.delete("/:id", authorizeRoles("Admin", "Profesor"), eliminarTema);

export default router;