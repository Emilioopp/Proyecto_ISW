import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisAsignaturas } from "../services/estudiante.service";
import "../styles/styles.css";

const MisAsignaturasEstudiante = () => {
  const navigate = useNavigate();
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      const response = await getMisAsignaturas();
      if (response.status === "Success") {
        setAsignaturas(response.data);
      }
    } catch (error) {
      console.error("Error cargando asignaturas", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            📚 Mis Asignaturas
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/estudiante/historial")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow"
            >
              Ver Historial de Notas
            </button>
            <button
              onClick={() => navigate("/home")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              ← Volver
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Asignaturas Inscritas
          </h2>
          {loading ? (
            <p className="text-center py-4">Cargando cursos...</p>
          ) : asignaturas.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No tienes asignaturas inscritas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {asignaturas.map((asig) => (
                <div
                  key={asig.id}
                  className="bg-gray-50 rounded-xl p-6 border hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    navigate(`/estudiante/asignaturas/${asig.id}`, {
                      state: { asignatura: asig },
                    })
                  }
                >
                  <div className="text-4xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {asig.nombre}
                  </h3>
                  <p className="text-gray-500 font-mono text-sm">
                    {asig.codigo}
                  </p>
                  <p className="text-blue-600 mt-4 font-semibold text-sm">
                    Abrir asignatura →
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

export default MisAsignaturasEstudiante;