import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { validateUserLogin, validateUserRegistration, buildValidationErrorResponse } from "../validations/usuario.validation.js";

export async function login(req, res) {
  try {
    const { valid, errors, value } = validateUserLogin(req.body);
    if (!valid) {
      return buildValidationErrorResponse(res, errors, 400);
    }
    
    const data = await loginUser(value.email, value.password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const { valid, errors, value } = validateUserRegistration(req.body);
    if (!valid) {
      return buildValidationErrorResponse(res, errors, 400);
    }
    
    const newUser = await createUser(value);
    delete newUser.password;
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    if (error.code === '23505') { 
      handleErrorClient(res, 409, "El email ya está registrado");
    } else {
      handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}
