import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import asignaturaRoutes from "./asignatura.routes.js";
import estudianteRoutes from "./estudiante.routes.js";
import profesorRoutes from "./profesor.routes.js";
import evaluacionOralRoutes from "./evaluacionOral.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/evaluaciones-orales", evaluacionOralRoutes);
  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/asignaturas", asignaturaRoutes);
  router.use("/estudiantes", estudianteRoutes);
  router.use("/profesores", profesorRoutes);
}
