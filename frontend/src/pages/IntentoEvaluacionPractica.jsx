import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert, showSuccessToast } from "../helpers/sweetAlert";
import Swal from "sweetalert2";

const IntentoEvaluacionPractica = () => {
  const { intentoId } = useParams();
  const navigate = useNavigate();

  const storageKeyByIntento = useMemo(
    () => `practica_respuestas_intento_${Number(intentoId)}`,
    [intentoId]
  );

  const [intento, setIntento] = useState(null);
  const [evaluacion, setEvaluacion] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [storageDisponible, setStorageDisponible] = useState(true);
  const [mostrarTimer, setMostrarTimer] = useState(true);

  useEffect(() => {
    // Detectar si el navegador permite localStorage
    try {
      const k = "__storage_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      setStorageDisponible(true);
    } catch {
      setStorageDisponible(false);
      Swal.fire({
        title: "Almacenamiento deshabilitado",
        text: "Tu navegador está bloqueando el almacenamiento local. No se podrán guardar borradores de respuestas.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    }
  }, []);

  const getStorageKeyByEvaluacion = useCallback(() => {
    const evaluacionId = evaluacion?.id ?? intento?.evaluacion_id;
    if (!evaluacionId) return null;
    return `practica_respuestas_eval_${Number(evaluacionId)}`;
  }, [evaluacion?.id, intento?.evaluacion_id]);

  const guardarBorradorEnStorage = useCallback(
    (respuestasToSave) => {
      try {
        localStorage.setItem(storageKeyByIntento, JSON.stringify(respuestasToSave));
      } catch {
        // ignore
      }

      const keyEval = getStorageKeyByEvaluacion();
      if (keyEval) {
        try {
          // Guarda con intentoId para no reutilizar en intentos nuevos
          localStorage.setItem(
            keyEval,
            JSON.stringify({
              intentoId: Number(intentoId),
              respuestas: respuestasToSave,
            })
          );
        } catch {
          // ignore
        }
      }
    },
    [getStorageKeyByEvaluacion, storageKeyByIntento, intentoId]
  );

  const limpiarBorradorEnStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKeyByIntento);
    } catch {
      // ignore
    }
    const keyEval = getStorageKeyByEvaluacion();
    if (keyEval) {
      try {
        localStorage.removeItem(keyEval);
      } catch {
        // ignore
      }
    }
  }, [getStorageKeyByEvaluacion, storageKeyByIntento]);

  useEffect(() => {
    cargarIntento();
  }, [intentoId]);

  const cargarIntento = async () => {
    setLoading(true);
    try {
      // Cargar intento existente
      const response = await axios.get(`/intentos/${Number(intentoId)}`);

      if (response.data.status === "Success") {
        const data = response.data.data;
        setIntento(data);
        setPreguntas(data.preguntas || []);

        // Obtener evaluación básica
        if (data.evaluacion) {
          setEvaluacion(data.evaluacion);
        }

        // Inicializar respuestas desde las que ya existen en el intento
        const initialRespuestas = {};
        if (data.respuestas && Array.isArray(data.respuestas)) {
          data.respuestas.forEach((r) => {
            initialRespuestas[r.pregunta_id] = r.respuesta_seleccionada;
          });
        } else {
          // Si no hay respuestas guardadas, inicializar vacías
          (data.preguntas || []).forEach((p) => {
            initialRespuestas[p.id] = null;
          });
        }

        // Restaurar borrador local
        let mergedRespuestas = { ...initialRespuestas };
        try {
          const evalId = data?.evaluacion?.id ?? data?.evaluacion_id;
          const keyEval = evalId ? `practica_respuestas_eval_${Number(evalId)}` : null;

          const questionIdSet = new Set(
            (data.preguntas || []).map((p) => String(p.id))
          );

          const sources = [
            keyEval ? localStorage.getItem(keyEval) : null,
            localStorage.getItem(storageKeyByIntento),
          ].filter(Boolean);

          for (const raw of sources) {
            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || typeof parsed !== "object") continue;
            const isWrapper =
              "intentoId" in parsed &&
              "respuestas" in parsed &&
              parsed.respuestas &&
              typeof parsed.respuestas === "object";

            // Si es de otro intento, no restaura
            if (isWrapper && Number(parsed.intentoId) !== Number(intentoId)) {
              continue;
            }

            // Si es wrapper, usamos parsed.respuestas, si no asumimos que es mapa directo
            const candidate = isWrapper ? parsed.respuestas : parsed;

            // Si no es wrapper y el raw venía de keyEval lo ignoramos
            if (!isWrapper && keyEval && raw === localStorage.getItem(keyEval)) {
              continue;
            }

            for (const [preguntaId, valor] of Object.entries(candidate)) {
                const key = String(preguntaId);
                const permitido =
                  valor === null || ["A", "B", "C", "D"].includes(valor);
                if (permitido && (questionIdSet.size === 0 || questionIdSet.has(key))) {
                  mergedRespuestas[key] = valor;
                }
              }
          }
        } catch {
          // nada
        }

        setRespuestas(mergedRespuestas);
      } else {
        showErrorAlert("Error", "No se pudo cargar el intento");
        navigate(-1);
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo cargar el intento"
      );
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!intento || !evaluacion) return;

    const calcularTiempoRestante = () => {
      const inicio = new Date(intento.fecha_inicio);
      const ahora = new Date();
      const transcurridoMs = ahora - inicio;
      const limiteMs = Number(evaluacion.tiempo_minutos) * 60 * 1000;
      const restanteMs = limiteMs - transcurridoMs;

      return Math.max(0, Math.floor(restanteMs / 1000));
    };

    setTiempoRestante(calcularTiempoRestante());

    const interval = setInterval(() => {
      const restante = calcularTiempoRestante();
      setTiempoRestante(restante);

      if (restante <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [intento, evaluacion]);

  const formatTiempo = useMemo(() => {
    if (tiempoRestante === null) return "--:--";
    const mins = Math.floor(tiempoRestante / 60);
    const secs = tiempoRestante % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [tiempoRestante]);

  const handleAutoSubmit = useCallback(async () => {
    if (enviando) return;

    const result = await Swal.fire({
      title: "⏰ Tiempo Agotado",
      text: "El tiempo se acabó. Tus respuestas se enviarán automáticamente.",
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "Entendido",
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      await handleSubmit(true);
    }
  }, [enviando, respuestas]);

  const handleSubmit = async (autoSubmit = false) => {
    if (enviando) return;

    if (!autoSubmit) {
      const result = await Swal.fire({
        title: "¿Enviar respuestas?",
        text: "Una vez enviadas, no podrás modificarlas",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;
    }

    setEnviando(true);
    try {
      const respuestasArray = Object.entries(respuestas).map(
        ([pregunta_id, respuesta_seleccionada]) => ({
          pregunta_id: Number(pregunta_id),
          respuesta_seleccionada,
        })
      );

      const response = await axios.post(`/intentos/${intentoId}/submit`, {
        respuestas: respuestasArray,
      });

      if (response.data.status === "Success") {
        limpiarBorradorEnStorage();
        showSuccessToast("Respuestas enviadas");
        navigate(`/estudiante/resultado-practica/${intentoId}`);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo enviar el intento"
        );
      }
    } catch (error) {
      const message = error.response?.data?.message;

      // Si expiró o el intento ya está finalizado va a resultados 
      if (
        message &&
        (message.includes("Tiempo de la evaluación expirado") ||
          message.includes("El intento ya fue finalizado"))
      ) {
        await Swal.fire({
          title: "Tiempo agotado",
          text: "La práctica finalizó. Te llevaremos a los resultados.",
          icon: "info",
          confirmButtonText: "Ver resultados",
          allowOutsideClick: false,
        });
        navigate(`/estudiante/resultado-practica/${intentoId}`);
        return;
      }

      showErrorAlert("Error", message || "No se pudo enviar el intento");
    } finally {
      setEnviando(false);
    }
  };

  const handleRespuestaChange = (preguntaId, alternativa) => {
    setRespuestas((prev) => {
      const next = {
        ...prev,
        [preguntaId]: alternativa,
      };
      return next;
    });
  };

  // Autosave
  useEffect(() => {
    if (!storageDisponible) return;
    if (!intento || !evaluacion) return;
    if (!respuestas || Object.keys(respuestas).length === 0) return;
    guardarBorradorEnStorage(respuestas);
  }, [storageDisponible, intento, evaluacion, respuestas, guardarBorradorEnStorage]);

  const handleGuardarBorrador = async () => {
    if (!storageDisponible) {
      await Swal.fire({
        title: "No disponible",
        text: "Tu navegador está bloqueando el almacenamiento local.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    guardarBorradorEnStorage(respuestas);
    await Swal.fire({
      title: "Guardado",
      text: "Se guardó un borrador local de tus respuestas en este navegador.",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <p className="text-gray-600 text-center">Cargando intento...</p>
        </div>
      </div>
    );
  }

  if (!intento || !evaluacion) return null;

  const tiempoAgotado = tiempoRestante === 0;
  const colorTimer = tiempoRestante < 60 ? "text-red-600" : "text-gray-800";

  const handleVolver = () => {
    const evaluacionId = evaluacion?.id ?? intento?.evaluacion_id;
    if (evaluacionId) {
      navigate(`/estudiante/evaluacion-practica/${Number(evaluacionId)}/iniciar`);
      return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con timer */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={handleVolver}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {evaluacion.titulo}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Intento en progreso
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto,auto] grid-rows-2 items-center justify-center gap-x-3 gap-y-0 self-start -mt-3">
              <div />
              <p className="text-sm text-gray-600 justify-self-center leading-none">Tiempo restante</p>
              <button
                type="button"
                onClick={() => setMostrarTimer((v) => !v)}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors -mt-1"
                aria-label={
                  mostrarTimer ? "Ocultar tiempo restante" : "Mostrar tiempo restante"
                }
                title={mostrarTimer ? "Ocultar tiempo" : "Mostrar tiempo"}
              >
                <span aria-hidden="true">{mostrarTimer ? "👁️" : "🙈"}</span>
              </button>
              <p className={`text-4xl font-bold ${colorTimer} justify-self-center leading-none -mt-1`}>
                {mostrarTimer ? formatTiempo : "--:--"}
              </p>
            </div>
          </div>
        </div>

        {/* Preguntas */}
        <div className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <div
              key={pregunta.id}
              className="bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold text-lg">
                    {pregunta.enunciado}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {pregunta.puntaje} punto{pregunta.puntaje !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-2 ml-12">
                {["A", "B", "C", "D"].map((letra) => {
                  const textoAlternativa = pregunta[`alternativa_${letra.toLowerCase()}`];
                  const isSelected = respuestas[pregunta.id] === letra;

                  return (
                    <label
                      key={letra}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={letra}
                        checked={isSelected}
                        onChange={() =>
                          handleRespuestaChange(pregunta.id, letra)
                        }
                        disabled={tiempoAgotado || enviando}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="font-semibold text-gray-700 min-w-[24px]">
                        {letra}.
                      </span>
                      <span className="text-gray-700">{textoAlternativa}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Botón enviar */}
        <div className="mt-8 bg-white rounded-2xl shadow-2xl p-6">
          <button
            onClick={handleGuardarBorrador}
            disabled={enviando || tiempoAgotado}
            className="w-full mb-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md"
          >
            💾 Guardar borrador
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={enviando || tiempoAgotado}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg text-lg"
          >
            {enviando
              ? "Enviando..."
              : tiempoAgotado
              ? "Tiempo agotado"
              : "📤 Enviar Respuestas"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntentoEvaluacionPractica;