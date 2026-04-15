require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/mongo");
const patientRoutes = require("./routes/patientRoutes");
const authRoutes = require("./routes/auth");

const app = express();

// CORS — allow your Azure Static Web App frontend + localhost for dev
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL // set this in Azure env vars
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check endpoint (Azure uses this to verify the app is running)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Medical Billing API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Use routes
app.use("/api", patientRoutes);
app.use("/api", authRoutes);

// Azure App Service sets PORT automatically — do NOT hardcode
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});