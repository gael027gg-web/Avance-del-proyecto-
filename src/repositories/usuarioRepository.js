// Repositorio = la unica parte del codigo que sabe "donde viven los datos".
// Aqui usamos un arreglo en memoria para que el proyecto se pueda correr
// y probar sin necesitar un PostgreSQL real todavia. El dia que conecten
// la base de datos de verdad (como dice su avance: PostgreSQL + PostGIS),
// solo cambian las funciones de aqui adentro -- el resto del codigo
// (servicios, controladores) no se entera del cambio.

let usuarios = [];
let siguienteId = 1;

function reset() {
  usuarios = [];
  siguienteId = 1;
}

function crear(usuario) {
  const nuevo = { ...usuario, id: siguienteId++ };
  usuarios.push(nuevo);
  return nuevo;
}

function buscarPorEmail(email) {
  return usuarios.find((u) => u.email === email) || null;
}

function buscarPorId(id) {
  return usuarios.find((u) => u.id === Number(id)) || null;
}

module.exports = { crear, buscarPorEmail, buscarPorId, reset };
