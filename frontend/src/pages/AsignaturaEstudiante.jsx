import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../services/root.service";

const AsignaturaEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [asignaturaRemota, setAsignaturaRemota] = useState(null);
  const [cargando, setCargando] = useState(false);

  const asignatura = useMemo(() => {
    return location.state?.asignatura || asignaturaRemota;
  }, [location.state?.asignatura, asignaturaRemota]);

  useEffect(() => {
    if (!location.state?.asignatura) {
      fetchAsignatura();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAsignatura = async () => {
    setCargando(true);
    try {
      const response = await axios.get(`/asignaturas/${id}`);
      if (response.data.status === "Success") {
        setAsignaturaRemota(response.data.data);
      }
    } catch (error) {
      console.error("No se pudo cargar la asignatura", error);
    } finally {
      setCargando(false);
    }
  };

  const navegarA = (path) => {
    navigate(path, { state: asignatura ? { asignatura } : undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {asignatura
                ? asignatura.nombre
                : cargando
                  ? "Cargando..."
                  : "Sin datos"}
            </h1>
            <p className="text-gray-600 mt-1">
              {asignatura?.codigo || ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/estudiante/mis-asignaturas")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navegarA(`/estudiante/asignaturas/${id}/orales`)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            🗣️ Evaluaciones Orales (próximamente)
          </button>

          <button
            onClick={() => navegarA(`/estudiante/asignaturas/${id}/practicas`)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            📝 Evaluaciones Prácticas
          </button>

          <button
            onClick={() => navegarA(`/estudiante/asignaturas/${id}/notas`)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            📈 Ver Mis Notas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignaturaEstudiante;