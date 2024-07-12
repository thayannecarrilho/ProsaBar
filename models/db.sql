CREATE DATABASE IF NOT EXISTS prosabar;

USE prosabar;

CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email_UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO usuarios (email, senha)
VALUES ('falecomprosa@gmail.com', '123');

CREATE TABLE IF NOT EXISTS clientes (
    comanda INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone CHAR(15) NOT NULL,
    apto VARCHAR(5) NOT NULL,
    obs VARCHAR(100) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
    pedidoid INT PRIMARY KEY AUTO_INCREMENT,
    comanda INT,
    item VARCHAR(100),
    qtde INT,
    valorunit DECIMAL(10,2),
    obs VARCHAR(250),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estoquebebida (
    estoqueid INT PRIMARY KEY AUTO_INCREMENT,
    item VARCHAR(50) NOT NULL UNIQUE,
    qtde INT NOT NULL,
    valorunit DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS estoquediverso (
    estoqueid INT PRIMARY KEY AUTO_INCREMENT,
    item VARCHAR(50) NOT NULL UNIQUE,
    qtde INT NOT NULL,
    valorunit DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS estoquecozinha (
    estoqueid INT PRIMARY KEY AUTO_INCREMENT,
    item VARCHAR(50) NOT NULL UNIQUE,
    qtde INT NOT NULL,
    valorunit DECIMAL(10,2) NOT NULL
);

SELECT * FROM clientes;
SELECT * FROM estoquebebida;
SELECT * FROM estoquecozinha;
SELECT * FROM estoquediverso;
SELECT * FROM pedidos;
SELECT * FROM usuarios;