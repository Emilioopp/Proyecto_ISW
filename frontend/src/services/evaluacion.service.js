import axios from "./root.service";

export const getEvaluacionDetalle = async (id) => {
  const response = await axios.get(`/evaluaciones/${id}/registros`);
  return response.data;
};

export const getNotasDeEvaluacion = async (id) => {
  const response = await axios.get(`/evaluaciones/${id}/registros`);
  return response.data;
};

export const getEstudiantesAsignatura = async (asignaturaId) => {
  const response = await axios.get(`/asignaturas/${asignaturaId}/estudiantes`);
  return response.data;
};

export const registrarNota = async (evaluacionId, data) => {
  const response = await axios.post(
    `/evaluaciones/${evaluacionId}/registro`,
    data
  );
  return response.data;
};

export const updateNota = async (notaId, data) => {
  const response = await axios.put(
    `/evaluaciones/notas/${notaId}`,
    data
  );
  return response.data;
};

export const deleteNota = async (notaId) => {
  const response = await axios.delete(`/evaluaciones/notas/${notaId}`);
  return response.data;
};
