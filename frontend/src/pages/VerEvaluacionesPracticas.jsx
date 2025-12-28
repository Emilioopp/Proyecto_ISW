import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";

const VerEvaluacionesPracticas = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarEvaluaciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/evaluaciones-practicas?asignaturaId=${Number(id)}`
      );
      if (response.data.status === "Success") {
        setEvaluaciones(response.data.data);
      } else {
        setEvaluaciones([]);
      }
    } catch (error) {
      setEvaluaciones([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Evaluaciones Prácticas
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Listado
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando...</p>
          ) : evaluaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay evaluaciones prácticas registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">
                      Título
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Tiempo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-lg">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((evaluacion) => (
                    <tr
                      key={evaluacion.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {evaluacion.titulo}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {evaluacion.estado}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {evaluacion.tiempo_minutos} min
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-4 rounded-full transition-colors text-sm"
                          onClick={() =>
                            navigate(`/evaluacion-practica/detalle/${evaluacion.id}`)
                          }
                        >
                          Gestionar
                        </button>
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

export default VerEvaluacionesPracticas;