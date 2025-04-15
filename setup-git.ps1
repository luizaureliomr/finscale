# Script de configuração do Git para o projeto Finscale
Write-Host "********************************************"
Write-Host "*    Configurando Repositório Git Finscale   *"
Write-Host "********************************************"
Write-Host ""

# Verificar se o Git está instalado
Write-Host "Verificando a instalação do Git..."
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion"
} catch {
    Write-Host "ERRO: Git não encontrado! Por favor instale o Git primeiro." -ForegroundColor Red
    Write-Host "Você pode baixá-lo em: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Inicializar repositório Git
Write-Host "Configurando repositório Git na pasta atual..."
git init

# Configurar nome de usuário e email (opcional)
$configureUser = Read-Host "Deseja configurar seu usuário Git para este repositório? (S/N)"
if ($configureUser -eq "S" -or $configureUser -eq "s") {
    $userName = Read-Host "Digite seu nome para o Git"
    $userEmail = Read-Host "Digite seu email para o Git"
    
    git config user.name "$userName"
    git config user.email "$userEmail"
    
    Write-Host "Usuário Git configurado!" -ForegroundColor Green
}

# Adicionar todos os arquivos
Write-Host "Adicionando todos os arquivos ao repositório..."
git add .

# Criar o primeiro commit
Write-Host "Criando o primeiro commit..."
git commit -m "Commit inicial do projeto Finscale"

# Mostrar status
git status

# Instruções para conectar a um repositório remoto
Write-Host ""
Write-Host "Repositório Git configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Crie um repositório no GitHub, GitLab ou outro serviço"
Write-Host "2. Execute os comandos para conectar ao repositório remoto:"
Write-Host "   git remote add origin [URL_DO_SEU_REPOSITORIO]"
Write-Host "   git push -u origin main"
Write-Host ""

# Aguardar entrada do usuário antes de fechar
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 