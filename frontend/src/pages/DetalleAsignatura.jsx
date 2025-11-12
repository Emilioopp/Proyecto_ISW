import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";
import axios from "../services/root.service";

const DetalleAsignatura = () => {
  const { id } = useParams(); // id de la asignatura
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asignatura, setAsignatura] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Cargar los datos de la asignatura
  useEffect(() => {
    cargarAsignatura();
  }, [id]);

  const cargarAsignatura = async () => {
    try {
      const response = await axios.get(`/asignaturas/${id}`);
      if (response.data.status === "Success") {
        setAsignatura(response.data.data);
      }
    } catch (error) {
      showErrorAlert("Error", "No se pudo cargar la asignatura");
    }
  };

  const handleCrearEvaluacion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/evaluaciones-orales`, {
        codigo_asignatura: asignatura.codigo,
        titulo,
        descripcion,
      });

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación oral creada correctamente");
        setTitulo("");
        setDescripcion("");
        setMostrarFormulario(false);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "Error al crear la evaluación"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al crear la evaluación"
      );
    }
  };

  if (!asignatura) return <p>Cargando asignatura...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {asignatura.nombre} ({asignatura.codigo})
        </h1>

        {/* Botón Crear Evaluación Oral */}
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all mb-4"
        >
          {mostrarFormulario ? "✖ Cancelar" : "➕ Crear Evaluación Oral"}
        </button>

        {/* Formulario de creación */}
        {mostrarFormulario && (
          <form onSubmit={handleCrearEvaluacion} className="mt-4 space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Ej: Examen Oral 1"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Breve descripción de la evaluación"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Guardar Evaluación
            </button>
          </form>
        )}

        {/* Botón para ver evaluaciones */}
        <button
          onClick={() => navigate(`/asignaturas/${id}/evaluaciones`)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all mt-6"
        >
          Ver Evaluaciones
        </button>
      </div>
    </div>
  );
};

export default DetalleAsignatura;
