"use strict";

export const handleSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    message,
    data,
    status: "Success",
  });
};

export const handleError = (res, error) => {
  const statusCode = Number(error?.statusCode);

  if (error?.name === "ValidationError" || statusCode === 400) {
    return handleErrorClient(res, 400, error.message);
  }

  if (!Number.isNaN(statusCode) && statusCode >= 400 && statusCode < 500) {
    return handleErrorClient(res, statusCode, error.message);
  }

  return handleErrorServer(res, error);
};

export const handleErrorClient = (
  res,
  statusCode,
  message,
  errorDetails = null
) => {
  res.status(statusCode).json({
    message,
    errorDetails,
    status: "Client error",
  });
};

export const handleErrorServer = (res, error) => {
  console.error("Server Error:", error);

  const statusCode = Number(error?.statusCode);
  const code = !Number.isNaN(statusCode) && statusCode >= 500 ? statusCode : 500;

  res.status(code).json({
    message: "Error interno del servidor",
    errorDetails: error?.message || error,
    status: "Server error",
  });
};