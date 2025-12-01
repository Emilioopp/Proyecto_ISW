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
  const [inputs, setInputs] = useState({});
  const [editingId, setEditingId] = useState(null);

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

      // --- CORRECCIÓN 1: LEER DESDE 'message' ---
      // Según tu imagen, los estudiantes vienen en 'data', pero las notas en 'message'
      const listaEstudiantes = respEst.data || [];
      const listaNotas = respNotas.message || []; // <--- AQUÍ ESTABA EL ERROR PRINCIPAL

      setEstudiantes(listaEstudiantes);
      setNotasExistentes(listaNotas);

      console.log("Datos cargados correctamente:", {
        listaEstudiantes,
        listaNotas,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la lista", "error");
    }
  };

  const handleInputChange = (studentId, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleGuardar = async (estudianteId) => {
    const dataInput = inputs[estudianteId];
    if (!dataInput?.nota)
      return Swal.fire("Falta nota", "Ingresa una nota válida", "warning");

    try {
      await registrarNota(id, {
        estudiante_id: estudianteId,
        nota: parseFloat(dataInput.nota),
        observacion: dataInput.observacion || "",
      });
      Swal.fire({
        title: "Guardado",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
      cargarDatos();
      setInputs((prev) => {
        const copy = { ...prev };
        delete copy[estudianteId];
        return copy;
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al guardar la nota";
      Swal.fire("Error", mensajeError, "error");
    }
  };

  const handleEditClick = (estudianteId, notaActual) => {
    setEditingId(estudianteId);
    setInputs((prev) => ({
      ...prev,
      [estudianteId]: {
        nota: notaActual.nota,
        observacion: notaActual.observacion,
      },
    }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputs((prev) => {
      const copy = { ...prev };
      delete copy[editingId];
      return copy;
    });
  };

  const handleUpdate = async (notaId, estudianteId) => {
    const dataInput = inputs[estudianteId];
    try {
      await updateNota(notaId, {
        nota: parseFloat(dataInput.nota),
        observacion: dataInput.observacion,
      });
      Swal.fire({
        title: "Actualizado",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
      setEditingId(null);
      cargarDatos();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al actualizar",
        "error"
      );
    }
  };

  const handleDelete = async (notaId) => {
    const result = await Swal.fire({
      title: "¿Eliminar nota?",
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => {
                // --- CORRECCIÓN 2: USAR 'estudiante_id' ---
                // Según tu imagen, el ID viene plano como 'estudiante_id'
                const notaRegistrada = notasExistentes.find(
                  (n) => Number(n.estudiante_id) === Number(est.id)
                );

                const isEditing = editingId === est.id;

                return (
                  <tr key={est.id}>
                    <td>
                      {est.nombreCompleto ||
                        `${est.nombre} ${est.apellido || ""}`}
                    </td>
                    <td>{est.rut}</td>

                    {/* --- INPUT DE NOTA --- */}
                    <td>
                      {!notaRegistrada || isEditing ? (
                        <input
                          type="number"
                          min="1.0"
                          max="7.0"
                          step="0.1"
                          className="input-nota"
                          value={inputs[est.id]?.nota || ""}
                          onChange={(e) =>
                            handleInputChange(est.id, "nota", e.target.value)
                          }
                          placeholder="1.0"
                        />
                      ) : (
                        <span className="nota-badge">
                          {notaRegistrada.nota}
                        </span>
                      )}
                    </td>

                    {/* --- INPUT DE OBSERVACIÓN --- */}
                    <td>
                      {!notaRegistrada || isEditing ? (
                        <input
                          type="text"
                          className="input-obs"
                          value={inputs[est.id]?.observacion || ""}
                          onChange={(e) =>
                            handleInputChange(
                              est.id,
                              "observacion",
                              e.target.value
                            )
                          }
                          placeholder="Observación..."
                        />
                      ) : (
                        <span>{notaRegistrada.observacion || "-"}</span>
                      )}
                    </td>

                    {/* --- BOTONES --- */}
                    <td>
                      {!notaRegistrada ? (
                        <button
                          className="btn-action btn-guardar"
                          onClick={() => handleGuardar(est.id)}
                        >
                          Guardar
                        </button>
                      ) : isEditing ? (
                        <>
                          <button
                            className="btn-action btn-confirmar"
                            onClick={() =>
                              handleUpdate(notaRegistrada.id, est.id)
                            }
                          >
                            OK
                          </button>
                          <button
                            className="btn-action btn-cancelar"
                            onClick={handleCancelEdit}
                          >
                            X
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-action btn-editar"
                            onClick={() =>
                              handleEditClick(est.id, notaRegistrada)
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-eliminar"
                            onClick={() => handleDelete(notaRegistrada.id)}
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
    </div>
  );
};

export default DetalleEvaluacion;
