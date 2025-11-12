import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { crearTema, getTemas, getTemaById, updateTema, deleteTema } from "../controllers/tema.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/", authorizeRoles("Admin", "Profesor"), crearTema); // http://localhost:3000/api/temas
router.get("/", getTemas);
router.get("/:id", getTemaById); // http://localhost:3000/api/temas/:id
router.put("/:id", authorizeRoles("Admin", "Profesor"), updateTema); // http://localhost:3000/api/temas/:id
router.delete("/:id", authorizeRoles("Admin"), deleteTema); // http://localhost:3000/api/temas/:id  
export default router;