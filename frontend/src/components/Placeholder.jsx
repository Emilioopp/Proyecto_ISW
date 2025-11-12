import { useNavigate } from 'react-router-dom';

const Placeholder = ({ titulo, icono }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">{icono} {titulo}</h1>
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              ← Volver al Home
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-4">{icono}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Página en construcción</h2>
          <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
