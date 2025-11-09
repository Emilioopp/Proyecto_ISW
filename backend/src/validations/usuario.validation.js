import Joi from "joi";

export function formatearRUT(rut) {
    const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    
    let cuerpoFormateado = '';
    for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) {
            cuerpoFormateado = '.' + cuerpoFormateado;
        }
        cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    }
    
    return `${cuerpoFormateado}-${dv}`;
}

export function extraerRutSinDigito(rut) {
    const limpio = rut.replace(/[^0-9]/g, '');
    return limpio.slice(0, -1);
}

const emailGenerico = Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(255)
    .messages({
        "string.email": "email no tiene un formato válido",
        "string.max": "email no debe superar 255 caracteres",
        "string.empty": "email es requerido",
    });

const emailEstudiante = Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .pattern(/@alumnos\.ubiobio\.cl$/)
    .max(255)
    .messages({
        "string.email": "email no tiene un formato válido",
        "string.pattern.base": "email de estudiante debe terminar en @alumnos.ubiobio.cl",
        "string.max": "email no debe superar 255 caracteres",
        "string.empty": "email es requerido",
    });

const emailAdmin = Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .pattern(/@ubiobio\.cl$/)
    .custom((value, helpers) => {
        if (value.endsWith("@alumnos.ubiobio.cl")) {
            return helpers.error("email.admin.invalid");
        }
        return value;
    })
    .max(255)
    .messages({
        "string.email": "email no tiene un formato válido",
        "string.pattern.base": "email de administrador debe terminar en @ubiobio.cl",
        "string.max": "email no debe superar 255 caracteres",
        "string.empty": "email es requerido",
        "email.admin.invalid": "email de administrador no puede ser @alumnos.ubiobio.cl",
    });

const password = Joi.string()
    .trim()
    .min(8)
    .max(60)
    .messages({
        "string.min": "password debe tener al menos 8 caracteres",
        "string.max": "password no debe superar 60 caracteres",
        "string.empty": "password es requerido",
});

const nombre = Joi.string()
    .trim()
    .pattern(/^[A-Za-zÀ-ÿ'\-\s]{1,255}$/)
    .required()
    .messages({
        "string.pattern.base": "nombre solo permite letras, espacios, guion y apóstrofe; máx 255 caracteres",
        "string.empty": "nombre es requerido",
    });

const rut = Joi.string()
    .trim()
    .pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]$/)
    .custom((value, helpers) => {
        if (!validarRUT(value)) {
            return helpers.error("rut.invalid");
        }
        return value;
    })
    .required()
    .messages({
        "string.pattern.base": "RUT debe tener formato válido (ej: 12.345.678-9)",
        "string.empty": "RUT es requerido",
        "rut.invalid": "RUT ingresado no es válido (dígito verificador incorrecto)",
    });

const rol = Joi.string()
    .valid("Admin", "Profesor", "Estudiante")
    .required()
    .messages({
        "any.only": "rol debe ser Admin, Profesor o Estudiante",
        "string.empty": "rol es requerido",
    });

// Esquemas de validación

const registerSchema = Joi.object({
    email: Joi.when('rol', {
        is: 'Admin',
        then: emailAdmin.required(),
        otherwise: Joi.when('rol', {
            is: 'Estudiante',
            then: emailEstudiante.required(),
            otherwise: emailGenerico.required(),
        })
    }),
    password: password.required(),
    nombre: nombre.required(),
    rut: rut.required(),
    rol: rol.required(),
}).unknown(false);

const loginSchema = Joi.object({
    email: emailGenerico.required(),
    password: password.required(),
}).unknown(false);

const updateSchema = Joi.object({
    email: emailGenerico.optional(),
    password: password.optional(),
    nombre: nombre.optional(),
    rut: rut.optional(),
    rol: rol.optional(),
})
    .or("email", "password", "nombre", "rut", "rol")
    .messages({
        "object.missing": "Se debe enviar al menos un campo para actualizar",
    })
    .unknown(false);

const inscribirEstudianteSchema = Joi.object({
    email: emailEstudiante.required(),
    nombre: nombre.required(),
    rut: rut.required(),
}).unknown(false);

function buildResult(error, value) {
    return {
        valid: !error,
        errors: error ? error.details.map((d) => d.message) : [],
        value,
    };
}

export function validateUserRegistration(data) {
    const { error, value } = registerSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUserLogin(data) {
    const { error, value } = loginSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}

export function validateUserUpdate(data) {
    const { error, value } = updateSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}

export function validateInscribirEstudiante(data) {
    const { error, value } = inscribirEstudianteSchema.validate(data, { abortEarly: false });
    return buildResult(error, value);
}