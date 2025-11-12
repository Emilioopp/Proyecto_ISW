"use strict";

export const handleSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    message,
    data,
    status: "Success",
  });
};

export const handleError = (res, error) => {
  if (error.name === "ValidationError" || error.statusCode === 400) {
    return handleErrorClient(res, 400, error.message);
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

  res.status(500).json({
    message: "Error interno del servidor",
    errorDetails: error?.message || error,
    status: "Server error",
  });
};
