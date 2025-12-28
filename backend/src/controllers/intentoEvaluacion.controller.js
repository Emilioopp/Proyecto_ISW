import {
    iniciarIntentoEvaluacionPractica,
    submitIntentoEvaluacion,
    obtenerIntentoById,
    listarIntentosPorEvaluacion,
} from "../services/intentoEvaluacion.service.js";
import {
    handleError,
    handleErrorClient,
    handleSuccess,
} from "../Handlers/responseHandlers.js";

export async function postIniciarIntento(req, res) {
  try {
    const { id } = req.params;
    const rol = req.user.rol;
    const estudianteId = req.user.sub;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const data = await iniciarIntentoEvaluacionPractica({
        evaluacionId: Number(id),
        estudianteId: Number(estudianteId),
        rol,
    });

    return handleSuccess(res, 201, "Intento iniciado", data);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function postSubmitIntento(req, res) {
  try {
    const { id } = req.params;
    const rol = req.user.rol;
    const estudianteId = req.user.sub;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const { respuestas } = req.body;

    const data = await submitIntentoEvaluacion({
        intentoId: Number(id),
        estudianteId: Number(estudianteId),
        rol,
        respuestas,
    });

    return handleSuccess(res, 200, "Intento finalizado", data);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getIntentoById(req, res) {
  try {
    const { id } = req.params;
    const rol = req.user.rol;
    const userId = req.user.sub;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const data = await obtenerIntentoById({
        intentoId: Number(id),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "OK", data);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getIntentosPorEvaluacion(req, res) {
  try {
    const { id } = req.params;
    const rol = req.user.rol;
    const userId = req.user.sub;

    if (!id || isNaN(Number(id))) {
        return handleErrorClient(res, 400, "id inválido");
    }

    const data = await listarIntentosPorEvaluacion({
        evaluacionId: Number(id),
        rol,
        userId: Number(userId),
    });

    return handleSuccess(res, 200, "OK", data);
  } catch (error) {
    return handleError(res, error);
  }
}