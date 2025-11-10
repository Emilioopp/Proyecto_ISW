import {
    crearProfesorService,
    asignarProfesorAsignaturaService,
    desasignarProfesorAsignaturaService,
    getProfesoresService,
    getProfesorByIdService,
    updateProfesorService,
    deleteProfesorService,
} from "../services/profesor.service.js";

import { validateCrearProfesor, validateUserUpdate } from "../validations/usuario.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../Handlers/responseHandlers.js";

export async function crearProfesor(req, res) {
    try {
        const { valid, errors, value } = validateCrearProfesor(req.body);

        if (!valid) {
            return handleErrorClient(res, 400, "Errores de validación", errors);
        }

        const [profesor, error] = await crearProfesorService(value);

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        handleSuccess(res, 201, "Profesor creado exitosamente", profesor);
    } catch (error) {
        handleErrorServer(res, 500, "Error al crear profesor", error.message);
    }
}

export async function asignarProfesorAsignatura(req, res) {
    try {
        const { profesorId, asignaturaId } = req.body;

        if (!profesorId || !asignaturaId) {
            return handleErrorClient(res, 400, "profesorId y asignaturaId son requeridos");
        }

        const [asignacion, error] = await asignarProfesorAsignaturaService(profesorId, asignaturaId);

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        handleSuccess(res, 201, "Profesor asignado a asignatura exitosamente", asignacion);
    } catch (error) {
        handleErrorServer(res, 500, "Error al asignar profesor", error.message);
    }
}

export async function desasignarProfesorAsignatura(req, res) {
    try {
        const { profesorId, asignaturaId } = req.body;

        if (!profesorId || !asignaturaId) {
            return handleErrorClient(res, 400, "profesorId y asignaturaId son requeridos");
        }

        const [result, error] = await desasignarProfesorAsignaturaService(profesorId, asignaturaId);

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        handleSuccess(res, 200, "Profesor desasignado exitosamente", result);
    } catch (error) {
        handleErrorServer(res, 500, "Error al desasignar profesor", error.message);
    }
}

export async function getProfesores(req, res) {
    try {
        const [profesores, error] = await getProfesoresService();

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        handleSuccess(res, 200, "Profesores obtenidos exitosamente", profesores);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener profesores", error.message);
    }
}

export async function getProfesorById(req, res) {
    try {
        const { id } = req.params;

        const [profesor, error] = await getProfesorByIdService(parseInt(id));

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        handleSuccess(res, 200, "Profesor obtenido exitosamente", profesor);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener profesor", error.message);
    }
}

export async function updateProfesor(req, res) {
    try {
        const { id } = req.params;

        const { valid, errors, value } = validateUserUpdate(req.body);

        if (!valid) {
            return handleErrorClient(res, 400, "Errores de validación", errors);
        }

        const [profesor, error] = await updateProfesorService(parseInt(id), value);

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        handleSuccess(res, 200, "Profesor actualizado exitosamente", profesor);
    } catch (error) {
        handleErrorServer(res, 500, "Error al actualizar profesor", error.message);
    }
}

export async function deleteProfesor(req, res) {
    try {
        const { id } = req.params;

        const [result, error] = await deleteProfesorService(parseInt(id));

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        handleSuccess(res, 200, "Profesor eliminado exitosamente", result);
    } catch (error) {
        handleErrorServer(res, 500, "Error al eliminar profesor", error.message);
    }
}