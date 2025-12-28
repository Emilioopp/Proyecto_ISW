import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import {
    getIntentosPorEvaluacion,
    postIniciarIntento,
} from "../controllers/intentoEvaluacion.controller.js";
import {
    getEvaluacionesPracticas,
    getEvaluacionesPracticasPublicas,
    getEvaluacionPracticaById,
    postEvaluacionPractica,
    putEvaluacionPractica,
    deleteEvaluacionPractica,
    postPreguntaEvaluacionPractica,
    putPreguntaEvaluacionPractica,
    deletePreguntaEvaluacionPractica,
} from "../controllers/evaluacionPractica.controller.js";

const router = express.Router();

router.post("/:id/intentos", authMiddleware, authorizeRoles("Estudiante", "Admin"), postIniciarIntento);

router.get("/publicas", authMiddleware, authorizeRoles("Estudiante", "Admin"), getEvaluacionesPracticasPublicas);

router.use(authMiddleware, authorizeRoles("Profesor", "Admin"));

router.route("/")
    .get(getEvaluacionesPracticas)  //http://localhost:3000/api/evaluaciones-practicas?asignaturaId=1
    .post(postEvaluacionPractica);  //http://localhost:3000/api/evaluaciones-practicas

router.route("/:id")
    .get(getEvaluacionPracticaById) //http://localhost:3000/api/evaluaciones-practicas/:id
    .put(putEvaluacionPractica)     //http://localhost:3000/api/evaluaciones-practicas/:id
    .delete(deleteEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/:id

router.get("/:id/intentos", getIntentosPorEvaluacion); //http://localhost:3000/api/evaluaciones-practicas/:id/intentos

router.route("/:id/preguntas")
  .post(postPreguntaEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/:id/preguntas

router.route("/preguntas/:preguntaId")
  .put(putPreguntaEvaluacionPractica) //http://localhost:3000/api/evaluaciones-practicas/preguntas/:preguntaId
  .delete(deletePreguntaEvaluacionPractica); //http://localhost:3000/api/evaluaciones-practicas/preguntas/:preguntaId

export default router;