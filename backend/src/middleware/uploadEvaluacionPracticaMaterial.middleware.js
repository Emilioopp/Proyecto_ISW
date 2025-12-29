import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(
  __dirname,
  "../../uploads/evaluaciones-practicas"
);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const evaluacionId = Number(req.params.id);
    const dir = path.join(uploadsRoot, String(evaluacionId));
    try {
      ensureDir(dir);
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    const safeExt = ext === ".pdf" ? ext : ".pdf";
    const random = crypto.randomBytes(8).toString("hex");
    cb(null, `material-${Date.now()}-${random}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfName = (file.originalname || "").toLowerCase().endsWith(".pdf");
  if (!isPdfMime && !isPdfName) {
    return cb(new Error("Solo se permite subir archivos PDF"));
  }
  return cb(null, true);
}

export const uploadEvaluacionPracticaMaterial = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});