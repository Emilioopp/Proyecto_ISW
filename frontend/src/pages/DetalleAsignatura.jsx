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
  
  // ESTADOS DE VISIBILIDAD DE FORMULARIOS
  const [mostrarFormEvaluacion, setMostrarFormEvaluacion] = useState(false);
  const [mostrarFormTema, setMostrarFormTema] = useState(false); // NUEVO

  // ESTADOS FORMULARIO EVALUACIÓN
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("oral");
  const [fechaHora, setFechaHora] = useState("");
  const [sala, setSala] = useState("");
  const [material, setMaterial] = useState("");
  
  // ESTADOS TEMAS
  const [temasDisponibles, setTemasDisponibles] = useState([]); 
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);
  
  // ESTADO FORMULARIO NUEVO TEMA
  const [nuevoTemaTitulo, setNuevoTemaTitulo] = useState(""); // NUEVO

  useEffect(() => {
    cargarAsignatura();
    cargarTemasAsignatura();
  }, [id]);

  const cargarAsignatura = async () => {
    try {
      const response = await axios.get(`/asignaturas/${id}`);
      if (response.data.status === "Success") {
        setAsignatura(response.data.data);
        if (user?.rol === 'Admin') cargarProfesores();
      }
    } catch (error) {
      showErrorAlert("Error", "No se pudo cargar la asignatura");
    }
  };

  const cargarProfesores = async () => { /* ... lógica admin ... */ };

  const cargarTemasAsignatura = async () => {
    try {
      const response = await axios.get(`/temas-evaluacion/asignatura/${id}`);
      if (response.data.status === "Success") {
        setTemasDisponibles(response.data.data);
      }
    } catch (error) {
      console.log("No hay temas o error al cargar");
    }
  };

  // --- LÓGICA CREAR TEMA RÁPIDO ---
  const handleCrearTema = async (e) => {
    e.preventDefault();
    if (!nuevoTemaTitulo.trim()) return showErrorAlert("Error", "El nombre del tema es obligatorio");

    try {
      const payload = {
        titulo: nuevoTemaTitulo,
        asignaturaIds: [Number(id)] // Asociamos a esta asignatura
      };
      
      const response = await axios.post('/temas-evaluacion', payload);
      
      if (response.data.status === "Success") {
        showSuccessAlert("Creado", "Tema agregado correctamente");
        setNuevoTemaTitulo("");
        setMostrarFormTema(false);
        cargarTemasAsignatura(); // Recargamos la lista para que aparezca en el checkbox
      }
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo crear el tema");
    }
  };

  const handleToggleTema = (temaId) => {
    if (temasSeleccionados.includes(temaId)) {
      setTemasSeleccionados(temasSeleccionados.filter(tid => tid !== temaId));
    } else {
      setTemasSeleccionados([...temasSeleccionados, temaId]);
    }
  };

  const handleCrearEvaluacion = async (e) => {
    e.preventDefault();
    // Validaciones
    if (!fechaHora || new Date(fechaHora) <= new Date()) return showErrorAlert("Error", "La fecha debe ser futura.");
    if (temasSeleccionados.length === 0) return showErrorAlert("Error", "Selecciona al menos un tema.");

    try {
      const payload = {
        titulo, descripcion, tipo, fecha_hora: fechaHora, sala, material_estudio: material, temasIds: temasSeleccionados
      };

      const response = await axios.post(`/evaluaciones/${id}`, payload); // Asegúrate de que esta ruta sea correcta en tu backend

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación creada correctamente");
        setTitulo(""); setDescripcion(""); setTipo("oral"); setFechaHora(""); setSala(""); setMaterial("");
        setTemasSeleccionados([]);
        setMostrarFormEvaluacion(false);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error al crear evaluación";
      showErrorAlert("Error", msg);
    }
  };

  if (!asignatura) return <p className="text-white text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">{asignatura.nombre} ({asignatura.codigo})</h1>
          <button onClick={() => navigate(-1)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md">
            ← Volver
          </button>
        </div>

        {/* --- ZONA DE ACCIONES (BOTONES REORGANIZADOS) --- */}
        {(user?.rol === 'Profesor' || user?.rol === 'Admin') && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            
            {/* BOTÓN IZQUIERDA: CREAR TEMA */}
            <button
              onClick={() => {
                setMostrarFormTema(!mostrarFormTema);
                setMostrarFormEvaluacion(false); // Cierra el otro form para no saturar
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {mostrarFormTema ? "✖ Cerrar Tema" : "📚 Nuevo Tema"}
            </button>

            {/* BOTÓN DERECHA: CREAR EVALUACIÓN */}
            <button
              onClick={() => {
                setMostrarFormEvaluacion(!mostrarFormEvaluacion);
                setMostrarFormTema(false); // Cierra el otro form
              }}
              className={`font-bold py-3 px-6 rounded-lg shadow-md text-white transition-all ${
                mostrarFormEvaluacion ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {mostrarFormEvaluacion ? "✖ Cancelar Evaluación" : "📝 Crear Evaluación"}
            </button>
          </div>
        )}

        {/* --- FORMULARIO DE NUEVO TEMA --- */}
        {mostrarFormTema && (
          <div className="mb-8 bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-inner animate-fade-in-down">
            <h3 className="text-lg font-bold text-indigo-800 mb-3">Agregar Nuevo Tema a la Asignatura</h3>
            <form onSubmit={handleCrearTema} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Nombre del tema (Ej: Modelo Relacional)" 
                value={nuevoTemaTitulo}
                onChange={(e) => setNuevoTemaTitulo(e.target.value)}
                className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow">
                Guardar Tema
              </button>
            </form>
          </div>
        )}

        {/* --- FORMULARIO DE NUEVA EVALUACIÓN --- */}
        {mostrarFormEvaluacion && (
          <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-green-200 shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Detalles de la Evaluación</h3>
            <form onSubmit={handleCrearEvaluacion} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Título</label>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Ej: Certamen 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Tipo</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="oral">Oral</option>
                    <option value="presencial">Presencial</option>
                    <option value="entregable">Entregable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Fecha y Hora</label>
                  <input type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Sala / Lugar</label>
                  <input type="text" value={sala} onChange={(e) => setSala(e.target.value)} required placeholder="Ej: Lab 3" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows="2" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700">Link Material (Opcional)</label>
                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
              </div>

              {/* LISTADO DE TEMAS (CHECKBOXES) */}
              <div className="bg-white p-4 border rounded-lg border-gray-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Temas a Evaluar:</label>
                {temasDisponibles.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {temasDisponibles.map((tema) => (
                      <div key={tema.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100 transition">
                        <input type="checkbox" id={`tema-${tema.id}`} checked={temasSeleccionados.includes(tema.id)} onChange={() => handleToggleTema(tema.id)} className="w-5 h-5 text-purple-600 rounded cursor-pointer" />
                        <label htmlFor={`tema-${tema.id}`} className="text-sm text-gray-700 cursor-pointer w-full select-none">{tema.titulo}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-yellow-50 rounded text-yellow-700 text-sm">
                    ⚠️ No hay temas creados. <br/>
                    <span className="font-bold">¡Usa el botón "Nuevo Tema" arriba para crear uno!</span>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg mt-4 transition">
                💾 Guardar Evaluación
              </button>
            </form>
          </div>
        )}

        {/* NAVEGACIÓN A LISTADO (Tu botón que da 404 por ahora) */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => navigate(`/asignaturas/${id}/evaluaciones`)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg">
            Ver Listado Completo (En construcción)
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleAsignatura;