const { Client } = require("pg");
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app); // Cria o servidor HTTP usando o Express
 // Esta linha cria o objeto 'io'
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Permite que qualquer página acesse os dados
        methods: ["GET", "POST"]
    }
});

require('dotenv').config();
const port = process.env.PORT || 3000; 

// Configuração para entender dados enviados pelo ESP32 e Formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos (HTML, CSS, JS do Dashboard)
app.use(express.static('public'));

// Configuração do Banco de Dados (Pega os dados do arquivo .env) 

const  client  = new Client ({
    connectionString:
    process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});
//Conexão com o banco de dados PostgreSQL
client.connect()
 .then(() => console.log("Conectadono PostgreSQL"))
 .catch(err => console.error("Erro ao conectar: ", err));
// Criar tabela automaticamente
async function createTable() {
    const query = 
     `CREATE TABLE IF NOT EXISTS registros (
                id SERIAL PRIMARY KEY,
                temperatura DOUBLE PRECISION,
                umidade DOUBLE PRECISION,
                data_hora TIMESTAMP
              
    );
    `;
    try {
        await client.query(query);
        console.log('Tabela "registros" criada ou já existente!');
         
       
    }catch(err){
        console.error('Erro ao criar tabela:"', err.message);
    }
}
// Chamar a função ao iniciar o servidor
createTable();
// --- ROTAS ---

// 1. Rota para o ESP32 enviar temperatura e umidade
app.post('/dados', (req, res) => {
    const { temperatura, umidade } = req.body;
    const sql = "INSERT INTO registros (temperatura, umidade) VALUES (?, ?)";
    
    db.query(sql, [temperatura, umidade], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Dados gravados!");
    });
});

// 2. Rota para o Dashboard ler os últimos dados
app.get('/get-data', (req, res) => {
    const sql = "SELECT * FROM registros ORDER BY data_hora DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
   
// 3. Rota de Login (Simplificada para teste)
app.post('/auth', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === '1234') {
        res.redirect('/dashboard.html');
    } else {
        res.send("Acesso negado!");
    }
});
// 4. Redireciona a página principal (/) para o login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// 5.  --- CONTROLE E STATUS DO VENTILADOR (INTERAÇÃO COM ESP32) ---

let statusVentilador = 0; // 0 = Desligado, 1 = Ligado

// 5.1 Rota que o Dashboard chama ao clicar no botão
app.post('/toggle-fan', (req, res) => {
    const { status } = req.body; // Recebe true ou false do HTML
    statusVentilador = status ? 1 : 0;
    console.log("Status do ventilador alterado para:", statusVentilador);
    res.send({ currentStatus: statusVentilador });
});

// 5.2 Rota que o ESP32 vai consultar (Polling)
app.get('/check-fan', (req, res) => {
    res.send(statusVentilador.toString()); 
});
// 5.3 NOVA ROTA: O ESP32 envia a temperatura para cá
app.post('/update-temp', (req, res) => {
    const tempRecebida = req.body.temperatura; // O valor vindo do sensor
    
    // 5.4 Envia para o Front-end (Dashboard) via Socket.io
    io.emit('atualizacaoTemp', tempRecebida); 
    
    // 5.5 Lógica automática (Ex: liga ventilador se > 30 graus)
    if (tempRecebida > 30) {
        statusVentilador = 1;
    } else {
        statusVentilador = 0;
    }

    res.status(200).send("Dados recebidos");
});
//6.Para colocação do gráfico via codificação js

//6.1 Rota que o gráfico vai consumir
app.get('/api/grafico', async (req, res) => {
  try {
    const query = "SELECT temperatura, umidade FROM registros LIMIT 10";
    const { rows } = await client.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

//7. Mantendo a porta na escuta
http.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
