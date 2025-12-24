
import { AppDataSource } from "../config/configDb.js";
import { Tema_oral } from "../entities/temaOral.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { In } from "typeorm";

const temaRepo = () => AppDataSource.getRepository(Tema_oral);
const asignaturaRepo = () => AppDataSource.getRepository(Asignatura);

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function crearTema(data, profesor) {
  // Verificar existencia por título y profesor (unicidad por profesor)
  const existe = await temaRepo().findOne({
    where: { titulo: data.titulo, profesor: { id: profesor.id } },
    relations: ["profesor"]
  });
  if (existe) throw createError("Tema ya existente", 409);

  const asignaturas = await asignaturaRepo().findBy({ id: In(data.asignaturaIds) });
  if (asignaturas.length !== data.asignaturaIds.length) {
    throw createError("Parametro invalido y especificar el parametro: asignaturaIds", 404);
  }

  const tema = temaRepo().create({
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    materialUrl: data.materialUrl ?? null,
    profesor: profesor,
    asignatura: asignaturas
  });

  return await temaRepo().save(tema);
}

export async function obtenerTemas() {
  const temas = await temaRepo().find({ relations: ["profesor", "asignatura"] });
  return temas;
}

export async function obtenerTemaPorId(id) {
  const tema = await temaRepo().findOne({
    where: { id },
    relations: ["profesor", "asignatura"]
  });
  if (!tema) throw createError("El tema no existe", 404);
  return tema;
}

export async function eliminarTema(id) {
  const tema = await temaRepo().findOneBy({ id });
  if (!tema) throw createError("El tema no existe", 404);

  // eliminar y confirmar
  const res = await temaRepo().delete(id);
  if (res.affected === 0) throw createError("El tema ya fue eliminado o no existe", 404);

  return;
}

export async function actualizarTema(id, data) {
  const tema = await temaRepo().findOne({ where: { id }, relations: ["asignatura"] });
  if (!tema) throw createError("El tema no existe", 404);

  if (data.titulo !== undefined) tema.titulo = data.titulo;
  if (data.descripcion !== undefined) tema.descripcion = data.descripcion;
  if (data.materialUrl !== undefined) tema.materialUrl = data.materialUrl;

  if (data.asignaturaIds) {
    const asignaturas = await asignaturaRepo().findBy({ id: In(data.asignaturaIds) });
    if (asignaturas.length !== data.asignaturaIds.length) {
      throw createError("Parametro invalido y especificar el parametro: asignaturaIds", 404);
    }
    tema.asignatura = asignaturas;
  }

  return await temaRepo().save(tema);
}