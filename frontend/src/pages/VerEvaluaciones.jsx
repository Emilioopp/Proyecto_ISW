import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Asegúrate de importar tu instancia de axios configurada o el servicio específico
import axios from "../services/root.service"; 
import { showSuccessAlert, showErrorAlert, showQuestionAlert } from "../helpers/sweetAlert";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const VerEvaluaciones = () => {
  const { id } = useParams(); // ID de la Asignatura
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, [id]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/evaluaciones-orales/${id}/evaluaciones-orales`);

      if (response.data || response.data.data) {
        // Soporte para ambas estructuras de respuesta (data.data o data directo)
        setEvaluaciones(response.data.data || response.data || []);
      }
    } catch (error) {
      console.error("Error al cargar evaluaciones orales", error);
      
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (evaluacionId) => {
    
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará la evaluación oral y todos sus horarios asignados. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/evaluaciones-orales/${evaluacionId}`);
        
        await Swal.fire({
            title: "Eliminado",
            text: "La evaluación ha sido eliminada correctamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        cargarEvaluaciones(); 
      } catch (error) {
        console.error(error);
        Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            🗣️ Evaluaciones Orales
          </h1>
          <button
            onClick={() => navigate(`/asignaturas/${id}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Listado de Evaluaciones Orales
          </h2>

          {loading ? (
             <p className="text-center py-4">Cargando...</p>
          ) : evaluaciones.length === 0 ? (
            <div className="text-center py-8">
                <p className="text-gray-500 text-lg mb-4">No hay evaluaciones orales registradas.</p>
                {/* Botón opcional para ir a crear si está vacío */}
                <button 
                    onClick={() => navigate(`/asignaturas/${id}`)}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Volver para crear una
                </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">Título / Descripción</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Temas a Evaluar</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Lugar</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.id} className="border-b hover:bg-gray-50 transition-colors">
                      
                      {/* TÍTULO Y DESCRIPCIÓN */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{evaluacion.titulo}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                            {evaluacion.descripcion || "Sin descripción"}
                        </p>
                      </td>

                      {/* TEMAS (Aquí está la diferencia principal visual) */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                            {evaluacion.temas && evaluacion.temas.length > 0 ? (
                                evaluacion.temas.map((tema, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold border border-purple-200">
                                        {tema.titulo || tema.nombre}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">Sin temas definidos</span>
                            )}
                        </div>
                      </td>

                      {/* SALA */}
                      <td className="px-4 py-3 text-gray-600">
                        {evaluacion.sala ? `📍 ${evaluacion.sala}` : "-"}
                      </td>
                      
                      {/* ACCIONES */}
                      <td className="px-4 py-3 flex gap-2 items-center">
                        <button
                            onClick={() => navigate(`/evaluacion-oral/detalle/${evaluacion.id}`)}
                            className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full transition"
                        >
                            👁 Ver
                        </button>

                        {(user?.rol === "Profesor" || user?.rol === "Admin") && (
                            <button
                                className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-full transition ml-2"
                                onClick={() => handleEliminar(evaluacion.id)}
                            >
                                🗑 Eliminar
                            </button>
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