# Esquema do Banco de Dados PostgreSQL - Finscale

Este documento detalha o esquema do banco de dados PostgreSQL para o projeto Finscale, focado na gestão de plantões médicos.

## Visão Geral

O banco de dados é organizado em várias tabelas que armazenam informações sobre usuários, hospitais, plantões, pagamentos e outros dados relacionados ao sistema. As tabelas principais são:

- `users`: Armazena informações dos usuários (médicos, administradores)
- `hospitals`: Armazena informações sobre os hospitais/clínicas
- `specialties`: Lista de especialidades médicas
- `shifts`: Informações sobre plantões disponíveis
- `user_shifts`: Relação entre usuários e plantões (agendamentos)
- `payments`: Registro de pagamentos aos médicos
- `notifications`: Histórico de notificações enviadas

## Diagrama ER

```
+----------------+      +-------------------+      +------------------+
| users          |      | shifts            |      | hospitals        |
+----------------+      +-------------------+      +------------------+
| id (PK)        |      | id (PK)           |      | id (PK)          |
| email          |      | hospital_id (FK)  |<-----| name             |
| password_hash  |      | specialty_id (FK) |      | address          |
| first_name     |      | start_date        |      | city             |
| last_name      |      | end_date          |      | state            |
| crm            |      | value             |      | zip_code         |
| specialty_id(FK)|--+  | status            |      | phone            |
| phone          |  |   | description       |      | created_at       |
| firebase_uid   |  |   | created_at        |      | updated_at       |
| role           |  |   | updated_at        |      | created_at       |
| created_at     |  |   +-------------------+      +------------------+
| updated_at     |  |           |                            ^
+----------------+  |           |                            |
        |           |           |                            |
        |           |           v                            |
        |           |   +-----------------+           +------------------+
        |           |   | user_shifts     |           | hospital_admins  |
        |           |   +-----------------+           +------------------+
        |           |   | id (PK)         |           | id (PK)          |
        |           |   | user_id (FK)    |<----------| user_id (FK)     |
        |           |   | shift_id (FK)   |           | hospital_id (FK) |
        |           |   | status          |           | role             |
        |           |   | check_in        |           | created_at       |
        |           |   | check_out       |           | updated_at       |
        |           |   | rating          |           +------------------+
        |           |   | created_at      |
        |           |   | updated_at      |
        |           |   +-----------------+
        |           |
        |           v
        |   +----------------+
        |   | specialties    |
        |   +----------------+
        |   | id (PK)        |
        +-->| name           |
            | description    |
            | created_at     |
            | updated_at     |
            +----------------+
                   ^
                   |
                   |
        +----------------------+
        | hospital_specialties |
        +----------------------+
        | id (PK)              |
        | hospital_id (FK)     |
        | specialty_id (FK)    |
        | created_at           |
        | updated_at           |
        +----------------------+
```

## Estrutura Detalhada das Tabelas

### Tabela `users`

Armazena os dados de usuários do sistema, incluindo médicos e administradores.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    crm VARCHAR(20),
    specialty_id INTEGER REFERENCES specialties(id),
    phone VARCHAR(20),
    firebase_uid VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'doctor', -- 'doctor', 'admin', 'superadmin'
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    fcm_token TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX users_specialty_id_idx ON users(specialty_id);
```

### Tabela `hospitals`

Armazena informações sobre hospitais e clínicas.

```sql
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    description TEXT,
    logo_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX hospitals_city_state_idx ON hospitals(city, state);
CREATE INDEX hospitals_status_idx ON hospitals(status);
```

### Tabela `hospital_admins`

Relaciona usuários administradores a hospitais específicos.

```sql
CREATE TABLE hospital_admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'admin', 'manager'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, hospital_id)
);

-- Índices
CREATE INDEX hospital_admins_user_id_idx ON hospital_admins(user_id);
CREATE INDEX hospital_admins_hospital_id_idx ON hospital_admins(hospital_id);
```

### Tabela `specialties`

Armazena as especialidades médicas disponíveis.

```sql
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO specialties (name, description) VALUES 
    ('Clínica Médica', 'Atendimento geral a pacientes adultos'),
    ('Pediatria', 'Atendimento médico a crianças e adolescentes'),
    ('Ortopedia', 'Tratamento de doenças e lesões nos ossos e músculos'),
    ('Cardiologia', 'Especialidade médica que se ocupa do diagnóstico e tratamento das doenças que acometem o coração'),
    ('Ginecologia', 'Especialidade médica que trata da saúde do aparelho reprodutor feminino'),
    ('Neurologia', 'Especialidade médica que trata dos distúrbios estruturais do sistema nervoso');
```

### Tabela `hospital_specialties`

Tabela de relacionamento entre hospitais e especialidades oferecidas.

```sql
CREATE TABLE hospital_specialties (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    specialty_id INTEGER NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hospital_id, specialty_id)
);

-- Índices
CREATE INDEX hospital_specialties_hospital_id_idx ON hospital_specialties(hospital_id);
CREATE INDEX hospital_specialties_specialty_id_idx ON hospital_specialties(specialty_id);
```

### Tabela `shifts`

Armazena informações sobre os plantões disponíveis.

```sql
CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    specialty_id INTEGER NOT NULL REFERENCES specialties(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'booked', 'completed', 'cancelled'
    description TEXT,
    requirements TEXT,
    priority INTEGER DEFAULT 0, -- Prioridade de exibição (0-normal, 1-alta, 2-urgente)
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- Índices
CREATE INDEX shifts_hospital_id_idx ON shifts(hospital_id);
CREATE INDEX shifts_specialty_id_idx ON shifts(specialty_id);
CREATE INDEX shifts_start_date_idx ON shifts(start_date);
CREATE INDEX shifts_status_idx ON shifts(status);
```

### Tabela `user_shifts`

Relaciona usuários (médicos) a plantões (agendamentos).

```sql
CREATE TABLE user_shifts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_id INTEGER NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled', 'no_show'
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    rating INTEGER, -- Avaliação do hospital (1-5)
    doctor_rating INTEGER, -- Avaliação do médico (1-5)
    hospital_notes TEXT,
    doctor_notes TEXT,
    cancellation_reason TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(shift_id)
);

-- Índices
CREATE INDEX user_shifts_user_id_idx ON user_shifts(user_id);
CREATE INDEX user_shifts_shift_id_idx ON user_shifts(shift_id);
CREATE INDEX user_shifts_status_idx ON user_shifts(status);
```

### Tabela `payments`

Registra pagamentos relacionados aos plantões.

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_shift_id INTEGER NOT NULL REFERENCES user_shifts(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    payment_date TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    invoice_url TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX payments_user_shift_id_idx ON payments(user_shift_id);
CREATE INDEX payments_status_idx ON payments(status);
```

### Tabela `notifications`

Armazena histórico de notificações enviadas aos usuários.

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'shift_available', 'shift_reminder', 'payment', 'system'
    reference_id INTEGER, -- ID relacionado ao tipo (por exemplo, ID do plantão)
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    fcm_sent BOOLEAN DEFAULT FALSE,
    fcm_sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_type_idx ON notifications(type);
```

### Tabela `user_availability`

Registra a disponibilidade de horários dos médicos.

```sql
CREATE TABLE user_availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (Domingo) a 6 (Sábado)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE, -- Se não for recorrente, data específica
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

-- Índices
CREATE INDEX user_availability_user_id_idx ON user_availability(user_id);
CREATE INDEX user_availability_day_of_week_idx ON user_availability(day_of_week);
```

### Tabela `user_fcm_tokens`

Armazena tokens de Firebase Cloud Messaging para cada dispositivo do usuário.

```sql
CREATE TABLE user_fcm_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type VARCHAR(50), -- 'android', 'ios', 'web'
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(token)
);

-- Índices
CREATE INDEX user_fcm_tokens_user_id_idx ON user_fcm_tokens(user_id);
CREATE INDEX user_fcm_tokens_token_idx ON user_fcm_tokens(token);
```

## Procedimentos Armazenados e Funções

### Procedimento: Atualizar Status de Plantões

```sql
CREATE OR REPLACE FUNCTION update_shift_statuses()
RETURNS void AS $$
BEGIN
    -- Atualizar plantões que já terminaram para 'completed'
    UPDATE shifts 
    SET status = 'completed' 
    WHERE status = 'booked' 
    AND end_date < NOW();
    
    -- Atualizar user_shifts correspondentes
    UPDATE user_shifts 
    SET status = 'completed' 
    WHERE status = 'confirmed' 
    AND shift_id IN (SELECT id FROM shifts WHERE status = 'completed');
END;
$$ LANGUAGE plpgsql;

-- Criar uma trigger para execução automatizada
CREATE OR REPLACE FUNCTION trigger_update_shift_statuses()
RETURNS trigger AS $$
BEGIN
    PERFORM update_shift_statuses();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shift_statuses_trigger
AFTER INSERT OR UPDATE ON shifts
EXECUTE PROCEDURE trigger_update_shift_statuses();
```

### Função: Calcular Estatísticas de Médico

```sql
CREATE OR REPLACE FUNCTION doctor_statistics(doctor_id INTEGER)
RETURNS TABLE (
    total_shifts INTEGER,
    total_hours DECIMAL,
    total_earnings DECIMAL,
    avg_rating DECIMAL,
    completed_shifts INTEGER,
    cancelled_shifts INTEGER,
    no_show_shifts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(us.id) AS total_shifts,
        SUM(EXTRACT(EPOCH FROM (s.end_date - s.start_date)) / 3600) AS total_hours,
        SUM(s.value) AS total_earnings,
        AVG(us.doctor_rating)::DECIMAL(3,1) AS avg_rating,
        COUNT(us.id) FILTER (WHERE us.status = 'completed') AS completed_shifts,
        COUNT(us.id) FILTER (WHERE us.status = 'cancelled') AS cancelled_shifts,
        COUNT(us.id) FILTER (WHERE us.status = 'no_show') AS no_show_shifts
    FROM 
        user_shifts us
    JOIN 
        shifts s ON us.shift_id = s.id
    WHERE 
        us.user_id = doctor_id;
END;
$$ LANGUAGE plpgsql;
```

## Procedimentos para Backup

### Rotina de Backup Diário

Para configurar backups diários do banco de dados, pode-se utilizar o utilitário `pg_dump` do PostgreSQL em conjunto com o agendador de tarefas do sistema operacional:

```bash
#!/bin/bash
# backup-finscale-db.sh

# Configurações
DB_NAME="finscale_db"
DB_USER="finscale_user"
BACKUP_DIR="/var/backups/postgres/finscale"
DATE=$(date +%Y-%m-%d)

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Realizar backup
pg_dump -U $DB_USER -Fc $DB_NAME > $BACKUP_DIR/$DB_NAME-$DATE.dump

# Comprimir backup
gzip $BACKUP_DIR/$DB_NAME-$DATE.dump

# Remover backups com mais de 30 dias
find $BACKUP_DIR -name "*.dump.gz" -mtime +30 -delete
```

Para agendar este script para execução diária às 2h da manhã:

```
0 2 * * * /path/to/backup-finscale-db.sh
```

### Procedimento para Restauração

Para restaurar um backup:

```bash
#!/bin/bash
# restore-finscale-db.sh

# Configurações
DB_NAME="finscale_db"
DB_USER="finscale_user"
BACKUP_FILE=$1

# Verificar se arquivo de backup foi especificado
if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <arquivo_de_backup>"
    exit 1
fi

# Descomprimir se necessário
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > /tmp/temp_backup.dump
    BACKUP_FILE="/tmp/temp_backup.dump"
fi

# Restaurar banco de dados
pg_restore -U $DB_USER -d $DB_NAME -c -C $BACKUP_FILE

# Limpar arquivo temporário
if [ -f "/tmp/temp_backup.dump" ]; then
    rm /tmp/temp_backup.dump
fi

echo "Restauração concluída!"
```

## Práticas de Segurança

1. **Backups Regulares**: Configurar backups diários conforme descrito acima.
2. **Replicação**: Implementar réplicas do banco de dados para alta disponibilidade.
3. **Controle de Acesso**: Criar usuários com permissões limitadas para diferentes funções.
4. **Criptografia**: Utilizar conexões criptografadas (SSL) para acesso ao banco de dados.
5. **Monitoramento**: Implementar monitoramento de consultas lentas e uso de recursos.

## Próximos Passos

1. Implementar migrations para gerenciar alterações no esquema.
2. Configurar réplicas para alta disponibilidade.
3. Implementar particionamento para tabelas que crescerão significativamente (como `user_shifts` e `notifications`).
4. Criar usuários específicos com permissões limitadas para diferentes microserviços.
5. Implementar métricas e monitoramento.

## Considerações sobre Escalabilidade

Para garantir a escalabilidade do banco de dados, considere:

1. **Particionamento de tabelas**: Especialmente para `notifications`, `user_shifts` e outras que crescem rapidamente.
2. **Índices estratégicos**: Avaliar regularmente o desempenho das consultas e ajustar índices.
3. **Read replicas**: Para distribuir a carga de consultas.
4. **Arquivamento de dados**: Mover dados antigos para tabelas de histórico após um período determinado.

## Consultas Comuns e Otimizadas

### Plantões Disponíveis para um Médico por Especialidade

```sql
SELECT s.*
FROM shifts s
JOIN specialties sp ON s.specialty_id = sp.id
JOIN users u ON u.specialty_id = sp.id
WHERE s.status = 'available'
AND u.id = [user_id]
AND s.start_date > NOW()
ORDER BY s.start_date ASC;
```

### Estatísticas de Plantões por Hospital

```sql
SELECT 
    h.name AS hospital_name,
    COUNT(s.id) AS total_shifts,
    COUNT(s.id) FILTER (WHERE s.status = 'available') AS available_shifts,
    COUNT(s.id) FILTER (WHERE s.status = 'booked') AS booked_shifts,
    COUNT(s.id) FILTER (WHERE s.status = 'completed') AS completed_shifts,
    AVG(us.doctor_rating) FILTER (WHERE us.doctor_rating IS NOT NULL) AS avg_doctor_rating
FROM 
    hospitals h
LEFT JOIN 
    shifts s ON h.id = s.hospital_id
LEFT JOIN 
    user_shifts us ON s.id = us.shift_id
GROUP BY 
    h.id, h.name
ORDER BY 
    h.name;
``` 