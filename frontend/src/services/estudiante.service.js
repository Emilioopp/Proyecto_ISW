import axios from "./root.service";

export const getMisEstadisticas = async () => {
  try {
    const response = await axios.get("/estudiantes/mis-estadisticas");
    return response.data;
  } catch (error) {
    throw error;
  }
};
