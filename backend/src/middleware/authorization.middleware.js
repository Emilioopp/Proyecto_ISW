import { handleErrorClient } from "../Handlers/responseHandlers.js";

// Verifica que el usuario tenga un rol permitido (Admin, Profesor, Estudiante)
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
    if (!req.user) {
        return handleErrorClient(res, 401, "No autenticado");
    }

    if (!roles.includes(req.user.rol)) {
        console.warn(`authorizeRoles: acceso denegado. ruta=${req.method} ${req.originalUrl} userRol=${req.user?.rol} required=${roles.join(", ")}`);
        return handleErrorClient(res, 403, `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(", ")}`);
    }

    next();
    };
};