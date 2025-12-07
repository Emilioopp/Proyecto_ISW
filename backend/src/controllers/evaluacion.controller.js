import {
  crearEvaluacion,
  obtenerEvaluaciones,
  obtenerEvaluacionPorId,
  obtenerEvaluacionesPorAsignatura,
  actualizarEvaluacion,
  eliminarEvaluacion,
  inscribirseEvaluacion,
  obtenerInscripcionesPorEstudiante,
  desinscribirseEvaluacion,
} from "../services/evaluacion.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../Handlers/responseHandlers.js";
import { evaluacionSchema } from "../validations/Evaluacion.validation.js";

export const crearEvaluacionController = async (req, res) => {
  try {
    const { asignaturaId } = req.params;
    
    console.log("Usuario autenticado:", req.user);
    console.log("Body recibido:", req.body);
    console.log("AsignaturaId:", asignaturaId);
    
    // Validar datos de entrada
    const { error: validationError } = evaluacionSchema.validate(req.body);
    if (validationError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación",
        validationError.details.map(detail => detail.message)
      );
    }

    if (!req.user || !req.user.sub) {
      return handleErrorClient(res, 401, "Usuario no autenticado");
    }

    const data = {
      ...req.body,
      asignatura_id: parseInt(asignaturaId),
      profesor_id: req.user.sub,
    };

    console.log("Data a insertar:", data);

    const [evaluacion, error] = await crearEvaluacion(data);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Evaluación creada exitosamente", evaluacion);
  } catch (error) {
    console.error("Error en crearEvaluacionController:", error);
    handleErrorServer(res, 500, error.message);
  }
};

export const obtenerEvaluacionesController = async (req, res) => {
  try {
    const [evaluaciones, error] = await obtenerEvaluaciones();

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Evaluaciones obtenidas exitosamente", evaluaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

export const obtenerEvaluacionPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const [evaluacion, error] = await obtenerEvaluacionPorId(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Evaluación obtenida exitosamente", evaluacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

export const obtenerEvaluacionesPorAsignaturaController = async (req, res) => {
  try {
    const { asignaturaId } = req.params;
    const [evaluaciones, error] = await obtenerEvaluacionesPorAsignatura(asignaturaId);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Evaluaciones obtenidas exitosamente", evaluaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
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

export const inscribirseEvaluacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.user.sub;

    const [inscripcion, error] = await inscribirseEvaluacion(id, estudianteId);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Inscripción exitosa", inscripcion);
  } catch (error) {
    console.error("Error en inscribirseEvaluacionController:", error);
    handleErrorServer(res, 500, error.message);
  }
};

export const obtenerInscripcionesPorEstudianteController = async (req, res) => {
  try {
    const { asignaturaId } = req.params;
    const estudianteId = req.user.sub;

    const [inscripciones, error] = await obtenerInscripcionesPorEstudiante(estudianteId, asignaturaId);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Inscripciones obtenidas exitosamente", inscripciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

export const desinscribirseEvaluacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.user.sub;

    const [inscripcion, error] = await desinscribirseEvaluacion(id, estudianteId);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Desinscripción exitosa", inscripcion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};
