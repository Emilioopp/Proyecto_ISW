import {
    crearEvaluacionPractica,
    listarEvaluacionesPracticasPorAsignatura,
    listarEvaluacionesPracticasPublicasPorAsignatura,
    obtenerEvaluacionPracticaPorId,
    actualizarEvaluacionPractica,
    eliminarEvaluacionPractica,
    crearPreguntaEvaluacionPractica,
    actualizarPreguntaEvaluacionPractica,
    eliminarPreguntaEvaluacionPractica,
} from "../services/evaluacionPractica.service.js";
import { handleError, handleErrorClient, handleSuccess } from "../Handlers/responseHandlers.js";

function isBlankString(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

function validarRespuestaCorrecta(value) {
  return ["A", "B", "C", "D"].includes(value);
}

export async function postEvaluacionPractica(req, res) {
  try {
    const profesor_id = req.user.sub;
    const rol = req.user.rol;

    const { asignatura_id, titulo, descripcion, tiempo_minutos } = req.body;

    if (!asignatura_id || isNaN(Number(asignatura_id))) {
        return handleErrorClient(res, 400, "asignatura_id es obligatorio");
    }
    if (!titulo || typeof titulo !== "string" || titulo.trim().length === 0) {
        return handleErrorClient(res, 400, "titulo es obligatorio");
    }
    if (!tiempo_minutos || isNaN(Number(tiempo_minutos)) || Number(tiempo_minutos) <= 0) {
        return handleErrorClient(res, 400, "tiempo_minutos debe ser un número > 0");
    }

    const evaluacion = await crearEvaluacionPractica({
        asignatura_id: Number(asignatura_id),
        profesor_id: Number(profesor_id),
        titulo: titulo.trim(),
        descripcion,
        tiempo_minutos: Number(tiempo_minutos),
        rol,
    });

    return handleSuccess(res, 201, "Evaluación práctica creada", evaluacion);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getEvaluacionesPracticas(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { asignaturaId } = req.query;

    if (!asignaturaId || isNaN(Number(asignaturaId))) {
        return handleErrorClient(res, 400, "asignaturaId es obligatorio en query");
    }

    const evaluaciones = await listarEvaluacionesPracticasPorAsignatura({
        asignaturaId: Number(asignaturaId),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "OK", evaluaciones);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getEvaluacionesPracticasPublicas(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { asignaturaId } = req.query;

    if (!asignaturaId || isNaN(Number(asignaturaId))) {
      return handleErrorClient(res, 400, "asignaturaId es obligatorio en query");
    }

    const evaluaciones = await listarEvaluacionesPracticasPublicasPorAsignatura({
      asignaturaId: Number(asignaturaId),
      rol,
      userId: Number(userId),
    });

    return handleSuccess(res, 200, "OK", evaluaciones);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getEvaluacionPracticaById(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const evaluacion = await obtenerEvaluacionPracticaPorId({
        id: Number(id),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "OK", evaluacion);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function putEvaluacionPractica(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const patch = {};
    const { titulo, descripcion, tiempo_minutos, estado } = req.body;

    if (titulo !== undefined) {
        if (typeof titulo !== "string" || titulo.trim().length === 0) {
            return handleErrorClient(res, 400, "titulo inválido");
        }
        patch.titulo = titulo.trim();
    }

    if (descripcion !== undefined) patch.descripcion = descripcion;

    if (tiempo_minutos !== undefined) {
        if (isNaN(Number(tiempo_minutos)) || Number(tiempo_minutos) <= 0) {
            return handleErrorClient(res, 400, "tiempo_minutos debe ser un número > 0");
        }
        patch.tiempo_minutos = Number(tiempo_minutos);
    }

    if (estado !== undefined) {
        if (!["oculta", "publica"].includes(estado)) {
            return handleErrorClient(res, 400, "estado debe ser 'oculta' o 'publica'");
        }
        patch.estado = estado;
    }

    if (Object.keys(patch).length === 0) {
        return handleErrorClient(res, 400, "No hay campos para actualizar");
    }

    const evaluacion = await actualizarEvaluacionPractica({
        id: Number(id),
        rol,
        userId: Number(userId),
        patch,
    });

    return handleSuccess(res, 200, "Evaluación práctica actualizada", evaluacion);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteEvaluacionPractica(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    await eliminarEvaluacionPractica({
        id: Number(id),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "Evaluación práctica eliminada", { id: Number(id) });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function postPreguntaEvaluacionPractica(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const {
        enunciado,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        respuesta_correcta,
        explicacion,
        puntaje,
    } = req.body;

    if (isBlankString(enunciado)) {
        return handleErrorClient(res, 400, "enunciado es obligatorio");
    }
    if (isBlankString(alternativa_a) || isBlankString(alternativa_b) || isBlankString(alternativa_c) || isBlankString(alternativa_d)) {
        return handleErrorClient(res, 400, "Todas las alternativas (a/b/c/d) son obligatorias");
    }
    if (!validarRespuestaCorrecta(respuesta_correcta)) {
        return handleErrorClient(res, 400, "respuesta_correcta debe ser A, B, C o D");
    }
    if (isBlankString(explicacion)) {
        return handleErrorClient(res, 400, "explicacion es obligatoria");
    }
    if (puntaje !== undefined && (isNaN(Number(puntaje)) || Number(puntaje) <= 0)) {
        return handleErrorClient(res, 400, "puntaje debe ser un número > 0");
    }

    const pregunta = await crearPreguntaEvaluacionPractica({
        evaluacionId: Number(id),
        rol,
        userId: Number(userId),
        data: {
            enunciado: enunciado.trim(),
            alternativa_a: alternativa_a.trim(),
            alternativa_b: alternativa_b.trim(),
            alternativa_c: alternativa_c.trim(),
            alternativa_d: alternativa_d.trim(),
            respuesta_correcta,
            explicacion: explicacion.trim(),
            puntaje: puntaje !== undefined ? Number(puntaje) : undefined,
        },
    });

    return handleSuccess(res, 201, "Pregunta creada", pregunta);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function putPreguntaEvaluacionPractica(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { preguntaId } = req.params;

    if (!preguntaId || isNaN(Number(preguntaId))) {
        return handleErrorClient(res, 400, "preguntaId inválido");
    }

    const patch = {};
    const {
        enunciado,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        respuesta_correcta,
        explicacion,
        puntaje,
        orden,
    } = req.body;

    if (enunciado !== undefined) {
        if (isBlankString(enunciado)) return handleErrorClient(res, 400, "enunciado inválido");
        patch.enunciado = enunciado.trim();
    }
    if (alternativa_a !== undefined) {
        if (isBlankString(alternativa_a)) return handleErrorClient(res, 400, "alternativa_a inválida");
        patch.alternativa_a = alternativa_a.trim();
    }
    if (alternativa_b !== undefined) {
        if (isBlankString(alternativa_b)) return handleErrorClient(res, 400, "alternativa_b inválida");
        patch.alternativa_b = alternativa_b.trim();
    }
    if (alternativa_c !== undefined) {
        if (isBlankString(alternativa_c)) return handleErrorClient(res, 400, "alternativa_c inválida");
        patch.alternativa_c = alternativa_c.trim();
    }
    if (alternativa_d !== undefined) {
        if (isBlankString(alternativa_d)) return handleErrorClient(res, 400, "alternativa_d inválida");
        patch.alternativa_d = alternativa_d.trim();
    }
    if (respuesta_correcta !== undefined) {
        if (!validarRespuestaCorrecta(respuesta_correcta)) {
            return handleErrorClient(res, 400, "respuesta_correcta debe ser A, B, C o D");
        }
        patch.respuesta_correcta = respuesta_correcta;
    }
    if (explicacion !== undefined) {
        if (isBlankString(explicacion)) return handleErrorClient(res, 400, "explicacion inválida");
        patch.explicacion = explicacion.trim();
    }
    if (puntaje !== undefined) {
        if (isNaN(Number(puntaje)) || Number(puntaje) <= 0) {
            return handleErrorClient(res, 400, "puntaje debe ser un número > 0");
        }
        patch.puntaje = Number(puntaje);
    }
    if (orden !== undefined) {
        if (isNaN(Number(orden))) return handleErrorClient(res, 400, "orden debe ser numérico");
        patch.orden = Number(orden);
    }

    if (Object.keys(patch).length === 0) {
        return handleErrorClient(res, 400, "No hay campos para actualizar");
    }

    const pregunta = await actualizarPreguntaEvaluacionPractica({
        preguntaId: Number(preguntaId),
        rol,
        userId: Number(userId),
        patch,
    });

    return handleSuccess(res, 200, "Pregunta actualizada", pregunta);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deletePreguntaEvaluacionPractica(req, res) {
  try {
    const rol = req.user.rol;
    const userId = req.user.sub;
    const { preguntaId } = req.params;

    if (!preguntaId || isNaN(Number(preguntaId))) {
        return handleErrorClient(res, 400, "preguntaId inválido");
    }

    await eliminarPreguntaEvaluacionPractica({
        preguntaId: Number(preguntaId),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "Pregunta eliminada", { id: Number(preguntaId) });
  } catch (error) {
    return handleError(res, error);
  }
}