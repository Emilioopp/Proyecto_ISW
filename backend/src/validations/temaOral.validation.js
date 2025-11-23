import Joi from "joi";
//import { asignarProfesorAsignatura } from "../controllers/profesor.controller";

export const temaOralCreateSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150).required(),
  descripcion: Joi.string().allow(null, "").max(500),
  materialUrl: Joi.string().uri().max(512).allow(null, ""),
  profesorId: Joi.number().integer().positive().required(),
  asignaturaIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

export const temaOralUpdateSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150),
  descripcion: Joi.string().allow(null, "").max(500),
  materialUrl: Joi.string().uri().max(512).allow(null, ""),
  profesorId: Joi.number().integer().positive(),
  asignaturaIds: Joi.array().items(Joi.number().integer().positive()).min(1)
}).min(1);

export function validateCreateTemaOral(payload) {
  return temaOralCreateSchema.validate(payload, { abortEarly: false, stripUnknown: true });
}

export function validateUpdateTemaOral(payload) {
  return temaOralUpdateSchema.validate(payload, { abortEarly: false, stripUnknown: true });
}