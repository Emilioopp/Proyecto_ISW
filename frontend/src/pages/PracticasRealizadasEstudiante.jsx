import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert } from "../helpers/sweetAlert";

const PracticasRealizadasEstudiante = () => {
  const { id } = useParams(); // asignaturaId
  const navigate = useNavigate();

  const [asignatura, setAsignatura] = useState(null);
  const [intentos, setIntentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAsignatura();
    cargarIntentosFinalizados();
  }, [id]);

  const cargarAsignatura = async () => {
    try {
      const response = await axios.get(`/asignaturas/${Number(id)}`);
      if (response.data.status === "Success") {
        setAsignatura(response.data.data);
      }
    } catch {
      // nada
    }
  };

  const cargarIntentosFinalizados = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/intentos/mis-finalizados?asignaturaId=${Number(id)}`
      );

      if (response.data.status === "Success") {
        setIntentos(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setIntentos([]);
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo cargar el historial de prácticas"
      );
      setIntentos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (iso) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const getPorcentaje = (puntajeObtenido, puntajeTotal) => {
    const total = Number(puntajeTotal ?? 0);
    const obtenido = Number(puntajeObtenido ?? 0);
    if (!Number.isFinite(total) || total <= 0) return null;
    if (!Number.isFinite(obtenido)) return null;
    return Math.round((obtenido / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ✅ Evaluaciones prácticas realizadas
            </h1>
            {asignatura && (
              <p className="text-gray-600 mt-1">
                {asignatura.nombre} ({asignatura.codigo})
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/estudiante/asignaturas/${id}/practicas`)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Historial
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando...</p>
          ) : intentos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aún no tienes prácticas finalizadas en esta asignatura
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {intentos.map((intento) => {
                const evaluacionTitulo =
                  intento?.evaluacion?.titulo ||
                  `Evaluación #${intento?.evaluacion_id ?? ""}`;

                const porcentaje = getPorcentaje(
                  intento?.puntaje_obtenido,
                  intento?.puntaje_total
                );

                return (
                  <div
                    key={intento.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() =>
                      navigate(`/estudiante/resultado-practica/${intento.id}`)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-800 leading-snug">
                        {evaluacionTitulo}
                      </h3>
                      <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                        FINALIZADA
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-semibold">Puntaje:</span>{" "}
                        {Number(intento?.puntaje_total ?? 0) > 0
                          ? `${intento?.puntaje_obtenido ?? 0}/${
                              intento?.puntaje_total ?? 0
                            }${porcentaje !== null ? ` (${porcentaje}%)` : ""}`
                          : "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Finalizada:</span>{" "}
                        {formatFecha(intento?.fecha_finalizacion)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-blue-600">
                      Ver resultados →
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticasRealizadasEstudiante;