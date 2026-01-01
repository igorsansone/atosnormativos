Implementa sistema inicial para controle e emissão de atos normativos (Decisões, Portarias, Resoluções).

- API REST (Node.js + TypeScript + Express)
- Prisma schema e migration SQL para PostgreSQL (tabelas acts e sequences)
- Geração de número sequencial por tipo/ano (ex: 001/2026) em transação
- Campos: objeto, setor solicitante, data, homologação (e número), publicações (site/word/pdf/pendente)
- Arquivamento e inutilização (status + timestamps)
- Busca livre (q) e filtros, endpoint para relatórios
- .env.example, README, scripts npm

Checklist (marcar quando pronto)
- [ ] Criar branch feature/implement-atosnormativos (já criado)
- [ ] Adicionar arquivos no repositório (migrations e templates adicionados)
- [ ] Rodar migrations / criar schema no Postgres
- [ ] Executar `npm install` e `npm run prisma:generate`
- [ ] Testar endpoints locais (`npm run dev`)
- [ ] Revisar e mesclar PR

Instruções para rodar localmente
1. Copie .env.example → .env e ajuste DATABASE_URL
2. npm install
3. npx prisma generate
4. Criar o schema no Postgres:
   - opção SQL direto: psql -d <db> -f migrations/001_init.sql
   - ou usar Prisma migrate se preferir
5. npm run dev
