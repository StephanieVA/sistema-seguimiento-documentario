const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "seguimiento_documentos",
});

conexion.connect((error) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log("MySQL conectado");
});

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(3000, () => {
  console.log("Servidor ejecutándose en puerto 3000");
});

app.get("/documentos", (req, res) => {
  conexion.query(
    "SELECT * FROM documentos ORDER BY id DESC",
    (error, resultados) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json(resultados);
    },
  );
});

app.post("/documentos", (req, res) => {
  const { numero, asunto, descripcion } = req.body;

  conexion.query(
    `
        INSERT INTO documentos
        (
            numero,
            asunto,
            descripcion
        )
        VALUES (?, ?, ?)
        `,
    [numero, asunto, descripcion],
    (error, resultado) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Documento registrado",
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
    sql = `
            UPDATE documentos
            SET estado = ?, fecha_inicio = NOW()
            WHERE id = ?
        `;

    valores = [estado, id];
  } else if (estado === "finalizado") {
    sql = `
            UPDATE documentos
            SET estado = ?, fecha_fin = NOW()
            WHERE id = ?
        `;

    valores = [estado, id];
  } else {
    sql = `
            UPDATE documentos
            SET estado = ?
            WHERE id = ?
        `;

    valores = [estado, id];
  }

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      mensaje: "Estado actualizado",
    });
  });
});
app.post("/seguimientos", (req, res) => {
  const { documento_id, detalle } = req.body;

  conexion.query(
    `
        INSERT INTO seguimientos
        (
            documento_id,
            detalle
        )
        VALUES (?, ?)
        `,
    [documento_id, detalle],
    (error, resultado) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Seguimiento registrado",
      });
    },
  );
});
app.get("/seguimientos/:documentoId", (req, res) => {
  const documentoId = req.params.documentoId;

  conexion.query(
    `
        SELECT *
        FROM seguimientos
        WHERE documento_id = ?
        ORDER BY fecha DESC
        `,
    [documentoId],
    (error, resultados) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json(resultados);
    },
  );
});
app.put("/seguimientos/:id", (req, res) => {
  const id = req.params.id;
  const { detalle } = req.body;

  conexion.query(
    `
        UPDATE seguimientos
        SET detalle = ?
        WHERE id = ?
        `,
    [detalle, id],
    (error, resultado) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Seguimiento actualizado",
      });
    },
  );
});
app.delete("/seguimientos/:id", (req, res) => {
  const id = req.params.id;

  conexion.query(
    `
        DELETE FROM seguimientos
        WHERE id = ?
        `,
    [id],
    (error, resultado) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Seguimiento eliminado",
      });
    },
  );
});
