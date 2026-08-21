# ============================================
# STAGE 1: BUILD
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas arquivos de dependência primeiro (cache do Docker)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copia o código fonte
COPY . .

# Build de produção (usa .env.production se existir)
RUN npm run build

# ============================================
# STAGE 2: SERVE (Nginx Alpine - ~25MB final)
# ============================================
FROM nginx:1.27-alpine AS runner

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas o build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Healthcheck nativo
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]