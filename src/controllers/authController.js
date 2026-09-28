const authService = require("../services/authService");

async function registrar(req, res) {
  try {
    const usuario = await authService.registrar(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const resultado = await authService.login(req.body);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { registrar, login };
