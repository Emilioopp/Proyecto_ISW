import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { formatearRUT, extraerRutSinDigito } from "../validations/usuario.validation.js";
import { NotaEvaluacion } from "../entities/NotaEvaluacion.entity.js";

const userRepo = AppDataSource.getRepository(User.options.name);
const eaRepo = AppDataSource.getRepository(EstudianteAsignatura.options.name);
const paRepo = AppDataSource.getRepository(ProfesorAsignatura.options.name);
const notaRepository = AppDataSource.getRepository(NotaEvaluacion.options.name);

export async function inscribirEstudianteService(userId, asignaturaId, data, rol = "Profesor") {
  if (rol !== "Admin") {
    const asignacionProfesor = await paRepo.findOne({
      where: {
        profesor_id: Number(userId),
        asignatura_id: Number(asignaturaId),
      },
    });
    if (!asignacionProfesor) {
      return [null, "El profesor no esta asignado a esta asignatura"];
    }
  }

  // Busca usuario por email
  let user = await userRepo.findOne({ where: { email: data.email } });

    if (user) {
        if (user.rol !== "Estudiante") {
            return [null, "El email ya existe y pertenece a un usuario que no es Estudiante"];
        }
        const yaInscrito = await eaRepo.findOne({
            where: { estudiante_id: user.id, asignatura_id: Number(asignaturaId) },
        });
        if (yaInscrito) {
            return [null, "El estudiante ya esta inscrito en esta asignatura"];
        }
    } else {
        if (!data.nombre || !data.rut) {
            return [null, "Para crear un nuevo estudiante se requiere nombre y rut"];
        }

    const rutFormateado = formatearRUT(data.rut);
    const passwordPlano = extraerRutSinDigito(data.rut);
    if (!passwordPlano || passwordPlano.length < 7) {
      return [null, "RUT invalido para generar contraseña inicial"];
    }
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    user = userRepo.create({
      nombre: data.nombre,
      rut: rutFormateado,
      email: data.email,
      password: passwordHash,
      rol: "Estudiante",
    });
    try {
      user = await userRepo.save(user);
    } catch (err) {
      if (err.code === "23505") {
        return [null, "El email o RUT ya esta registrado"];
      }
      return [null, "Error al crear el usuario estudiante"];
    }
  }

  const vinculo = eaRepo.create({
    estudiante_id: user.id,
    asignatura_id: Number(asignaturaId),
  });
  try {
    await eaRepo.save(vinculo);
  } catch (err) {
    if (err.code === "23505") {
      return [null, "El estudiante ya esta inscrito en esta asignatura"];
    }
    return [null, "Error al inscribir al estudiante en la asignatura"];
  }

  // Respuesta (password oculta)
  const { password, ...publicUser } = user;
  return [
    { estudiante: publicUser, asignatura_id: Number(asignaturaId) }, null];
}

export async function getEstudiantesByAsignaturaService(userId, asignaturaId, rol = "Profesor") {
    // Si es Profesor valida asignacion; Admin puede ver cualquier asignatura
    if (rol !== "Admin") {
        const asignacionProfesor = await paRepo.findOne({
            where: { profesor_id: Number(userId), asignatura_id: Number(asignaturaId) },
        });
        if (!asignacionProfesor) {
            return [null, "El profesor no está asignado a esta asignatura"];
        }
    }

  const vinculos = await eaRepo.find({
    where: { asignatura_id: Number(asignaturaId) },
    relations: ["estudiante"],
    order: { id: "ASC" },
  });

  const estudiantes = vinculos.map((v) => {
    const { password, ...rest } = v.estudiante;
    return rest;
  });

  return [estudiantes, null];
}

export async function getEstudiantePerfilService(userId, estudianteId, rol) {
  if (rol === "Estudiante" && userId !== Number(estudianteId)) {
    return [null, "No tienes permiso para ver este perfil"];
  }

  const estudiante = await userRepo.findOne({
    where: { id: Number(estudianteId), rol: "Estudiante" },
  });
  if (!estudiante) return [null, "Estudiante no encontrado"];

  const vinculos = await eaRepo.find({
    where: { estudiante_id: Number(estudianteId) },
    relations: ["asignatura"],
    order: { id: "ASC" },
  });
  const asignaturas = vinculos.map((v) => v.asignatura);

  if (rol === "Profesor") {
    const aps = await paRepo.find({ where: { profesor_id: Number(userId) } });
    const ids = new Set(aps.map((ap) => ap.asignatura_id));
    const autorizado = asignaturas.some((a) => ids.has(a.id));
    if (!autorizado)
      return [null, "Este estudiante no está en tus asignaturas"];
  }

  const { password, ...publicEst } = estudiante;
  return [{ ...publicEst, asignaturas }, null];
}

export async function editarEstudianteService(userId, estudianteId, data, rol) {
  if (rol === "Estudiante") {
    return [null, "No puedes editar tu perfil aquí. Usa /api/profile/password"];
  }

  const estudiante = await userRepo.findOne({
    where: { id: Number(estudianteId), rol: "Estudiante" },
  });
  if (!estudiante) return [null, "Estudiante no encontrado"];

  if (data.email && data.email !== estudiante.email) {
    const existsEmail = await userRepo.findOne({
      where: { email: data.email },
    });
    if (existsEmail) return [null, "Ya existe un usuario con ese email"];
    estudiante.email = data.email;
  }
  if (data.rut && data.rut !== estudiante.rut) {
    const rutFmt = formatearRUT(data.rut);
    const existsRut = await userRepo.findOne({ where: { rut: rutFmt } });
    if (existsRut) return [null, "Ya existe un usuario con ese RUT"];
    estudiante.rut = rutFmt;
  }
  if (data.nombre) estudiante.nombre = data.nombre;
  if (data.password) {
    estudiante.password = await bcrypt.hash(data.password, 10);
  }

  await userRepo.save(estudiante);
  const { password, ...publicEst } = estudiante;
  return [publicEst, null];
}

export async function desasignarEstudianteAsignaturaService(
  userId,
  estudianteId,
  asignaturaId,
  rol
) {
  if (rol === "Profesor") {
    const ap = await paRepo.findOne({
      where: {
        profesor_id: Number(userId),
        asignatura_id: Number(asignaturaId),
      },
    });
    if (!ap) return [null, "No estás asignado a esta asignatura"];
  }

  const vinculo = await eaRepo.findOne({
    where: {
      estudiante_id: Number(estudianteId),
      asignatura_id: Number(asignaturaId),
    },
  });
  if (!vinculo)
    return [null, "El estudiante no está inscrito en esta asignatura"];

  await eaRepo.remove(vinculo);
  return [{ message: "Estudiante desasignado exitosamente" }, null];
}

export async function deleteEstudianteService(estudianteId) {
  const estudiante = await userRepo.findOne({
    where: { id: Number(estudianteId), rol: "Estudiante" },
  });
  if (!estudiante) return [null, "Estudiante no encontrado"];

  const vinculos = await eaRepo.find({
    where: { estudiante_id: Number(estudianteId) },
  });
  if (vinculos.length) await eaRepo.remove(vinculos);

  await userRepo.remove(estudiante);
  return [{ message: "Estudiante eliminado exitosamente" }, null];
}

export async function buscarEstudiantePorEmailService(email) {
  const user = await userRepo.findOne({
    where: { email, rol: "Estudiante" },
  });
  if (!user) return [null, null];
  const { password, ...publicUser } = user;
  return [publicUser, null];
}

export const obtenerNotasPorAsignatura = async (estudianteId, asignaturaId) => {
  const notas = await notaRepository.find({
    where: {
      estudiante: { id: estudianteId },
      evaluacion: {
        asignatura: { id: asignaturaId },
      },
    },
    relations: ["evaluacion", "evaluacion.asignatura"],
    order: {
      id: "ASC",
    },
  });

  return notas;
};

export const getAsignaturasInscritas = async (estudianteId) => {
  const inscripciones = await eaRepo.find({
    where: { estudiante: { id: estudianteId } },
    relations: ["asignatura"],
  });

  return inscripciones.map((inscripcion) => inscripcion.asignatura);
};

export const obtenerHistorialNotas = async (estudianteId) => {
  const historial = await notaRepository.find({
    where: {
      estudiante: { id: estudianteId },
    },
    relations: [
      "evaluacion",
      "evaluacion.asignatura",
      "evaluacion.profesor",
    ],
    order: {
      id: "DESC",
    },
    take: 20,
  });

  return historial;
};

export const obtenerEstadisticasEstudiante = async (estudianteId) => {
  const notas = await notaRepository.find({
    where: { estudiante: { id: estudianteId } },
    relations: ["evaluacion", "evaluacion.asignatura"],
  });

  if (!notas || notas.length === 0) {
    return {
      promedioGeneral: 0,
      totalEvaluaciones: 0,
      promedioPorAsignatura: [],
    };
  }

  const sumaTotal = notas.reduce((acc, curr) => acc + Number(curr.nota), 0);
  const promedioGeneral = sumaTotal / notas.length;

  const asignaturasMap = {};

  notas.forEach((registro) => {
    if (!registro.evaluacion || !registro.evaluacion.asignatura)
      return;

    const asignaturaNombre = registro.evaluacion.asignatura.nombre;
    const nota = Number(registro.nota);

    if (!asignaturasMap[asignaturaNombre]) {
      asignaturasMap[asignaturaNombre] = {
        suma: 0,
        cantidad: 0,
        codigo: registro.evaluacion.asignatura.codigo,
      };
    }

    asignaturasMap[asignaturaNombre].suma += nota;
    asignaturasMap[asignaturaNombre].cantidad += 1;
  });

  const promedioPorAsignatura = Object.keys(asignaturasMap).map((nombre) => {
    const datos = asignaturasMap[nombre];
    return {
      asignatura: nombre,
      codigo: datos.codigo,
      promedio: parseFloat((datos.suma / datos.cantidad).toFixed(1)),
      cantidadEvaluaciones: datos.cantidad,
    };
  });

  return {
    promedioGeneral: parseFloat(promedioGeneral.toFixed(1)),
    totalEvaluaciones: notas.length,
    promedioPorAsignatura: promedioPorAsignatura,
  };
};
