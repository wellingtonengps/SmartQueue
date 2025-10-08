import express from "express";
import { WebSocketServer } from "ws";
import oracledb from "oracledb";

oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_23_9" });

const app = express();
const port = 3000;

// Cria servidor WebSocket para mandar eventos pro front
const wss = new WebSocketServer({ port: 4000 });

// Armazena o último ID ou timestamp visto
let lastId = 0; // Supondo que você tenha uma coluna ID auto-increment ou timestamp

// Conexão com Oracle
async function start() {
  try {
    const connection = await oracledb.getConnection({
      user: "APPUSER",
      password: "appuser123",
      connectString: "localhost:1521/XEPDB1",
    });

    // Função de polling a cada X segundos
    setInterval(async () => {
      try {
        const result = await connection.execute(
          `SELECT * FROM ATENDIMENTO_LOCAL WHERE ID > :lastId ORDER BY ID`,
          [lastId]
        );

        if (result.rows.length > 0) {
          lastId = result.rows[result.rows.length - 1][0];

          const data = result.rows.map((row) => ({
            id: row[0],
            nr_seq_local_pa: row[1],
            time: row[2],
            status: row[3],
          }));

          wss.clients.forEach((client) => {
            client.send(JSON.stringify(data));
          });

          console.log("Novos registros enviados:", data);
        }
      } catch (err) {
        console.error("Erro no polling:", err);
      }
    }, 2000);

    app.get("/", (req, res) => {
      res.send("API Oracle Polling rodando...");
    });

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Erro ao conectar:", err);
  }
}

start();
