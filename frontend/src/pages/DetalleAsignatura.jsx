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

  // Cargar los datos de la asignatura
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