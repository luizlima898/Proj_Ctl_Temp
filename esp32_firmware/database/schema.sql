-- Garante que o banco de dados existe
CREATE DATABASE IF NOT EXISTS projeto_home;
USE projeto_home;

-- Cria a tabela exatamente com o nome que você definiu
CREATE TABLE IF NOT EXISTS registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperatura DECIMAL(5,2) NOT NULL,
    umidade DECIMAL(5,2) NOT NULL
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
