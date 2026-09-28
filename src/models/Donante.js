// Forma de un registro de "persona donante" dentro del sistema
// de gestion de donaciones. En produccion esto seria una tabla
// en PostgreSQL relacionada con la tabla "usuarios" (usuarioId).
//
// id           -> identificador unico del registro de donante
// usuarioId    -> a que usuario (login) pertenece este donante
// tipo         -> 'empresa' o 'persona_fisica'
// nombreLegal  -> razon social o nombre completo
// datosFiscales-> RFC u otro identificador fiscal (simplificado)
// telefono     -> contacto
// creadoEn     -> fecha de registro

function crearDonante({ id, usuarioId, tipo, nombreLegal, datosFiscales, telefono }) {
  return {
    id,
    usuarioId,
    tipo,
    nombreLegal,
    datosFiscales,
    telefono,
    creadoEn: new Date().toISOString()
  };
}

module.exports = { crearDonante };
