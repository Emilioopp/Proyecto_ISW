import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert, showSuccessToast } from "../helpers/sweetAlert";

const IniciarEvaluacionPractica = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [intentoActivo, setIntentoActivo] = useState(null);
  const [cargandoIntentoActivo, setCargandoIntentoActivo] = useState(false);
  const [descargandoMaterial, setDescargandoMaterial] = useState(false);

  useEffect(() => {
    cargarEvaluacion();
    cargarIntentoActivo();
  }, [id]);

  const cargarEvaluacion = async () => {
    setLoading(true);
    try {
      // Obtener info pública de la evaluación
      const response = await axios.get(`/evaluaciones-practicas/${Number(id)}/publica`);
      if (response.data.status === "Success") {
        setEvaluacion(response.data.data);
      } else {
        showErrorAlert("Error", "No se pudo cargar la evaluación");
        navigate(-1);
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo cargar la evaluación"
      );
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const cargarIntentoActivo = async () => {
    setCargandoIntentoActivo(true);
    try {
      const response = await axios.get(
        `/evaluaciones-practicas/${Number(id)}/intentos/activo`
      );
      if (response.data.status === "Success") {
        setIntentoActivo(response.data.data?.intento ?? null);
      } else {
        setIntentoActivo(null);
      }
    } catch {
      // Si falla no bloquea la pantalla simplemente oculta la opcion
      setIntentoActivo(null);
    } finally {
      setCargandoIntentoActivo(false);
    }
  };

  const handleIniciar = async ({ forceNew = false } = {}) => {
    setIniciando(true);
    try {
      const url = forceNew
        ? `/evaluaciones-practicas/${Number(id)}/intentos?forceNew=1`
        : `/evaluaciones-practicas/${Number(id)}/intentos`;

      const response = await axios.post(url);

      if (response.data.status === "Success") {
        const { intento } = response.data.data;

        // Iniciar un intento nuevo, limpia cualquier borrador anterior de esta evaluación
        try {
          const evalKey = `practica_respuestas_eval_${Number(id)}`;
          const raw = localStorage.getItem(evalKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            const oldIntentoId = parsed?.intentoId;
            if (oldIntentoId) {
              localStorage.removeItem(
                `practica_respuestas_intento_${Number(oldIntentoId)}`
              );
            }
          }
          localStorage.removeItem(evalKey);
        } catch {
          // ignore
        }

        showSuccessToast("Evaluación iniciada");
        navigate(`/estudiante/intento-practica/${intento.id}`);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo iniciar el intento"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo iniciar el intento"
      );
    } finally {
      setIniciando(false);
    }
  };

  const handleReanudar = () => {
    if (!intentoActivo?.id) return;
    showSuccessToast("Evaluación reanudada");
    navigate(`/estudiante/intento-practica/${intentoActivo.id}`);
  };

  const handleVolver = () => {
    const asignaturaId = evaluacion?.asignatura_id;
    if (asignaturaId) {
      navigate(`/estudiante/asignaturas/${Number(asignaturaId)}/practicas`);
      return;
    }
    navigate(-1);
  };

  const descargarMaterial = async () => {
    setDescargandoMaterial(true);
    try {
      const response = await axios.get(
        `/evaluaciones-practicas/${Number(id)}/material`,
        { responseType: "blob" }
      );

      const contentType =
        response.headers?.["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const filename =
        evaluacion?.material_nombre_original ||
        `material-evaluacion-${Number(id)}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        showErrorAlert("Error", "Esta evaluación no tiene material asociado");
      } else {
        showErrorAlert(
          "Error",
          error.response?.data?.message || "No se pudo descargar el material"
        );
      }
    } finally {
      setDescargandoMaterial(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <p className="text-gray-600 text-center">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!evaluacion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {evaluacion.titulo}
          </h1>
          <button
            onClick={handleVolver}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📋 Información de la Evaluación Práctica
          </h2>

          {evaluacion.descripcion && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">{evaluacion.descripcion}</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">⏱️ Tiempo:</span>
              <span className="text-gray-600">
                {evaluacion.tiempo_minutos} minutos
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">
                📝 Cantidad de preguntas:
              </span>
              <span className="text-gray-600">
                {evaluacion.cantidad_preguntas ?? evaluacion.preguntas?.length ?? 0}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">
                🎯 Puntaje total:
              </span>
              <span className="text-gray-600">
                {evaluacion.puntaje_total ?? (evaluacion.preguntas?.reduce(
                  (acc, p) => acc + Number(p.puntaje || 0),
                  0
                ) || 0)}{" "}
                puntos
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">📎 Material:</span>
              {evaluacion.tiene_material ? (
                <button
                  type="button"
                  onClick={descargarMaterial}
                  disabled={descargandoMaterial}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-1.5 px-4 rounded-lg transition-all shadow-md"
                >
                  {descargandoMaterial ? "Descargando..." : "Descargar PDF"}
                </button>
              ) : (
                <span className="text-gray-600">No disponible</span>
              )}
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Importante
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      El tiempo comenzará cuando hagas clic en "Iniciar Práctica"
                    </li>
                    <li>
                      Si el tiempo se agota, tus respuestas se enviarán
                      automáticamente
                    </li>
                    <li>
                      Podrás ver las respuestas correctas y explicaciones al finalizar
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => (intentoActivo?.id ? handleReanudar() : handleIniciar({ forceNew: false }))}
            disabled={iniciando || cargandoIntentoActivo}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg text-lg"
          >
            {iniciando
              ? "Iniciando..."
              : intentoActivo
              ? "▶️ Reanudar intento"
              : "🚀 Iniciar Práctica"}
          </button>

          {intentoActivo?.id && (
            <button
              onClick={() => handleIniciar({ forceNew: true })}
              disabled={iniciando || cargandoIntentoActivo}
              className="w-full mt-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md"
            >
              🆕 Iniciar nuevo (finaliza el anterior)
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default IniciarEvaluacionPractica;