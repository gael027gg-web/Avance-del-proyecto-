const express = require("express");
const donanteController = require("../controllers/donanteController");
const { verificarJWT, requiereRol } = require("../middleware/authMiddleware");

const router = express.Router();

// Cualquier usuario autenticado (usuario o administrador) puede
// registrarse a si mismo como persona donante.
router.post("/", verificarJWT, donanteController.registrar);

// Solo un administrador puede ver el listado completo de donantes.
router.get("/", verificarJWT, requiereRol("administrador"), donanteController.listar);

// Un usuario puede ver su propio donante; un admin puede ver cualquiera
// (esa regla vive en el servicio, no aqui).
router.get("/:id", verificarJWT, donanteController.obtenerPorId);

module.exports = router;
