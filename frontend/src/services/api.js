import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://nithish18-dxbkaxf7ewgqgbhc.centralindia-01.azurewebsites.net/api"
});

export default API;