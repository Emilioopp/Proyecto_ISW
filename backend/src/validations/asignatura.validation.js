import Joi from "joi";

const codigo = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9]{3,10}$/)
    .required()
    .messages({
        "string.pattern.base": "código debe tener entre 3-10 caracteres alfanuméricos en mayúsculas",
        "string.empty": "código es requerido",
    });

const nombre = Joi.string()
    .trim()
    .min(3)
    .max(255)
    .required()
    .messages({
        "string.min": "nombre debe tener al menos 3 caracteres",
        "string.max": "nombre no debe superar 255 caracteres",
        "string.empty": "nombre es requerido",
    });

// Esquemas de validación

const createSchema = Joi.object({
    codigo: codigo.required(),
    nombre: nombre.required(),
}).unknown(false);

const updateSchema = Joi.object({
    codigo: codigo.optional(),
    nombre: nombre.optional(),
})
    .or("codigo", "nombre")
    .messages({
        "object.missing": "Se debe enviar al menos un campo para actualizar",
    })
    .unknown(false);


function buildResult(error, value) {
    return {
        valid: !error,
        errors: error ? error.details.map((d) => d.message) : [],
        value,
    };
}

export function validateCrearAsignatura(data) {
    const { error, value } = createSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUpdateAsignatura(data) {
    const { error, value } = updateSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}