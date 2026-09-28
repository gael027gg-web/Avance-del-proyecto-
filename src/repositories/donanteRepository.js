let donantes = [];
let siguienteId = 1;

function reset() {
  donantes = [];
  siguienteId = 1;
}

function crear(donante) {
  const nuevo = { ...donante, id: siguienteId++ };
  donantes.push(nuevo);
  return nuevo;
}

function listarTodos() {
  return donantes;
}

function buscarPorId(id) {
  return donantes.find((d) => d.id === Number(id)) || null;
}

function buscarPorUsuarioId(usuarioId) {
  return donantes.filter((d) => d.usuarioId === usuarioId);
}

module.exports = { crear, listarTodos, buscarPorId, buscarPorUsuarioId, reset };
