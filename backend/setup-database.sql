-- Arquivo: setup-database.sql
-- Descrição: Script inicial para criação e configuração do banco de dados Finscale
-- Este script deve ser executado com privilégios de administrador PostgreSQL

-- Parte 1: Criação do banco de dados
-- Exclui o banco se já existir (descomente se necessário)
-- DROP DATABASE IF EXISTS finscale;

-- Criar o banco de dados
CREATE DATABASE finscale;

-- Parte 2: Próximos passos para executar manualmente no psql
-- 1. Conecte-se ao banco finscale: 
--    \c finscale

-- 2. Crie as extensões necessárias:
--    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Parte 3: Instruções para criar as tabelas
-- Após criar o banco e conectar-se a ele, execute o script database.sql para criar as tabelas:
--    psql -U postgres -d finscale -f src/models/database.sql

-- Notas:
-- - Este script só cria o banco de dados
-- - Os comandos comentados precisam ser executados manualmente no terminal psql
-- - Consulte o arquivo database-manual-setup.md para mais detalhes 