import { AppDataSource } from "../config/configDb.js";
import { EvaluacionOral } from "../entities/EvaluacionOral.entity.js";
import { NotaEvaluacion } from "../entities/NotaEvaluacion.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { User } from "../entities/user.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";

const evaluacionRepo = AppDataSource.getRepository(EvaluacionOral);
const notaRepo = AppDataSource.getRepository(NotaEvaluacion);
const estudianteAsignaturaRepo =
  AppDataSource.getRepository(EstudianteAsignatura);
const userRepo = AppDataSource.getRepository(User);

const asignaturaRepo = AppDataSource.getRepository(Asignatura);

// Crear una evaluación oral/
/*
export const crearEvaluacionOral = async (data) => {
  const nuevaEvaluacion = evaluacionRepo.create(data);
  return await evaluacionRepo.save(nuevaEvaluacion);
};
*/
export const crearEvaluacionOral = async (data) => {
  const { codigo_asignatura, profesor_id, titulo, descripcion } = data;

  // Buscar la asignatura por código
  const asignatura = await asignaturaRepo.findOne({
    where: { codigo: codigo_asignatura },
  });

  if (!asignatura) {
    throw new Error(
      `No se encontró una asignatura con código ${codigo_asignatura}`
    );
  }

  const nuevaEvaluacion = evaluacionRepo.create({
    asignatura_id: asignatura.id,
    profesor_id,
    titulo,
    descripcion,
  });

  return await evaluacionRepo.save(nuevaEvaluacion);
};

// Registrar nota y observación
export const registrarNota = async ({
  evaluacion_oral_id,
  estudiante_id,
  nota,
  observacion,
}) => {
  const evaluacion = await evaluacionRepo.findOne({
    where: { id: evaluacion_oral_id },
  });
  if (!evaluacion) throw new Error("La evaluación oral no existe");

  // Verificar que el estudiante esté inscrito en la asignatura
  const inscrito = await estudianteAsignaturaRepo.findOne({
    where: {
      estudiante_id,
      asignatura_id: evaluacion.asignatura_id,
    },
  });

  if (!inscrito)
    throw new Error(
      "El estudiante no está inscrito en la asignatura de esta evaluación"
    );

  // Verificar si ya existe un registro previo
  const existente = await notaRepo.findOne({
    where: { evaluacion_oral_id, estudiante_id },
  });
  if (existente)
    throw new Error(
      "Ya existe una nota registrada para este estudiante en esta evaluación"
    );

  const nuevaNota = notaRepo.create({
    evaluacion_oral_id,
    estudiante_id,
    nota,
    observacion,
  });

  const guardada = await notaRepo.save(nuevaNota);

  // Simular envío de notificación
  const alumno = await userRepo.findOne({ where: { id: estudiante_id } });
  console.log(
    `Notificación enviada a ${alumno.email}: nota ${nota} registrada.`
  );

  return guardada;
};

// Obtener notas por evaluación
export const obtenerNotasPorEvaluacion = async (evaluacion_oral_id) => {
  return await notaRepo.find({
    where: { evaluacion_oral_id },
    relations: ["estudiante"],
  });
};
