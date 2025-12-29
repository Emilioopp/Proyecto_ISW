import axios from "./root.service";

export const getEvaluacionDetalle = async (id) => {
  const response = await axios.get(`/evaluaciones-orales/${id}/registros`);
  return response.data;
};

export const getNotasDeEvaluacion = async (id) => {
  const response = await axios.get(`/evaluaciones-orales/${id}/registros`);
  return response.data;
};

// Alias para compatibilidad con pantallas antiguas
export const getNotasByEvaluacion = async (id) => {
  const response = await axios.get(`/evaluaciones-orales/${id}/registros`);
  return response.data;
};

export const getEstudiantesAsignatura = async (asignaturaId) => {
  const response = await axios.get(`/asignaturas/${asignaturaId}/estudiantes`);
  return response.data;
};

export const registrarNota = async (evaluacionId, data) => {
  const response = await axios.post(
    `/evaluaciones-orales/${evaluacionId}/registro`,
    data
  );
  return response.data;
};

export const updateNota = async (notaId, data) => {
  const response = await axios.put(
    `/evaluaciones-orales/notas/${notaId}`,
    data
  );
  return response.data;
};

export const deleteNota = async (notaId) => {
  const response = await axios.delete(`/evaluaciones-orales/notas/${notaId}`);
  return response.data;
};

export const deleteEvaluacion = async (evaluacionId) => {
  const response = await axios.delete(
    `/evaluaciones-orales/${evaluacionId}`
  );
  return response.data;
};
