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
import VerEvaluacionesPracticas from "@pages/VerEvaluacionesPracticas.jsx";
import Placeholder from "@components/Placeholder";
import DetalleEvaluacion from "@pages/DetalleEvaluacion";
import DetalleEvaluacionPractica from "@pages/DetalleEvaluacionPractica";
import MisEstadisticas from "@pages/MisEstadisticas";
import ListaEvaluacionesPracticasEstudiante from "@pages/ListaEvaluacionesPracticasEstudiante";
import IniciarEvaluacionPractica from "@pages/IniciarEvaluacionPractica";
import IntentoEvaluacionPractica from "@pages/IntentoEvaluacionPractica";
import ResultadoIntentoPractica from "@pages/ResultadoIntentoPractica";
import PracticasRealizadasEstudiante from "@pages/PracticasRealizadasEstudiante";
import MisAsignaturasEstudiante from "@pages/MisAsignaturasEstudiante";
import NotasEstudiante from "@pages/NotasEstudiante";
import AsignaturaEstudiante from "@pages/AsignaturaEstudiante";
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
        path: "/evaluaciones-orales/:id/evaluaciones-orales",
        element: (
          <ProtectedRoute>
            <VerEvaluaciones />
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
            <AsignaturaEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/asignaturas/:id/notas",
        element: (
          <ProtectedRoute>
            <NotasEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/asignaturas/:id/practicas",
        element: (
          <ProtectedRoute>
            <ListaEvaluacionesPracticasEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/asignaturas/:id/practicas-realizadas",
        element: (
          <ProtectedRoute>
            <PracticasRealizadasEstudiante />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/evaluacion-practica/:id/iniciar",
        element: (
          <ProtectedRoute>
            <IniciarEvaluacionPractica />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/intento-practica/:intentoId",
        element: (
          <ProtectedRoute>
            <IntentoEvaluacionPractica />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/resultado-practica/:intentoId",
        element: (
          <ProtectedRoute>
            <ResultadoIntentoPractica />
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudiante/asignaturas/:id/orales",
        element: (
          <ProtectedRoute>
            <Placeholder titulo="Evaluaciones Orales" />
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
        path: "/asignaturas/:id/evaluaciones-practicas",
        element: (
          <ProtectedRoute>
            <VerEvaluacionesPracticas />
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
      {
        path: "/evaluacion-practica/detalle/:id",
        element: (
          <ProtectedRoute>
            <DetalleEvaluacionPractica />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
