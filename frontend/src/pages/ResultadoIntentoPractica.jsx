import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert } from "../helpers/sweetAlert";

const ResultadoIntentoPractica = () => {
  const { intentoId } = useParams();
  const navigate = useNavigate();

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarResultado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentoId]);

  const cargarResultado = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/intentos/${intentoId}`);

      if (response.data.status === "Success") {
        setResultado(response.data.data);
      } else {
        showErrorAlert("Error", "No se pudo cargar el resultado");
        navigate(-1);
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo cargar el resultado"
      );
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <p className="text-gray-600 text-center">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (!resultado) return null;

  const porcentaje = resultado.puntaje_total > 0
    ? Math.round((resultado.puntaje_obtenido / resultado.puntaje_total) * 100)
    : 0;

  const aprobado = porcentaje >= 60;

  const handleVolver = () => {
    const asignaturaId =
      resultado?.evaluacion?.asignatura_id ??
      resultado?.evaluacion?.asignaturaId ??
      null;

    if (asignaturaId) {
      navigate(`/estudiante/asignaturas/${Number(asignaturaId)}/practicas`);
      return;
    }

    navigate("/estudiante/mis-asignaturas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            📊 Resultado de la Práctica
          </h1>
          <button
            onClick={handleVolver}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* Resumen de puntaje */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                aprobado ? "bg-green-100" : "bg-red-100"
              } mb-4`}
            >
              <span
                className={`text-5xl font-bold ${
                  aprobado ? "text-green-600" : "text-red-600"
                }`}
              >
                {porcentaje}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {aprobado ? "¡Buen trabajo!" : "Sigue practicando"}
            </h2>
            <p className="text-gray-600">
              Obtuviste {resultado.puntaje_obtenido} de{" "}
              {resultado.puntaje_total} puntos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Puntaje Obtenido</p>
              <p className="text-2xl font-bold text-blue-600">
                {resultado.puntaje_obtenido}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Puntaje Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {resultado.puntaje_total}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Tiempo Usado</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.floor(resultado.tiempo_usado_segundos / 60)}:
                {String(resultado.tiempo_usado_segundos % 60).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        {/* Detalle por pregunta */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            📝 Detalle por Pregunta
          </h2>

          <div className="space-y-6">
            {resultado.respuestas &&
              resultado.respuestas.map((respuesta, index) => {
                const pregunta = respuesta.pregunta;
                if (!pregunta) return null;

                const esCorrecta = respuesta.es_correcta;

                return (
                  <div
                    key={respuesta.id}
                    className={`border-2 rounded-xl p-6 ${
                      esCorrecta
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span
                        className={`font-bold px-3 py-1 rounded-full text-sm ${
                          esCorrecta
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-semibold text-lg mb-2">
                          {pregunta.enunciado}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pregunta.puntaje} punto
                          {pregunta.puntaje !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`text-3xl ${
                          esCorrecta ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {esCorrecta ? "✓" : "✗"}
                      </span>
                    </div>

                    <div className="ml-12 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700">
                          Tu respuesta:
                        </span>
                        <span
                          className={`font-semibold ${
                            esCorrecta ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {respuesta.respuesta_seleccionada || "(Sin respuesta)"}
                          {respuesta.respuesta_seleccionada &&
                            ` - ${
                              pregunta[
                                `alternativa_${respuesta.respuesta_seleccionada.toLowerCase()}`
                              ]
                            }`}
                        </span>
                      </div>

                      {!esCorrecta && pregunta.respuesta_correcta && (
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-gray-700">
                            Respuesta correcta:
                          </span>
                          <span className="font-semibold text-green-700">
                            {pregunta.respuesta_correcta} -{" "}
                            {
                              pregunta[
                                `alternativa_${pregunta.respuesta_correcta.toLowerCase()}`
                              ]
                            }
                          </span>
                        </div>
                      )}

                      {pregunta.explicacion && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            💡 Explicación:
                          </p>
                          <p className="text-sm text-gray-600">
                            {pregunta.explicacion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoIntentoPractica;