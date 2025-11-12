import express from "express";
import {
  crearEvaluacionOral,
  registrarNota,
  obtenerNotasPorEvaluacion,
} from "../controllers/evaluacionOral.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, crearEvaluacionOral);
router.post("/:id/registro", authenticate, registrarNota);
router.get("/:id/registros", authenticate, obtenerNotasPorEvaluacion);

export default router;
