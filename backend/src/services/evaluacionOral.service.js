import { AppDataSource } from "../config/configDb.js";
import { EvaluacionOral } from "../entities/EvaluacionOral.entity.js";
import { NotaEvaluacionOral } from "../entities/NotaEvaluacionOral.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";

const evaluacionRepo = AppDataSource.getRepository(EvaluacionOral);
const notaRepo = AppDataSource.getRepository(NotaEvaluacionOral);
const estudianteAsignaturaRepo =
  AppDataSource.getRepository(EstudianteAsignatura);
const userRepo = AppDataSource.getRepository(User);
const asignaturaRepo = AppDataSource.getRepository(Asignatura);

// --- CREAR EVALUACIÓN ORAL (Actualizado) ---
export const crearEvaluacionOral = async (data) => {
  const {
    asignaturaId,
    profesor_id,
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    fecha_hora,
    temas,
  } = data;

  const asignatura = await asignaturaRepo.findOne({
    where: { id: asignaturaId },
  });

  if (!asignatura) {
    throw new Error(`No se encontró una asignatura con id ${asignaturaId}`);
  }

  const listaTemas =
    temas && Array.isArray(temas)
      ? temas.map((idTema) => ({ id: idTema }))
      : [];

  const nuevaEvaluacion = evaluacionRepo.create({
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    fecha: fecha_hora,
    asignatura: asignatura,
    profesor: { id: profesor_id },
    temas: listaTemas,
  });

  return await evaluacionRepo.save(nuevaEvaluacion);
};

export const actualizarEvaluacionOral = async (evaluacionId, data) => {
  const {
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    fecha_hora,
    temas,
  } = data;

  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
    relations: ["temas"],
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  if (titulo) evaluacion.titulo = titulo;
  if (descripcion) evaluacion.descripcion = descripcion;
  if (sala) evaluacion.sala = sala;
  if (duracion_minutos) evaluacion.duracion_minutos = duracion_minutos;
  if (material_estudio) evaluacion.material_estudio = material_estudio;
  if (fecha_hora) evaluacion.fecha = fecha_hora;

  if (temas && Array.isArray(temas)) {
    evaluacion.temas = temas.map((id) => ({ id }));
  }

  return await evaluacionRepo.save(evaluacion);
};

export const eliminarEvaluacionOral = async (evaluacionId) => {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  return await evaluacionRepo.remove(evaluacion);
};

export const obtenerEvaluacionesPorAsignatura = async (asignaturaId) => {
  try {
    if (!asignaturaId || isNaN(Number(asignaturaId))) {
      return [];
    }
    const evaluaciones = await evaluacionRepo.find({
      where: { asignatura: { id: Number(asignaturaId) } },
      relations: ["asignatura", "temas"],
      order: { fecha: "ASC" },
    });
    return evaluaciones;
  } catch (error) {
    throw new Error("Error al obtener evaluaciones: " + error.message);
  }
};

export const registrarNota = async ({
  evaluacion_oral_id,
  estudiante_id,
  nota,
  observacion,
}) => {
  if (typeof nota !== "number" || nota < 1.0 || nota > 7.0) {
    throw new Error("La nota debe ser un número entre 1.0 y 7.0");
  }

  const evaluacionObj = await evaluacionRepo.findOne({
    where: { id: evaluacion_oral_id },
    relations: ["asignatura"],
  });
  if (!evaluacionObj) throw new Error("La evaluación oral no existe");

  const inscrito = await estudianteAsignaturaRepo.findOne({
    where: {
      estudiante: { id: estudiante_id },
      asignatura: { id: evaluacionObj.asignatura.id },
    },
  });

  if (!inscrito)
    throw new Error(
      "El estudiante no está inscrito en la asignatura de esta evaluación"
    );

  const existente = await notaRepo.findOne({
    where: {
      evaluacion_oral: { id: evaluacion_oral_id },
      estudiante: { id: estudiante_id },
    },
  });
  if (existente)
    throw new Error(
      "Ya existe una nota registrada para este estudiante en esta evaluación"
    );

  const nuevaNota = notaRepo.create({
    nota,
    observacion,
    evaluacion_oral: evaluacionObj,
    estudiante: { id: estudiante_id },
  });

  const guardada = await notaRepo.save(nuevaNota);
  return guardada;
};

export const obtenerNotasPorEvaluacion = async (evaluacion_oral_id) => {
  return await notaRepo.find({
    where: { evaluacion_oral: { id: evaluacion_oral_id } },
    relations: ["estudiante"],
  });
};

export const actualizarNota = async (notaId, { nota, observacion }) => {
  const notaExistente = await notaRepo.findOne({
    where: { id: notaId },
  });

  if (!notaExistente) {
    throw new Error("La nota no existe");
  }

  if (nota !== undefined) {
    if (typeof nota !== "number" || nota < 1.0 || nota > 7.0) {
      throw new Error("La nota debe ser un número entre 1.0 y 7.0");
    }
    notaExistente.nota = nota;
  }

  if (observacion !== undefined) {
    notaExistente.observacion = observacion;
  }

  return await notaRepo.save(notaExistente);
};

export const eliminarNota = async (notaId) => {
  const notaExistente = await notaRepo.findOne({
    where: { id: notaId },
  });

  if (!notaExistente) {
    throw new Error("La nota no existe");
  }

  return await notaRepo.remove(notaExistente);
};
