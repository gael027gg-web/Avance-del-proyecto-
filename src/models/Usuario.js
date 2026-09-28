// No usamos un ORM aqui para mantenerlo simple, pero dejamos documentada
// la "forma" que debe tener un usuario. Si mas adelante conectan
// PostgreSQL de verdad, esto se vuelve el modelo de la tabla "usuarios".
//
// id          -> identificador unico
// nombre      -> nombre de la persona
// email       -> usado para hacer login, debe ser unico
// password    -> se guarda YA HASHEADA (nunca en texto plano)
// rol         -> 'administrador' o 'usuario'

function crearUsuario({ id, nombre, email, passwordHash, rol = "usuario" }) {
  return { id, nombre, email, password: passwordHash, rol };
}

module.exports = { crearUsuario };
