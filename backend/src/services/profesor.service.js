import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";
import { EvaluacionPractica } from "../entities/EvaluacionPractica.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";

const userRepo = AppDataSource.getRepository(User.options.name);
const paRepo = AppDataSource.getRepository(ProfesorAsignatura.options.name);
const asignaturaRepo = AppDataSource.getRepository(Asignatura.options.name);

export async function crearProfesorService(data) {
  try {
    // Verifica si ya existe usuario con ese email
    const existingByEmail = await userRepo.findOne({
      where: { email: data.email },
    });
    if (existingByEmail) {
      return [null, "Ya existe un usuario con ese email"];
    }

    // Verifica si ya existe usuario con ese RUT
    const existingByRut = await userRepo.findOne({ where: { rut: data.rut } });
    if (existingByRut) {
      return [null, "Ya existe un usuario con ese RUT"];
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crea profesor
    const profesor = userRepo.create({
      nombre: data.nombre,
      rut: data.rut,
      email: data.email,
      password: hashedPassword,
      rol: "Profesor",
    });

    await userRepo.save(profesor);

    // Oculta password
    const { password, ...publicProfesor } = profesor;
    return [publicProfesor, null];
  } catch (error) {
    console.error("Error al crear profesor:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function asignarProfesorAsignaturaService(
  profesorId,
  asignaturaId
) {
  try {
    // Verifica que el profesor existe
    const profesor = await userRepo.findOne({
      where: { id: Number(profesorId) },
    });
    if (!profesor) {
      return [null, "Profesor no encontrado"];
    }
    if (profesor.rol !== "Profesor") {
      return [null, "El usuario no tiene rol de Profesor"];
    }

    // Verifica que la asignatura existe
    const asignatura = await asignaturaRepo.findOne({
      where: { id: Number(asignaturaId) },
    });
    if (!asignatura) {
      return [null, "Asignatura no encontrada"];
    }

    // Verifica si ya esta asignado
    const yaAsignado = await paRepo.findOne({
      where: {
        profesor_id: Number(profesorId),
        asignatura_id: Number(asignaturaId),
      },
    });
    if (yaAsignado) {
      return [null, "El profesor ya esta asignado a esta asignatura"];
    }

    // Crea asignación
    const asignacion = paRepo.create({
      profesor_id: Number(profesorId),
      asignatura_id: Number(asignaturaId),
    });

    await paRepo.save(asignacion);

    return [
      {
        profesor_id: Number(profesorId),
        asignatura_id: Number(asignaturaId),
        profesor: { id: profesor.id, nombre: profesor.nombre },
        asignatura: {
          id: asignatura.id,
          codigo: asignatura.codigo,
          nombre: asignatura.nombre,
        },
      },
      null,
    ];
  } catch (error) {
    console.error("Error al asignar profesor a asignatura:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function desasignarProfesorAsignaturaService(
  profesorId,
  asignaturaId
) {
  try {
    const asignacion = await paRepo.findOne({
      where: {
        profesor_id: Number(profesorId),
        asignatura_id: Number(asignaturaId),
      },
    });

    if (!asignacion) {
      return [null, "El profesor no esta asignado a esta asignatura"];
    }

    await paRepo.remove(asignacion);

    return [{ message: "Profesor desasignado exitosamente" }, null];
  } catch (error) {
    console.error("Error al desasignar profesor:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getProfesoresService() {
  try {
    const profesores = await userRepo.find({
      where: { rol: "Profesor" },
      order: { nombre: "ASC" },
    });

    // Oculta password
    const profesoresPublic = profesores.map(({ password, ...rest }) => rest);

    return [profesoresPublic, null];
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getProfesorByIdService(id) {
  try {
    const profesor = await userRepo.findOne({
      where: { id: Number(id), rol: "Profesor" },
    });

    if (!profesor) {
      return [null, "Profesor no encontrado"];
    }

    const { password, ...publicProfesor } = profesor;
    return [publicProfesor, null];
  } catch (error) {
    console.error("Error al obtener profesor:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateProfesorService(id, data) {
  try {
    const profesor = await userRepo.findOne({
      where: { id: Number(id), rol: "Profesor" },
    });

    if (!profesor) {
      return [null, "Profesor no encontrado"];
    }

    // Verificar que no exista si se actualiza
    if (data.email && data.email !== profesor.email) {
      const existingByEmail = await userRepo.findOne({
        where: { email: data.email },
      });
      if (existingByEmail) {
        return [null, "Ya existe un usuario con ese email"];
      }
    }

    // Verificar que no exista si se actualiza
    if (data.rut && data.rut !== profesor.rut) {
      const existingByRut = await userRepo.findOne({
        where: { rut: data.rut },
      });
      if (existingByRut) {
        return [null, "Ya existe un usuario con ese RUT"];
      }
    }

    // Actualizar campos
    if (data.email) profesor.email = data.email;
    if (data.nombre) profesor.nombre = data.nombre;
    if (data.rut) profesor.rut = data.rut;

    // Si se envía password, hashearlo
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      profesor.password = hashedPassword;
    }

    await userRepo.save(profesor);

    const { password, ...publicProfesor } = profesor;
    return [publicProfesor, null];
  } catch (error) {
    console.error("Error al actualizar profesor:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteProfesorService(id) {
  try {
    const profesor = await userRepo.findOne({
      where: { id: Number(id), rol: "Profesor" },
    });

    if (!profesor) {
      return [null, "Profesor no encontrado"];
    }

    // Verifica si tiene asignaturas asignadas
    const asignaciones = await paRepo.find({
      where: { profesor_id: Number(id) },
    });

    if (asignaciones.length > 0) {
      return [
        null,
        "No se puede eliminar el profesor porque tiene asignaturas asignadas. Desasigne primero.",
      ];
    }

    // Elimina profesor
    await userRepo.remove(profesor);

    return [{ message: "Profesor eliminado exitosamente" }, null];
  } catch (error) {
    console.error("Error al eliminar profesor:", error);
    return [null, "Error interno del servidor"];
  }
}
