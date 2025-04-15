# Configuração Manual do Banco de Dados PostgreSQL

Se o script automático não funcionar, siga estas etapas para configurar manualmente o banco de dados:

## Pré-requisitos
- PostgreSQL instalado
- Acesso ao usuário postgres (ou outro usuário com privilégios de administrador)

## Passos para criação do banco de dados

### 1. Abra o cliente psql:

```bash
# Se o PostgreSQL estiver no PATH:
psql -U postgres

# Ou use o caminho completo:
"C:\Program Files\PostgreSQL\14\bin\psql" -U postgres
```

Quando solicitado, digite a senha que você definiu durante a instalação.

### 2. Crie o banco de dados:

```sql
CREATE DATABASE finscale;
```

### 3. Conecte-se ao banco de dados:

```sql
\c finscale
```

### 4. Saia do psql:

```sql
\q
```

### 5. Execute o script SQL para criar as tabelas:

```bash
# Se o PostgreSQL estiver no PATH:
psql -U postgres -d finscale -f "C:\Finscale\backend\src\models\database.sql"

# Ou use o caminho completo:
"C:\Program Files\PostgreSQL\14\bin\psql" -U postgres -d finscale -f "C:\Finscale\backend\src\models\database.sql"
```

## Verificação da instalação

Para verificar se as tabelas foram criadas corretamente:

```bash
psql -U postgres -d finscale
```

Depois, digite:

```sql
\dt
```

Isso mostrará todas as tabelas no banco de dados. Você deve ver as tabelas `users`, `institutions`, `shifts`, etc.

Para sair do psql, digite:

```sql
\q
``` 