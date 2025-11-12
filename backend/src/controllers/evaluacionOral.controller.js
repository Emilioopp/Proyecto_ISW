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

/*
export const registrarNota = async (req, res) => {
  try {
    const evaluacion_oral_id = parseInt(req.params.id);
    const { rut, nota, observacion } = req.body;

    const registro = await evaluacionService.registrarNota({
      evaluacion_oral_id,
      rut,
      nota,
      observacion,
    });

    handleSuccess(res, 201, registro);
  } catch (error) {
    handleError(res, error);
  }
};
*/
export const registrarNota = async ({
  evaluacion_oral_id,
  rut,
  nota,
  observacion,
}) => {
  // Verificar existencia de la evaluación
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacion_oral_id },
  });
  if (!evaluacion) throw new Error("La evaluación oral no existe");

  // Buscar estudiante por rut
  const estudiante = await userRepo.findOne({ where: { rut } });
  if (!estudiante) throw new Error("No se encontró un estudiante con ese RUT");

  // Verificar inscripción del estudiante en la asignatura de la evaluación
  const inscripcion = await estudianteAsignaturaRepo.findOne({
    where: {
      estudiante_id: estudiante.id,
      asignatura_id: evaluacion.asignatura_id,
    },
  });
  if (!inscripcion)
    throw new Error(
      "El estudiante no está inscrito en la asignatura de esta evaluación"
    );

  // Evitar duplicados
  const existente = await notaRepo.findOne({
    where: { evaluacion_oral_id, estudiante_id: estudiante.id },
  });
  if (existente)
    throw new Error(
      "Ya existe una nota registrada para este estudiante en esta evaluación"
    );

  // Crear y guardar nueva nota
  const nuevaNota = notaRepo.create({
    evaluacion_oral_id,
    estudiante_id: estudiante.id,
    nota,
    observacion,
  });

  const guardada = await notaRepo.save(nuevaNota);

  console.log(
    `✅ Nota registrada para ${estudiante.rut} (${estudiante.email}): ${nota}`
  );

  return guardada;
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
