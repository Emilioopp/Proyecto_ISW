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
import "../styles/detalleEvaluacion.css";

const DetalleEvaluacion = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const evaluacionInfo = location.state?.evaluacion;

  const [estudiantes, setEstudiantes] = useState([]);
  const [notasExistentes, setNotasExistentes] = useState([]);

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
      <div className="detalle-container">
        <div className="card-detalle">Cargando datos...</div>
      </div>
    );

  return (
    <div className="detalle-container">
      <div className="card-detalle">
        <div className="card-header">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
          <h1>Calificar: {evaluacionInfo.titulo}</h1>
          <p>{evaluacionInfo.descripcion}</p>
        </div>

        <div className="table-responsive">
          <table className="tabla-notas">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Rut</th>
                <th>Nota</th>
                <th>Observación</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
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
                  <tr key={est.id}>
                    <td>
                      {est.nombreCompleto ||
                        `${est.nombre} ${est.apellido || ""}`}
                    </td>
                    <td>{est.rut}</td>

                    {/* Nota (Solo lectura aquí) */}
                    <td>
                      {notaRegistrada ? (
                        <span className="nota-badge">
                          {notaRegistrada.nota}
                        </span>
                      ) : (
                        <span style={{ color: "#aaa" }}>-</span>
                      )}
                    </td>

                    {/* Observación (Solo lectura, cortada si es larga) */}
                    <td
                      className="obs-cell"
                      title={notaRegistrada?.observacion}
                    >
                      {notaRegistrada?.observacion || "-"}
                    </td>

                    {/* Botones */}
                    <td style={{ textAlign: "center" }}>
                      {!notaRegistrada ? (
                        <button
                          className="btn-action btn-guardar"
                          onClick={() => abrirModal(est)}
                        >
                          Calificar
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-action btn-editar"
                            onClick={() => abrirModal(est, notaRegistrada)}
                            title="Editar Nota y Observación"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-eliminar"
                            onClick={() => handleDelete(notaRegistrada.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {estudiantes.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay estudiantes inscritos en esta asignatura.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VENTANA MODAL --- */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {currentNoteId ? "Editar Calificación" : "Nueva Calificación"}
              </h2>
              <p>
                Estudiante:{" "}
                <strong>
                  {currentStudent?.nombre} {currentStudent?.apellido}
                </strong>
              </p>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nota (1.0 - 7.0):</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="7.0"
                  className="input-modal"
                  value={notaInput}
                  onChange={(e) => setNotaInput(e.target.value)}
                  placeholder="Ej: 5.5"
                />
              </div>

              <div className="form-group">
                <label>Observación:</label>
                <textarea
                  className="textarea-modal"
                  value={obsInput}
                  onChange={(e) => setObsInput(e.target.value)}
                  placeholder="Escriba aquí los detalles de la evaluación, puntos fuertes y débiles..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-action btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
              <button
                className="btn-action btn-guardar"
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
