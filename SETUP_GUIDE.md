# Setup Guide - NewChecklist Enhanced

## Pré-requisitos
- Supabase projeto configurado
- Variáveis de ambiente já configuradas (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Configuração do Banco de Dados

Se você receber erros sobre tabelas ou colunas faltando, execute as migrações manualmente:

### Opção 1: Via API Route (Automático)
1. Acesse `POST /api/migrations` no seu projeto
2. As migrações serão executadas automaticamente

### Opção 2: Manual no Supabase Console
1. Abra o Supabase Dashboard
2. Vá para SQL Editor
3. Copie e execute cada arquivo de migração em ordem:
   - `scripts/002_add_groups.sql`
   - `scripts/003_add_categories.sql`
   - `scripts/004_add_preferences.sql`

## Estrutura Criada

### Novas Tabelas
- `groups`: Armazena grupos de tarefas do usuário
- `user_preferences`: Armazena preferências de tema e visualização

### Colunas Adicionadas a `tasks`
- `group_id`: Referência ao grupo
- `category`: Categoria (daily, weekly, monthly, etc)
- `due_date`: Data de vencimento

## Recursos Disponíveis

### Componentes
- `ChecklistEnhanced`: Checklist com filtros e categorias
- `GroupsManager`: Gerenciar grupos de tarefas
- `PreferencesPanel`: Customizar tema
- `CategoryFilter`: Filtrar por categoria
- `DueDateFilter`: Filtrar por data

### API Routes
- `GET/POST /api/groups` - Listar e criar grupos
- `DELETE /api/groups/[id]` - Deletar grupo
- `GET/POST /api/preferences` - Preferências de usuário
- `POST /api/tasks` - Criar tarefa
- `POST /api/migrations` - Executar migrações

## Troubleshooting

### Erro: "Tables don't exist"
Execute as migrações SQL no console do Supabase.

### Erro: "Unauthorized"
Verifique se você está logado. O middleware protege as rotas.

### Componentes não aparecem
Componentes são carregados dinamicamente para melhor performance.
Aguarde alguns segundos para eles aparecerem.

## Recursos Implementados

✅ Grupos de tarefas
✅ Filtros por status e categoria
✅ Customização de tema (cores, fontes, bordas)
✅ Preferências persistentes
✅ Animações suaves
✅ Segurança com validação de inputs
✅ Rate limiting
✅ Audit logging
✅ Responsive design
✅ Dark mode
