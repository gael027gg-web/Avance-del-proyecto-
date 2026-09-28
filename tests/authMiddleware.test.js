const request = require("supertest");
const app = require("../src/app");
const usuarioRepository = require("../src/repositories/usuarioRepository");
const donanteRepository = require("../src/repositories/donanteRepository");

beforeEach(() => {
  usuarioRepository.reset();
  donanteRepository.reset();
});

describe("Middleware verificarJWT / requiereRol", () => {
  it("bloquea el acceso si no se manda token", async () => {
    const res = await request(app).get("/api/donantes");
    expect(res.status).toBe(401);
  });

  it("bloquea el acceso si el token esta mal formado", async () => {
    const res = await request(app)
      .get("/api/donantes")
      .set("Authorization", "TokenSinBearer");
    expect(res.status).toBe(401);
  });

  it("bloquea el acceso si el token es invalido", async () => {
    const res = await request(app)
      .get("/api/donantes")
      .set("Authorization", "Bearer token.invalido.aqui");
    expect(res.status).toBe(401);
  });

  it("bloquea a un usuario normal de una ruta solo para administrador", async () => {
    await request(app).post("/api/auth/registro").send({
      nombre: "Usuario Normal",
      email: "normal@ejemplo.com",
      password: "clave123"
    });
    const login = await request(app).post("/api/auth/login").send({
      email: "normal@ejemplo.com",
      password: "clave123"
    });

    const res = await request(app)
      .get("/api/donantes")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
  });
});
