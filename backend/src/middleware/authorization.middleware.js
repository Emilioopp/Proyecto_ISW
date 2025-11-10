import { handleErrorClient } from "../Handlers/responseHandlers.js";

// Verifica que el usuario tenga un rol permitido (Admin, Profesor, Estudiante)
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
    if (!req.user) {
        return handleErrorClient(res, 401, "No autenticado");
    }

    if (!roles.includes(req.user.rol)) {
        return handleErrorClient(res, 403, 
        `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(", ")}`
        );
    }

    next();
    };
};