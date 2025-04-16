# Script para gerenciar migrações do banco de dados PostgreSQL
# Finscale - Sistema de Gerenciamento de Plantões Médicos

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$Name = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

# Configurações
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$MigrationsFolder = Join-Path $ProjectRoot "backend\database\migrations"
$SeedsFolder = Join-Path $ProjectRoot "backend\database\seeds"
$ConfigFile = Join-Path $ProjectRoot "backend\config\database.js"

# Verifica se o diretório de migrações existe
if (-not (Test-Path $MigrationsFolder)) {
    New-Item -ItemType Directory -Path $MigrationsFolder | Out-Null
    Write-Host "Diretório de migrações criado em $MigrationsFolder" -ForegroundColor Green
}

# Verifica se o diretório de seeds existe
if (-not (Test-Path $SeedsFolder)) {
    New-Item -ItemType Directory -Path $SeedsFolder | Out-Null
    Write-Host "Diretório de seeds criado em $SeedsFolder" -ForegroundColor Green
}

# Função para verificar dependências
function Check-Dependencies {
    try {
        $NodeVersion = node -v
        Write-Host "Node.js versão $NodeVersion encontrado" -ForegroundColor Green
        
        $NpxVersion = npx -v
        Write-Host "NPX versão $NpxVersion encontrado" -ForegroundColor Green
        
        # Verifica se Knex está instalado globalmente
        $KnexInstalled = npm list -g knex
        if (-not ($KnexInstalled -like "*knex@*")) {
            Write-Host "Instalando Knex CLI globalmente..." -ForegroundColor Yellow
            npm install -g knex
        } else {
            Write-Host "Knex CLI já está instalado" -ForegroundColor Green
        }
        
        # Verifica se pg está instalado no projeto
        $PgInstalled = npm list --prefix backend pg
        if (-not ($PgInstalled -like "*pg@*")) {
            Write-Host "Instalando driver pg no projeto..." -ForegroundColor Yellow
            npm install --prefix backend pg
        } else {
            Write-Host "Driver pg já está instalado" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erro ao verificar dependências: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para criar uma nova migração
function Create-Migration {
    param([string]$MigrationName)
    
    if ([string]::IsNullOrEmpty($MigrationName)) {
        Write-Host "É necessário especificar um nome para a migração" -ForegroundColor Red
        Write-Host "Exemplo: .\criar-migrations.ps1 -Action create -Name create_users_table" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        # Executa o Knex para criar a migração
        Set-Location $ProjectRoot\backend
        npx knex migrate:make $MigrationName --migrations-directory database\migrations
        
        # Obtém o arquivo recém-criado para edição
        $NewMigrationFile = Get-ChildItem -Path $MigrationsFolder -Filter "*_$MigrationName.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        if ($NewMigrationFile) {
            Write-Host "Migração criada: $($NewMigrationFile.FullName)" -ForegroundColor Green
            
            # Abre o arquivo no editor padrão
            Write-Host "Deseja abrir o arquivo no editor padrão? (S/N)" -ForegroundColor Cyan
            $OpenEditor = Read-Host
            if ($OpenEditor -eq "S" -or $OpenEditor -eq "s") {
                Start-Process $NewMigrationFile.FullName
            }
        } else {
            Write-Host "Não foi possível encontrar o arquivo de migração criado" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erro ao criar migração: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para executar migrações
function Run-Migrations {
    try {
        Write-Host "Executando migrações no ambiente $Environment..." -ForegroundColor Yellow
        
        Set-Location $ProjectRoot\backend
        npx knex migrate:latest --env $Environment
        
        Write-Host "Migrações executadas com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao executar migrações: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para reverter a última migração
function Rollback-Migration {
    try {
        Write-Host "Revertendo última migração no ambiente $Environment..." -ForegroundColor Yellow
        
        Set-Location $ProjectRoot\backend
        npx knex migrate:rollback --env $Environment
        
        Write-Host "Migração revertida com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao reverter migração: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para criar um seed
function Create-Seed {
    param([string]$SeedName)
    
    if ([string]::IsNullOrEmpty($SeedName)) {
        Write-Host "É necessário especificar um nome para o seed" -ForegroundColor Red
        Write-Host "Exemplo: .\criar-migrations.ps1 -Action create-seed -Name 01_users" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        # Executa o Knex para criar o seed
        Set-Location $ProjectRoot\backend
        npx knex seed:make $SeedName --knexfile .\knexfile.js
        
        # Obtém o arquivo recém-criado para edição
        $NewSeedFile = Get-ChildItem -Path $SeedsFolder -Filter "*$SeedName.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        if ($NewSeedFile) {
            Write-Host "Seed criado: $($NewSeedFile.FullName)" -ForegroundColor Green
            
            # Abre o arquivo no editor padrão
            Write-Host "Deseja abrir o arquivo no editor padrão? (S/N)" -ForegroundColor Cyan
            $OpenEditor = Read-Host
            if ($OpenEditor -eq "S" -or $OpenEditor -eq "s") {
                Start-Process $NewSeedFile.FullName
            }
        } else {
            Write-Host "Não foi possível encontrar o arquivo de seed criado" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erro ao criar seed: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para executar seeds
function Run-Seeds {
    try {
        Write-Host "Executando seeds no ambiente $Environment..." -ForegroundColor Yellow
        
        Set-Location $ProjectRoot\backend
        npx knex seed:run --env $Environment
        
        Write-Host "Seeds executados com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao executar seeds: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para verificar o status das migrações
function Check-Status {
    try {
        Write-Host "Verificando status das migrações no ambiente $Environment..." -ForegroundColor Yellow
        
        Set-Location $ProjectRoot\backend
        npx knex migrate:status --env $Environment
    } catch {
        Write-Host "Erro ao verificar status das migrações: $_" -ForegroundColor Red
        exit 1
    }
}

# Função para criar arquivo knexfile.js se não existir
function Create-KnexFile {
    $KnexfilePath = Join-Path $ProjectRoot "backend\knexfile.js"
    
    if (-not (Test-Path $KnexfilePath)) {
        Write-Host "Criando arquivo knexfile.js..." -ForegroundColor Yellow
        
        # Certifica-se que o diretório existe
        $BackendDir = Join-Path $ProjectRoot "backend"
        if (-not (Test-Path $BackendDir)) {
            New-Item -ItemType Directory -Path $BackendDir | Out-Null
        }
        
        # Conteúdo do knexfile.js
        $KnexfileContent = @"
// Configuração de migrações e conexão com banco de dados
// Arquivo gerado pelo script criar-migrations.ps1

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'finscale_dev'
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'finscale_test'
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 20
    }
  }
};
"@

        Set-Content -Path $KnexfilePath -Value $KnexfileContent
        Write-Host "Arquivo knexfile.js criado em $KnexfilePath" -ForegroundColor Green
    } else {
        Write-Host "Arquivo knexfile.js já existe em $KnexfilePath" -ForegroundColor Green
    }
}

# Função para inicializar o ambiente de migrações
function Initialize-Environment {
    Write-Host "Inicializando ambiente de migrações..." -ForegroundColor Yellow
    
    # Verifica dependências
    Check-Dependencies
    
    # Cria knexfile.js
    Create-KnexFile
    
    # Cria diretórios necessários
    if (-not (Test-Path $MigrationsFolder)) {
        New-Item -ItemType Directory -Path $MigrationsFolder -Force | Out-Null
        Write-Host "Diretório de migrações criado: $MigrationsFolder" -ForegroundColor Green
    }
    
    if (-not (Test-Path $SeedsFolder)) {
        New-Item -ItemType Directory -Path $SeedsFolder -Force | Out-Null
        Write-Host "Diretório de seeds criado: $SeedsFolder" -ForegroundColor Green
    }
    
    # Verifica existência do banco de dados
    try {
        $env:PGPASSWORD = "postgres"
        $DatabaseExists = psql -U postgres -h localhost -t -c "SELECT 1 FROM pg_database WHERE datname='finscale_dev'" | Out-String
        
        if ($DatabaseExists.Trim() -ne "1") {
            Write-Host "Criando banco de dados finscale_dev..." -ForegroundColor Yellow
            psql -U postgres -h localhost -c "CREATE DATABASE finscale_dev" | Out-Null
            Write-Host "Banco de dados finscale_dev criado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Banco de dados finscale_dev já existe" -ForegroundColor Green
        }
        
        # Verifica banco de testes
        $TestDatabaseExists = psql -U postgres -h localhost -t -c "SELECT 1 FROM pg_database WHERE datname='finscale_test'" | Out-String
        
        if ($TestDatabaseExists.Trim() -ne "1") {
            Write-Host "Criando banco de dados finscale_test..." -ForegroundColor Yellow
            psql -U postgres -h localhost -c "CREATE DATABASE finscale_test" | Out-Null
            Write-Host "Banco de dados finscale_test criado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Banco de dados finscale_test já existe" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erro ao verificar/criar banco de dados: $_" -ForegroundColor Red
        Write-Host "Certifique-se que o PostgreSQL está instalado e rodando" -ForegroundColor Yellow
    }
    
    Write-Host "Ambiente de migrações inicializado com sucesso!" -ForegroundColor Green
}

# Função para mostrar ajuda
function Show-Help {
    Write-Host "Finscale - Gerenciador de Migrações de Banco de Dados" -ForegroundColor Cyan
    Write-Host "Uso: .\criar-migrations.ps1 -Action <ação> [opções]" -ForegroundColor White
    Write-Host ""
    Write-Host "Ações disponíveis:" -ForegroundColor Yellow
    Write-Host "  init              - Inicializa o ambiente para migrações"
    Write-Host "  create            - Cria uma nova migração"
    Write-Host "  run               - Executa todas as migrações pendentes"
    Write-Host "  rollback          - Reverte a última migração"
    Write-Host "  status            - Verifica o status das migrações"
    Write-Host "  create-seed       - Cria um novo arquivo de seed"
    Write-Host "  run-seeds         - Executa todos os seeds"
    Write-Host "  help              - Mostra esta ajuda"
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  -Name <nome>      - Nome para a migração ou seed"
    Write-Host "  -Environment <env>- Ambiente (development, test, production)"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\criar-migrations.ps1 -Action init"
    Write-Host "  .\criar-migrations.ps1 -Action create -Name create_users_table"
    Write-Host "  .\criar-migrations.ps1 -Action run -Environment production"
    Write-Host "  .\criar-migrations.ps1 -Action create-seed -Name 01_users"
    Write-Host ""
}

# Processamento principal
switch ($Action) {
    "init" {
        Initialize-Environment
    }
    "create" {
        Create-Migration -MigrationName $Name
    }
    "run" {
        Run-Migrations
    }
    "rollback" {
        Rollback-Migration
    }
    "status" {
        Check-Status
    }
    "create-seed" {
        Create-Seed -SeedName $Name
    }
    "run-seeds" {
        Run-Seeds
    }
    default {
        Show-Help
    }
} 