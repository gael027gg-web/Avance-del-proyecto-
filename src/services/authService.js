const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const usuarioRepository = require("../repositories/usuarioRepository");
const { crearUsuario } = require("../models/Usuario");

function obtenerConfiguracionJWT() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET no esta configurado");
    error.status = 500;
    throw error;
  }

  return {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  };
}

// registro publico: SIEMPRE crea rol 'usuario'.
// (Un administrador no se crea por este endpoint, eso evita que
// cualquiera se autoasigne permisos de admin. Ver README.)
async function registrar({ nombre, email, password } = {}) {
  if (!esTextoNoVacio(nombre) || !esEmailValido(email) || !esTextoNoVacio(password)) {
    const error = new Error("nombre, email y password son obligatorios");
    error.status = 400;
    throw error;
  }

  const existente = usuarioRepository.buscarPorEmail(email);
  if (existente) {
    const error = new Error("Ya existe un usuario con ese email");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = crearUsuario({ nombre, email, passwordHash, rol: "usuario" });
  const guardado = usuarioRepository.crear(usuario);

  return sinPassword(guardado);
}

async function login({ email, password } = {}) {
  if (!esEmailValido(email) || !esTextoNoVacio(password)) {
    const error = new Error("email y password son obligatorios");
    error.status = 400;
    throw error;
  }

  const usuario = usuarioRepository.buscarPorEmail(email);
  if (!usuario) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const token = generarToken(usuario);
  return { token, usuario: sinPassword(usuario) };
}

function generarToken(usuario) {
  // El "payload" es la info que va DENTRO del token, firmada.
  // Aqui guardamos lo minimo necesario para autorizar despues: id y rol.
  const { secret, expiresIn } = obtenerConfiguracionJWT();
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    secret,
    { expiresIn }
  );
}

function verificarToken(token) {
  const { secret } = obtenerConfiguracionJWT();
  return jwt.verify(token, secret);
}

function esTextoNoVacio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function esEmailValido(email) {
  return esTextoNoVacio(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sinPassword(usuario) {
  const { password, ...resto } = usuario;
  return resto;
}

module.exports = { registrar, login, generarToken, verificarToken };
