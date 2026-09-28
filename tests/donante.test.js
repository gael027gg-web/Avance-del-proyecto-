const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const usuarioRepository = require("../src/repositories/usuarioRepository");
const donanteRepository = require("../src/repositories/donanteRepository");
const authService = require("../src/services/authService");
const donanteService = require("../src/services/donanteService");

beforeEach(() => {
  usuarioRepository.reset();
  donanteRepository.reset();
});

// Pequeno helper para las pruebas: como el registro publico SIEMPRE
// crea rol 'usuario' (por diseno, ver authService), para probar el
// camino de administrador insertamos uno directo al repositorio,
// simulando un admin que ya existia dado de alta en la base de datos.
async function crearAdminYObtenerToken() {
  const passwordHash = await bcrypt.hash("claveAdmin123", 10);
  const admin = usuarioRepository.crear({
    nombre: "Admin",
    email: "admin@ejemplo.com",
    password: passwordHash,
    rol: "administrador"
  });
  return authService.generarToken(admin);
}

async function crearUsuarioYObtenerToken() {
  await request(app).post("/api/auth/registro").send({
    nombre: "Manuel",
    email: "manuel@ejemplo.com",
    password: "clave123"
  });
  const login = await request(app).post("/api/auth/login").send({
    email: "manuel@ejemplo.com",
    password: "clave123"
  });
  return login.body.token;
}

describe("POST /api/donantes", () => {
  it("rechaza un registro sin usuario autenticado", () => {
    expect(() => donanteService.registrarDonante({
      tipo: "empresa",
      nombreLegal: "Empresa sin usuario"
    })).toThrow("tipo debe ser uno de: empresa, persona_fisica");
  });

  it("registra un donante tipo empresa cuando el usuario esta autenticado", async () => {
    const token = await crearUsuarioYObtenerToken();

    const res = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "empresa",
        nombreLegal: "Panaderia El Buen Pan S.A. de C.V.",
        datosFiscales: "PBP010101ABC",
        telefono: "8110000000"
      });

    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe("empresa");
    expect(res.body.nombreLegal).toBe("Panaderia El Buen Pan S.A. de C.V.");
  });

  it("rechaza un tipo de donante invalido", async () => {
    const token = await crearUsuarioYObtenerToken();

    const res = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${token}`)
      .send({ tipo: "otro_tipo", nombreLegal: "X" });

    expect(res.status).toBe(400);
  });

  it("rechaza si falta el nombreLegal", async () => {
    const token = await crearUsuarioYObtenerToken();

    const res = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${token}`)
      .send({ tipo: "persona_fisica" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/donantes (solo administrador)", () => {
  it("permite a un administrador ver el listado completo", async () => {
    const tokenUsuario = await crearUsuarioYObtenerToken();
    await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({ tipo: "persona_fisica", nombreLegal: "Juan Perez" });

    const tokenAdmin = await crearAdminYObtenerToken();
    const res = await request(app)
      .get("/api/donantes")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe("GET /api/donantes/:id", () => {
  it("permite al dueno ver su propio registro de donante", async () => {
    const token = await crearUsuarioYObtenerToken();
    const creado = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${token}`)
      .send({ tipo: "persona_fisica", nombreLegal: "Juan Perez" });

    const res = await request(app)
      .get(`/api/donantes/${creado.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(creado.body.id);
  });

  it("regresa 404 si el donante no existe", async () => {
    const token = await crearUsuarioYObtenerToken();

    const res = await request(app)
      .get("/api/donantes/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("bloquea a un usuario que intenta ver el donante de otra persona", async () => {
    const tokenDueno = await crearUsuarioYObtenerToken();
    const creado = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${tokenDueno}`)
      .send({ tipo: "persona_fisica", nombreLegal: "Juan Perez" });

    // Creamos un segundo usuario normal que intentara ver el donante ajeno.
    await request(app).post("/api/auth/registro").send({
      nombre: "Otra Persona",
      email: "otra@ejemplo.com",
      password: "clave123"
    });
    const loginOtra = await request(app).post("/api/auth/login").send({
      email: "otra@ejemplo.com",
      password: "clave123"
    });

    const res = await request(app)
      .get(`/api/donantes/${creado.body.id}`)
      .set("Authorization", `Bearer ${loginOtra.body.token}`);

    expect(res.status).toBe(403);
  });

  it("permite a un administrador ver el donante de cualquier usuario", async () => {
    const tokenDueno = await crearUsuarioYObtenerToken();
    const creado = await request(app)
      .post("/api/donantes")
      .set("Authorization", `Bearer ${tokenDueno}`)
      .send({ tipo: "persona_fisica", nombreLegal: "Juan Perez" });

    const tokenAdmin = await crearAdminYObtenerToken();
    const res = await request(app)
      .get(`/api/donantes/${creado.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
  });
});
