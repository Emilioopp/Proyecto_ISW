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

  // Estados para el Modal de Observación
  const [modalOpen, setModalOpen] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

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

  // Función para abrir el modal
  const verObservacion = (nota) => {
    setNotaSeleccionada(nota);
    setModalOpen(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalOpen(false);
    setNotaSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow transition-all"
          >
            ← Volver
          </button>
        </div>

        {/* Tabla de Notas */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Cargando notas...</p>
          ) : notas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">
                No hay notas registradas para esta asignatura.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tl-lg">
                      Evaluación
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">
                      Nota
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700 rounded-tr-lg">
                      Observación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((nota) => (
                    <tr
                      key={nota.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">
                          {nota.evaluacion_oral?.titulo || "Evaluación"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-sm border ${
                            parseFloat(nota.nota) >= 4.0
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {nota.nota}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {nota.observacion ? (
                          <button
                            onClick={() => verObservacion(nota)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-4 rounded-full text-sm transition-colors flex items-center justify-center mx-auto gap-1"
                          >
                            <span>👁️</span> Ver Detalle
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Sin observación
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- VENTANA MODAL (Overlay) --- */}
      {modalOpen && notaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
          {/* CAMBIO AQUÍ: Cambié max-w-lg a max-w-3xl para hacerlo más ancho */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">
                {notaSeleccionada.evaluacion_oral?.titulo ||
                  "Detalle de Observación"}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-white hover:text-gray-200 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                    Calificación
                  </span>
                  <div
                    className={`text-4xl font-bold mt-1 ${
                      parseFloat(notaSeleccionada.nota) >= 4.0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {notaSeleccionada.nota}
                  </div>
                </div>
                {/* Puedes agregar más info aquí si quieres, como la fecha */}
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Observación del Docente
                </span>
                {/* Aumenté la altura máxima del scroll y mejoré el espaciado */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 text-base leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-wrap shadow-inner">
                  {notaSeleccionada.observacion}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 text-right border-t border-gray-100">
              <button
                onClick={cerrarModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded-lg transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotasEstudiante;
