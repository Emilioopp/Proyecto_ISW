import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { logout } from "../services/auth.service";

const Home = () => {
  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();

    setUser(null);

    navigate("/auth");
  };

  if (!user) {
    navigate("/auth");

    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bienvenido, {user.nombre}
              </h1>

              <p className="text-gray-600 mt-1">
                Rol:{" "}
                <span className="font-semibold text-purple-600">
                  {user.rol}
                </span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Contenido según rol */}

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {user.rol === "Admin" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Panel de Administrador
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate("/asignaturas")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  📚 Gestionar Asignaturas
                </button>

                <button
                  onClick={() => navigate("/profesores")}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  👨‍🏫 Gestionar Profesores
                </button>

                <button
                  onClick={() => navigate("/estudiantes")}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  👨‍🎓 Gestionar Estudiantes
                </button>
              </div>
            </div>
          )}

          {user.rol === "Profesor" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Panel de Profesor
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/mis-asignaturas")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  📚 Mis Asignaturas
                </button>

                <button
                  onClick={() => navigate("/mis-estudiantes")}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  👨‍🎓 Mis Estudiantes
                </button>
              </div>
            </div>
          )}

          {user.rol === "Estudiante" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Mi Portal Estudiantil
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {" "}
                <button
                  onClick={() => navigate("/mis-estadisticas")}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  📊 Mi Rendimiento
                  <div className="text-sm font-normal mt-1 text-orange-100">
                    Ver estadísticas y promedios
                  </div>
                </button>
                {/* ----------------------------------- */}
                <button
                  onClick={() => navigate("/estudiante/mis-asignaturas")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  📚 Mis Asignaturas
                </button>
                <button
                  onClick={() => navigate("/mi-perfil")}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  👤 Mi Perfil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
