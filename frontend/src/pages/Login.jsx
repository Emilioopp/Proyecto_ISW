import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert.js';
import useLogin from '../hooks/useLogin.jsx';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { errorEmail, errorPassword, errorData, handleInputChange } = useLogin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password });
            if (res && res.data && res.data.user) {
                setUser(res.data.user);
                showSuccessAlert('Bienvenido', res.message || 'Inicio de sesión correcto');
                navigate('/');
            } else {
                const message = res?.message || 'Credenciales incorrectas';
                errorData(message);
                showErrorAlert('Error', message);
            }
        } catch (error) {
            const message = error?.message || 'Error al conectar con el servidor';
            errorData(message);
            showErrorAlert('Error', message);
            console.error('Login error:', error);
        }
    }    

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md transform transition-all hover:scale-105">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-8">
                        Iniciar sesión
                    </h1>
                    
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
                            placeholder="usuario@ejemplo.com"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                        {errorEmail && <span className="text-red-500 text-sm font-medium">{errorEmail}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                            placeholder="**********"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                        {errorPassword && <span className="text-red-500 text-sm font-medium">{errorPassword}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;