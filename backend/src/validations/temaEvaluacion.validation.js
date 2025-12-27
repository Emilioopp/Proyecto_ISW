import Joi from "joi";

export const temaEvaluacionCreateSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150).required().messages({
    "any.required": "El título del tema es obligatorio"
  }),
  descripcion: Joi.string().allow(null, "").max(500),
  materialUrl: Joi.string().uri().max(512).allow(null, ""),
  
  // profesorId opcional porque viene del Token
  profesorId: Joi.number().integer().positive().optional(),
  
  asignaturaIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    "array.min": "Debes asociar el tema a al menos una asignatura"
  })
});

export const temaEvaluacionUpdateSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150),
  descripcion: Joi.string().allow(null, "").max(500),
  materialUrl: Joi.string().uri().max(512).allow(null, ""),
  asignaturaIds: Joi.array().items(Joi.number().integer().positive()).min(1)
}).min(1);

export function validateCreateTemaEvaluacion(payload) {
  return temaEvaluacionCreateSchema.validate(payload, { abortEarly: false, stripUnknown: true });
}

export function validateUpdateTemaEvaluacion(payload) {
  return temaEvaluacionUpdateSchema.validate(payload, { abortEarly: false, stripUnknown: true });
}