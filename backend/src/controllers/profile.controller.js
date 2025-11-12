import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";
import { ProfesorAsignatura } from "../entities/ProfesorAsignatura.entity.js";
import { validateCambiarPassword } from "../validations/usuario.validation.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

const userRepo = AppDataSource.getRepository(User.options.name);
const eaRepo = AppDataSource.getRepository(EstudianteAsignatura.options.name);
const paRepo = AppDataSource.getRepository(ProfesorAsignatura.options.name);

export async function getMiPerfil(req, res) {
  try {
    const userId = req.user?.sub;
    const rol = req.user?.rol;

    if (!userId) return handleErrorClient(res, 401, "No autenticado");

    const usuario = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!usuario) return handleErrorClient(res, 404, "Usuario no encontrado");

    // Base de respuesta (ocultar password)
    const { password, ...publicUser } = usuario;
    const perfil = { ...publicUser };

    if (rol === "Estudiante") {
      const vinculos = await eaRepo.find({
        where: { estudiante_id: Number(userId) },
        relations: ["asignatura"],
        order: { id: "ASC" },
      });
      perfil.asignaturas = vinculos.map(v => v.asignatura);
    } else if (rol === "Profesor") {
      const vinculos = await paRepo.find({
        where: { profesor_id: Number(userId) },
        relations: ["asignatura"],
        order: { id: "ASC" },
      });
      perfil.asignaturas = vinculos.map(v => v.asignatura);
    } else {
      perfil.asignaturas = []; // Admin: sin lista por defecto
    }

    return handleSuccess(res, 200, "Perfil obtenido exitosamente", perfil);
  } catch (error) {
    return handleErrorServer(res, 500, "Error al obtener perfil", error.message);
  }
}

export async function cambiarMiPassword(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return handleErrorClient(res, 401, "No autenticado");

    const { valid, errors, value } = validateCambiarPassword(req.body);
    if (!valid) return handleErrorClient(res, 400, "Errores de validación", errors);

    const usuario = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!usuario) return handleErrorClient(res, 404, "Usuario no encontrado");

    const coincide = await bcrypt.compare(value.passwordActual, usuario.password);
    if (!coincide) return handleErrorClient(res, 400, "Contraseña actual incorrecta");

    const mismaPassword = await bcrypt.compare(value.passwordNueva, usuario.password);
    if (mismaPassword) return handleErrorClient(res, 400, "La nueva contraseña no puede ser igual a la anterior");

    usuario.password = await bcrypt.hash(value.passwordNueva, 10);
    await userRepo.save(usuario);

    return handleSuccess(res, 200, "Contraseña actualizada exitosamente", { actualizado: true });
  } catch (error) {
    return handleErrorServer(res, 500, "Error al cambiar contraseña", error.message);
  }
}