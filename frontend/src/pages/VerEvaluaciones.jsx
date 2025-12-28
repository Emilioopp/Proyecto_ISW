import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/root.service";
import { showSuccessAlert, showErrorAlert, deleteDataAlert, showQuestionAlert } from "../helpers/sweetAlert";
import { useAuth } from "../context/AuthContext";

const VerEvaluaciones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    cargarEvaluaciones();
    if (user?.rol === "Estudiante") {
      cargarInscripciones();
    }
  }, [id]);

  const cargarEvaluaciones = async () => {
    try {
      const response = await axios.get(
        `/evaluaciones/asignatura/${id}/`
      );

      if(response.data.status =="Success" || response.data){
        console.log(response.data);
        setEvaluaciones(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar evaluaciones", error);
    }
  };

  const cargarInscripciones = async () => {
    try {
      const response = await axios.get(`/evaluaciones/mis-inscripciones/${id}`);
      console.log("Inscripciones cargadas:", response.data.data);
      setInscripciones(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar inscripciones", error);
    }
  };

  const handleInscribirse = async (evaluacionId) => {
    try {
      await axios.post(`/evaluaciones/${evaluacionId}/inscribir`);
      showSuccessAlert("Éxito", "Te has inscrito a la evaluación");
      cargarInscripciones();
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || "No se pudo inscribir");
    }
  };

  const handleEliminar = async (evaluacionId) => {
    const confirmacion = showQuestionAlert("¿Estás seguro?", "Esta acción no se puede deshacer");
    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`/evaluaciones/${evaluacionId}`);
        showSuccessAlert("Eliminado", "La evaluación ha sido eliminada");
        cargarEvaluaciones();
      } catch (error) {
        showErrorAlert("Error", error.response?.data?.message || "No se pudo eliminar la evaluación");
      }
    }
  };

  const estaInscrito = (evaluacionId) => {
    return inscripciones.some(i => {
      const id = i.evaluacion_id || i.evaluacion?.id;
      return id === evaluacionId;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* TARJETA DE TÍTULO + VOLVER */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Evaluaciones de Asignatura
          </h1>
          <button
            onClick={() => navigate(`/asignaturas/${id}`)} // Volver al detalle
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Listado de Evaluaciones
          </h2>
          {evaluaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay evaluaciones registradas en esta asignatura.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">Título</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Sala</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{evaluacion.titulo}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          evaluacion.tipo === 'oral' ? 'bg-blue-100 text-blue-700' :
                          evaluacion.tipo === 'presencial' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {evaluacion.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {evaluacion.fecha_hora 
                          ? new Date(evaluacion.fecha_hora).toLocaleString()
                          : "Fecha no definida"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{evaluacion.sala || "-"}</td>
                      
                      {/* ACCIONES */}
                      <td className="px-4 py-3 flex gap-2">
                        {/* ACCIONES ESTUDIANTE */}
                        {user?.rol === "Estudiante" && (
                          estaInscrito(evaluacion.id) ? (
                            <button
                              className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold py-1 px-4 rounded-full text-sm"
                              onClick={() => navigate(`/evaluacion/detalle/${evaluacion.id}`)}
                            >
                              Ver detalle
                            </button>
                          ) : (
                            <button
                              className="bg-blue-500 text-white hover:bg-blue-600 font-semibold py-1 px-4 rounded-full text-sm"
                              onClick={() => handleInscribirse(evaluacion.id)}
                            >
                              Inscribirse
                            </button>
                          )
                        )}

                        {/* ACCIONES PROFESOR / ADMIN */}
                        {(user?.rol === "Profesor" || user?.rol === "Admin") && (
                            <>
                                <button
                                    onClick={() => navigate(`/evaluacion/detalle/${evaluacion.id}`)} // O una ruta de edición
                                    className="text-blue-500 hover:text-blue-700 font-bold text-sm"
                                >
                                    👁 Ver
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-700 font-bold text-sm ml-2"
                                    onClick={() => showQuestionAlert(evaluacion.id)}
                                    
                                >
                                    🗑 Eliminar
                                </button>
                            </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerEvaluaciones;