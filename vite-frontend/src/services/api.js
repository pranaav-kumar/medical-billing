import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://nithish18-dxbkaxf7ewgqgbhc.centralindia-01.azurewebsites.net/api",
});

export default API;