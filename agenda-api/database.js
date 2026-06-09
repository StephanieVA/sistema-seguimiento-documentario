const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const db = require("./database");

const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error("Error abriendo base de datos", err);
  } else {
    console.log("SQLite conectado");
  }
});

// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL,
      asunto TEXT NOT NULL,
      descripcion TEXT,
      estado TEXT DEFAULT 'pendiente',
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_inicio DATETIME,
      fecha_fin DATETIME
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS seguimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento_id INTEGER NOT NULL,
      detalle TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE
    )
  `);
});
app.get("/documentos", (req, res) => {
  db.all("SELECT * FROM documentos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});
app.post("/documentos", (req, res) => {
  const { numero, asunto, descripcion } = req.body;

  db.run(
    `INSERT INTO documentos (numero, asunto, descripcion) VALUES (?, ?, ?)`,
    [numero, asunto, descripcion],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        mensaje: "Documento registrado",
        id: this.lastID,
      });
    },
  );
});
app.put("/documentos/:id/estado", (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  let sql = "";
  let valores = [];

  if (estado === "atencion") {
    sql = `UPDATE documentos SET estado = ?, fecha_inicio = CURRENT_TIMESTAMP WHERE id = ?`;
    valores = [estado, id];
  } else if (estado === "finalizado") {
    sql = `UPDATE documentos SET estado = ?, fecha_fin = CURRENT_TIMESTAMP WHERE id = ?`;
    valores = [estado, id];
  } else {
    sql = `UPDATE documentos SET estado = ? WHERE id = ?`;
    valores = [estado, id];
  }

  db.run(sql, valores, function (err) {
    if (err) return res.status(500).json(err);

    res.json({ mensaje: "Estado actualizado" });
  });
});
app.post("/seguimientos", (req, res) => {
  const { documento_id, detalle } = req.body;

  db.run(
    `INSERT INTO seguimientos (documento_id, detalle) VALUES (?, ?)`,
    [documento_id, detalle],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({ mensaje: "Seguimiento registrado" });
    },
  );
});
app.get("/seguimientos/:documentoId", (req, res) => {
  const documentoId = req.params.documentoId;

  db.all(
    `SELECT * FROM seguimientos WHERE documento_id = ? ORDER BY fecha DESC`,
    [documentoId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    },
  );
});
app.put("/seguimientos/:id", (req, res) => {
  const id = req.params.id;
  const { detalle } = req.body;

  db.run(
    `UPDATE seguimientos SET detalle = ? WHERE id = ?`,
    [detalle, id],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({ mensaje: "Seguimiento actualizado" });
    },
  );
});
app.delete("/seguimientos/:id", (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM seguimientos WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json(err);

    res.json({ mensaje: "Seguimiento eliminado" });
  });
});

module.exports = db;
