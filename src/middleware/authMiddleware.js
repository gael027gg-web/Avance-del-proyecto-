const authService = require("../services/authService");

// Este middleware se pone ANTES de las rutas que quieres proteger.
// Revisa el header "Authorization: Bearer <token>", verifica el JWT
// y, si es valido, pega la info del usuario en req.user para que
// los siguientes middlewares/controladores la puedan usar.
function verificarJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = authService.verificarToken(token);
    req.user = payload; // { id, email, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
}

// Fabrica de middlewares: requiereRol('administrador') solo deja pasar
// a quien tenga ese rol en su token. Se usa DESPUES de verificarJWT.
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos para esta accion" });
    }
    next();
  };
}

module.exports = { verificarJWT, requiereRol };
