import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  showSuccessAlert,
  showErrorAlert,
  showSuccessToast,
} from "../helpers/sweetAlert";
import axios from "../services/root.service";

const DetalleAsignatura = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asignatura, setAsignatura] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");

  // ESTADOS DE VISIBILIDAD DE FORMULARIOS
  const [mostrarFormEvaluacion, setMostrarFormEvaluacion] = useState(false);
  const [mostrarFormTema, setMostrarFormTema] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Para lógica antigua si la hubiera

  // ESTADOS FORMULARIO EVALUACIÓN ORAL
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Nuevos campos para la entidad actualizada
  const [fechaHora, setFechaHora] = useState("");
  const [sala, setSala] = useState("");
  const [material, setMaterial] = useState("");
  const [duracion, setDuracion] = useState(30); // Duración en minutos

  // ESTADOS TEMAS
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);

  // ESTADO FORMULARIO NUEVO TEMA
  const [nuevoTemaTitulo, setNuevoTemaTitulo] = useState("");

  // ESTADOS FORMULARIO PRÁCTICA (NO TOCAR)
  const [mostrarFormularioPractica, setMostrarFormularioPractica] =
    useState(false);
  const [tituloPractica, setTituloPractica] = useState("");
  const [descripcionPractica, setDescripcionPractica] = useState("");
  const [tiempoMinutosPractica, setTiempoMinutosPractica] = useState(10);

  useEffect(() => {
    cargarAsignatura();
    cargarTemasAsignatura();
  }, [id]);

  const cargarAsignatura = async () => {
    try {
      const response = await axios.get(`/asignaturas/${id}`);
      if (response.data.status === "Success") {
        setAsignatura(response.data.data);
        if (user?.rol === "Admin") cargarProfesores();
      }
    } catch (error) {
      showErrorAlert("Error", "No se pudo cargar la asignatura");
    }
  };

  const cargarProfesores = async () => {
    try {
      const response = await axios.get("/profesores");
      if (response.data.status === "Success") setProfesores(response.data.data);
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar los profesores");
    }
  };

  const handleAsignarProfesor = async () => {
    if (!profesorSeleccionado)
      return showErrorAlert("Error", "Selecciona un profesor");
    try {
      const response = await axios.post("/profesores/asignar", {
        profesorId: Number(profesorSeleccionado),
        asignaturaId: Number(id),
      });
      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Profesor asignado correctamente");
        setProfesorSeleccionado("");
        cargarAsignatura();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo asignar el profesor"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al asignar profesor"
      );
    }
  };

  const handleDesasignarProfesor = async (profId) => {
    try {
      const response = await axios.delete("/profesores/desasignar", {
        data: { profesorId: Number(profId), asignaturaId: Number(id) },
      });
      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Profesor desasignado correctamente");
        cargarAsignatura();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo desasignar el profesor"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al desasignar profesor"
      );
    }
  };

  const cargarTemasAsignatura = async () => {
    try {
      console.log("Cargando temas para asignatura ID:", id);
      const response = await axios.get(`/temas-evaluacion/asignatura/${id}`);
      console.log("Respuesta temas:", response.data);
      if (response.data.status === "Success") {
        setTemasDisponibles(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar temas:", error);
    }
  };

  // CREAR TEMA (NO TOCAR)
  const handleCrearTema = async (e) => {
    e.preventDefault();
    if (!nuevoTemaTitulo.trim())
      return showErrorAlert("Error", "El nombre del tema es obligatorio");

    try {
      const payload = {
        titulo: nuevoTemaTitulo,
        asignaturaIds: [Number(id)],
      };

      const response = await axios.post("/temas-evaluacion", payload);

      if (response.data.status === "Success") {
        showSuccessAlert("Creado", "Tema agregado correctamente");
        setNuevoTemaTitulo("");
        setMostrarFormTema(false);
        cargarTemasAsignatura();
      }
    } catch (error) {
      console.error(error);
      showErrorAlert(
        "Error",
        error.response?.data?.message || "No se pudo crear el tema"
      );
    }
  };

  const handleToggleTema = (temaId) => {
    if (temasSeleccionados.includes(temaId)) {
      setTemasSeleccionados(temasSeleccionados.filter((tid) => tid !== temaId));
    } else {
      setTemasSeleccionados([...temasSeleccionados, temaId]);
    }
  };

  // --- CREAR EVALUACIÓN ORAL (CORREGIDO) ---
  const handleCrearEvaluacion = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!fechaHora || new Date(fechaHora) <= new Date())
      return showErrorAlert("Error", "La fecha debe ser futura.");

    if (temasSeleccionados.length === 0)
      return showErrorAlert("Error", "Selecciona al menos un tema.");

    if (!duracion || parseInt(duracion) <= 0)
      return showErrorAlert("Error", "La duración debe ser mayor a 0.");

    try {
      // Preparamos el payload plano que espera el nuevo backend
      const payload = {
        titulo,
        descripcion,
        sala,
        duracion_minutos: parseInt(duracion),
        material_estudio: material,
        fecha_hora: fechaHora,
        temas: temasSeleccionados, // Array de IDs
      };

      const response = await axios.post(
        `/evaluaciones-orales/${id}`, // URL corregida
        payload
      );

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Evaluación creada correctamente");

        // Limpiar formulario
        setTitulo("");
        setDescripcion("");
        setSala("");
        setMaterial("");
        setFechaHora("");
        setDuracion(30);
        setTemasSeleccionados([]);

        setMostrarFormEvaluacion(false);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al crear evaluación";
      showErrorAlert("Error", msg);
    }
  };

  // CREAR EVALUACIÓN PRÁCTICA (NO TOCAR)
  const handleCrearEvaluacionPractica = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/evaluaciones-practicas`, {
        asignatura_id: Number(id),
        titulo: tituloPractica,
        descripcion: descripcionPractica,
        tiempo_minutos: Number(tiempoMinutosPractica),
      });
      if (response.data.status === "Success") {
        const nueva = response.data.data;
        const nuevaId = nueva?.id;
        showSuccessToast("Evaluación práctica creada");

        if (nuevaId) {
          navigate(`/evaluacion-practica/detalle/${Number(nuevaId)}`);
          return;
        }

        setTituloPractica("");
        setDescripcionPractica("");
        setTiempoMinutosPractica(10);
        setMostrarFormularioPractica(false);
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "Error al crear la evaluación práctica"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al crear la evaluación práctica"
      );
    }
  };

  if (!asignatura)
    return <p className="text-white text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            {asignatura.nombre} ({asignatura.codigo})
          </h1>
          <div className="flex gap-3">
            {(user?.rol === "Profesor" || user?.rol === "Admin") && (
              <button
                onClick={() => {
                  setMostrarFormTema(!mostrarFormTema);
                  setMostrarFormEvaluacion(false);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow"
              >
                📚 Nuevo Tema
              </button>
            )}

            <button
              onClick={() =>
                navigate(
                  user?.rol === "Profesor" ? "/mis-asignaturas" : "/asignaturas"
                )
              }
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Asignar profesor (solo Admin) - MANTENIDO IGUAL */}
        {user?.rol === "Admin" && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">Profesores asignados</h2>
            {asignatura.profesoresAsignados &&
            asignatura.profesoresAsignados.length > 0 ? (
              <ul className="mb-4">
                {asignatura.profesoresAsignados.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <span>
                      {p.nombre} — {p.email}
                    </span>
                    <button
                      onClick={() => handleDesasignarProfesor(p.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Desasignar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-4">
                No hay profesores asignados a esta asignatura
              </p>
            )}
            <div className="flex gap-3 items-center">
              <select
                value={profesorSeleccionado}
                onChange={(e) => setProfesorSeleccionado(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="">-- Selecciona profesor --</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre} — {prof.email}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAsignarProfesor}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Asignar
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* EVALUACIONES ORALES (FORMULARIO ARREGLADO) */}
        {/* ======================================================= */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">Evaluaciones Orales</h2>
            <button
              onClick={() => {
                setMostrarFormEvaluacion(!mostrarFormEvaluacion);
                setMostrarFormTema(false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
              {mostrarFormEvaluacion
                ? "✖ Cancelar"
                : "➕ Crear Evaluación Oral"}
            </button>
          </div>

          {mostrarFormEvaluacion && (
            <div className="mt-4 bg-gray-50 p-6 rounded-xl border border-green-200 shadow-inner animate-fade-in-down">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                Nueva Evaluación Oral
              </h3>

              <form onSubmit={handleCrearEvaluacion} className="space-y-4">
                {/* Fila 1: Título y Duración (Reemplaza al antiguo 'Tipo') */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Certamen 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={duracion}
                      onChange={(e) => setDuracion(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Fila 2: Fecha/Hora y Sala */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Fecha y Hora
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaHora}
                      onChange={(e) => setFechaHora(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Sala / Lugar
                    </label>
                    <input
                      type="text"
                      value={sala}
                      onChange={(e) => setSala(e.target.value)}
                      required
                      placeholder="Ej: Sala 302"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Fila 3: Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Instrucciones para el estudiante..."
                  />
                </div>

                {/* Fila 4: Material */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Link Material (Opcional)
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                {/* Fila 5: Selección de Temas */}
                <div className="bg-white p-4 border rounded-lg border-gray-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Seleccionar Temas a Evaluar:
                  </label>
                  {temasDisponibles.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {temasDisponibles.map((tema) => (
                        <div
                          key={tema.id}
                          className="flex items-center space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100 transition cursor-pointer"
                          onClick={() => handleToggleTema(tema.id)}
                        >
                          <input
                            type="checkbox"
                            checked={temasSeleccionados.includes(tema.id)}
                            onChange={() => {}} // Controlado por el div
                            className="w-5 h-5 text-purple-600 rounded cursor-pointer pointer-events-none"
                          />
                          <span className="text-sm text-gray-700 select-none">
                            {tema.titulo}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-yellow-50 rounded text-yellow-700 text-sm">
                      ⚠️ No hay temas creados.
                      <br />
                      <span className="font-bold">
                        ¡Crea un tema arriba para continuar!
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg mt-4 transition"
                >
                  💾 Guardar Evaluación Oral
                </button>
              </form>
            </div>
          )}

          {/* Botón ver listado */}
          <div className="mt-4">
            <button
              onClick={() => navigate(`/asignaturas/${id}/evaluaciones`)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md w-full sm:w-auto"
            >
              📂 Ver Evaluaciones Orales
            </button>
          </div>
        </div>

        {/* FORMULARIO DE NUEVO TEMA (MANTENIDO IGUAL) */}
        {mostrarFormTema && (
          <div className="mb-8 bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-inner animate-fade-in-down">
            <h3 className="text-lg font-bold text-indigo-800 mb-3">
              Agregar Nuevo Tema a la Asignatura
            </h3>
            <form
              onSubmit={handleCrearTema}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="Nombre del tema (Ej: Modelo Relacional)"
                value={nuevoTemaTitulo}
                onChange={(e) => setNuevoTemaTitulo(e.target.value)}
                className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow"
              >
                Guardar Tema
              </button>
            </form>
          </div>
        )}

        {/* Evaluaciones Practicas (MANTENIDO IGUAL) */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold">Evaluaciones Prácticas</h2>
            <button
              onClick={() =>
                setMostrarFormularioPractica(!mostrarFormularioPractica)
              }
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md"
            >
              {mostrarFormularioPractica
                ? "✖ Cancelar"
                : "➕ Crear Evaluación Práctica"}
            </button>
          </div>
          {mostrarFormularioPractica && (
            <form
              onSubmit={handleCrearEvaluacionPractica}
              className="mt-4 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={tituloPractica}
                  onChange={(e) => setTituloPractica(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Ej: Práctica 1"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcionPractica}
                  onChange={(e) => setDescripcionPractica(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Breve descripción de la práctica"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tiempo (minutos)
                </label>
                <input
                  type="number"
                  min={1}
                  value={tiempoMinutosPractica}
                  onChange={(e) => setTiempoMinutosPractica(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full"
              >
                Guardar Evaluación Práctica
              </button>
            </form>
          )}
          <div className="mt-4">
            <button
              onClick={() =>
                navigate(`/asignaturas/${id}/evaluaciones-practicas`)
              }
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md w-full sm:w-auto"
            >
              📂 Ver Evaluaciones Prácticas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleAsignatura;
