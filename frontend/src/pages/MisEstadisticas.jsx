import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisEstadisticas } from "../services/estudiante.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Swal from "sweetalert2";
import "../styles/estadisticas.css";

const MisEstadisticas = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoadError(false);
      const response = await getMisEstadisticas();
      if (response.status === "Success") {
        setStats(response.data);
      }
    } catch (error) {
      console.error(error);
      setLoadError(true);
      await Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const getColorNota = (nota) => {
    if (nota >= 6.0) return "#2ecc71";
    if (nota >= 4.0) return "#3498db";
    return "#e74c3c";
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Calculando rendimiento...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">📊 Mi Rendimiento</h1>
            <button
              onClick={() => navigate("/home")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
            >
              ← Volver
            </button>
          </div>
          <p className="text-gray-700">
            No fue posible cargar tus estadísticas en este momento.
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">📊 Mi Rendimiento</h1>
            <button
              onClick={() => navigate("/home")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
            >
              ← Volver
            </button>
          </div>
          <p className="text-gray-700">Aún no hay datos para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="dashboard-container">
        {/* Encabezado con Título y Botón Volver */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-0">
            📊 Mi Rendimiento Académico
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* --- TARJETAS DE RESUMEN --- */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Promedio General</span>
            <span
              className={`stat-value ${
                stats.promedioGeneral < 4.0 ? "nota-baja" : ""
              }`}
            >
              {stats.promedioGeneral}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Evaluaciones Rendidas</span>
            <span className="stat-value" style={{ color: "#34495e" }}>
              {stats.totalEvaluaciones}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Estado Actual</span>
            <span
              className="stat-value"
              style={{ fontSize: "1.5rem", marginTop: "20px" }}
            >
              {stats.promedioGeneral >= 4.0 ? "Aprobando" : "En Riesgo"}
            </span>
          </div>
        </div>

        {/* --- GRÁFICO DE BARRAS --- */}
        <div className="charts-section">
          <div className="chart-header">
            <h2>Promedio por Asignatura</h2>
            <p className="text-gray-500">
              Comparativa de rendimiento entre ramos
            </p>
          </div>

          <div className="chart-wrapper">
            {stats.promedioPorAsignatura.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.promedioPorAsignatura}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asignatura" />
                  <YAxis domain={[0, 7]} />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Promedio"]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="promedio"
                    name="Nota Promedio"
                    radius={[5, 5, 0, 0]}
                  >
                    {stats.promedioPorAsignatura.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColorNota(entry.promedio)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-gray-400">
                No hay suficientes datos para generar el gráfico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisEstadisticas;