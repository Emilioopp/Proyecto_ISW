import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@pages/Login";
import Home from "@pages/Home";
import Asignaturas from "@pages/Asignaturas";
import Profesores from "@pages/Profesores";
import Estudiantes from "@pages/Estudiantes";
import Error404 from "@pages/Error404";
import Root from "@pages/Root";
import ProtectedRoute from "@components/ProtectedRoute";
import DetalleAsignatura from "@pages/DetalleAsignatura.jsx";
import VerEvaluaciones from "@pages/VerEvaluaciones.jsx";
import Placeholder from "@components/Placeholder";
import DetalleEvaluacion from "@pages/DetalleEvaluacion";
import MisEstadisticas from "@pages/MisEstadisticas";
import MisAsignaturasEstudiante from "@pages/MisAsignaturasEstudiante";
import NotasEstudiante from "@pages/NotasEstudiante";
import HistorialEstudiante from "@pages/HistorialEstudiante";
import "@styles/styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/auth",
        element: <Login />,
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mis-estadisticas",
        element: (
          <ProtectedRoute>
            <MisEstadisticas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/mis-asignaturas",
        element: (
          <ProtectedRoute>
            <MisAsignaturasEstudiante />
          </ProtectedRoute>
        ),
      },

      {
        path: "/estudiante/asignaturas/:id",
        element: (
          <ProtectedRoute>
            <NotasEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/historial",
        element: (
          <ProtectedRoute>
            <HistorialEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mis-estadisticas",
        element: (
          <ProtectedRoute>
            <MisEstadisticas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/asignaturas",
        element: (
          <ProtectedRoute>
            <Asignaturas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profesores",
        element: (
          <ProtectedRoute>
            <Profesores />
          </ProtectedRoute>
        ),
      },
      {
        path: "/evaluacion/detalle/:id",
        element: (
          <ProtectedRoute>
            <DetalleEvaluacion />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiantes",
        element: (
          <ProtectedRoute>
            <Estudiantes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mis-asignaturas",
        element: (
          <ProtectedRoute>
            <Asignaturas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mis-estudiantes",
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Mis Estudiantes" icono="👨‍🎓" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/asignaturas/:id",
        element: (
          <ProtectedRoute>
            <DetalleAsignatura />
          </ProtectedRoute>
        ),
      },
      {
        path: "/asignaturas/:id/evaluaciones",
        element: (
          <ProtectedRoute>
            <VerEvaluaciones />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mi-perfil",
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Mi Perfil" icono="👤" />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
