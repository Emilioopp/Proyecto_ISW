import { validateCreateTemaOral, validateUpdateTemaOral } from "../validations/temaOral.validation.js";
import { AppDataSource } from "../config/configDb.js";
import { Tema_oral } from "../entities/temaOral.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import * as temaService from "../services/temaOral.service.js";

function formatJoiDetails(details) {
  return details.map(d => ({ param: d.path.join('.'), message: d.message }));
}

export async function crearTema(req, res) {
  const { error, value } = validateCreateTemaOral(req.body);
  if (error) {
    const detalles = formatJoiDetails(error.details);
    return res.status(400).json({ message: "Parametro invalido y especificar el parametro", details: detalles });
  }

  try {
    // usar profesor de req.user si existe
    const profesor = req.user ?? { id: value.profesorId };
    const tema = await temaService.crearTema(value, profesor);
    return res.status(201).json({ message: "Tema creado exitosamente", tema });
  } catch (err) {
    if (err.status === 409) return res.status(409).json({ message: "Tema ya existente" });
    if (err.status === 404 && err.message.startsWith("Parametro invalido")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(err.status || 500).json({ message: err.message || "Error interno" });
  }
}

export async function obtenerTemas(req, res) {
  try {
    const temas = await temaService.obtenerTemas();
    if (!temas || temas.length === 0) return res.status(404).json({ message: "No existen temas" });
    return res.status(200).json(temas);
  } catch (err) {
    return res.status(500).json({ message: "Error interno" });
  }
}

export async function obtenerTemaPorId(req, res) {
  const temaId = parseInt(req.params.id);
  try {
    const tema = await temaService.obtenerTemaPorId(temaId);
    return res.status(200).json(tema);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: "El tema no existe" });
    return res.status(err.status || 500).json({ message: err.message || "Error interno" });
  }
}

export async function eliminarTema(req, res) {
  const temaId = parseInt(req.params.id);
  try {
    await temaService.eliminarTema(temaId);
    return res.status(200).json({ message: "Tema eliminado exitosamente" });
  } catch (err) {
    if (err.status === 404) {
      // servicio usa mensajes distintos: "El tema no existe" o "El tema ya fue eliminado o no existe"
      return res.status(404).json({ message: err.message });
    }
    return res.status(err.status || 500).json({ message: err.message || "Error interno" });
  }
}

export async function actualizarTema(req, res) {
  const temaId = parseInt(req.params.id);
  const { error, value } = validateUpdateTemaOral(req.body);
  if (error) {
    const detalles = formatJoiDetails(error.details);
    return res.status(400).json({ message: "Parametro invalido y especificar el parametro", details: detalles });
  }

  try {
    const tema = await temaService.actualizarTema(temaId, value);
    return res.status(200).json({ message: "Tema actualizado exitosamente", tema });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message === "El tema no existe" ? "El tema no existe" : err.message });
    if (err.status === 400) return res.status(400).json({ message: err.message });
    return res.status(err.status || 500).json({ message: err.message || "Error interno" });
  }
}