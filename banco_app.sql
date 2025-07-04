```
-- Para garantir um ambiente limpo, você pode criar e/ou selecionar o banco de dados primeiro.
-- CREATE DATABASE IF NOT EXISTS banco_malvader DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- USE banco_malvader;

-- Desativa verificações de chaves estrangeiras temporariamente para evitar erros de ordem de criação/inserção
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


-- -----------------------------------------------------
-- Tabela `usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `data_nascimento` date NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `tipo_usuario` enum('FUNCIONARIO','CLIENTE') NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `otp_ativo` varchar(6) DEFAULT NULL,
  `otp_expiracao` datetime DEFAULT NULL,
  `endereco` text,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cpf` (`cpf`),
  KEY `idx_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `endereco`;
CREATE TABLE `endereco` (
  `id_endereco` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `cep` varchar(10) NOT NULL,
  `local` varchar(100) NOT NULL,
  `numero_casa` int NOT NULL,
  `bairro` varchar(50) NOT NULL,
  `cidade` varchar(50) NOT NULL,
  `estado` char(2) NOT NULL,
  `complemento` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_endereco`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_cep` (`cep`),
  CONSTRAINT `endereco_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `agencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `agencia`;
CREATE TABLE `agencia` (
  `id_agencia` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `codigo_agencia` varchar(10) NOT NULL,
  `endereco_id` int NOT NULL,
  PRIMARY KEY (`id_agencia`),
  UNIQUE KEY `codigo_agencia` (`codigo_agencia`),
  KEY `endereco_id` (`endereco_id`),
  CONSTRAINT `agencia_ibfk_1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id_endereco`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `funcionario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `funcionario`;
CREATE TABLE `funcionario` (
  `id_funcionario` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `codigo_funcionario` varchar(20) NOT NULL,
  `cargo` enum('ESTAGIARIO','ATENDENTE','GERENTE') NOT NULL,
  `id_supervisor` int DEFAULT NULL,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `codigo_funcionario` (`codigo_funcionario`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_supervisor` (`id_supervisor`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `funcionario_ibfk_2` FOREIGN KEY (`id_supervisor`) REFERENCES `funcionario` (`id_funcionario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `cliente`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `score_credito` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `conta`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `conta`;
CREATE TABLE `conta` (
  `id_conta` int NOT NULL AUTO_INCREMENT,
  `numero_conta` varchar(20) NOT NULL,
  `id_agencia` int NOT NULL,
  `saldo` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tipo_conta` enum('POUPANCA','CORRENTE','INVESTIMENTO') NOT NULL,
  `id_cliente` int NOT NULL,
  `data_abertura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('ATIVA','ENCERRADA','BLOQUEADA') NOT NULL DEFAULT 'ATIVA',
  `id_funcionario_abertura` int DEFAULT NULL,
  PRIMARY KEY (`id_conta`),
  UNIQUE KEY `numero_conta` (`numero_conta`),
  KEY `id_agencia` (`id_agencia`),
  KEY `id_cliente` (`id_cliente`),
  KEY `idx_numero_conta` (`numero_conta`),
  KEY `fk_conta_funcionario` (`id_funcionario_abertura`),
  CONSTRAINT `conta_ibfk_1` FOREIGN KEY (`id_agencia`) REFERENCES `agencia` (`id_agencia`),
  CONSTRAINT `conta_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_conta_funcionario` FOREIGN KEY (`id_funcionario_abertura`) REFERENCES `funcionario` (`id_funcionario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `conta_corrente`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `conta_corrente`;
CREATE TABLE `conta_corrente` (
  `id_conta_corrente` int NOT NULL AUTO_INCREMENT,
  `id_conta` int NOT NULL,
  `limite` decimal(15,2) NOT NULL DEFAULT '0.00',
  `data_vencimento` date NOT NULL,
  `taxa_manutencao` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_conta_corrente`),
  UNIQUE KEY `id_conta` (`id_conta`),
  CONSTRAINT `conta_corrente_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta` (`id_conta`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `conta_investimento`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `conta_investimento`;
CREATE TABLE `conta_investimento` (
  `id_conta_investimento` int NOT NULL AUTO_INCREMENT,
  `id_conta` int NOT NULL,
  `perfil_risco` enum('BAIXO','MEDIO','ALTO') NOT NULL,
  `valor_minimo` decimal(15,2) NOT NULL,
  `taxa_rendimento_base` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_conta_investimento`),
  UNIQUE KEY `id_conta` (`id_conta`),
  CONSTRAINT `conta_investimento_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta` (`id_conta`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `conta_poupanca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `conta_poupanca`;
CREATE TABLE `conta_poupanca` (
  `id_conta_poupanca` int NOT NULL AUTO_INCREMENT,
  `id_conta` int NOT NULL,
  `taxa_rendimento` decimal(5,2) NOT NULL,
  `ultimo_rendimento` datetime DEFAULT NULL,
  PRIMARY KEY (`id_conta_poupanca`),
  UNIQUE KEY `id_conta` (`id_conta`),
  CONSTRAINT `conta_poupanca_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta` (`id_conta`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `transacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `transacao`;
CREATE TABLE `transacao` (
  `id_transacao` int NOT NULL AUTO_INCREMENT,
  `id_conta_origem` int NOT NULL,
  `id_conta_destino` int DEFAULT NULL,
  `tipo_transacao` enum('DEPOSITO','SAQUE','TRANSFERENCIA','TAXA','RENDIMENTO') NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descricao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_transacao`),
  KEY `id_conta_origem` (`id_conta_origem`),
  KEY `id_conta_destino` (`id_conta_destino`),
  KEY `idx_data_hora` (`data_hora`),
  CONSTRAINT `transacao_ibfk_1` FOREIGN KEY (`id_conta_origem`) REFERENCES `conta` (`id_conta`),
  CONSTRAINT `transacao_ibfk_2` FOREIGN KEY (`id_conta_destino`) REFERENCES `conta` (`id_conta`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `auditoria`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `acao` varchar(50) NOT NULL,
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `detalhes` text,
  PRIMARY KEY (`id_auditoria`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Tabela `relatorio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `relatorio`;
CREATE TABLE `relatorio` (
  `id_relatorio` int NOT NULL AUTO_INCREMENT,
  `id_funcionario` int NOT NULL,
  `tipo_relatorio` varchar(50) NOT NULL,
  `data_geracao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `conteudo` text NOT NULL,
  PRIMARY KEY (`id_relatorio`),
  KEY `id_funcionario` (`id_funcionario`),
  CONSTRAINT `relatorio_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- INSERINDO DADOS
-- -----------------------------------------------------

INSERT INTO `usuario` VALUES
(10,'Gerente Teste','12345678901','1980-01-01','11987654321','FUNCIONARIO','$2b$10$VJf5u442EXFQeIKrRBcdrOR3WP5QXt86wRIBQsVipSamqpG7BLKOK','404404','2025-06-18 06:40:56','Rua Teste, 123'),
(11,'Cliente Teste','98765432109','1990-01-01','61912345678','CLIENTE','$2b$10$FO9d/QPPWXHfy43JSOi3reP3v0IOkokz9HuttBT95i626xRxWXGAe','404404','2025-06-18 06:40:56','Rua Cliente, 456'),
(12,'Novo Cliente','11122233344','1995-01-01','61999998888','CLIENTE','$2b$10$n25We9fOo3VU8bpO2yefKOIDPvFh4XvaIzYkm5KrmOrisn1wgvTuS','404404','2025-06-18 06:40:56',NULL),
(13,'Rafael Moreira','77777777777','1997-07-07','61977777777','CLIENTE','$2b$10$82jnhj//BgFTttNF6kWs2eGyrIR75/5YrswuZjWcs0lf5H2A3EDzm','404404','2025-06-18 06:40:56',NULL),
(14,'Cliente Oito','88888888888','1998-08-08','61988888888','CLIENTE','$2b$10$rYUcNGfByp2J/7O6aDD/PeH5guS5ZmNAO/IiyGCS.jrh.RGBbjJnS','404404','2025-06-18 06:40:56',NULL),
(21,'Atendente da Silva','00099988877','1997-09-08','61900009999','FUNCIONARIO','$2b$10$.dukb3B0lw3upiD/vqQMfeuIu4TdeVFnDRcHNqg2iV/gLx8EGVcH2','404404','2025-06-18 06:40:56',NULL),
(22,'Estagiario de Sousa','00011199922','1992-01-29','61901922910','FUNCIONARIO','$2b$10$3W/m4XhaLfa3uXvZQwLX.uAjuAOnuigEVeVxX5GPNb41dOQnIGEp.','404404','2025-06-18 06:40:56',NULL);

INSERT INTO `endereco` VALUES
(2,11,'12345678','Rua Teste',123,'Centro','Brasília','DF','Apto 101'),
(3,12,'12345-678','Rua Nova',456,'Bairro Novo','Brasília','DF','Apto 202'),
(4,13,'77777-777','Rua Sete',777,'Bairro sete','Brasília','DF','Apto 77'),
(5,10,'12345678','Rua Teste',123,'Bairro Teste','São Paulo','SP','Apto 101'),
(6,14,'88888-888','Rua Oito',888,'Bairro Oito','Brasília','DF','Apto 888'),
(7,21,'66666666','Teste',66,'Teste','Teste','TS',NULL),
(8,22,'01922901','Rua Estagio',921,'Bairro Estagio','Brasília','DF',NULL);

INSERT INTO `agencia` VALUES (2,'Agência Central','0001',2);

INSERT INTO `funcionario` VALUES
(3,10,'FUNC001','GERENTE',NULL),
(4,21,'002','ATENDENTE',3),
(5,22,'003','ESTAGIARIO',3);

INSERT INTO `cliente` VALUES
(2,11,4.20),
(3,12,0.00),
(4,13,0.00),
(5,14,0.00);

INSERT INTO `conta` VALUES
(4,'123456-7',2,1800.00,'POUPANCA',2,'2025-06-17 02:04:42','ATIVA',NULL),
(7,'6543210',2,0.00,'POUPANCA',3,'2025-06-17 05:09:58','ATIVA',NULL),
(8,'6543220',2,0.00,'CORRENTE',3,'2025-06-17 05:13:22','ENCERRADA',NULL),
(9,'6543230',2,0.00,'INVESTIMENTO',3,'2025-06-17 05:14:33','ATIVA',3),
(10,'77',2,9382.00,'POUPANCA',4,'2025-06-17 22:17:19','ATIVA',3),
(11,'8888',2,250.00,'POUPANCA',5,'2025-06-18 01:53:15','ATIVA',3),
(12,'777',2,2000.00,'CORRENTE',4,'2025-06-18 06:35:46','ATIVA',3);

INSERT INTO `conta_corrente` VALUES
(1,8,1000.00,'2025-07-17',0.20),
(2,12,2000.00,'2025-07-18',5.00);

INSERT INTO `conta_investimento` VALUES (1,9,'MEDIO',1000.00,1.00);

INSERT INTO `conta_poupanca` VALUES
(1,4,0.05,NULL),
(2,7,0.50,NULL),
(3,10,0.05,NULL),
(4,11,0.80,NULL);

INSERT INTO `transacao` VALUES
(1,4,NULL,'DEPOSITO',500.00,'2025-06-17 05:43:44','Depósito inicial'),
(2,4,NULL,'SAQUE',200.00,'2025-06-17 05:43:45','Saque em caixa'),
(3,10,NULL,'DEPOSITO',77.00,'2025-06-18 07:30:33','Depósito de R$77.00'),
(4,10,NULL,'DEPOSITO',9500.00,'2025-06-18 07:32:12','Depósito de R$9500.00'),
(5,10,NULL,'DEPOSITO',100.00,'2025-06-18 07:32:16','Depósito de R$100.00'),
(6,4,NULL,'DEPOSITO',500.00,'2025-06-18 07:35:04','Depósito de R$500.00'),
(7,10,NULL,'DEPOSITO',100.00,'2025-06-18 07:54:17','Depósito de R$100.00'),
(8,10,NULL,'DEPOSITO',15.00,'2025-06-18 08:28:59','Depósito de R$15.00'),
(9,10,NULL,'SAQUE',50.00,'2025-06-18 08:34:25','Saque de R$50.00'),
(10,10,NULL,'DEPOSITO',10.00,'2025-06-18 08:48:43','Depósito de R$10.00'),
(11,10,NULL,'SAQUE',50.00,'2025-06-18 08:48:53','Saque de R$50.00'),
(12,10,NULL,'SAQUE',100.00,'2025-06-18 08:49:08','Saque de R$100.00'),
(13,10,NULL,'DEPOSITO',10.00,'2025-06-18 08:54:47','Depósito de R$10.00'),
(14,10,NULL,'DEPOSITO',20.00,'2025-06-18 09:09:18','Depósito de R$20.00'),
(15,10,11,'TRANSFERENCIA',10.00,'2025-06-18 09:23:11','Transferência de R$10.00 para conta 8888'),
(16,10,11,'TRANSFERENCIA',20.00,'2025-06-18 09:23:31','Transferência de R$20.00 para conta 8888'),
(17,10,11,'TRANSFERENCIA',100.00,'2025-06-18 09:23:40','Transferência de R$100.00 para conta 8888'),
(18,10,11,'TRANSFERENCIA',120.00,'2025-06-18 09:23:45','Transferência de R$120.00 para conta 8888'),
(19,12,NULL,'DEPOSITO',2000.00,'2025-06-18 09:36:10','Depósito de R$2000.00');

-- Omitindo a inserção de dados de auditoria por serem muito numerosos e geralmente não necessários para recriar a estrutura funcional. Se precisar deles, eles podem ser adicionados aqui.


-- -----------------------------------------------------
-- CRIAÇÃO DAS VIEWS
-- -----------------------------------------------------
DROP VIEW IF EXISTS `vw_movimentacoes_recentes`;
CREATE VIEW `vw_movimentacoes_recentes` AS
SELECT
    `t`.`id_transacao` AS `id_transacao`,
    `t`.`id_conta_origem` AS `id_conta_origem`,
    `t`.`id_conta_destino` AS `id_conta_destino`,
    `t`.`tipo_transacao` AS `tipo_transacao`,
    `t`.`valor` AS `valor`,
    `t`.`data_hora` AS `data_hora`,
    `t`.`descricao` AS `descricao`,
    `c`.`numero_conta` AS `numero_conta`,
    `u`.`nome` AS `cliente`
FROM
    (((`transacao` `t`
    JOIN `conta` `c` ON ((`t`.`id_conta_origem` = `c`.`id_conta`)))
    JOIN `cliente` `cl` ON ((`c`.`id_cliente` = `cl`.`id_cliente`)))
    JOIN `usuario` `u` ON ((`cl`.`id_usuario` = `u`.`id_usuario`)))
WHERE
    (`t`.`data_hora` >= (now() - interval 90 day));

DROP VIEW IF EXISTS `vw_resumo_contas`;
CREATE VIEW `vw_resumo_contas` AS
SELECT
    `c`.`id_cliente` AS `id_cliente`,
    `u`.`nome` AS `nome`,
    count(`co`.`id_conta`) AS `total_contas`,
    sum(`co`.`saldo`) AS `saldo_total`
FROM
    ((`cliente` `c`
    JOIN `usuario` `u` ON ((`c`.`id_usuario` = `u`.`id_usuario`)))
    JOIN `conta` `co` ON ((`c`.`id_cliente` = `co`.`id_cliente`)))
GROUP BY `c`.`id_cliente` , `u`.`nome`;


-- -----------------------------------------------------
-- CRIAÇÃO DOS TRIGGERS
-- -----------------------------------------------------

DELIMITER $$

-- TRIGGER: limite_deposito
DROP TRIGGER IF EXISTS `limite_deposito`$$
CREATE TRIGGER `limite_deposito` BEFORE INSERT ON `transacao` FOR EACH ROW
BEGIN
    DECLARE total_dia DECIMAL(15,2);
    IF NEW.tipo_transacao = 'DEPOSITO' THEN
        SELECT SUM(valor) INTO total_dia
        FROM transacao
        WHERE id_conta_origem = NEW.id_conta_origem
          AND tipo_transacao = 'DEPOSITO'
          AND DATE(data_hora) = DATE(NEW.data_hora);

        IF (IFNULL(total_dia, 0) + NEW.valor) > 10000 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Limite diário de depósito excedido';
        END IF;
    END IF;
END$$

-- TRIGGER: taxa_saque_excessivo
DROP TRIGGER IF EXISTS `taxa_saque_excessivo`$$
CREATE TRIGGER `taxa_saque_excessivo` BEFORE INSERT ON `transacao` FOR EACH ROW
BEGIN
    DECLARE saques_mes INT;
    DECLARE taxa DECIMAL(5,2) DEFAULT 5.00;

    IF NEW.tipo_transacao = 'SAQUE' THEN
        SELECT COUNT(*) INTO saques_mes
        FROM transacao
        WHERE id_conta_origem = NEW.id_conta_origem
          AND tipo_transacao = 'SAQUE'
          AND YEAR(data_hora) = YEAR(NEW.data_hora)
          AND MONTH(data_hora) = MONTH(NEW.data_hora);

        IF saques_mes >= 5 THEN
            INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, data_hora, descricao)
            VALUES (NEW.id_conta_origem, 'TAXA', taxa, NEW.data_hora, 'Taxa por saque excessivo');
        END IF;
    END IF;
END$$

-- TRIGGER: atualizar_saldo
DROP TRIGGER IF EXISTS `atualizar_saldo`$$
CREATE TRIGGER `atualizar_saldo` AFTER INSERT ON `transacao` FOR EACH ROW
BEGIN
    IF NEW.tipo_transacao = 'DEPOSITO' OR NEW.tipo_transacao = 'RENDIMENTO' THEN
        UPDATE conta SET saldo = saldo + NEW.valor WHERE id_conta = NEW.id_conta_origem;
    ELSEIF NEW.tipo_transacao IN ('SAQUE', 'TAXA') THEN
        UPDATE conta SET saldo = saldo - NEW.valor WHERE id_conta = NEW.id_conta_origem;
    ELSEIF NEW.tipo_transacao = 'TRANSFERENCIA' THEN
        UPDATE conta SET saldo = saldo - NEW.valor WHERE id_conta = NEW.id_conta_origem;
        UPDATE conta SET saldo = saldo + NEW.valor WHERE id_conta = NEW.id_conta_destino;
    END IF;
END$$

DELIMITER ;

-- Restaura as configurações originais do SQL
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
```