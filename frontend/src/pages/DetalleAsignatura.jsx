import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";
import axios from "../services/root.service";

const DetalleAsignatura = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asignatura, setAsignatura] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("oral");

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
      const response = await axios.post(`/evaluaciones/${id}`, {
        titulo,
        descripcion,
        tipo,
      });

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación creada correctamente");
        setTitulo("");
        setDescripcion("");
        setTipo("oral");
        setMostrarFormulario(false);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "Error al crear la evaluación"
        );
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      
      const errorMessage = error.response?.data?.details 
        ? error.response.data.details.join(", ")
        : error.response?.data?.message || "Error al crear la evaluación";
      
      showErrorAlert("Error", errorMessage);
    }
  };

  if (!asignatura) return <p>Cargando asignatura...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        {/* ENCABEZADO CON BOTÓN VOLVER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            {asignatura.nombre} ({asignatura.codigo})
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* Botón Crear Evaluación (solo para Profesor y Admin) */}
        {user?.rol !== "Estudiante" && (
          <>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md w-full"
            >
              {mostrarFormulario ? "✖ Cancelar" : "➕ Crear Evaluación"}
            </button>

            {/* Formulario de creación */}
            {mostrarFormulario && (
              <form
                onSubmit={handleCrearEvaluacion}
                className="mt-4 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
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
                    placeholder="Ej: Examen 1"
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
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tipo de Evaluación
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
                  >
                    <option value="oral">Oral</option>
                    <option value="presencial">Presencial</option>
                    <option value="entregable">Entregable</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full"
                >
                  Guardar Evaluación
                </button>
              </form>
            )}

            <hr className="my-6 border-gray-200" />
          </>
        )}

        {/* Botón para ver Evaluaciones */}
        <div className="text-center sm:text-left">
          <p className="text-gray-600 mb-2">
            {user?.rol === "Estudiante" 
              ? "Ver evaluaciones disponibles:" 
              : "Gestionar evaluaciones existentes:"}
          </p>
          <button
            onClick={() => navigate(`/asignaturas/${id}/evaluaciones`)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md w-full sm:w-auto"
          >
            📂 Ver Evaluaciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleAsignatura;
