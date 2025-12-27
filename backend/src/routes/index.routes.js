import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import asignaturaRoutes from "./asignatura.routes.js";
import estudianteRoutes from "./estudiante.routes.js";
import profesorRoutes from "./profesor.routes.js";
import evaluacionRoutes from "./evaluacion.routes.js";
import temaEvaluacionRoutes from "./temaEvaluacion.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/asignaturas", asignaturaRoutes);
  router.use("/estudiantes", estudianteRoutes);
  router.use("/profesores", profesorRoutes);
  router.use("/evaluaciones", evaluacionRoutes);
  router.use("/temas-evaluacion", temaEvaluacionRoutes);
}
