import { handleErrorClient, handleErrorServer, handleSuccess } from "../Handlers/responseHandlers.js";
import { validateInscribirEstudiante, validateCambiarPassword } from "../validations/usuario.validation.js";
import { 
    inscribirEstudianteService, 
    getEstudiantesByAsignaturaService,
    getEstudiantePerfilService,
    editarEstudianteService,
    desasignarEstudianteAsignaturaService,
    deleteEstudianteService,
    buscarEstudiantePorEmailService
} from "../services/estudiante.service.js";

export async function inscribirEstudiante(req, res) {
    try {
        const { asignaturaId, ...estudianteData } = req.body;
        if (!asignaturaId || isNaN(Number(asignaturaId))) {
            return handleErrorClient(res, 400, "El campo asignaturaId es requerido y debe ser numerico");
        }

        const { valid, errors, value } = validateInscribirEstudiante(estudianteData);
        if (!valid) {
            return handleErrorClient(res, 400, "Errores de validacion", errors);
        }

        const profesorId = req.user.sub;
        const [result, error] = await inscribirEstudianteService(profesorId, Number(asignaturaId), value);
        if (error) {
            return handleErrorClient(res, 400, error);
        }

        return handleSuccess(res, 201, "Estudiante inscrito exitosamente", result);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al inscribir estudiante", error.message);
    }
}

export async function getEstudiantesByAsignatura(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return handleErrorClient(res, 400, "ID de asignatura inválido");
        }
        const profesorId = req.user.sub;
        const [estudiantes, error] = await getEstudiantesByAsignaturaService(profesorId, Number(id));
        if (error) {
            return handleErrorClient(res, 400, error);
        }
        return handleSuccess(res, 200, "Estudiantes obtenidos exitosamente", estudiantes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener estudiantes", error.message);
    }
}

export async function getEstudiantePerfil(req, res) {
    try {
        const { id } = req.params;
        const [perfil, error] = await getEstudiantePerfilService(req.user.sub, Number(id), req.user.rol);
        if (error) return handleErrorClient(res, 400, error);
        return handleSuccess(res, 200, "Perfil de estudiante obtenido", perfil);
    } catch (e) {
        return handleErrorServer(res, e);
    }
}

export async function editarEstudiante(req, res) {
    try {
        const { id } = req.params;
        const [estudiante, error] = await editarEstudianteService(req.user.sub, Number(id), req.body, req.user.rol);
        if (error) return handleErrorClient(res, 400, error);
        return handleSuccess(res, 200, "Estudiante actualizado", estudiante);
    } catch (e) {
        return handleErrorServer(res, e);
    }
}

export async function desasignarEstudianteAsignatura(req, res) {
    try {
        const { estudianteId, asignaturaId } = req.body;
        if (!estudianteId || !asignaturaId) {
            return handleErrorClient(res, 400, "estudianteId y asignaturaId son requeridos");
        }
        const [result, error] = await desasignarEstudianteAsignaturaService(
            req.user.sub, Number(estudianteId), Number(asignaturaId), req.user.rol
        );
        if (error) return handleErrorClient(res, 400, error);
        return handleSuccess(res, 200, "Estudiante desasignado", result);
    } catch (e) {
        return handleErrorServer(res, e);
    }
}

export async function deleteEstudiante(req, res) {
    try {
        const { id } = req.params;
        const [result, error] = await deleteEstudianteService(Number(id));
        if (error) return handleErrorClient(res, 400, error);
        return handleSuccess(res, 200, "Estudiante eliminado", result);
    } catch (e) {
        return handleErrorServer(res, e);
    }
}

export async function buscarEstudiantePorEmail(req, res) {
    try {
        const { email } = req.params;
        const [estudiante, error] = await buscarEstudiantePorEmailService(email);
        if (!estudiante) {
            return handleSuccess(res, 200, "Estudiante no encontrado", { existe: false });
        }
        return handleSuccess(res, 200, "Estudiante encontrado", { existe: true, estudiante });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al buscar estudiante", error.message);
    }
}