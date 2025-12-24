import {
  crearAsignaturaService,
  getAsignaturasService,
  getAsignaturaByIdService,
  updateAsignaturaService,
  deleteAsignaturaService,
} from "../services/asignatura.service.js";

import {
  validateCrearAsignatura,
  validateUpdateAsignatura,
} from "../validations/asignatura.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../Handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";

import { EstudianteAsignatura } from "../entities/EstudianteAsignatura.entity.js";

export async function crearAsignatura(req, res) {
  try {
    // Valida datos de entrada
    const { valid, errors, value } = validateCrearAsignatura(req.body);

    if (!valid) {
      return handleErrorClient(res, 400, "Errores de validación", errors);
    }

    // Crea asignatura
    const [asignatura, error] = await crearAsignaturaService(value);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 201, "Asignatura creada exitosamente", asignatura);
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function getAsignaturas(req, res) {
  try {
    const [asignaturas, error] = await getAsignaturasService();

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    handleSuccess(res, 200, "Asignaturas obtenidas exitosamente", asignaturas);
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function getAsignaturaById(req, res) {
  try {
    const { id } = req.params;

    const [asignatura, error] = await getAsignaturaByIdService(parseInt(id));

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    handleSuccess(res, 200, "Asignatura obtenida exitosamente", asignatura);
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function updateAsignatura(req, res) {
  try {
    const { id } = req.params;

    // Valida datos de entrada
    const { valid, errors, value } = validateUpdateAsignatura(req.body);

    if (!valid) {
      return handleErrorClient(res, 400, "Errores de validación", errors);
    }

    // Actualiza asignatura
    const [asignatura, error] = await updateAsignaturaService(
      parseInt(id),
      value
    );

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 200, "Asignatura actualizada exitosamente", asignatura);
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function deleteAsignatura(req, res) {
  try {
    const { id } = req.params;

    const [result, error] = await deleteAsignaturaService(parseInt(id));

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 200, "Asignatura eliminada exitosamente", result);
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export const getEstudiantesEnAsignatura = async (req, res) => {
  try {
    const { id } = req.params;
    const eaRepo = AppDataSource.getRepository(EstudianteAsignatura);

    const inscripciones = await eaRepo.find({
      where: { asignatura: { id: parseInt(id) } },
      relations: ["estudiante"],
    });

    const estudiantes = inscripciones.map((ins) => ins.estudiante);

    res.json({ status: "Success", data: estudiantes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error", message: error.message });
  }
};
