import axios from "axios";

const baseURL = "https://jsonplaceholder.typicode.com";

const api = axios.create({
    baseURL: baseURL,
});

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken")
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`
//     }
//     return config
//   }
// );

export default api;
