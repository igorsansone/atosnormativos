```markdown
# Sistema de Atos Normativos — Setup inicial

Este é um template inicial para um sistema de controle e emissão de atos normativos (Decisões, Portarias, Resoluções) com banco PostgreSQL e backend em Node.js + Express + Prisma.

Funcionalidades chave:
- Campos conforme solicitado (número sequencial por tipo/ano, objeto, setor solicitante, data do ato, homologação com número específico, publicação, arquivamento, inutilização).
- Geração de número sequencial por tipo e ano (ex: `001/2026`).
- Busca por palavras, números e datas.
- Relatório filtrável (endpoint que retorna dados filtrados para impressão/export).
- Conexão com PostgreSQL via Prisma.

Pré-requisitos:
- Node.js 18+
- PostgreSQL 12+
- yarn ou npm

Exemplo .env:
DATABASE_URL="postgresql://user:password@localhost:5432/atosdb?schema=public"

Scripts úteis:
- `npm run dev` — iniciar em modo dev (ts-node-dev)
- `npm run build` — transpilar TypeScript
- `npm run start` — iniciar build produzido
- `npm run prisma:generate` — gerar client Prisma
- `npm run prisma:migrate` — aplicar migrations (usar com cuidado)

Migração (opções):
- Usar o arquivo SQL em `migrations/001_init.sql` com psql:
  psql -d <seu_db> -f migrations/001_init.sql
- Ou ajustar/usar Prisma Migrate com o schema em `prisma/schema.prisma`.

Observações:
- A geração do número sequencial é feita dentro de transação e usa a tabela `sequences` para evitar conflitos concorrentes.
- Campos de publicação são 4 booleans (site/word/pdf/pendente).
- Quando uma homologação diferente de "Pendente" é selecionada, a UI deve mostrar o campo `homologationNumber`.
- Status: ACTIVE / ARCHIVED / VOIDED. Arquivados e inutilizados devem ser exibidos com cores diferentes na UI.

API endpoints principais:
- POST /api/acts          -> criar ato
- GET  /api/acts          -> listar/pesquisar
- GET  /api/acts/:id      -> obter ato
- PUT  /api/acts/:id      -> editar
- DELETE /api/acts/:id    -> excluir (hard delete)
- POST /api/acts/:id/archive -> arquivar/desarquivar
- POST /api/acts/:id/void    -> marcar como inutilizado
- GET /api/acts/report/download -> endpoint para relatório/export

Se quiser que eu abra o PR diretamente daqui, diga — caso contrário, crie o branch e faça o push com os arquivos abaixo e abra o PR usando a descrição sugerida.
```
