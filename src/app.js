const express = require("express");
const authRoutes = require("./routes/authRoutes");
const donanteRoutes = require("./routes/donanteRoutes");

// Separamos "app" (la definicion de la aplicacion) de "server.js"
// (quien realmente hace app.listen). Esto es lo que nos permite
// probar la app con supertest SIN necesidad de abrir un puerto real.
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/donantes", donanteRoutes);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalido" });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
