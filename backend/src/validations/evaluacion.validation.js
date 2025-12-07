import Joi from "joi";

export const evaluacionSchema = Joi.object({
  titulo: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.empty": "El título no puede estar vacío",
      "string.min": "El título debe tener al menos 3 caracteres",
      "string.max": "El título no puede exceder 255 caracteres",
      "any.required": "El título es obligatorio",
    }),

  descripcion: Joi.string()
    .allow("")
    .max(1000)
    .optional()
    .messages({
      "string.max": "La descripción no puede exceder 1000 caracteres",
    }),

  tipo: Joi.string()
    .valid("oral", "presencial", "entregable")
    .default("oral")
    .messages({
      "any.only": "El tipo debe ser: oral, presencial o entregable",
    }),

  fecha_hora: Joi.date()
    .optional()
    .messages({
      "date.base": "La fecha y hora deben ser válidas",
    }),

  lugar: Joi.string()
    .max(255)
    .optional()
    .messages({
      "string.max": "El lugar no puede exceder 255 caracteres",
    }),

  duracion_minutos: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "La duración debe ser un número",
      "number.integer": "La duración debe ser un número entero",
      "number.min": "La duración debe ser al menos 1 minuto",
    }),

  cupos_disponibles: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Los cupos deben ser un número",
      "number.integer": "Los cupos deben ser un número entero",
      "number.min": "Debe haber al menos 1 cupo disponible",
    }),

  estado: Joi.string()
    .valid("programada", "en_curso", "finalizada", "cancelada")
    .default("programada")
    .optional()
    .messages({
      "any.only": "El estado debe ser: programada, en_curso, finalizada o cancelada",
    }),
}).options({ abortEarly: false, allowUnknown: true });

export const actualizarEvaluacionSchema = Joi.object({
  titulo: Joi.string()
    .min(3)
    .max(255)
    .optional()
    .messages({
      "string.empty": "El título no puede estar vacío",
      "string.min": "El título debe tener al menos 3 caracteres",
      "string.max": "El título no puede exceder 255 caracteres",
    }),

  descripcion: Joi.string()
    .allow("")
    .max(1000)
    .optional()
    .messages({
      "string.max": "La descripción no puede exceder 1000 caracteres",
    }),

  tipo: Joi.string()
    .valid("oral", "presencial", "entregable")
    .optional()
    .messages({
      "any.only": "El tipo debe ser: oral, presencial o entregable",
    }),

  fecha_hora: Joi.date()
    .optional()
    .messages({
      "date.base": "La fecha y hora deben ser válidas",
    }),

  lugar: Joi.string()
    .max(255)
    .optional()
    .messages({
      "string.max": "El lugar no puede exceder 255 caracteres",
    }),

  duracion_minutos: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "La duración debe ser un número",
      "number.integer": "La duración debe ser un número entero",
      "number.min": "La duración debe ser al menos 1 minuto",
    }),

  cupos_disponibles: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Los cupos deben ser un número",
      "number.integer": "Los cupos deben ser un número entero",
      "number.min": "Debe haber al menos 1 cupo disponible",
    }),

  estado: Joi.string()
    .valid("programada", "en_curso", "finalizada", "cancelada")
    .optional()
    .messages({
      "any.only": "El estado debe ser: programada, en_curso, finalizada o cancelada",
    }),
}).options({ abortEarly: false, allowUnknown: false });
