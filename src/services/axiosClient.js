import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "https://api.test.postjamm.com";

const axiosClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = token;
  return config;
});


export default axiosClient;
