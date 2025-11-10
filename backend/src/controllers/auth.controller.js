import { loginUser } from "../services/auth.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { validateUserLogin } from "../validations/usuario.validation.js";

export async function login(req, res) {
  try {
    const { valid, errors, value } = validateUserLogin(req.body);
    if (!valid) {
      return handleErrorClient(res, 400, "Errores de validación", errors);
    }
    
    const data = await loginUser(value.email, value.password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}