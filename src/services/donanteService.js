const donanteRepository = require("../repositories/donanteRepository");
const { crearDonante } = require("../models/Donante");

const TIPOS_VALIDOS = ["empresa", "persona_fisica"];

function registrarDonante({ usuarioId, tipo, nombreLegal, datosFiscales, telefono } = {}) {
  if (!usuarioId || !tipo || !TIPOS_VALIDOS.includes(tipo)) {
    const error = new Error(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(", ")}`);
    error.status = 400;
    throw error;
  }
  if (typeof nombreLegal !== "string" || !nombreLegal.trim()) {
    const error = new Error("nombreLegal es obligatorio");
    error.status = 400;
    throw error;
  }

  const donante = crearDonante({ usuarioId, tipo, nombreLegal, datosFiscales, telefono });
  return donanteRepository.crear(donante);
}

function listarDonantes() {
  return donanteRepository.listarTodos();
}

function obtenerDonantePorId(id, usuarioSolicitante) {
  const donante = donanteRepository.buscarPorId(id);
  if (!donante) {
    const error = new Error("Donante no encontrado");
    error.status = 404;
    throw error;
  }

  // Regla de negocio: un usuario normal solo puede ver SUS propios
  // registros de donante. Un administrador puede ver cualquiera.
  const esDueno = donante.usuarioId === usuarioSolicitante.id;
  const esAdmin = usuarioSolicitante.rol === "administrador";
  if (!esDueno && !esAdmin) {
    const error = new Error("No tienes permiso para ver este donante");
    error.status = 403;
    throw error;
  }

  return donante;
}

module.exports = { registrarDonante, listarDonantes, obtenerDonantePorId };
