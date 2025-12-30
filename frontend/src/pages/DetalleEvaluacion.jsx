import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  getNotasDeEvaluacion,
  getEstudiantesAsignatura,
  registrarNota,
  updateNota,
  deleteNota,
} from "../services/evaluacion.service";
import Swal from "sweetalert2";

// Ya no importamos CSS externo, usamos Tailwind para consistencia
// import "../styles/detalleEvaluacion.css";

const DetalleEvaluacion = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const evaluacionInfo = location.state?.evaluacion;

  const [estudiantes, setEstudiantes] = useState([]);
  const [notasExistentes, setNotasExistentes] = useState([]);

  // Estados Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [notaInput, setNotaInput] = useState("");
  const [obsInput, setObsInput] = useState("");

  useEffect(() => {
    if (evaluacionInfo) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      const asignaturaId =
        evaluacionInfo.asignatura?.id || evaluacionInfo.asignatura_id;

      const [respEst, respNotas] = await Promise.all([
        getEstudiantesAsignatura(asignaturaId),
        getNotasDeEvaluacion(id),
      ]);

      const listaEstudiantes = respEst.data || [];
      const listaNotas = respNotas.message || [];

      setEstudiantes(listaEstudiantes);
      setNotasExistentes(listaNotas);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la lista", "error");
    }
  };

  const abrirModal = (estudiante, notaExistente = null) => {
    setCurrentStudent(estudiante);

    if (notaExistente) {
      setCurrentNoteId(notaExistente.id);
      setNotaInput(notaExistente.nota);
      setObsInput(notaExistente.observacion || "");
    } else {
      setCurrentNoteId(null);
      setNotaInput("");
      setObsInput("");
    }
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setCurrentStudent(null);
    setCurrentNoteId(null);
  };

  const guardarDesdeModal = async () => {
    if (
      !notaInput ||
      parseFloat(notaInput) < 1.0 ||
      parseFloat(notaInput) > 7.0
    ) {
      return Swal.fire(
        "Error",
        "La nota debe estar entre 1.0 y 7.0",
        "warning"
      );
    }

    try {
      if (currentNoteId) {
        await updateNota(currentNoteId, {
          nota: parseFloat(notaInput),
          observacion: obsInput,
        });
        Swal.fire({
          title: "Actualizado",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await registrarNota(id, {
          estudiante_id: currentStudent.id,
          nota: parseFloat(notaInput),
          observacion: obsInput,
        });
        Swal.fire({
          title: "Guardado",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      cargarDatos();
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      const mensajeError =
        error.response?.data?.message || "Error al procesar la solicitud";
      Swal.fire("Error", mensajeError, "error");
    }
  };

  const handleDelete = async (notaId) => {
    const result = await Swal.fire({
      title: "¿Eliminar nota?",
      text: "Se borrará la calificación y la observación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteNota(notaId);
        Swal.fire("Eliminado", "La nota ha sido eliminada.", "success");
        cargarDatos();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la nota", "error");
      }
    }
  };

  if (!evaluacionInfo)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg font-semibold text-gray-600">
          Cargando datos...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER: Estilo Unificado con VerEvaluaciones */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {evaluacionInfo.titulo}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              {evaluacionInfo.descripcion}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* TABLA: Estilo Unificado */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Listado de Estudiantes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Rut
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Nota
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Observación
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 rounded-tr-lg">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => {
                  const notaRegistrada = notasExistentes.find(
                    (n) =>
                      Number(n.estudiante_id || n.estudiante?.id) ===
                      Number(est.id)
                  );

                  return (
                    <tr
                      key={est.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {est.nombreCompleto ||
                          `${est.nombre} ${est.apellido || ""}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{est.rut}</td>

                      {/* Nota */}
                      <td className="px-4 py-3 text-center">
                        {notaRegistrada ? (
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-sm border ${
                              parseFloat(notaRegistrada.nota) >= 4.0
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {notaRegistrada.nota}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Observación */}
                      <td
                        className="px-4 py-3 text-gray-600 italic max-w-xs truncate"
                        title={notaRegistrada?.observacion}
                      >
                        {notaRegistrada?.observacion || "-"}
                      </td>

                      {/* Botones */}
                      <td className="px-4 py-3 flex justify-center gap-2">
                        {!notaRegistrada ? (
                          <button
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-4 rounded-full transition-colors text-sm shadow-sm"
                            onClick={() => abrirModal(est)}
                          >
                            Calificar
                          </button>
                        ) : (
                          <>
                            <button
                              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold py-1 px-3 rounded-full transition-colors text-sm border border-yellow-200"
                              onClick={() => abrirModal(est, notaRegistrada)}
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-1 px-3 rounded-full transition-colors text-sm border border-red-200"
                              onClick={() => handleDelete(notaRegistrada.id)}
                              title="Eliminar"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {estudiantes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No hay estudiantes inscritos en esta asignatura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- VENTANA MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 border border-gray-100">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentNoteId ? "Editar Calificación" : "Nueva Calificación"}
              </h2>
              <p className="text-purple-100 text-sm">
                Estudiante:{" "}
                <strong className="text-white text-base ml-1">
                  {currentStudent?.nombre} {currentStudent?.apellido}
                </strong>
              </p>
            </div>

            {/* Body Modal */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Nota (1.0 - 7.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="7.0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none text-lg font-semibold text-gray-800 transition-colors"
                  value={notaInput}
                  onChange={(e) => setNotaInput(e.target.value)}
                  placeholder="Ej: 5.5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Observación / Feedback
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none h-48 resize-none text-gray-700 leading-relaxed transition-colors"
                  value={obsInput}
                  onChange={(e) => setObsInput(e.target.value)}
                  placeholder="Escriba aquí los detalles de la evaluación, fortalezas y aspectos a mejorar..."
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-100">
              <button
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold transition-colors"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                className="px-8 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-lg hover:shadow-green-500/30"
                onClick={guardarDesdeModal}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleEvaluacion;
