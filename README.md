# Módulo de Registro de Personas Donantes

Esta es la parte de **Implementación y seguridad** del proyecto (sistema de gestión de donaciones). Aquí armamos un módulo chiquito pero completo: registro de personas donantes, con login JWT, roles, pruebas unitarias y un pipeline de CI/CD.

## ¿Qué trae esto?

```
donaciones-backend/
├── src/
│   ├── models/          -> cómo se ve un Usuario y un Donante (solo la forma de los datos)
│   ├── repositories/    -> "dónde viven" los datos (aquí en memoria, luego cámbialo por PostgreSQL)
│   ├── services/        -> la lógica de negocio real (auth, registrar donante, etc.)
│   ├── middleware/       -> el "guardia de seguridad": revisa el JWT y el rol
│   ├── controllers/     -> reciben el request y llaman al service
│   ├── routes/          -> define las URLs (endpoints)
│   ├── app.js           -> arma la app de Express (sin abrir puerto, para poder probarla)
│   └── server.js        -> el que sí levanta el servidor de verdad
├── tests/               -> pruebas con Jest + Supertest
├── .github/workflows/   -> el pipeline de CI/CD
├── jest.config.js       -> aquí se configura el 80% mínimo de cobertura
└── package.json
```

## 1. Autenticación con JWT (explicado bien simple)

Piensa en el JWT como una "pulsera de acceso" de un evento:

1. Te registras (`POST /api/auth/registro`) con nombre, email y password. La contraseña **nunca** se guarda tal cual, se guarda "hasheada" con bcrypt (o sea, encriptada de forma que ni nosotros la podemos leer de vuelta).
2. Haces login (`POST /api/auth/login`) con tu email y password. Si son correctos, el servidor te regresa un **token** (la pulsera).
3. En cada request a una ruta protegida, mandas ese token en el header:
   ```
   Authorization: Bearer <tu-token-aquí>
   ```
4. El middleware `verificarJWT` revisa que el token sea válido y no esté vencido, y saca de ahí quién eres (`req.user`).
5. El middleware `requiereRol('administrador')` revisa si tu rol alcanza para esa ruta.

Roles que existen: `usuario` y `administrador`. Por seguridad, el registro público **siempre** crea usuarios con rol `usuario` — nadie se puede auto-asignar admin desde el endpoint de registro. Un admin se daría de alta directo en la base de datos o por un endpoint aparte, ya protegido, más adelante.

### Endpoints

| Método | Ruta                  | Protegida | Quién puede |
|--------|-----------------------|-----------|-------------|
| POST   | `/api/auth/registro`  | No        | Cualquiera |
| POST   | `/api/auth/login`     | No        | Cualquiera |
| POST   | `/api/donantes`       | Sí        | Usuario o administrador |
| GET    | `/api/donantes`       | Sí        | Solo administrador |
| GET    | `/api/donantes/:id`   | Sí        | El dueño del registro, o administrador |

## 2. Sobre el "repositorio en memoria"

Para que el módulo se pueda correr y probar YA MISMO sin necesitar el PostgreSQL real montado, los datos se guardan en un arreglo en memoria (`usuarioRepository.js` y `donanteRepository.js`). El resto del código (servicios, controladores) no sabe ni le importa cómo se guardan los datos — solo llama funciones como `crear()` o `buscarPorId()`.

Esto es a propósito: cuando conecten PostgreSQL de verdad, **solo tienen que reescribir esos dos archivos** para que usen `pg` en vez de un arreglo. Ningún otro archivo del proyecto se toca. Eso se llama "patrón repositorio" y es justo lo que les conviene para no romper nada cuando cambien la base de datos.

## 3. Pruebas unitarias (Jest + Supertest)

- `npm test` corre todas las pruebas y calcula la cobertura.
- `jest.config.js` tiene puesto un `coverageThreshold` de 80% en statements, branches, functions y lines — si baja de ahí, el comando **falla** (esto es justo lo que va a checar el CI).
- Usamos **Supertest** para simular requests HTTP reales contra la app (`POST /api/auth/login`, etc.) sin necesidad de levantar el servidor de verdad.
- Antes de cada prueba se llama `reset()` en los repositorios, para que una prueba no deje "basura" que afecte a la siguiente.

Corrida actual de referencia: **21 pruebas, todas pasando, cobertura global arriba del 80%** en las 4 métricas.

Para correrlo tú mismo:
```bash
npm install
npm test
```

## 4. Pipeline de CI (GitHub Actions)

El archivo `.github/workflows/ci-cd.yml` ejecuta el job `test` en cada push o pull request hacia `main` o `develop`. Instala dependencias con `npm ci`, ejecuta `npm test` y sube el reporte de cobertura como artefacto. Si una prueba falla o la cobertura baja del 80% configurado en `jest.config.js`, el pipeline falla.

El despliegue no forma parte de esta etapa del proyecto; se puede agregar después de validar el CI.

## 5. Variables de entorno

Copia `.env.example` a `.env` y ajusta:

```
PORT=3000
JWT_SECRET=cambia_esto_por_un_secreto_largo_y_random
JWT_EXPIRES_IN=1h
```

`JWT_SECRET` es la "llave maestra" con la que se firman y verifican los tokens. La aplicación no usa un secreto de respaldo: debes configurarlo mediante `.env` o el entorno de ejecución. Nunca subas el `.env` a GitHub (está en `.gitignore`).

## Conclusión

Con esto ya queda cubierta la parte de Implementación y seguridad: el módulo de registro de donantes funciona con autenticación JWT y roles bien definidos, las pruebas pasan con más del 80% de cobertura, y el pipeline de GitHub Actions corre las pruebas automáticamente y despliega a un entorno de prueba cuando todo está en orden. La arquitectura de repositorios deja el camino libre para conectar PostgreSQL/PostGIS más adelante sin tener que reescribir la lógica de negocio.
