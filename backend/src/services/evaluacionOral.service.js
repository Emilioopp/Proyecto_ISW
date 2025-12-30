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
    // Nuevos campos recibidos del controlador
    sala,
    duracion_minutos,
    material_estudio,
    fecha_hora, // Fecha y hora integradas
    temas, // Array de IDs de temas [1, 2, 5]
  } = data;

  // 1. Validar que la asignatura exista
  const asignatura = await asignaturaRepo.findOne({
    where: { id: asignaturaId },
  });

  if (!asignatura) {
    throw new Error(`No se encontró una asignatura con id ${asignaturaId}`);
  }

  // 2. Preparar la relación de Temas (Many-to-Many)
  // TypeORM espera un array de objetos con la propiedad ID: [{ id: 1 }, { id: 2 }]
  // Si 'temas' es undefined o vacío, pasamos un array vacío.
  const listaTemas =
    temas && Array.isArray(temas)
      ? temas.map((idTema) => ({ id: idTema }))
      : [];

  // 3. Crear la instancia con todos los datos
  const nuevaEvaluacion = evaluacionRepo.create({
    titulo,
    descripcion,
    sala, // Nuevo
    duracion_minutos, // Nuevo
    material_estudio, // Nuevo
    fecha: fecha_hora, // Nuevo (reemplaza a Horario externo)
    asignatura: asignatura,
    profesor: { id: profesor_id },
    temas: listaTemas, // Relación Many-to-Many
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
    temas, // Array de IDs [1, 3]
  } = data;

  // 1. Buscar la evaluación existente
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
    relations: ["temas"], // Traemos los temas actuales
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  // 2. Actualizar campos simples
  if (titulo) evaluacion.titulo = titulo;
  if (descripcion) evaluacion.descripcion = descripcion;
  if (sala) evaluacion.sala = sala;
  if (duracion_minutos) evaluacion.duracion_minutos = duracion_minutos;
  if (material_estudio) evaluacion.material_estudio = material_estudio;
  if (fecha_hora) evaluacion.fecha = fecha_hora; // Ojo con el nombre de columna en tu entidad ('fecha' vs 'fecha_hora')

  // 3. Actualizar relación Temas
  if (temas && Array.isArray(temas)) {
    // Convertimos array de IDs a array de objetos [{ id: 1 }, { id: 3 }]
    evaluacion.temas = temas.map((id) => ({ id }));
  }

  // 4. Guardar cambios
  return await evaluacionRepo.save(evaluacion);
};

export const eliminarEvaluacionOral = async (evaluacionId) => {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  // Al eliminar, el 'CASCADE' en la BD debería borrar las notas y relaciones de temas
  return await evaluacionRepo.remove(evaluacion);
};

// --- OBTENER EVALUACIONES POR ASIGNATURA ---
export const obtenerEvaluacionesPorAsignatura = async (asignaturaId) => {
  try {
    if (!asignaturaId || isNaN(Number(asignaturaId))) {
      return [];
    }
    const evaluaciones = await evaluacionRepo.find({
      where: { asignatura: { id: Number(asignaturaId) } },
      // Agregamos 'temas' a las relaciones para que el frontend pueda mostrarlos
      relations: ["asignatura", "temas"],
      order: { fecha: "ASC" }, // Ordenar por fecha de la evaluación tiene sentido
    });
    return evaluaciones;
  } catch (error) {
    throw new Error("Error al obtener evaluaciones: " + error.message);
  }
};

// --- REGISTRAR NOTA (Sin cambios mayores, solo validaciones) ---
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

// --- OBTENER NOTAS POR EVALUACIÓN ---
export const obtenerNotasPorEvaluacion = async (evaluacion_oral_id) => {
  return await notaRepo.find({
    where: { evaluacion_oral: { id: evaluacion_oral_id } },
    relations: ["estudiante"],
  });
};

// --- ACTUALIZAR NOTA ---
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

// --- ELIMINAR NOTA ---
export const eliminarNota = async (notaId) => {
  const notaExistente = await notaRepo.findOne({
    where: { id: notaId },
  });

  if (!notaExistente) {
    throw new Error("La nota no existe");
  }

  return await notaRepo.remove(notaExistente);
};
