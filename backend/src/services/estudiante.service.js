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

    // Normaliza datos del estudiante
    const rutFormateado = formatearRUT(data.rut);
    const passwordPlano = extraerRutSinDigito(data.rut);
    if (!passwordPlano || passwordPlano.length < 7) {
        return [null, "RUT invalido para generar contraseña inicial"];
    }
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    // Busca usuario por email
    let user = await userRepo.findOne({ where: { email: data.email } });

    if (user) {
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