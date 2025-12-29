import axios from 'axios';
import cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    // Si es FormData, dejar que el navegador/axios setee el Content-Type con boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      // Para JSON, asegurar Content-Type si no viene seteado
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    const token = cookies.get('jwt-auth', { path: '/' });
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
