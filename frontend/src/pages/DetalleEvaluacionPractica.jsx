import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert";

const DetalleEvaluacionPractica = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState(null);
  const [preguntas, setPreguntas] = useState([]);

  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editTiempo, setEditTiempo] = useState(10);
  const [editEstado, setEditEstado] = useState("oculta");

  const [qEnunciado, setQEnunciado] = useState("");
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");
  const [qD, setQD] = useState("");
  const [qCorrecta, setQCorrecta] = useState("A");
  const [qExplicacion, setQExplicacion] = useState("");
  const [qPuntaje, setQPuntaje] = useState(1);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const puntajeTotal = useMemo(() => {
    return (preguntas || []).reduce(
      (acc, p) => acc + Number(p.puntaje ?? 0),
      0
    );
  }, [preguntas]);

  const cargar = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/evaluaciones-practicas/${Number(id)}`);
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "No se pudo cargar");
      }

      const data = response.data.data;
      setEvaluacion(data);
      setPreguntas(data.preguntas || []);

      setEditTitulo(data.titulo || "");
      setEditDescripcion(data.descripcion || "");
      setEditTiempo(Number(data.tiempo_minutos || 10));
      setEditEstado(data.estado || "oculta");
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarEvaluacion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: editTitulo,
        descripcion: editDescripcion,
        tiempo_minutos: Number(editTiempo),
        estado: editEstado,
      };

      const response = await axios.put(
        `/evaluaciones-practicas/${Number(id)}`,
        payload
      );

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación actualizada");
        await cargar();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo actualizar"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al actualizar"
      );
    }
  };

  const crearPregunta = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        enunciado: qEnunciado,
        alternativa_a: qA,
        alternativa_b: qB,
        alternativa_c: qC,
        alternativa_d: qD,
        respuesta_correcta: qCorrecta,
        explicacion: qExplicacion,
        puntaje: Number(qPuntaje),
      };

      const response = await axios.post(
        `/evaluaciones-practicas/${Number(id)}/preguntas`,
        payload
      );

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Pregunta creada");
        setQEnunciado("");
        setQA("");
        setQB("");
        setQC("");
        setQD("");
        setQCorrecta("A");
        setQExplicacion("");
        setQPuntaje(1);
        await cargar();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo crear la pregunta"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al crear la pregunta"
      );
    }
  };

  const eliminarPregunta = async (preguntaId) => {
    try {
      const response = await axios.delete(
        `/evaluaciones-practicas/preguntas/${Number(preguntaId)}`
      );

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Pregunta eliminada");
        await cargar();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo eliminar"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al eliminar"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Evaluación práctica</h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
            >
              ← Volver
            </button>
          </div>
          <p className="text-gray-600">No se encontró la evaluación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {evaluacion.titulo}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Configuración
          </h2>

          <form onSubmit={guardarEvaluacion} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tiempo (min)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editTiempo}
                  onChange={(e) => setEditTiempo(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="oculta">oculta</option>
                  <option value="publica">publica</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full"
            >
              Guardar cambios
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Preguntas ({preguntas.length}) — Puntaje total: {puntajeTotal}
          </h2>

          {preguntas.length === 0 ? (
            <p className="text-gray-500">Aún no hay preguntas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">
                      Orden
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Enunciado
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Puntaje
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-lg">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preguntas.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600">{p.orden}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {p.enunciado}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.puntaje}</td>
                      <td className="px-4 py-3">
                        <button
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                          onClick={() => eliminarPregunta(p.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Agregar pregunta
          </h2>

          <form onSubmit={crearPregunta} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Enunciado
              </label>
              <textarea
                value={qEnunciado}
                onChange={(e) => setQEnunciado(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alternativa A
                </label>
                <input
                  value={qA}
                  onChange={(e) => setQA(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alternativa B
                </label>
                <input
                  value={qB}
                  onChange={(e) => setQB(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alternativa C
                </label>
                <input
                  value={qC}
                  onChange={(e) => setQC(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alternativa D
                </label>
                <input
                  value={qD}
                  onChange={(e) => setQD(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Correcta
                </label>
                <select
                  value={qCorrecta}
                  onChange={(e) => setQCorrecta(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Puntaje
                </label>
                <input
                  type="number"
                  min={1}
                  value={qPuntaje}
                  onChange={(e) => setQPuntaje(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Explicación
              </label>
              <textarea
                value={qExplicacion}
                onChange={(e) => setQExplicacion(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full"
            >
              Agregar pregunta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvaluacionPractica;