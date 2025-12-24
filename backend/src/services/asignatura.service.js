import { AppDataSource } from "../config/configDb.js";
import { Asignatura } from "../entities/asignatura.entity.js";

const asignaturaRepository = AppDataSource.getRepository(Asignatura);

export async function crearAsignaturaService(data) {
  try {
    const existingByCodigo = await asignaturaRepository.findOne({
      where: { codigo: data.codigo },
    });

    if (existingByCodigo) {
      return [null, "Ya existe una asignatura con ese código"];
    }
    const newAsignatura = asignaturaRepository.create(data);
    await asignaturaRepository.save(newAsignatura);

    return [newAsignatura, null];
  } catch (error) {
    console.error("Error al crear asignatura:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAsignaturasService() {
  try {
    const asignaturas = await asignaturaRepository.find({
      order: { codigo: "ASC" },
    });

    return [asignaturas, null];
  } catch (error) {
    console.error("Error al obtener asignaturas:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAsignaturaByIdService(id) {
  try {
    const asignatura = await asignaturaRepository.findOne({
      where: { id },
    });

    if (!asignatura) {
      return [null, "Asignatura no encontrada"];
    }

    return [asignatura, null];
  } catch (error) {
    console.error("Error al obtener asignatura:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateAsignaturaService(id, data) {
  try {
    const asignatura = await asignaturaRepository.findOne({
      where: { id },
    });

    if (!asignatura) {
      return [null, "Asignatura no encontrada"];
    }

    if (data.codigo && data.codigo !== asignatura.codigo) {
      const existingByCodigo = await asignaturaRepository.findOne({
        where: { codigo: data.codigo },
      });

      if (existingByCodigo) {
        return [null, "Ya existe una asignatura con ese código"];
      }
    }

    if (data.codigo) asignatura.codigo = data.codigo;
    if (data.nombre) asignatura.nombre = data.nombre;

    await asignaturaRepository.save(asignatura);

    return [asignatura, null];
  } catch (error) {
    console.error("Error al actualizar asignatura:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteAsignaturaService(id) {
  try {
    const asignatura = await asignaturaRepository.findOne({
      where: { id },
      relations: [
        "profesorAsignaturas",
        "estudianteAsignaturas",
        "evaluacionesPracticas",
      ],
    });

    if (!asignatura) {
      return [null, "Asignatura no encontrada"];
    }

    if (
      asignatura.profesorAsignaturas?.length > 0 ||
      asignatura.estudianteAsignaturas?.length > 0 ||
      asignatura.evaluacionesPracticas?.length > 0
    ) {
      return [
        null,
        "No se puede eliminar la asignatura porque tiene profesores, estudiantes o evaluaciones asociadas",
      ];
    }

    await asignaturaRepository.remove(asignatura);

    return [{ message: "Asignatura eliminada exitosamente" }, null];
  } catch (error) {
    console.error("Error al eliminar asignatura:", error);
    return [null, "Error interno del servidor"];
  }
}
