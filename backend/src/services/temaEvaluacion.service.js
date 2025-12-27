import { AppDataSource } from "../config/configDb.js";
import { TemaEvaluacion } from "../entities/temaEvaluacion.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { In } from "typeorm";

const temaRepo = () => AppDataSource.getRepository(TemaEvaluacion);
const asignaturaRepo = () => AppDataSource.getRepository(Asignatura);

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function crearTema(data, profesor) {
  // Verificar existencia por título y profesor
  const existe = await temaRepo().findOne({
    where: { titulo: data.titulo, profesor: { id: profesor.id } },
    relations: ["profesor"]
  });
  if (existe) throw createError("Tema ya existente", 409);

  const asignaturasEncontradas = await asignaturaRepo().findBy({ id: In(data.asignaturaIds) });
  
  if (asignaturasEncontradas.length !== data.asignaturaIds.length) {
    throw createError("Parámetro inválido: alguna asignatura no existe", 404);
  }

  const tema = temaRepo().create({
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    materialUrl: data.materialUrl ?? null,
    profesor: profesor,
    asignaturas: asignaturasEncontradas
  });

  return await temaRepo().save(tema);
}

export async function obtenerTemas() {
  const temas = await temaRepo().find({ relations: ["profesor", "asignaturas"] });
  return temas;
}

// --- NUEVA FUNCIÓN NECESARIA PARA EL FRONTEND ---
export async function obtenerTemasPorAsignatura(asignaturaId) {
  // Buscamos temas donde la asignatura coincida con el ID
  const temas = await temaRepo().find({
    where: {
      asignaturas: {
        id: parseInt(asignaturaId)
      }
    },
    relations: ["profesor"] // Opcional: si quieres saber qué profe creó el tema
  });
  return temas;
}
// ------------------------------------------------

export async function obtenerTemaPorId(id) {
  const tema = await temaRepo().findOne({
    where: { id },
    relations: ["profesor", "asignaturas"] 
  });
  if (!tema) throw createError("El tema no existe", 404);
  return tema;
}

export async function eliminarTema(id) {
  const tema = await temaRepo().findOneBy({ id });
  if (!tema) throw createError("El tema no existe", 404);

  const res = await temaRepo().delete(id);
  if (res.affected === 0) throw createError("El tema ya fue eliminado o no existe", 404);

  return;
}

export async function actualizarTema(id, data) {
  const tema = await temaRepo().findOne({ where: { id }, relations: ["asignaturas"] });
  if (!tema) throw createError("El tema no existe", 404);

  if (data.titulo !== undefined) tema.titulo = data.titulo;
  if (data.descripcion !== undefined) tema.descripcion = data.descripcion;
  if (data.materialUrl !== undefined) tema.materialUrl = data.materialUrl;

  if (data.asignaturaIds) {
    const asignaturasEncontradas = await asignaturaRepo().findBy({ id: In(data.asignaturaIds) });
    if (asignaturasEncontradas.length !== data.asignaturaIds.length) {
      throw createError("Parámetro inválido: alguna asignatura no existe", 404);
    }
    tema.asignaturas = asignaturasEncontradas; 
  }

  return await temaRepo().save(tema);
}