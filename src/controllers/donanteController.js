const donanteService = require("../services/donanteService");

function registrar(req, res) {
  try {
    const donante = donanteService.registrarDonante({
      usuarioId: req.user.id,
      ...req.body
    });
    res.status(201).json(donante);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function listar(req, res) {
  const donantes = donanteService.listarDonantes();
  res.status(200).json(donantes);
}

function obtenerPorId(req, res) {
  try {
    const donante = donanteService.obtenerDonantePorId(req.params.id, req.user);
    res.status(200).json(donante);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { registrar, listar, obtenerPorId };
