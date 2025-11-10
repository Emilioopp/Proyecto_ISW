import { handleErrorClient, handleErrorServer, handleSuccess } from "../Handlers/responseHandlers.js";
import { validateInscribirEstudiante } from "../validations/usuario.validation.js";
import { inscribirEstudianteService, getEstudiantesByAsignaturaService } from "../services/estudiante.service.js";

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