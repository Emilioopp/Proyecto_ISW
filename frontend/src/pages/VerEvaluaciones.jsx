import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../services/root.service";

const VerEvaluaciones = () => {
  const { id } = useParams(); // Obtiene el id de la asignatura
  const [evaluaciones, setEvaluaciones] = useState([]);

  useEffect(() => {
    cargarEvaluaciones();
  }, [id]);

  const cargarEvaluaciones = async () => {
    try {
      const response = await axios.get(`/asignaturas/${id}/evaluaciones`);
      setEvaluaciones(response.data.data);
    } catch (error) {
      console.error("Error al cargar evaluaciones", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Evaluaciones de Asignatura
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Listado de Evaluaciones
          </h2>
          {evaluaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay evaluaciones registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Título
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((evaluacion) => (
                    <tr
                      key={evaluacion.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{evaluacion.titulo}</td>
                      <td className="px-4 py-3">{evaluacion.fecha}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-500 hover:text-blue-700 font-semibold">
                          Ver detalles →
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

export default VerEvaluaciones;
