import { AppDataSource } from "../config/configDb.js";
import { EvaluacionPractica } from "../entities/EvaluacionPractica.entity.js";
import { Pregunta } from "../entities/pregunta.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";

const evaluacionPracticaRepo = AppDataSource.getRepository(EvaluacionPractica.options.name);
const preguntaRepo = AppDataSource.getRepository(Pregunta.options.name);
const asignaturaRepo = AppDataSource.getRepository(Asignatura.options.name);
const profesorAsignaturaRepo = AppDataSource.getRepository(ProfesorAsignatura.options.name);
const estudianteAsignaturaRepo = AppDataSource.getRepository(EstudianteAsignatura.options.name);

async function assertEstudianteInscrito({ estudianteId, asignaturaId }) {
  const inscrito = await estudianteAsignaturaRepo.findOne({
    where: {
      estudiante_id: Number(estudianteId),
      asignatura_id: Number(asignaturaId),
    },
  });

  if (!inscrito) {
    const error = new Error(
      "Acceso denegado: el estudiante no está inscrito en esta asignatura"
    );
    error.statusCode = 403;
    throw error;
  }
}

async function assertAsignaturaExiste(asignaturaId) {
  const asignatura = await asignaturaRepo.findOne({where: { id: Number(asignaturaId) } });
  if (!asignatura) {
    const error = new Error("Asignatura no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return asignatura;
}

async function assertProfesorPuedeAccederAsignatura({rol, profesorId, asignaturaId}) {
  if (rol === "Admin") return;

  const asignacion = await profesorAsignaturaRepo.findOne({
    where: {
      profesor_id: Number(profesorId),
      asignatura_id: Number(asignaturaId)
    }
  });

  if (!asignacion) {
    const error = new Error(
      "Acceso denegado: el profesor no está asignado a esta asignatura"
    );
    error.statusCode = 403;
    throw error;
  } 
}

function assertEsDuenoEvaluacion({rol, userId, evaluacion}) {
  if (rol === "Admin") return;
  if (Number(evaluacion.profesor_id) !== Number(userId)) {
    const error = new Error("Acceso denegado: no eres dueño de la evaluación");
    error.statusCode = 403;
    throw error;
  }
}

export async function crearEvaluacionPractica({asignatura_id, profesor_id, titulo, descripcion,
                                            tiempo_minutos, rol}) {
  await assertAsignaturaExiste(asignatura_id);
  await assertProfesorPuedeAccederAsignatura({
    rol,
    profesorId: profesor_id,
    asignaturaId: asignatura_id
  });

  const nueva = evaluacionPracticaRepo.create({
    asignatura_id: Number(asignatura_id),
    profesor_id: Number(profesor_id),
    titulo,
    descripcion: descripcion ?? null,
    tiempo_minutos: Number(tiempo_minutos),
    estado: "oculta"
  });

  return await evaluacionPracticaRepo.save(nueva);
}

export async function listarEvaluacionesPracticasPorAsignatura({asignaturaId, rol, userId}) {
  await assertAsignaturaExiste(asignaturaId);
  await assertProfesorPuedeAccederAsignatura({
    rol,
    profesorId: userId,
    asignaturaId
  });

  return await evaluacionPracticaRepo.find({
    where: { asignatura_id: Number(asignaturaId) },
    order: { created_at: "DESC" }
  });
}

export async function listarEvaluacionesPracticasPublicasPorAsignatura({
  asignaturaId,
  rol,
  userId,
}) {
  await assertAsignaturaExiste(asignaturaId);

  // Admin puede listar sin restriccion
  if (rol !== "Admin") {
    await assertEstudianteInscrito({
      estudianteId: userId,
      asignaturaId,
    });
  }

  // Solo públicas
  return await evaluacionPracticaRepo.find({
    where: { asignatura_id: Number(asignaturaId), estado: "publica" },
    order: { created_at: "DESC" },
  });
}

export async function obtenerEvaluacionPracticaPorId({id, rol, userId}) {
  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(id) },
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  await assertProfesorPuedeAccederAsignatura({
    rol,
    profesorId: userId,
    asignaturaId: evaluacion.asignatura_id,
  });

  const preguntas = await preguntaRepo.find({
    where: { evaluacion_id: Number(id) },
    order: { orden: "ASC", id: "ASC" }
  });

  return { ...evaluacion, preguntas };
}

async function getSiguienteOrdenPregunta(evaluacionId) {
  const raw = await preguntaRepo
    .createQueryBuilder("p")
    .select("COALESCE(MAX(p.orden), 0)", "max")
    .where("p.evaluacion_id = :evaluacionId", {
      evaluacionId: Number(evaluacionId),
    })
    .getRawOne();

  const max = Number(raw?.max ?? 0);
  return max + 1;
}

export async function actualizarEvaluacionPractica({id, rol, userId, patch}) {
  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(id) }
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  assertEsDuenoEvaluacion({rol, userId, evaluacion});

  if (patch.titulo !== undefined) evaluacion.titulo = patch.titulo;
  if (patch.descripcion !== undefined)
    evaluacion.descripcion = patch.descripcion ?? null;
  if (patch.tiempo_minutos !== undefined)
    evaluacion.tiempo_minutos = Number(patch.tiempo_minutos);
  if (patch.estado !== undefined) evaluacion.estado = patch.estado;

  return await evaluacionPracticaRepo.save(evaluacion);
}

export async function eliminarEvaluacionPractica({id, rol, userId}) {
  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(id) }
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  assertEsDuenoEvaluacion({rol, userId, evaluacion});

  await evaluacionPracticaRepo.remove(evaluacion);

  return { id: Number(id) };
}

export async function crearPreguntaEvaluacionPractica({evaluacionId, rol, userId, data}) {
  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(evaluacionId) },
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  assertEsDuenoEvaluacion({ rol, userId, evaluacion });

  const siguienteOrden = await getSiguienteOrdenPregunta(evaluacionId);

  const pregunta = preguntaRepo.create({
    evaluacion_id: Number(evaluacionId),
    enunciado: data.enunciado,
    alternativa_a: data.alternativa_a,
    alternativa_b: data.alternativa_b,
    alternativa_c: data.alternativa_c,
    alternativa_d: data.alternativa_d,
    respuesta_correcta: data.respuesta_correcta,
    explicacion: data.explicacion,
    puntaje: data.puntaje ?? 1,
    orden: siguienteOrden
  });

  return await preguntaRepo.save(pregunta);
}

export async function actualizarPreguntaEvaluacionPractica({preguntaId, rol, userId, patch}) {
  const pregunta = await preguntaRepo.findOne({
    where: { id: Number(preguntaId) }
  });

  if (!pregunta) {
    const error = new Error("Pregunta no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(pregunta.evaluacion_id) }
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  assertEsDuenoEvaluacion({ rol, userId, evaluacion });

  if (patch.enunciado !== undefined) pregunta.enunciado = patch.enunciado;
  if (patch.alternativa_a !== undefined) pregunta.alternativa_a = patch.alternativa_a;
  if (patch.alternativa_b !== undefined) pregunta.alternativa_b = patch.alternativa_b;
  if (patch.alternativa_c !== undefined) pregunta.alternativa_c = patch.alternativa_c;
  if (patch.alternativa_d !== undefined) pregunta.alternativa_d = patch.alternativa_d;
  if (patch.respuesta_correcta !== undefined) pregunta.respuesta_correcta = patch.respuesta_correcta;
  if (patch.explicacion !== undefined) pregunta.explicacion = patch.explicacion;
  if (patch.puntaje !== undefined) pregunta.puntaje = Number(patch.puntaje);
  if (patch.orden !== undefined) {
    const ordenDestino = Number(patch.orden);
    const ordenActual = Number(pregunta.orden);

    if (ordenDestino !== ordenActual) {
      const preguntaEnDestino = await preguntaRepo.findOne({
        where: {
          evaluacion_id: Number(pregunta.evaluacion_id),
          orden: ordenDestino,
        },
      });

      if (preguntaEnDestino && Number(preguntaEnDestino.id) !== Number(pregunta.id)) {
        await AppDataSource.transaction(async (manager) => {
          const repo = manager.getRepository(Pregunta.options.name);
          preguntaEnDestino.orden = ordenActual;
          pregunta.orden = ordenDestino;
          await repo.save([preguntaEnDestino, pregunta]);
        });

        return pregunta;
      }

      pregunta.orden = ordenDestino;
    }
  }

  return await preguntaRepo.save(pregunta);
}

export async function eliminarPreguntaEvaluacionPractica({preguntaId, rol, userId}) {
  const pregunta = await preguntaRepo.findOne({
    where: { id: Number(preguntaId) }
  });

  if (!pregunta) {
    const error = new Error("Pregunta no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const evaluacion = await evaluacionPracticaRepo.findOne({
    where: { id: Number(pregunta.evaluacion_id) }
  });

  if (!evaluacion) {
    const error = new Error("Evaluación práctica no encontrada");
    error.statusCode = 404;
    throw error;
  }

  assertEsDuenoEvaluacion({rol, userId, evaluacion});

  await preguntaRepo.remove(pregunta);
  return { id: Number(preguntaId) };
}