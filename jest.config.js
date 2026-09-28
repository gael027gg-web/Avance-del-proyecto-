// Configuracion de Jest: le decimos que mida cobertura y que falle
// si algun archivo baja del 80% en cualquiera de las 4 metricas.
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js" // server.js solo levanta el puerto, no tiene logica que probar
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ["text", "lcov", "html"]
};
