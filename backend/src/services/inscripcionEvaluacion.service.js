import { AppDataSource } from "../config/configDb.js";
import { InscripcionEvaluacion } from "../entities/inscripcionEvaluacion.entity.js";
import { HorarioDisponible } from "../entities/HorarioDisponible.entity.js";

const inscripcionRepo = AppDataSource.getRepository(InscripcionEvaluacion);
const horarioRepo = AppDataSource.getRepository(HorarioDisponible);

export const obtenerHorariosDisponibles = async (evaluacionId) => {
  return await horarioRepo.find({
    where: {
      evaluacion_oral: { id: evaluacionId },
      disponible: true,
    },
    order: { fecha: "ASC", hora_inicio: "ASC" },
  });
};

export const inscribirEstudianteEnHorario = async ({
  evaluacionId,
  horarioId,
  estudianteId,
}) => {
  //Verificar horario
  const horario = await horarioRepo.findOne({
    where: { id: horarioId },
    relations: ["evaluacion_oral"],
  });

  if (!horario || !horario.disponible) {
    throw new Error("El horario no está disponible");
  }

  if (horario.evaluacion_oral.id !== evaluacionId) {
    throw new Error("Horario no pertenece a esta evaluación");
  }

  //Crear inscripción
  const inscripcion = inscripcionRepo.create({
    evaluacion_id: evaluacionId,
    estudiante_id: estudianteId,
  });

  await inscripcionRepo.save(inscripcion);

  //Bloquear horario elegido
  horario.disponible = false;
  await horarioRepo.save(horario);

  return inscripcion;
};
