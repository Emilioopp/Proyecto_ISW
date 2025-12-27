import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";
import axios from "../services/root.service";
import { format } from "date-fns";

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

  const [fechaHora, setFechaHora] = useState("");
  const [sala, setSala] = useState("");
  const [material, setMaterial] = useState("");
  
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);

  useEffect(() => {
    cargarAsignatura();
    cargarTemasAsignatura();
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

  const cargarTemasAsignatura = async () => {
    try {
      // Ajusta la URL según cómo definiste la ruta en backend (ej: /temas-evaluacion/asignatura/:id)
      const response = await axios.get(`/temas-evaluacion/asignatura/${id}`);
      if (response.data.status === "Success") {
        setTemasDisponibles(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar temas:", error);
      // No mostramos alerta intrusiva, solo log, para no molestar si no hay temas
    }
  };

  // Manejar selección de checkboxes
  const handleToggleTema = (temaId) => {
    if (temasSeleccionados.includes(temaId)) {
      setTemasSeleccionados(temasSeleccionados.filter(tid => tid !== temaId));
    } else {
      setTemasSeleccionados([...temasSeleccionados, temaId]);
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

      if (new Date(fechaHora) <= new Date()) {
        return showErrorAlert("Error", "La fecha y hora no pueden ser en el pasado");
      }
      if (temasSeleccionados.length === 0) {
        return showErrorAlert("Error", "Debes seleccionar al menos un tema a evaluar");
      }

      try {
      const payload = {
        titulo,
        descripcion,
        tipo,
        fecha_hora: fechaHora,
        sala,
        material_estudio: material,
        temasIds: temasSeleccionados
      };

      // Llamada al backend
      const response = await axios.post(`/evaluaciones/${id}`, payload);

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación creada correctamente");
        
        // Limpiar el formulario
        setTitulo("");
        setDescripcion("");
        setTipo("oral");
        setFechaHora("");
        setSala("");
        setMaterial("");
        setTemasSeleccionados([]); // Limpiamos los temas seleccionados
        setMostrarFormulario(false);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "Error al crear la evaluación"
        );
      }
    } catch (error) {
      console.error("Error completo:", error);
      
      const errorMessage = error.response?.data?.details 
        ? error.response.data.details.map(d => d.message).join(", ") // A veces details es un array de objetos
        : error.response?.data?.message || "Error al crear la evaluación";
      
      showErrorAlert("Error", errorMessage);
    }
  }; 

  if (!asignatura) return <p className="text-white text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            {asignatura.nombre} ({asignatura.codigo})
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            ← Volver
          </button>
        </div>

        {/* SECCIÓN ADMIN PROFESORES (Si existe en tu código, mantenla aquí) */}
        {user?.rol === 'Admin' && (
             <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                {/* ... Tu lógica de asignar profesores ... */}
                <p>Panel de Administración de Profesores (Visible solo para Admin)</p>
             </div>
        )}

        {/* BOTÓN DESPLEGAR FORMULARIO */}
        {(user?.rol === 'Profesor' || user?.rol === 'Admin') && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`w-full sm:w-auto font-bold py-3 px-6 rounded-lg transition-all mb-4 shadow-md text-white ${
              mostrarFormulario ? "bg-red-500" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {mostrarFormulario ? "✖ Cancelar" : "➕ Crear Nueva Evaluación"}
          </button>
        )}

        {/* --- FORMULARIO DE CREACIÓN --- */}
        {mostrarFormulario && (
          <div className="mt-2 mb-8 bg-gray-50 p-6 rounded-xl border border-blue-200 shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Detalles de la Evaluación</h3>
            
            <form onSubmit={handleCrearEvaluacion} className="space-y-4">
              
              {/* FILA 1: Título y Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Título</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ej: Certamen 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="oral">Oral</option>
                    <option value="presencial">Presencial</option>
                    <option value="entregable">Entregable</option>
                  </select>
                </div>
              </div>

              {/* FILA 2: Fecha y Sala */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Sala / Lugar</label>
                  <input
                    type="text"
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                    required
                    placeholder="Ej: Lab 3, Sala 204"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  rows="2"
                  placeholder="Instrucciones generales..."
                />
              </div>

              {/* Material (Opcional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Link Material de Estudio (Opcional)</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* --- SELECCIÓN DE TEMAS --- */}
              <div className="bg-white p-4 border rounded-lg border-gray-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Seleccionar Temas a Evaluar:
                </label>
                
                {temasDisponibles.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {temasDisponibles.map((tema) => (
                      <div key={tema.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          id={`tema-${tema.id}`}
                          checked={temasSeleccionados.includes(tema.id)}
                          onChange={() => handleToggleTema(tema.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                        <label htmlFor={`tema-${tema.id}`} className="text-sm text-gray-700 cursor-pointer w-full select-none">
                          {tema.titulo}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-yellow-50 rounded text-yellow-700 text-sm">
                    ⚠️ No hay temas creados para esta asignatura. <br/>
                    Crea temas primero en el panel de gestión.
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  * Selecciona los temas que se incluirán en esta evaluación.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg mt-4 transition transform hover:scale-[1.01]"
              >
                💾 Guardar Evaluación
              </button>
            </form>
          </div>
        )}

        {/* NAVEGACIÓN A LISTADO */}
        <div className="text-center sm:text-left mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-600 mb-3">
            {user?.rol === "Estudiante" ? "Mis evaluaciones pendientes:" : "Gestionar evaluaciones:"}
          </p>
          <button
            onClick={() => navigate(`/asignaturas/${id}/evaluaciones`)}
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2"
          >
            📂 Ver Listado de Evaluaciones
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleAsignatura;