import axios from "./root.service";

export const getMisEstadisticas = async () => {
  try {
    const response = await axios.get("/estudiantes/mis-estadisticas");
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getMisAsignaturas = async () => {
  try {
    const response = await axios.get("/estudiantes/mis-asignaturas");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMisNotasPorAsignatura = async (asignaturaId) => {
  try {
    const response = await axios.get(`/estudiantes/mis-notas/${asignaturaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMiHistorial = async () => {
  try {
    const response = await axios.get("/estudiantes/mis-notas/historial");
    return response.data;
  } catch (error) {
    throw error;
  }
};
