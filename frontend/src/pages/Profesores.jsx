import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import axios from '../services/root.service';

const Profesores = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profesores, setProfesores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');

  const formatearRut = (rutSinFormato) => {
    const limpio = rutSinFormato.replace(/[^0-9kK]/g, '');
    if (limpio.length < 2) return limpio;
    
    const dv = limpio.slice(-1);
    const numero = limpio.slice(0, -1);

    const formateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formateado}-${dv}`;
  };

  const normalizarRut = (rutInput) => {
    if (!rutInput.includes('-')) {
      throw new Error('El RUT debe incluir el guión separador (ej: 12345678-9)');
    }
    
    const limpio = rutInput.replace(/[^0-9kK]/g, '');
    if (limpio.length < 2) return rutInput;
    
    const dv = limpio.slice(-1);
    const numero = limpio.slice(0, -1);
    const formateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formateado}-${dv}`;
  };

  useEffect(() => {
    cargarProfesores();
  }, []);

  const cargarProfesores = async () => {
    try {
      const response = await axios.get('/profesores');
      if (response.data.status === 'Success') {
        setProfesores(response.data.data);
      }
    } catch (error) {
      showErrorAlert('Error', 'No se pudieron cargar los profesores');
    }
  };

  const handleCrearProfesor = async (e) => {
    e.preventDefault();
    try {
      const rutNormalizado = normalizarRut(rut);
      
      const password = rutNormalizado.replace(/\./g, '').replace(/-/g, '').slice(0, -1);
      
      const response = await axios.post('/profesores', { 
        email, 
        nombre, 
        rut: rutNormalizado, 
        password 
      });
      
      if (response.data.status === 'Success') {
        showSuccessAlert('Éxito', 'Profesor creado correctamente');
        setEmail('');
        setNombre('');
        setRut('');
        setMostrarFormulario(false);
        cargarProfesores();
      } else {
        showErrorAlert('Error', response.data.message || 'No se pudo crear el profesor');
      }
    } catch (error) {
      if (error.message && error.message.includes('guión')) {
        showErrorAlert('RUT inválido', error.message);
      } else {
        showErrorAlert('Error', error.response?.data?.message || 'Error al crear el profesor');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">👨‍🏫 Gestión de Profesores</h1>
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Botón crear (solo Admin) */}
        {user?.rol === 'Admin' && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {mostrarFormulario ? '✖ Cancelar' : '➕ Nuevo Profesor'}
            </button>

            {/* Formulario de creación */}
            {mostrarFormulario && (
              <form onSubmit={handleCrearProfesor} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="profesor@ubiobio.cl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ej: Juan Pérez González"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RUT</label>
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="12.345.678-9"
                  />
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    ℹ️ La contraseña inicial será el RUT sin puntos ni guión (solo dígitos sin dígito verificador)
                  </p>
                </div>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Crear Profesor
                </button>
              </form>
            )}
          </div>
        )}

        {/* Listado de profesores */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Listado de Profesores</h2>
          {profesores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay profesores registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">RUT</th>
                  </tr>
                </thead>
                <tbody>
                  {profesores.map((profesor) => (
                    <tr key={profesor.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{profesor.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{profesor.email}</td>
                      <td className="px-4 py-3 font-mono text-sm">{formatearRut(profesor.rut)}</td>
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

export default Profesores;
