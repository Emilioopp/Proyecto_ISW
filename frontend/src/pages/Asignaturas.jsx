import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";
import axios from "../services/root.service";

const Asignaturas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asignaturas, setAsignaturas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      const response = await axios.get("/asignaturas");
      if (response.data.status === "Success") {
        setAsignaturas(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar asignaturas:", error);
      showErrorAlert("Error", "No se pudieron cargar las asignaturas");
    }
  };

  const handleCrearAsignatura = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/asignaturas", { nombre, codigo });

      if (response.data.status === "Success") {
        showSuccessAlert("Éxito", "Asignatura creada correctamente");
        setNombre("");
        setCodigo("");
        setMostrarFormulario(false);
        cargarAsignaturas();
      } else {
        showErrorAlert(
          "Error",
          response.data.message || "No se pudo crear la asignatura"
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.response?.data?.message || "Error al crear la asignatura"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              📚 Gestión de Asignaturas
            </h1>
            <button
              onClick={() => navigate("/home")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Botón crear (solo Admin) */}
        {user?.rol === "Admin" && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {mostrarFormulario ? "✖ Cancelar" : "➕ Nueva Asignatura"}
            </button>

            {/* Formulario de creación */}
            {mostrarFormulario && (
              <form onSubmit={handleCrearAsignatura} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ej: Derecho Civil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ej: DER101"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Guardar Asignatura
                </button>
              </form>
            )}
          </div>
        )}

        {/* Listado de asignaturas */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Listado de Asignaturas
          </h2>
          {asignaturas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay asignaturas registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {asignaturas.map((asignatura) => (
                    <tr
                      key={asignatura.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-sm">
                        {asignatura.codigo}
                      </td>
                      <td className="px-4 py-3">{asignatura.nombre}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-500 hover:text-blue-700 font-semibold">
                          Ver detalle →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Asignaturas;
