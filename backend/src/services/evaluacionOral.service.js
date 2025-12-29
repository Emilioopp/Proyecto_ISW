import { AppDataSource } from "../config/configDb.js";
import { EvaluacionOral } from "../entities/EvaluacionOral.entity.js";
import { NotaEvaluacion } from "../entities/NotaEvaluacion.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { HorarioDisponible } from "../entities/HorarioDisponible.entity.js";
import { TemaEvaluacion } from "../entities/temaEvaluacion.entity.js";
import { InscripcionEvaluacion } from "../entities/inscripcionEvaluacion.entity.js";

const horarioRepo = AppDataSource.getRepository(HorarioDisponible);
const temaRepo = AppDataSource.getRepository(TemaEvaluacion);
const inscripcionRepo = AppDataSource.getRepository(InscripcionEvaluacion);

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

  const listaHorarios = horarios.map((h) =>
    horarioRepo.create({
      fecha: h.fecha,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      evaluacion_oral: evaluacionGuardada, // Vinculamos con la evaluación recién creada
      disponible: true,
    })
  );

  await horarioRepo.save(listaHorarios);

  const evaluacionCompleta = await evaluacionRepo.findOne({
    where: { id: evaluacionGuardada.id },
    relations: ["temas", "asignatura", "profesor"], 
  });

  
  if (evaluacionCompleta) {
      evaluacionCompleta.horarios = listaHorarios;
  }

  return evaluacionCompleta;
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
  console.log(">>> ESTOY EJECUTANDO EL CÓDIGO NUEVO <<<");
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
  });

  if (!evaluacion) {
    throw new Error("Evaluación no encontrada");
  }

  const horarios = await horarioRepo.find({
    where: { evaluacion_oral: { id: evaluacionId } },
  });

  const inscripciones = await inscripcionRepo.find({
    where: { evaluacion_oral: { id: evaluacionId } },
  });

  const horariosOcupadosIds = inscripciones.map(
    (i) => i.horario_disponible_id
  );

  return horarios.map((horario) => ({
    ...horario,
    disponible: !horariosOcupadosIds.includes(horario.id),
  }));
};


export const inscribirseAEvaluacion = async (
  evaluacionId,
  horarioId,
  estudianteId
) => {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacionId },
  });

  if (!evaluacion) {
    throw new Error("Evaluación no encontrada");
  }

  const horario = await horarioRepo.findOne({
    where: {
      id: horarioId,
      evaluacion_oral: { id: evaluacionId },
    },
  });

  if (!horario) {
    throw new Error("Horario no válido para esta evaluación");
  }

  const horarioOcupado = await inscripcionRepo.findOne({
    where: {
      evaluacion: { id: evaluacionId },
      horario_disponible: {id: horarioId},
    },
  });

  if (horarioOcupado) {
    throw new Error("Horario ya ocupado");
  }

  const yaInscrito = await inscripcionRepo.findOne({
    where: {
      evaluacion: { id: evaluacionId },
      estudiante: { id: estudianteId },
    },
  });

  if (yaInscrito) {
    throw new Error("Ya estás inscrito en esta evaluación");
  }

  const inscripcion = inscripcionRepo.create({
    evaluacion: { id: evaluacionId },
    estudiante: { id: estudianteId },
    horario_disponible: { id: horarioId },
  });

  return await inscripcionRepo.save(inscripcion);
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
      relations: ["asignatura", "temas"], 
      order: { created_at: "DESC" }
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

// Obtener todas las evaluaciones orales de una asignatura
export const getEvaluacionesByAsignatura = async (asignaturaId) => {
  try {
    
    const response = await axios.get(`/evaluaciones-orales/asignatura/${asignaturaId}`);
    return response.data; // Retorna { status: "Success", data: [...] }
  } catch (error) {
    throw error;
  }
};
