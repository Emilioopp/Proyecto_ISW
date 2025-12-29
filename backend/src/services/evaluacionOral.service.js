import { AppDataSource } from "../config/configDb.js";
import { EvaluacionOral } from "../entities/EvaluacionOral.entity.js";
import { NotaEvaluacion } from "../entities/NotaEvaluacion.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { HorarioDisponible } from "../entities/horarioDisponible.entity.js";
import { TemaEvaluacion } from "../entities/temaEvaluacion.entity.js";


const horarioRepo = AppDataSource.getRepository(HorarioDisponible);
const temaRepo = AppDataSource.getRepository(TemaEvaluacion);

const evaluacionRepo = AppDataSource.getRepository(EvaluacionOral);
const notaRepo = AppDataSource.getRepository(NotaEvaluacion);
const estudianteAsignaturaRepo =
  AppDataSource.getRepository(EstudianteAsignatura);
const userRepo = AppDataSource.getRepository(User);

const asignaturaRepo = AppDataSource.getRepository(Asignatura);

export const crearEvaluacionOral = async (data) => {
  const {
    asignaturaId,
    profesor_id,
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    temas,
    horarios,
  } = data;

  // Validaciones base
  if (!temas || temas.length === 0) {
    throw new Error("La evaluación debe tener al menos un tema");
  }

  if (!horarios || horarios.length === 0) {
    throw new Error("Debe definir al menos un horario disponible");
  }

  const asignatura = await asignaturaRepo.findOne({
    where: { id: asignaturaId },
  });

  if (!asignatura) {
    throw new Error("Asignatura no encontrada");
  }

  
  const temasEncontrados = await temaRepo.findByIds(temas);

  if (temasEncontrados.length !== temas.length) {
    throw new Error("Uno o más temas no existen");
  }

  const nuevaEvaluacion = evaluacionRepo.create({
    titulo,
    descripcion,
    sala,
    duracion_minutos,
    material_estudio,
    asignatura: { id: asignaturaId },
    profesor: { id: profesor_id },
    temas: temasEncontrados,
  });

  const evaluacionGuardada = await evaluacionRepo.save(nuevaEvaluacion);

  // Crear horarios disponibles
  const horariosDisponibles = horarios.map((h) =>
    horarioRepo.create({
      fecha: h.fecha,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      evaluacion_oral: evaluacionGuardada,
      disponible: true,
    })
  );

  await horarioRepo.save(horariosDisponibles);

  return evaluacionGuardada;
};


export const eliminarEvaluacion = async (id) => {
  try {
    const evaluacion = await evaluacionRepo.findOne({
      where: { id: Number(id) }
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }
    
    try {
        await notaRepo.delete({ evaluacion: { id: Number(id) } });
    } catch (errNotes) {
        console.log("No se pudieron borrar notas o no existían: ", errNotes.message);
    }

    await evaluacionRepo.remove(evaluacion);

    return [evaluacion, null];

  } catch (error) {
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

export const obtenerHorariosDisponibles = async (evaluacionId) => {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
  });

  if (!evaluacion) {
    throw new Error("Evaluación oral no encontrada");
  }

  return await horarioRepo.find({
    where: {
      evaluacion_id: evaluacionId,
      disponible: true,
    },
    order: {
      fecha: "ASC",
      hora_inicio: "ASC",
    },
  });
};

export const inscribirseAEvaluacion = async (
  evaluacionId,
  horarioId,
  estudianteId
) => {
  const horario = await horarioRepo.findOne({
    where: {
      id: horarioId,
      evaluacion_id: evaluacionId,
      disponible: true,
    },
  });

  if (!horario) {
    throw new Error("Horario no disponible");
  }

  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
    relations: ["temas"],
  });

  if (!evaluacion || evaluacion.temas.length === 0) {
    throw new Error("La evaluación no tiene temas asociados");
  }

  const temaAsignado = asignarTemaAleatorio(evaluacion.temas);

  const inscripcion = inscripcionRepo.create({
    evaluacion_id: evaluacionId,
    estudiante_id: estudianteId,
    tema_asignado_id: temaAsignado.id,
    material_asignado: temaAsignado.materialUrl,
  });

  await inscripcionRepo.save(inscripcion);

  horario.disponible = false;
  await horarioRepo.save(horario);

  return inscripcion;
};

export const asignarTemaAleatorio = (temas) => {
  const indiceAleatorio = Math.floor(Math.random() * temas.length);
  return temas[indiceAleatorio];
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
