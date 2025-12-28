import { useLocation, useNavigate, useParams } from "react-router-dom";

const AsignaturaEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const asignatura = location.state?.asignatura;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Asignatura</h1>
            <p className="text-gray-600">
              {asignatura ? `${asignatura.nombre} (${asignatura.codigo})` : `ID ${id}`}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Evaluaciones orales */}
          <button
            onClick={() =>
              navigate(`/estudiante/asignaturas/${id}/orales`, {
                state: { asignatura },
              })
            }
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            🗣️ Evaluaciones Orales (próximamente)
          </button>

          {/* Evaluaciones practicas */}
          <button
            onClick={() =>
              navigate(`/estudiante/asignaturas/${id}/practicas`, {
                state: { asignatura },
              })
            }
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            📝 Evaluaciones Prácticas (próximamente)
          </button>

          <button
            onClick={() => navigate(`/estudiante/asignaturas/${id}/notas`, { state: { asignatura } })}
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
