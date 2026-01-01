# Descrição
Descreva resumidamente as mudanças realizadas e o motivo.

# O que foi implementado
- Backend Node.js + TypeScript + Express
- Prisma schema e migration SQL para PostgreSQL (tabelas acts e sequences)
- Geração de número sequencial por tipo/ano (ex: 001/2026)
- Endpoints para CRUD, arquivamento, inutilização e relatório
- .env.example, README, scripts npm

# Checklist
- [ ] Código compilável
- [ ] Migrations adicionadas
- [ ] Testes básicos (se aplicável)
- [ ] README atualizado

# Como testar
1. Copie .env.example para .env e configure DATABASE_URL
2. Rode: npm install && npm run prisma:generate
3. Aplique migration SQL: psql -d <db> -f migrations/001_init.sql
4. Rode: npm run dev
5. Teste endpoints em http://localhost:3333/api/acts
