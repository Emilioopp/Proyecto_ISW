import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import {
    getIntentosPorEvaluacion,
    postIniciarIntento,
    getIntentoActivo,
} from "../controllers/intentoEvaluacion.controller.js";
import {
    getEvaluacionesPracticas,
    getEvaluacionesPracticasPublicas,
    getEvaluacionPracticaById,
    getEvaluacionPracticaPublicaById,
    postEvaluacionPractica,
    putEvaluacionPractica,
    deleteEvaluacionPractica,
    postPreguntaEvaluacionPractica,
    putPreguntaEvaluacionPractica,
    deletePreguntaEvaluacionPractica,
    postMaterialEvaluacionPractica,
    getMaterialEvaluacionPractica,
    deleteMaterialEvaluacionPractica,
} from "../controllers/evaluacionPractica.controller.js";
import { uploadEvaluacionPracticaMaterial } from "../middleware/uploadEvaluacionPracticaMaterial.middleware.js";

const router = express.Router();

router.post("/:id/intentos", authMiddleware, authorizeRoles("Estudiante", "Admin"), postIniciarIntento);

router.get(
  "/:id/intentos/activo",
  authMiddleware,
  authorizeRoles("Estudiante", "Admin"),
  getIntentoActivo
);

router.get("/publicas", authMiddleware, authorizeRoles("Estudiante", "Admin"), getEvaluacionesPracticasPublicas);

// Info pública por id para estudiantes
router.get("/:id/publica", authMiddleware, authorizeRoles("Estudiante", "Admin"), getEvaluacionPracticaPublicaById);

// Material PDF (Estudiante/Profesor/Admin según permisos)
router.get("/:id/material",authMiddleware,authorizeRoles("Estudiante", "Profesor", "Admin"),getMaterialEvaluacionPractica);

// Historial de intentos por evaluación (Estudiante ve solo los propios; Profesor solo sus evaluaciones; Admin todo)
router.get(
  "/:id/intentos",
  authMiddleware,
  authorizeRoles("Estudiante", "Profesor", "Admin"),
  getIntentosPorEvaluacion
);

router.use(authMiddleware, authorizeRoles("Profesor", "Admin"));

router.route("/")
    .get(getEvaluacionesPracticas)  //http://localhost:3000/api/evaluaciones-practicas?asignaturaId=1
    .post(postEvaluacionPractica);  //http://localhost:3000/api/evaluaciones-practicas

router.route("/:id")
    .get(getEvaluacionPracticaById) //http://localhost:3000/api/evaluaciones-practicas/:id
    .put(putEvaluacionPractica)     //http://localhost:3000/api/evaluaciones-practicas/:id
    .delete(deleteEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/:id

router.post("/:id/material",uploadEvaluacionPracticaMaterial.single("material"),postMaterialEvaluacionPractica);

router.delete("/:id/material", deleteMaterialEvaluacionPractica);

router.route("/:id/preguntas")
  .post(postPreguntaEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/:id/preguntas

router.route("/preguntas/:preguntaId")
  .put(putPreguntaEvaluacionPractica) //http://localhost:3000/api/evaluaciones-practicas/preguntas/:preguntaId
  .delete(deletePreguntaEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/preguntas/:preguntaId

export default router;