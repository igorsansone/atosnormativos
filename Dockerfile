# Imagem base leve
FROM node:18-alpine

WORKDIR /app

# instalar dependências em produção
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# copiar código
COPY . .

# gerar prisma client
RUN npx prisma generate || true

# build (se houver step de build)
RUN npm run build || true

EXPOSE 3333

CMD ["npm", "run", "start"]
