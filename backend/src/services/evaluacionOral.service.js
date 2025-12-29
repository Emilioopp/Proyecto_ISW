import { AppDataSource } from "../config/configDb.js";
import { EvaluacionOral } from "../entities/EvaluacionOral.entity.js";
import { NotaEvaluacion } from "../entities/NotaEvaluacion.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";

const evaluacionRepo = AppDataSource.getRepository(EvaluacionOral);
const notaRepo = AppDataSource.getRepository(NotaEvaluacion);
const estudianteAsignaturaRepo =
  AppDataSource.getRepository(EstudianteAsignatura);
const userRepo = AppDataSource.getRepository(User);

const asignaturaRepo = AppDataSource.getRepository(Asignatura);

export const crearEvaluacionOral = async (data) => {
  const { asignaturaId, profesor_id, titulo, descripcion, sala, duracion_minutos, material_estudio, tipo } = data;

  const asignatura = await asignaturaRepo.findOne({
    where: { id: asignaturaId },
  });

  if (!asignatura) {
    throw new Error(`No se encontró una asignatura con id ${asignaturaId}`);
  }

  const nuevaEvaluacion = evaluacionRepo.create({
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    tipo,
    asignatura: asignatura,
    profesor: { id: profesor_id },
  });

  return await evaluacionRepo.save(nuevaEvaluacion);
};

export const eliminarEvaluacion = async (id) => {
  try {
    // 1. Buscar usando el repositorio (NO usar EvaluacionOral.findOne)
    const evaluacion = await evaluacionRepo.findOne({
      where: { id: Number(id) }
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    // 2. Limpiar Notas Asociadas (Evita el error de Foreign Key)
    // "evaluacion" debe coincidir con el nombre de la relación en tu entidad NotaEvaluacion
    // Si tu entidad nota tiene @ManyToOne(() => ..., (eval) => eval.notas), busca ese nombre.
    // Intentaremos borrar por ID directo que es más seguro:
    
    try {
        // Intenta borrar las notas que apunten a esta evaluación
        // Ajusta "evaluacion" por el nombre exacto de la relación en NotaEvaluacion.entity.js
        await notaRepo.delete({ evaluacion: { id: Number(id) } });
    } catch (errNotes) {
        console.log("No se pudieron borrar notas o no existían: ", errNotes.message);
        // Continuamos, tal vez no tenía notas
    }

    // 3. Eliminar la evaluación usando el repositorio
    await evaluacionRepo.remove(evaluacion);

    return [evaluacion, null];

  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN BACKEND:", error);
    // IMPORTANTE: Devolvemos el error real para verlo en el frontend
    return [null, error.message]; 
  }
};

export const actualizarEvaluacion = async (id, data) => {
  try {
    const evaluacion = await EvaluacionOral.findOne({ where: { id } });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    await EvaluacionOral.update(id, data);
    const evaluacionActualizada = await EvaluacionOral.findOne({
      where: { id },
      relations: ["asignatura", "profesor"],
    });

    return [evaluacionActualizada, null];
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    return [null, "Error interno del servidor"];
  }
};

export const obtenerEvaluacionesPorAsignatura = async (asignaturaId) => {
  try {
    if (!asignaturaId || isNaN(Number(asignaturaId))) {
      return [];
    }
    const evaluaciones = await evaluacionRepo.find({
      where: { asignatura: { id: Number(asignaturaId) } },
      relations: ["asignatura"],
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

  const alumno = await userRepo.findOne({ where: { id: estudiante_id } });
  console.log(
    `Notificación enviada a ${alumno.email}: nota ${nota} registrada.`
  );

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
