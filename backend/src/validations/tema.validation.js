import Joi from "joi";
//import { asignarProfesorAsignatura } from "../controllers/profesor.controller";

export const validarCrearTema = Joi.object({
    titulo: Joi.string().min(5).max(100).required(),
    descripcion: Joi.string().max(500).allow(""),
    materialUrl: Joi.string().uri().max(512).allow("").optional(),
    asignaturaIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});