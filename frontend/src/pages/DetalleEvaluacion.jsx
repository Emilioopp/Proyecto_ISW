import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import evaluacionService from "../services/evaluacion";

const DetalleEvaluacion = () => {
  const { id } = useParams(); // id de la evaluación
  const navigate = useNavigate();

  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Cargar notas de la evaluación
  // ===============================
  const cargarNotas = async () => {
    try {
      const response = await evaluacionService.getNotasByEvaluacion(id);
      setNotas(response.data);
    } catch (error) {
      console.error("Error al cargar notas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotas();
  }, [id]);

  // ===============================
  // Eliminar evaluación
  // ===============================
  const eliminarEvaluacion = async () => {
    const confirmacion = window.confirm(
      "¿Estás seguro de eliminar esta evaluación?"
    );
    if (!confirmacion) return;

    try {
      await evaluacionService.deleteEvaluacion(id);
      alert("Evaluación eliminada");
      navigate(-1); // volver atrás
    } catch (error) {
      console.error("Error al eliminar evaluación", error);
    }
  };

  // ===============================
  // Eliminar nota
  // ===============================
  const eliminarNota = async (notaId) => {
    try {
      await evaluacionService.deleteNota(notaId);
      cargarNotas(); // refrescar lista
    } catch (error) {
      console.error("Error al eliminar nota", error);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Detalle de Evaluación</h2>

      <button onClick={eliminarEvaluacion} style={{ color: "red" }}>
        Eliminar evaluación
      </button>

      <hr />

      <h3>Notas registradas</h3>

      {notas.length === 0 ? (
        <p>No hay notas registradas</p>
      ) : (
        <ul>
          {notas.map((nota) => (
            <li key={nota.id}>
              <strong>{nota.estudiante?.nombre}</strong> — Nota: {nota.nota}

              <button
                onClick={() => eliminarNota(nota.id)}
                style={{ marginLeft: "10px" }}
              >
                Eliminar nota
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DetalleEvaluacion;
