import * as evaluacionService from "../services/evaluacionOral.service.js";
import { handleError, handleSuccess } from "../Handlers/responseHandlers.js";
export const crearEvaluacionOral = async (req, res) => {
  try {
    const profesor_id = req.user.sub;
    const data = { ...req.body, profesor_id };
    const evaluacion = await evaluacionService.crearEvaluacionOral(data);
    handleSuccess(res, 201, "Evaluación oral creada exitosamente", evaluacion);
  } catch (error) {
    handleError(res, error);
  }
};
export const registrarNota = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);
    const { estudiante_id, nota, observacion } = req.body;
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
