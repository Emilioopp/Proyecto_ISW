
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import { initialSetup } from "./config/initialSetup.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build del frontend (Vite). Ruta esperada: <repo>/frontend/dist
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

// Inicializa la conexión a la base de datos
connectDB()
  .then(async () => {
    // Ejecuta la configuración inicial (crear admin si no existe)
    await initialSetup();
    
    // Carga todas las rutas de la aplicación
    routerApi(app);

    // Sirve frontend estático y fallback SPA (excluye /api)
    app.use(express.static(frontendDistPath));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });

    // Levanta el servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });