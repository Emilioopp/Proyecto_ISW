import { AppDataSource } from "../config/configDb.js";
import { EvaluacionPractica } from "../entities/EvaluacionPractica.entity.js";
import { IntentoEvaluacion } from "../entities/IntentoEvaluacion.entity.js";
import { Pregunta } from "../entities/pregunta.entity.js";
import { RespuestaEstudiante } from "../entities/RespuestaEstudiante.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";

const evaluacionRepo = AppDataSource.getRepository(EvaluacionPractica.options.name);
const intentoRepo = AppDataSource.getRepository(IntentoEvaluacion.options.name);
const preguntaRepo = AppDataSource.getRepository(Pregunta.options.name);
const respuestaRepo = AppDataSource.getRepository(RespuestaEstudiante.options.name);
const estudianteAsignaturaRepo = AppDataSource.getRepository(EstudianteAsignatura.options.name);
const userRepo = AppDataSource.getRepository(User.options.name);

function errorWithStatus(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertAlternativa(value) {
  if (value === null || value === undefined) return;
  if (!["A", "B", "C", "D"].includes(value)) {
    throw errorWithStatus("respuesta_seleccionada debe ser A, B, C o D", 400);
  }
}

async function assertEstudianteInscrito({estudianteId, asignaturaId}) {
  const inscrito = await estudianteAsignaturaRepo.findOne({
    where: {
        estudiante_id: Number(estudianteId),
        asignatura_id: Number(asignaturaId),
    },
  });

  if (!inscrito) {
    throw errorWithStatus("Acceso denegado: el estudiante no está inscrito en esta asignatura", 403);
  }
}

function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

export async function iniciarIntentoEvaluacionPractica({evaluacionId, estudianteId, rol}) {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: Number(evaluacionId) },
  });

  if (!evaluacion) throw errorWithStatus("Evaluación práctica no encontrada", 404);

  // Admin puede iniciar igual; estudiante requiere evaluación pública
  if (rol !== "Admin" && evaluacion.estado !== "publica") {
    throw errorWithStatus("La evaluación no está disponible", 403);
  }

  await assertEstudianteInscrito({
    estudianteId,
    asignaturaId: evaluacion.asignatura_id,
  });

  const preguntas = await preguntaRepo.find({
    where: { evaluacion_id: Number(evaluacionId) },
    order: { orden: "ASC", id: "ASC" },
  });

  const puntaje_total = preguntas.reduce((acc, p) => acc + Number(p.puntaje ?? 0), 0);

  // Si hay un intento activo, se reutiliza
  let intentoActivo = await intentoRepo.findOne({
    where: {
        evaluacion_id: Number(evaluacionId),
        estudiante_id: Number(estudianteId),
        finalizado: false,
    },
    order: { id: "DESC" },
  });

  // Detectar si el intento activo expiró sin finalizarse
  if (intentoActivo) {
    const now = new Date();
    const inicio = new Date(intentoActivo.fecha_inicio);
    const tiempoMaxMs = Number(evaluacion.tiempo_minutos) * 60 * 1000;
    const usadoMs = now.getTime() - inicio.getTime();

    if (Number.isFinite(tiempoMaxMs) && usadoMs > tiempoMaxMs) {
      // Finaliza automaticamente el intento expirado
      intentoActivo.finalizado = true;
      intentoActivo.fecha_finalizacion = now;
      intentoActivo.tiempo_usado_segundos = Math.floor(usadoMs / 1000);
      intentoActivo.puntaje_obtenido = 0;
      intentoActivo.puntaje_total = puntaje_total;
      await intentoRepo.save(intentoActivo);
      intentoActivo = null;
    } else if (intentoActivo.puntaje_total !== puntaje_total) {
      intentoActivo.puntaje_total = puntaje_total;
      await intentoRepo.save(intentoActivo);
    }
  }

  const intento = intentoActivo || (await intentoRepo.save(intentoRepo.create( {
        evaluacion_id: Number(evaluacionId),
        estudiante_id: Number(estudianteId),
        fecha_inicio: new Date(),
        finalizado: false,
        puntaje_total,
    })));

  if (!intentoActivo && intento.puntaje_total !== puntaje_total) {
    intento.puntaje_total = puntaje_total;
    await intentoRepo.save(intento);
  }

  const preguntasPublicas = preguntas.map((p) => ({
    id: p.id,
    evaluacion_id: p.evaluacion_id,
    enunciado: p.enunciado,
    alternativa_a: p.alternativa_a,
    alternativa_b: p.alternativa_b,
    alternativa_c: p.alternativa_c,
    alternativa_d: p.alternativa_d,
    puntaje: p.puntaje,
    orden: p.orden,
  }));

  return {
    intento,
    evaluacion: {
        id: evaluacion.id,
        asignatura_id: evaluacion.asignatura_id,
        titulo: evaluacion.titulo,
        descripcion: evaluacion.descripcion,
        tiempo_minutos: evaluacion.tiempo_minutos,
    },
    puntaje_total,
    preguntas: preguntasPublicas,
  };
}

export async function submitIntentoEvaluacion({intentoId, estudianteId, rol, respuestas}) {
  const intento = await intentoRepo.findOne({
    where: { id: Number(intentoId) },
    relations: ["evaluacion"]
  });

  if (!intento) throw errorWithStatus("Intento no encontrado", 404);

  if (rol !== "Admin" && Number(intento.estudiante_id) !== Number(estudianteId)) {
    throw errorWithStatus("Acceso denegado", 403);
  }

  if (intento.finalizado) {
    throw errorWithStatus("El intento ya fue finalizado", 400);
  }

  const evaluacion = intento.evaluacion;
  if (!evaluacion) throw errorWithStatus("Evaluación práctica no encontrada", 404);

  // Validación de inscripción
  await assertEstudianteInscrito({
    estudianteId: intento.estudiante_id,
    asignaturaId: evaluacion.asignatura_id,
  });

  const now = new Date();
  const inicio = new Date(intento.fecha_inicio);
  const tiempoMaxMs = Number(evaluacion.tiempo_minutos) * 60 * 1000;
  const usadoMs = now.getTime() - inicio.getTime();

  if (Number.isFinite(tiempoMaxMs) && usadoMs > tiempoMaxMs) {
    throw errorWithStatus("Tiempo de la evaluación expirado", 400);
  }

  const preguntas = await preguntaRepo.find({
    where: { evaluacion_id: Number(evaluacion.id) },
    order: { orden: "ASC", id: "ASC" },
  });

  if (preguntas.length === 0) {
    throw errorWithStatus("La evaluación no tiene preguntas", 400);
  }

  const respuestasArray = Array.isArray(respuestas) ? respuestas : [];
  const respuestasPorPreguntaId = new Map();
  for (const r of respuestasArray) {
    if (!r) continue;
    const preguntaId = Number(r.pregunta_id);
    if (!preguntaId || Number.isNaN(preguntaId)) {
        throw errorWithStatus("pregunta_id inválido", 400);
    }
    const seleccion = r.respuesta_seleccionada ?? null;
    assertAlternativa(seleccion);
    respuestasPorPreguntaId.set(preguntaId, seleccion);
  }

  const puntaje_total = preguntas.reduce(
    (acc, p) => acc + Number(p.puntaje ?? 0),
    0
  );

  let puntaje_obtenido = 0;
  const detalle = [];

  await AppDataSource.transaction(async (manager) => {
    const intentoTxRepo = manager.getRepository(IntentoEvaluacion.options.name);
    const respuestaTxRepo = manager.getRepository(RespuestaEstudiante.options.name);

    // Evita doble submit por carrera
    const intentoActual = await intentoTxRepo.findOne({
        where: { id: Number(intento.id) },
    });
    if (!intentoActual) throw errorWithStatus("Intento no encontrado", 404);
    if (intentoActual.finalizado) throw errorWithStatus("El intento ya fue finalizado", 400);

    for (const pregunta of preguntas) {
        const seleccionada =
            respuestasPorPreguntaId.get(Number(pregunta.id)) ?? null;
        const es_correcta =
            seleccionada !== null && seleccionada === pregunta.respuesta_correcta;

        if (es_correcta) {
            puntaje_obtenido += Number(pregunta.puntaje ?? 0);
        }

        await respuestaTxRepo.save(
            respuestaTxRepo.create({
                intento_id: Number(intento.id),
                pregunta_id: Number(pregunta.id),
                respuesta_seleccionada: seleccionada,
                es_correcta,
            })
        );

        detalle.push({
            pregunta_id: pregunta.id,
            orden: pregunta.orden,
            enunciado: pregunta.enunciado,
            respuesta_seleccionada: seleccionada,
            es_correcta,
            respuesta_correcta: pregunta.respuesta_correcta,
            explicacion: pregunta.explicacion,
            puntaje: pregunta.puntaje,
        });
    }

    intentoActual.puntaje_obtenido = Number(puntaje_obtenido);
    intentoActual.puntaje_total = Number(puntaje_total);
    intentoActual.tiempo_usado_segundos = Math.max(0, Math.floor(usadoMs / 1000));
    intentoActual.finalizado = true;
    intentoActual.fecha_finalizacion = now;

    await intentoTxRepo.save(intentoActual);
  });

  return {
    intento_id: intento.id,
    evaluacion_id: evaluacion.id,
    estudiante_id: intento.estudiante_id,
    puntaje_obtenido,
    puntaje_total,
    tiempo_usado_segundos: Math.max(0, Math.floor(usadoMs / 1000)),
    finalizado: true,
    detalle: detalle.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
  };
}

export async function obtenerIntentoById({intentoId, rol, userId}) {
  const intento = await intentoRepo.findOne({
    where: { id: Number(intentoId) },
    relations: ["evaluacion", "estudiante"],
  });

  if (!intento) throw errorWithStatus("Intento no encontrado", 404);

  if (rol === "Estudiante" && Number(intento.estudiante_id) !== Number(userId)) {
    throw errorWithStatus("Acceso denegado", 403);
  }

  if (rol === "Profesor") {
    if (!intento.evaluacion) throw errorWithStatus("Evaluación práctica no encontrada", 404);
    if (Number(intento.evaluacion.profesor_id) !== Number(userId)) {
        throw errorWithStatus("Acceso denegado", 403);
    }
  }

  const respuestas = await respuestaRepo.find({
    where: { intento_id: Number(intentoId) },
    relations: ["pregunta"],
    order: { id: "ASC" },
  });

  return {
    ...intento,
    estudiante: sanitizeUser(intento.estudiante),
    respuestas,
  };
}

export async function listarIntentosPorEvaluacion({ evaluacionId, rol, userId }) {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: Number(evaluacionId) },
  });

  if (!evaluacion) throw errorWithStatus("Evaluación práctica no encontrada", 404);

  if (rol === "Profesor" && Number(evaluacion.profesor_id) !== Number(userId)) {
    throw errorWithStatus("Acceso denegado", 403);
  }

  // Admin puede ver todo
  const intentos = await intentoRepo.find({
    where: { evaluacion_id: Number(evaluacionId) },
    relations: ["estudiante"],
    order: { id: "DESC" },
  });

  return intentos.map((i) => ({
    ...i,
    estudiante: sanitizeUser(i.estudiante),
  }));
}