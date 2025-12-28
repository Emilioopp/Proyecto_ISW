import * as evaluacionService from "../services/evaluacionOral.service.js";
import { handleError, handleSuccess } from "../Handlers/responseHandlers.js";

export const obtenerEvaluacionesPorAsignatura = async (req, res) => {
  const { id } = req.params;

  try {
    const evaluaciones =
      await evaluacionService.obtenerEvaluacionesPorAsignatura(id);

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
    const data = { ...req.body, profesor_id, asignaturaId };
    const evaluacion = await evaluacionService.crearEvaluacionOral(data);
    handleSuccess(res, 201, "Evaluación oral creada exitosamente", evaluacion);
  } catch (error) {
    handleError(res, error);
  }
};

export const actualizarEvaluacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const [evaluacion, error] = await actualizarEvaluacion(id, req.body);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Evaluación actualizada exitosamente", evaluacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

export const eliminarEvaluacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const [evaluacion, error] = await eliminarEvaluacion(id);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Evaluación eliminada exitosamente", evaluacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

export const registrarNota = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);
    const { estudiante_id, nota, observacion } = req.body;
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
    handleSuccess(res, 201, registro);
  } catch (error) {
    handleError(res, error);
  }
};

export const obtenerNotasPorEvaluacion = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);
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
