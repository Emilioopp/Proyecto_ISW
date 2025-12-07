import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import axios from '../services/root.service';

const Estudiantes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asignaturas, setAsignaturas] = useState([]);
  const [estudiantesActuales, setEstudiantesActuales] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [estudianteExiste, setEstudianteExiste] = useState(null);

  const formatearRut = (rutSinFormato) => {
    if (!rutSinFormato) return '';
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
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
       // implementar endpoint /api/profesores/mis-asignaturas)
       const endpoint = user?.rol === 'Admin' ? '/asignaturas' : '/asignaturas'; // Cambiar a /profesores/mis-asignaturas cuando este
       const response = await axios.get(endpoint);
      if (response.data.status === 'Success') {
        setAsignaturas(response.data.data);
      }
    } catch (error) {
      showErrorAlert('Error', 'No se pudieron cargar las asignaturas');
    }
  };

  const cargarEstudiantesPorAsignatura = async (asignaturaId) => {
    try {
      const response = await axios.get(`/estudiantes/asignatura/${asignaturaId}`);
      if (response.data.status === 'Success') {
        setEstudiantesActuales(response.data.data);
      }
    } catch (error) {
      setEstudiantesActuales([]);
    }
  };

  const buscarEstudiantePorEmail = async (emailBuscar) => {
    if (!emailBuscar || !emailBuscar.includes('@')) return;
    
    try {
      const response = await axios.get(`/estudiantes/buscar-por-email/${emailBuscar}`);
      if (response.data.status === 'Success' && response.data.data.existe) {
        setEstudianteExiste(response.data.data.estudiante);
        setNombre(response.data.data.estudiante.nombre);
        setRut(response.data.data.estudiante.rut);
      } else {
        setEstudianteExiste(null);
        setNombre('');
        setRut('');
      }
    } catch (error) {
      setEstudianteExiste(null);
    }
  };

  const handleEmailChange = (e) => {
    const nuevoEmail = e.target.value;
    setEmail(nuevoEmail);
    if (nuevoEmail.includes('@')) {
      buscarEstudiantePorEmail(nuevoEmail);
    }
  };

  const handleAsignaturaChange = (e) => {
    const id = e.target.value;
    setAsignaturaSeleccionada(id);
    if (id) {
      cargarEstudiantesPorAsignatura(id);
    } else {
      setEstudiantesActuales([]);
    }
  };

  const handleInscribirEstudiante = async (e) => {
    e.preventDefault();
    
    if (!asignaturaSeleccionada) {
      showErrorAlert('Error', 'Debes seleccionar una asignatura');
      return;
    }

    try {
      const datos = { asignaturaId: Number(asignaturaSeleccionada), email };
      
      if (!estudianteExiste) {
        const rutNormalizado = normalizarRut(rut);
        datos.nombre = nombre;
        datos.rut = rutNormalizado;
      }

      const response = await axios.post('/estudiantes/inscribir', datos);
      
      if (response.data.status === 'Success') {
        showSuccessAlert('Éxito', estudianteExiste 
          ? 'Estudiante inscrito en la asignatura' 
          : 'Estudiante creado e inscrito en la asignatura'
        );
        setEmail('');
        setNombre('');
        setRut('');
        setEstudianteExiste(null);
        setMostrarFormulario(false);
        cargarEstudiantesPorAsignatura(asignaturaSeleccionada);
      } else {
        showErrorAlert('Error', response.data.message || 'No se pudo inscribir el estudiante');
      }
    } catch (error) {
      if (error.message && error.message.includes('guión')) {
        showErrorAlert('RUT inválido', error.message);
      } else {
        showErrorAlert('Error', error.response?.data?.message || 'Error al inscribir estudiante');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">👨‍🎓 Gestión de Estudiantes</h1>
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Selector de asignatura */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Seleccionar Asignatura
          </label>
          <select
            value={asignaturaSeleccionada}
            onChange={handleAsignaturaChange}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            <option value="">-- Selecciona una asignatura --</option>
            {asignaturas.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.codigo} - {asignatura.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón inscribir */}
        {asignaturaSeleccionada && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {mostrarFormulario ? '✖ Cancelar' : '➕ Inscribir Estudiante'}
            </button>

            {/* Formulario de inscripción */}
            {mostrarFormulario && (
              <form onSubmit={handleInscribirEstudiante} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email del estudiante</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="estudiante@alumnos.ubiobio.cl"
                  />
                  {estudianteExiste && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Estudiante encontrado: {estudianteExiste.nombre} - {estudianteExiste.rut}
                    </p>
                  )}
                </div>

                {!estudianteExiste && email.includes('@') && (
                  <>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-sm text-yellow-700">
                        ⚠️ Estudiante nuevo. Completa los datos para crearlo:
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        placeholder="Ej: María González López"
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
                  </>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    ℹ️ La contraseña inicial será el RUT sin puntos ni guión (solo dígitos sin dígito verificador)
                  </p>
                </div>

                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  {estudianteExiste ? 'Inscribir en Asignatura' : 'Crear e Inscribir'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Listado de estudiantes */}
        {asignaturaSeleccionada && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Estudiantes inscritos en esta asignatura
            </h2>
            {estudiantesActuales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay estudiantes inscritos en esta asignatura</p>
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
                    {estudiantesActuales.map((estudiante) => (
                      <tr key={estudiante.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{estudiante.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{estudiante.email}</td>
                        <td className="px-4 py-3 font-mono text-sm">{formatearRut(estudiante.rut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Estudiantes;
