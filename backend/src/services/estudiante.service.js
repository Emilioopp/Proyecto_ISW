import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { formatearRUT, extraerRutSinDigito } from "../validations/usuario.validation.js";

const userRepo = AppDataSource.getRepository(User.options.name);
const eaRepo = AppDataSource.getRepository(EstudianteAsignatura.options.name);
const paRepo = AppDataSource.getRepository(ProfesorAsignatura.options.name);

export async function inscribirEstudianteService(profesorId, asignaturaId, data) {
    // Verifica que el profesor este asignado a la asignatura
    const asignacionProfesor = await paRepo.findOne({
        where: { profesor_id: Number(profesorId), asignatura_id: Number(asignaturaId) },
    });
    if (!asignacionProfesor) {
        return [null, "El profesor no esta asignado a esta asignatura"];
    }

    // Busca usuario por email
    let user = await userRepo.findOne({ where: { email: data.email } });

    if (user) {
        // El estudiante ya existe
        if (user.rol !== "Estudiante") {
            return [null, "El email ya existe y pertenece a un usuario que no es Estudiante"];
        }
        // Verifica si ya esta inscrito en la asignatura
        const yaInscrito = await eaRepo.findOne({
            where: { estudiante_id: user.id, asignatura_id: Number(asignaturaId) },
        });
        if (yaInscrito) {
            return [null, "El estudiante ya esta inscrito en esta asignatura"];
        }
    } else {
        // El estudiante NO existe, debe crearse
        if (!data.nombre || !data.rut) {
            return [null, "Para crear un nuevo estudiante se requiere nombre y rut"];
        }

        // Normaliza datos del estudiante
        const rutFormateado = formatearRUT(data.rut);
        const passwordPlano = extraerRutSinDigito(data.rut);
        if (!passwordPlano || passwordPlano.length < 7) {
            return [null, "RUT invalido para generar contraseña inicial"];
        }
        const passwordHash = await bcrypt.hash(passwordPlano, 10);

        // Crea usuario estudiante
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

    // Vincula estudiante a la asignatura
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
    return [{ estudiante: publicUser, asignatura_id: Number(asignaturaId) }, null];
}

export async function getEstudiantesByAsignaturaService(profesorId, asignaturaId) {
    // Verifica asignacion del profesor
    const asignacionProfesor = await paRepo.findOne({
        where: { profesor_id: Number(profesorId), asignatura_id: Number(asignaturaId) },
    });
    if (!asignacionProfesor) {
        return [null, "El profesor no está asignado a esta asignatura"];
    }

    // Obtiene estudiantes con sus datos de usuario
    const vinculos = await eaRepo.find({
        where: { asignatura_id: Number(asignaturaId) },
        relations: ["estudiante"],
        order: { id: "ASC" },
    });

    const estudiantes = vinculos.map(v => {
        const { password, ...rest } = v.estudiante;
        return rest;
    });

    return [estudiantes, null];
}

export async function getEstudiantePerfilService(userId, estudianteId, rol) {
    // Estudiante ve solo su propio perfil
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
    const asignaturas = vinculos.map(v => v.asignatura);

    // Profesor valida que el estudiante este en alguna de sus asignaturas
    if (rol === "Profesor") {
        const aps = await paRepo.find({ where: { profesor_id: Number(userId) } });
        const ids = new Set(aps.map(ap => ap.asignatura_id));
        const autorizado = asignaturas.some(a => ids.has(a.id));
        if (!autorizado) return [null, "Este estudiante no está en tus asignaturas"];
    }

    const { password, ...publicEst } = estudiante;
    return [{ ...publicEst, asignaturas }, null];
}

export async function editarEstudianteService(userId, estudianteId, data, rol) {
    // Estudiante edita solo contraseña
    if (rol === "Estudiante") {
        return [null, "No puedes editar tu perfil aquí. Usa /api/profile/password"];
    }

    const estudiante = await userRepo.findOne({
        where: { id: Number(estudianteId), rol: "Estudiante" },
    });
    if (!estudiante) return [null, "Estudiante no encontrado"];

    // Admin puede cambiar email/nombre/rut/password
    if (data.email && data.email !== estudiante.email) {
        const existsEmail = await userRepo.findOne({ where: { email: data.email } });
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

export async function desasignarEstudianteAsignaturaService(userId, estudianteId, asignaturaId, rol) {
    if (rol === "Profesor") {
        const ap = await paRepo.findOne({
            where: { profesor_id: Number(userId), asignatura_id: Number(asignaturaId) },
        });
        if (!ap) return [null, "No estás asignado a esta asignatura"];
    }

    const vinculo = await eaRepo.findOne({
        where: { estudiante_id: Number(estudianteId), asignatura_id: Number(asignaturaId) },
    });
    if (!vinculo) return [null, "El estudiante no está inscrito en esta asignatura"];

    await eaRepo.remove(vinculo);
    return [{ message: "Estudiante desasignado exitosamente" }, null];
}

export async function deleteEstudianteService(estudianteId) {
    const estudiante = await userRepo.findOne({
        where: { id: Number(estudianteId), rol: "Estudiante" },
    });
    if (!estudiante) return [null, "Estudiante no encontrado"];

    const vinculos = await eaRepo.find({ where: { estudiante_id: Number(estudianteId) } });
    if (vinculos.length) await eaRepo.remove(vinculos);
    
    await userRepo.remove(estudiante);
    return [{ message: "Estudiante eliminado exitosamente" }, null];
}

export async function buscarEstudiantePorEmailService(email) {
    const user = await userRepo.findOne({ 
        where: { email, rol: "Estudiante" } 
    });
    if (!user) return [null, null];
    const { password, ...publicUser } = user;
    return [publicUser, null];
}