import {
  validateCreateTemaEvaluacion,
  validateUpdateTemaEvaluacion,
} from "../validations/temaEvaluacion.validation.js";
import * as temaService from "../services/temaEvaluacion.service.js";

function formatJoiDetails(details) {
  return details.map((d) => ({ param: d.path.join("."), message: d.message }));
}

export async function crearTema(req, res) {
  const { error, value } = validateCreateTemaEvaluacion(req.body);
  if (error) {
    const detalles = formatJoiDetails(error.details);
    return res
      .status(400)
      .json({ message: "Error de validación", details: detalles });
  }

  try {
    const profesorId = req.user.sub || req.user.id;
    const tema = await temaService.crearTema(value, { id: profesorId });
    return res.status(201).json({
      status: "Success",
      message: "Tema creado exitosamente",
      data: tema,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error interno al crear tema" });
  }
}

export async function obtenerTemas(req, res) {
  try {
    const temas = await temaService.obtenerTemas();
    return res.status(200).json({ status: "Success", data: temas });
  } catch (err) {
    return res.status(500).json({ message: "Error interno" });
  }
}

export async function obtenerTemasPorAsignatura(req, res) {
  const { asignaturaId } = req.params;
  try {
    const temas = await temaService.obtenerTemasPorAsignatura(asignaturaId);
    return res.status(200).json({ status: "Success", data: temas || [] });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error al obtener temas de la asignatura" });
  }
}

export async function obtenerTemaPorId(req, res) {
  const temaId = parseInt(req.params.id);
  try {
    const tema = await temaService.obtenerTemaPorId(temaId);
    if (!tema) return res.status(404).json({ message: "El tema no existe" });
    return res.status(200).json({ status: "Success", data: tema });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Error interno" });
  }
}

export async function eliminarTema(req, res) {
  const temaId = parseInt(req.params.id);
  try {
    await temaService.eliminarTema(temaId);
    return res
      .status(200)
      .json({ status: "Success", message: "Tema eliminado exitosamente" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error al eliminar" });
  }
}

export async function actualizarTema(req, res) {
  const temaId = parseInt(req.params.id);
  const { error, value } = validateUpdateTemaEvaluacion(req.body);

  if (error) {
    return res.status(400).json({
      message: "Error validación",
      details: formatJoiDetails(error.details),
    });
  }

  try {
    const tema = await temaService.actualizarTema(temaId, value);
    return res
      .status(200)
      .json({ status: "Success", message: "Tema actualizado", data: tema });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Error interno" });
  }
}
