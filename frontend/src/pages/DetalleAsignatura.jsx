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
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
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
        // si es admin carga lista de profesores para asignar
        if (user?.rol === 'Admin') {
          cargarProfesores();
        }
      }
    } catch (error) {
      showErrorAlert("Error", "No se pudo cargar la asignatura");
    }
  };

  const cargarProfesores = async () => {
    try {
      const response = await axios.get('/profesores');
      if (response.data.status === 'Success') setProfesores(response.data.data);
    } catch (error) {
      showErrorAlert('Error', 'No se pudieron cargar los profesores');
    }
  };

  const handleAsignarProfesor = async () => {
    if (!profesorSeleccionado) return showErrorAlert('Error', 'Selecciona un profesor');
    try {
      const response = await axios.post('/profesores/asignar', { profesorId: Number(profesorSeleccionado), asignaturaId: Number(id) });
      if (response.data.status === 'Success') {
        showSuccessAlert('Éxito', 'Profesor asignado correctamente');
        cargarAsignatura();
      } else {
        showErrorAlert('Error', response.data.message || 'No se pudo asignar el profesor');
      }
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Error al asignar profesor');
    }
  };

  const handleDesasignarProfesor = async (profId) => {
    try {
      const response = await axios.delete('/profesores/desasignar', { data: { profesorId: Number(profId), asignaturaId: Number(id) } });
      if (response.data.status === 'Success') {
        showSuccessAlert('Éxito', 'Profesor desasignado correctamente');
        cargarAsignatura();
      } else {
        showErrorAlert('Error', response.data.message || 'No se pudo desasignar el profesor');
      }
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Error al desasignar profesor');
    }
  };

  const handleCrearEvaluacion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/evaluaciones-orales/${id}`, {
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

        {/* Sección: asignar profesor (solo Admin) */}
        {user?.rol === 'Admin' && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">Profesores asignados</h2>
            {asignatura.profesoresAsignados && asignatura.profesoresAsignados.length > 0 ? (
              <ul className="mb-4">
                {asignatura.profesoresAsignados.map((p) => (
                  <li key={p.id} className="flex justify-between items-center py-2 border-b">
                    <span>{p.nombre} — {p.email}</span>
                    <button onClick={() => handleDesasignarProfesor(p.id)} className="text-red-500 hover:text-red-700">Desasignar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-4">No hay profesores asignados a esta asignatura</p>
            )}

            <div className="flex gap-3 items-center">
              <select value={profesorSeleccionado} onChange={(e) => setProfesorSeleccionado(e.target.value)} className="px-3 py-2 border rounded">
                <option value="">-- Selecciona profesor --</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>{prof.nombre} — {prof.email}</option>
                ))}
              </select>
              <button onClick={handleAsignarProfesor} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Asignar</button>
            </div>
          </div>
        )}

        {/* Botón Crear Evaluación Oral */}
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all mb-4 shadow-md w-full sm:w-auto"
        >
          {mostrarFormulario ? "✖ Cancelar" : "➕ Crear Evaluación Oral"}
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
          </form>
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