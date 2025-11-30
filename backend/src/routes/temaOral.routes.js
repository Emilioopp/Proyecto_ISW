import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { crearTema, obtenerTemas, obtenerTemaPorId, actualizarTema, eliminarTema } from "../controllers/temaOral.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/", authorizeRoles("Admin", "Profesor"), crearTema); // http://localhost:3000/api/temas
router.get("/", obtenerTemas);
router.get("/:id", obtenerTemaPorId); // http://localhost:3000/api/temas/:id
router.put("/:id", authorizeRoles("Admin", "Profesor"), actualizarTema); // http://localhost:3000/api/temas/:id
router.delete("/:id", authorizeRoles("Admin"), eliminarTema); // http://localhost:3000/api/temas/:id  
export default router;