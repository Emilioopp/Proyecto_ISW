import Joi from "joi";

const email = Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(255)
    .messages({
        "string.email": "email no tiene un formato válido",
        "string.max": "email no debe superar 255 caracteres",
        "string.empty": "email es requerido",
});

const password = Joi.string()
    .trim()
    .min(6)
    .max(60)
    .messages({
        "string.min": "password debe tener al menos 6 caracteres",
        "string.max": "password no debe superar 60 caracteres",
        "string.empty": "password es requerido",
});

const nameLike = Joi.string()
    .trim()
    .pattern(/^[A-Za-zÀ-ÿ'\-\s]{1,100}$/)
    .messages({
        "string.pattern.base": "Solo letras, espacios, guion y apóstrofe; max 100 caracteres",
        "string.empty": "No debe estar vacío",
});

const registerSchema = Joi.object({
    email: email.required(),
    password: password.required(),
    firstName: nameLike.optional(),
    lastName: nameLike.optional(),
}).unknown(false);

const loginSchema = Joi.object({
    email: email.required(),
    password: password.required(),
}).unknown(false);

const updateSchema = Joi.object({
    email: email.optional(),
    password: password.optional(),
    firstName: nameLike.optional(),
    lastName: nameLike.optional(),
    })
    .or("email", "password", "firstName", "lastName")
    .messages({
    "object.missing": "Se debe enviar al menos un campo para actualizar (email, password, firstName o lastName)",
    })
    .unknown(false);

function buildResult(error, value) {
    return {
        valid: !error,
        errors: error ? error.details.map((d) => d.message) : [],
        value,
    };
}

export function validateUserRegistration(payload = {}) {
    const { error, value } = registerSchema.validate(payload, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUserLogin(payload = {}) {
    const { error, value } = loginSchema.validate(payload, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUserUpdate(payload = {}) {
    const { error, value } = updateSchema.validate(payload, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUserDelete(payload = {}) {
    return { valid: true, errors: [], value: {} };
}

export function buildValidationErrorResponse(res, errors, status = 400) {
    return res.status(status).json({
        message: "Datos inválidos",
        errors,
        status: "Client error",
    });
}
