import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getMisNotasPorAsignatura } from "../services/estudiante.service";

const NotasEstudiante = () => {
  const { id } = useParams(); // ID de la asignatura
  const navigate = useNavigate();
  const location = useLocation();
  const asignaturaInfo = location.state?.asignatura;

  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotas();
  }, [id]);

  const cargarNotas = async () => {
    try {
      const response = await getMisNotasPorAsignatura(id);
      if (response.status === "Success") {
        setNotas(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis Notas</h1>
            <p className="text-gray-600">
              {asignaturaInfo
                ? `${asignaturaInfo.nombre} (${asignaturaInfo.codigo})`
                : "Asignatura"}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : notas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay notas registradas para esta asignatura.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left">Evaluación</th>
                    <th className="px-4 py-3 text-center">Nota</th>
                    <th className="px-4 py-3 text-left">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((nota) => (
                    <tr key={nota.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {nota.evaluacion_oral?.titulo || "Evaluación"}
                        <div className="text-xs text-gray-400">
                          {nota.evaluacion_oral?.descripcion}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-sm ${
                            parseFloat(nota.nota) >= 4.0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {nota.nota}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 italic">
                        {nota.observacion || "-"}
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

export default NotasEstudiante;
