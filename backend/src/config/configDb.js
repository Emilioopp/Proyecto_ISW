"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { EvaluacionPractica } from "../entities/EvaluacionPractica.entity.js";
import { Pregunta } from "../entities/pregunta.entity.js";
import { IntentoEvaluacion } from "../entities/IntentoEvaluacion.entity.js";
import { RespuestaEstudiante } from "../entities/RespuestaEstudiante.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: PASSWORD,
  database: DATABASE,
  entities: [
    User,
    Asignatura,
    ProfesorAsignatura,
    EstudianteAsignatura,
    EvaluacionPractica,
    Pregunta,
    IntentoEvaluacion,
    RespuestaEstudiante
  ],
  synchronize: true,
  logging: ["schema", "error"],
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa");
    console.log(
      "Entidades:",
      AppDataSource.entityMetadatas.map(e => e.tableName)
    );
  } catch (e) {
    console.error("Error DB:", e);
    process.exit(1);
  }
}