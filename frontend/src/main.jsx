import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Asignaturas from '@pages/Asignaturas';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import Placeholder from '@components/Placeholder';
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/',
        element: <Login />
      },
      {
        path: '/auth',
        element: <Login />
      },
      {
        path: '/home',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: '/asignaturas',
        element: (
          <ProtectedRoute>
            <Asignaturas />
          </ProtectedRoute>
        )
      },
      {
        path: '/profesores',
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Gestión de Profesores" icono="👨‍🏫" />
          </ProtectedRoute>
        )
      },
      {
        path: '/estudiantes',
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Gestión de Estudiantes" icono="👨‍🎓" />
          </ProtectedRoute>
        )
      },
      {
        path: '/mis-asignaturas',
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Mis Asignaturas" icono="📚" />
          </ProtectedRoute>
        )
      },
      {
        path: '/mis-estudiantes',
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Mis Estudiantes" icono="👨‍🎓" />
          </ProtectedRoute>
        )
      },
      {
        path: '/mi-perfil',
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Mi Perfil" icono="👤" />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
