const request = require("supertest");
const app = require("../src/app");

describe("App base", () => {
  it("GET /health responde ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("una ruta que no existe responde 404", async () => {
    const res = await request(app).get("/esto/no/existe");
    expect(res.status).toBe(404);
  });

  it("rechaza JSON invalido con una respuesta JSON", async () => {
    const res = await request(app)
      .post("/api/auth/registro")
      .set("Content-Type", "application/json")
      .send('{"nombre":');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("JSON invalido");
  });
});
