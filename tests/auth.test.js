const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const usuarioRepository = require("../src/repositories/usuarioRepository");
const authService = require("../src/services/authService");

// Antes de cada prueba dejamos el "repositorio" limpio, para que
// una prueba no contamine a la siguiente.
beforeEach(() => {
  usuarioRepository.reset();
});

describe("POST /api/auth/registro", () => {
  it("registra un usuario nuevo con rol 'usuario' por defecto", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Manuel",
      email: "manuel@ejemplo.com",
      password: "clave123"
    });

    expect(res.status).toBe(201);
    expect(res.body.rol).toBe("usuario");
    expect(res.body.password).toBeUndefined(); // nunca debe regresar el password
  });

  it("rechaza el registro si faltan campos", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      email: "sinnombre@ejemplo.com"
    });

    expect(res.status).toBe(400);
  });

  it("rechaza un email con formato invalido", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Manuel",
      email: "correo-invalido",
      password: "clave123"
    });

    expect(res.status).toBe(400);
  });

  it("rechaza el registro si el email ya existe", async () => {
    await request(app).post("/api/auth/registro").send({
      nombre: "Manuel",
      email: "repetido@ejemplo.com",
      password: "clave123"
    });

    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Otro",
      email: "repetido@ejemplo.com",
      password: "otraClave"
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/registro").send({
      nombre: "Manuel",
      email: "manuel@ejemplo.com",
      password: "clave123"
    });
  });

  it("regresa un token JWT cuando las credenciales son correctas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "manuel@ejemplo.com",
      password: "clave123"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario.email).toBe("manuel@ejemplo.com");
  });

  it("rechaza el login con password incorrecto", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "manuel@ejemplo.com",
      password: "claveMala"
    });

    expect(res.status).toBe(401);
  });

  it("rechaza el login con un email que no existe", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "noexiste@ejemplo.com",
      password: "clave123"
    });

    expect(res.status).toBe(401);
  });

  it("rechaza el login si faltan campos", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "manuel@ejemplo.com"
    });

    expect(res.status).toBe(400);
  });

  it("rechaza el login si el email tiene formato invalido", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "correo-invalido",
      password: "clave123"
    });

    expect(res.status).toBe(400);
  });

  it("guarda la contraseña usando un hash", async () => {
    await request(app).post("/api/auth/registro").send({
      nombre: "Manuel",
      email: "hash@ejemplo.com",
      password: "clave123"
    });

    const usuario = usuarioRepository.buscarPorEmail("hash@ejemplo.com");
    expect(usuario.password).not.toBe("clave123");
    await expect(bcrypt.compare("clave123", usuario.password)).resolves.toBe(true);
  });

  it("falla de forma controlada si falta JWT_SECRET", () => {
    const secretoOriginal = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => authService.generarToken({ id: 1, email: "a@b.com", rol: "usuario" }))
      .toThrow("JWT_SECRET no esta configurado");

    process.env.JWT_SECRET = secretoOriginal;
  });
});
