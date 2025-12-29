import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert } from "../helpers/sweetAlert";

const ListaEvaluacionesPracticasEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asignatura, setAsignatura] = useState(null);

  useEffect(() => {
    cargarAsignatura();
    cargarEvaluaciones();
  }, [id]);

  const cargarAsignatura = async () => {
    try {
      const response = await axios.get(`/asignaturas/${id}`);
      if (response.data.status === "Success") {
        setAsignatura(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar asignatura", error);
    }
  };

  const cargarEvaluaciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/evaluaciones-practicas/publicas?asignaturaId=${Number(id)}`
      );
      if (response.data.status === "Success") {
        setEvaluaciones(response.data.data);
      } else {
        setEvaluaciones([]);
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudieron cargar las evaluaciones"
      );
      setEvaluaciones([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📝 Evaluaciones Prácticas
            </h1>
            {asignatura && (
              <p className="text-gray-600 mt-1">
                {asignatura.nombre} ({asignatura.codigo})
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/estudiante/asignaturas/${id}/practicas-realizadas`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
            >
              ✅ Realizadas
            </button>
            <button
              onClick={() => navigate(`/estudiante/asignaturas/${id}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
            >
              ← Volver
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Evaluaciones Disponibles
          </h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando...</p>
          ) : evaluaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay evaluaciones prácticas disponibles en este momento
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluaciones.map((evaluacion) => (
                <div
                  key={evaluacion.id}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/estudiante/evaluacion-practica/${evaluacion.id}/iniciar`
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">
                      {evaluacion.titulo}
                    </h3>
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PÚBLICA
                    </span>
                  </div>
                  {evaluacion.descripcion && (
                    <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                      {evaluacion.descripcion}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-semibold text-blue-600">
                    Ver detalle →
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaEvaluacionesPracticasEstudiante;