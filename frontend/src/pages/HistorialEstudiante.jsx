import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMiHistorial } from "../services/estudiante.service";

const HistorialEstudiante = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const response = await getMiHistorial();
      if (response.status === "Success") {
        setHistorial(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            ⏱ Historial de Notas Recientes
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Volver
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="text-white text-center">No hay actividad reciente.</p>
          ) : (
            historial.map((registro) => (
              <div
                key={registro.id}
                className="bg-white rounded-xl p-4 shadow-lg border-l-8 border-purple-500 flex justify-between items-center transform transition hover:scale-[1.01]"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {registro.evaluacion_oral?.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {registro.evaluacion_oral?.asignatura?.nombre}
                    <span className="text-xs ml-2 bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                      {registro.evaluacion_oral?.asignatura?.codigo}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    "{registro.observacion}"
                  </p>
                </div>
                <div className="text-center min-w-[80px]">
                  <div
                    className={`text-2xl font-bold ${
                      parseFloat(registro.nota) >= 4.0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {registro.nota}
                  </div>
                  <div className="text-xs text-gray-400">Nota</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialEstudiante;
