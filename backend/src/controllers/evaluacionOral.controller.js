import * as evaluacionService from "../services/evaluacionOral.service.js";
import {
  handleError,
  handleSuccess,
  handleErrorClient,
} from "../Handlers/responseHandlers.js";

export const obtenerEvaluacionesPorAsignatura = async (req, res) => {
  const { id } = req.params;

  try {
    const idAsignatura = parseInt(id);
    if (isNaN(idAsignatura)) {
      return res.status(400).json({
        status: "Error",
        message: "El ID de la asignatura debe ser numérico.",
      });
    }

    const evaluaciones =
      await evaluacionService.obtenerEvaluacionesPorAsignatura(idAsignatura);

    res.json({
      status: "Success",
      data: evaluaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Error",
      message: "Error al obtener las evaluaciones",
    });
  }
};

export const crearEvaluacionOral = async (req, res) => {
  try {
    const profesor_id = req.user.sub;
    const { asignaturaId } = req.params;

    const {
      titulo,
      descripcion,
      sala,
      duracion_minutos,
      material_estudio,
      fecha_hora,
      temas,
    } = req.body;

    if (!temas || !Array.isArray(temas) || temas.length === 0) {
      return handleErrorClient(
        res,
        400,
        "Se requiere al menos un tema para la evaluación oral"
      );
    }

    const data = {
      asignaturaId: parseInt(asignaturaId),
      profesor_id,
      titulo,
      descripcion,
      sala,
      duracion_minutos: parseInt(duracion_minutos),
      material_estudio,
      fecha_hora,
      temas,
    };

    const evaluacion = await evaluacionService.crearEvaluacionOral(data);

    if (!evaluacion) {
      return handleErrorClient(res, 400, "No se pudo crear la evaluación.");
    }

    handleSuccess(res, 201, "Evaluación oral creada exitosamente", evaluacion);
  } catch (error) {
    handleError(res, error);
  }
};

export const registrarNota = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);
    const { estudiante_id, nota, observacion } = req.body;

    if (isNaN(evaluacion_oral_id)) {
      return res
        .status(400)
        .json({ status: "Error", message: "ID de evaluación inválido" });
    }

    if (!estudiante_id || nota === undefined) {
      return res.status(400).json({
        status: "Error",
        message: "Faltan datos obligatorios: estudiante_id y nota",
      });
    }

    const registro = await evaluacionService.registrarNota({
      evaluacion_oral_id,
      estudiante_id,
      nota,
      observacion,
    });
    handleSuccess(res, 201, "Nota registrada exitosamente", registro);
  } catch (error) {
    handleError(res, error);
  }
};

export const obtenerNotasPorEvaluacion = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);

    if (isNaN(evaluacion_oral_id)) {
      return res
        .status(400)
        .json({ status: "Error", message: "ID de evaluación inválido" });
    }

    const notas = await evaluacionService.obtenerNotasPorEvaluacion(
      evaluacion_oral_id
    );
    handleSuccess(res, 200, notas);
  } catch (error) {
    handleError(res, error);
  }
};

export const actualizarNota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, observacion } = req.body;

    const idNota = parseInt(id);
    if (isNaN(idNota)) {
      return res
        .status(400)
        .json({ status: "Error", message: "ID de nota inválido" });
    }

    const notaActualizada = await evaluacionService.actualizarNota(idNota, {
      nota,
      observacion,
    });

    handleSuccess(res, 200, "Nota actualizada correctamente", notaActualizada);
  } catch (error) {
    handleError(res, error);
  }
};

export const eliminarNota = async (req, res) => {
  try {
    const { id } = req.params;

    const idNota = parseInt(id);
    if (isNaN(idNota)) {
      return res
        .status(400)
        .json({ status: "Error", message: "ID de nota inválido" });
    }

    await evaluacionService.eliminarNota(idNota);

    handleSuccess(res, 200, "Nota eliminada correctamente");
  } catch (error) {
    handleError(res, error);
  }
};

export const actualizarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluacionId = parseInt(id);

    if (isNaN(evaluacionId)) {
      return handleErrorClient(res, 400, "ID de evaluación inválido");
    }

    const {
      titulo,
      descripcion,
      sala,
      duracion_minutos,
      material_estudio,
      fecha_hora,
      temas,
    } = req.body;

    if (temas && (!Array.isArray(temas) || temas.length === 0)) {
      return handleErrorClient(
        res,
        400,
        "La lista de temas no puede estar vacía si se envía"
      );
    }

    const data = {
      titulo,
      descripcion,
      sala,
      duracion_minutos: duracion_minutos
        ? parseInt(duracion_minutos)
        : undefined,
      material_estudio,
      fecha_hora,
      temas,
    };

    const evaluacionActualizada =
      await evaluacionService.actualizarEvaluacionOral(evaluacionId, data);

    handleSuccess(
      res,
      200,
      "Evaluación actualizada correctamente",
      evaluacionActualizada
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluacionId = parseInt(id);

    if (isNaN(evaluacionId)) {
      return handleErrorClient(res, 400, "ID de evaluación inválido");
    }

    await evaluacionService.eliminarEvaluacionOral(evaluacionId);

    handleSuccess(res, 200, "Evaluación eliminada correctamente");
  } catch (error) {
    handleError(res, error);
  }
};
