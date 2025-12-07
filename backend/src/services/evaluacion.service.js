import { AppDataSource } from "../config/configDb.js";
import { Evaluacion } from "../entities/Evaluacion.entity.js";
import { InscripcionEvaluacion } from "../entities/inscripcionEvaluacion.entity.js";

const evaluacionRepository = AppDataSource.getRepository(Evaluacion);
const inscripcionRepository = AppDataSource.getRepository(InscripcionEvaluacion);

export const crearEvaluacion = async (data) => {
  try {
    const nuevaEvaluacion = evaluacionRepository.create(data);
    await evaluacionRepository.save(nuevaEvaluacion);
    return [nuevaEvaluacion, null];
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    return [null, "Error interno del servidor"];
  }
};

export const obtenerEvaluaciones = async () => {
  try {
    const evaluaciones = await evaluacionRepository.find({
      relations: ["asignatura", "profesor"],
      order: { created_at: "DESC" },
    });
    return [evaluaciones, null];
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [null, "Error interno del servidor"];
  }
};

export const obtenerEvaluacionPorId = async (id) => {
  try {
    const evaluacion = await evaluacionRepository.findOne({
      where: { id },
      relations: ["asignatura", "profesor", "notas", "notas.estudiante"],
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    return [evaluacion, null];
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    return [null, "Error interno del servidor"];
  }
};

export const obtenerEvaluacionesPorAsignatura = async (asignaturaId) => {
  try {
    const evaluaciones = await evaluacionRepository.find({
      where: { asignatura_id: asignaturaId },
      relations: ["profesor"],
      order: { fecha_hora: "ASC" },
    });
    return [evaluaciones, null];
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [null, "Error interno del servidor"];
  }
};

export const actualizarEvaluacion = async (id, data) => {
  try {
    const evaluacion = await evaluacionRepository.findOne({ where: { id } });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    await evaluacionRepository.update(id, data);
    const evaluacionActualizada = await evaluacionRepository.findOne({
      where: { id },
      relations: ["asignatura", "profesor"],
    });

    return [evaluacionActualizada, null];
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    return [null, "Error interno del servidor"];
  }
};

export const eliminarEvaluacion = async (id) => {
  try {
    const evaluacion = await evaluacionRepository.findOne({
      where: { id },
      relations: ["notas"],
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    if (evaluacion.notas && evaluacion.notas.length > 0) {
      return [null, "No se puede eliminar la evaluación porque tiene notas registradas"];
    }

    await evaluacionRepository.remove(evaluacion);
    return [evaluacion, null];
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    return [null, "Error interno del servidor"];
  }
};

export const inscribirseEvaluacion = async (evaluacionId, estudianteId) => {
  try {
    // Verificar que la evaluación existe
    const evaluacion = await evaluacionRepository.findOne({
      where: { id: evaluacionId },
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await inscripcionRepository.findOne({
      where: {
        evaluacion_id: evaluacionId,
        estudiante_id: estudianteId,
      },
    });

    if (inscripcionExistente) {
      return [null, "Ya estás inscrito en esta evaluación"];
    }

    // Crear inscripción
    const nuevaInscripcion = inscripcionRepository.create({
      evaluacion_id: evaluacionId,
      estudiante_id: estudianteId,
    });

    await inscripcionRepository.save(nuevaInscripcion);
    return [nuevaInscripcion, null];
  } catch (error) {
    console.error("Error al inscribirse:", error);
    return [null, "Error interno del servidor"];
  }
};

export const obtenerInscripcionesPorEstudiante = async (estudianteId, asignaturaId) => {
  try {
    const inscripciones = await inscripcionRepository.find({
      where: {
        estudiante_id: estudianteId,
      },
      relations: ["evaluacion", "evaluacion.asignatura"],
    });

    // Filtrar por asignatura si se proporciona
    const inscripcionesFiltradas = asignaturaId
      ? inscripciones.filter(i => i.evaluacion.asignatura_id === parseInt(asignaturaId))
      : inscripciones;

    return [inscripcionesFiltradas, null];
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    return [null, "Error interno del servidor"];
  }
};

export const desinscribirseEvaluacion = async (evaluacionId, estudianteId) => {
  try {
    const inscripcion = await inscripcionRepository.findOne({
      where: {
        evaluacion_id: evaluacionId,
        estudiante_id: estudianteId,
      },
    });

    if (!inscripcion) {
      return [null, "No estás inscrito en esta evaluación"];
    }

    await inscripcionRepository.remove(inscripcion);
    return [inscripcion, null];
  } catch (error) {
    console.error("Error al desinscribirse:", error);
    return [null, "Error interno del servidor"];
  }
};
