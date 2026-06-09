const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "database.db"));

console.log("SQLite conectado");

// Crear tablas
db.exec(`
CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL,
  asunto TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'pendiente',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio DATETIME,
  fecha_fin DATETIME
);

CREATE TABLE IF NOT EXISTS seguimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documento_id INTEGER NOT NULL,
  detalle TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
