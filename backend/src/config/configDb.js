"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: PASSWORD,
  database: DATABASE,
  entities: ["src/entities/**/*.js"],
  synchronize: true,
  logging: ["schema", "error"],
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos PostgreSQL!");
    console.log(
      "Entidades cargadas:",
      AppDataSource.entityMetadatas.map(e => e.tableName)
    );
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}