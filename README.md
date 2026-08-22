# Controle Financeiro Familiar — Frontend

![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)
![React 18.2.0](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite 5.0.12](https://img.shields.io/badge/Vite-5.0.12-646CFF?logo=vite)
![Tailwind 3.4.1](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-vite--plugin--pwa-5A0FC8?logo=pwa)
![Release v0.4.1](https://img.shields.io/badge/Release-v0.4.1-blue)
![Node 22.x](https://img.shields.io/badge/Node-22.x-339933?logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)
![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)

Aplicação web feita em **React 18 + Vite 5** para o sistema **Controle Financeiro Familiar**.

Interface responsiva (mobile-first) para cadastro de despesas, rendas, colaboradores e visualização do resumo mensal com divisão proporcional, com foco em usabilidade e clareza financeira.

> ⚠️ **Importante**: O frontend **não se conecta diretamente ao Supabase**. Toda comunicação com o banco de dados é feita via **API backend** (Flask 3.x + PostgreSQL).

---

## 🌐 Links Úteis
- **App em produção**: https://controle-familiar-frontend.vercel.app
- **Backend (API)**: https://github.com/alan-vieira/controle-familiar
- **API em produção**: https://controle-familiar.onrender.com
- **Banco de dados**: Supabase (acessado apenas pelo backend)

## 📦 Funcionalidades
- ✅ Tela de login/logout (**Cookies HttpOnly** + Refresh Token automático, fluxo SPA-safe)
- 👥 Gerenciamento de colaboradores (CRUD completo)
- 💸 Registro e listagem de despesas com: Data, Descrição, Categoria, Valor (formatado em BRL: `R$ 1.234,56`)
- 💰 Registro e listagem de rendas mensais
- 📅 Configuração do dia de fechamento do mês
- 📊 Resumo mensal com cálculo automático de: Total de rendas, Total de despesas, Saldo líquido
- ⚖️ Divisão proporcional por colaborador (marcar/desmarcar pago) com cards responsivos e barra de progresso
- 📱 Layout responsivo mobile-first (Tailwind CSS 3.4)
- 🔄 PWA (auto-update, installable, offline-capable)

## 🛠️ Stack (versões reais do `package.json`)
| Tecnologia | Versão | Papel |
| --- | --- | --- |
| React | 18.2.0 | UI library |
| React DOM | 18.2.0 | Renderer |
| React Router DOM | 6.22.0 | Roteamento SPA |
| Vite | 5.0.12 | Build tool / dev server |
| @vitejs/plugin-react | 4.2.1 | Plugin React para Vite |
| Tailwind CSS | 3.4.1 | Utility-first CSS |
| PostCSS | 8.4.35 | Processador CSS |
| Autoprefixer | 10.4.18 | Prefixos vendor automáticos |
| vite-plugin-pwa | 0.20.0 | Service Worker + Manifest (Workbox) |
| Node.js | 22.x | Runtime |

## 🚀 Rodando Localmente

### Opção 1: Desenvolvimento Tradicional (Node.js)

### 1. Clone e instale dependências
```bash
git clone https://github.com/alan-vieira/controle-familiar-frontend.git
cd controle-familiar-frontend
npm install
```

### 2. Configure variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite `.env.local` se necessário (padrão aponta para produção)

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### Opção 2: Ambiente Docker (Fiel à Produção)
```bash
# Build e inicia o frontend em container Nginx otimizado
docker compose up --build -d
```

Acesse http://localhost:8080
Health check: http://localhost:8080/health

### Opção 3: Ambiente Fullstack (DB + Backend + Frontend)

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse http://localhost:5173 (porta configurada em `vite.config.js`).

---

## 🏗️ Build de Produção

```bash
# Build otimizado para produção (gera pasta dist/)
npm run build

# Preview local do build de produção
npm run preview
```

- Output: pasta `dist/` (configurado em `vite.config.js:43`)
- Build command no Vercel: `npm run build`

---

## ⚙️ Variáveis de Ambiente

| Variável | Obrigatória | Descrição | Exemplo (dev) | Exemplo (prod) |
|----------|-------------|-----------|---------------|----------------|
| `VITE_API_URL` | Sim | URL base da API Flask (sem `/api` no final) | `http://localhost:5000` | `https://controle-familiar.onrender.com` |

> ❌ **Não existe** `VITE_API_BASE_URL`. O nome real é `VITE_API_URL` (prefixo `VITE_` é obrigatório para Vite expor ao cliente).

---

## 📁 Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizáveis (Header, Forms, Tabelas, Cards)
├── pages/          # Páginas de rota (Login, Dashboard)
├── services/       # Cliente HTTP (api.js) + Auth (auth.js)
├── utils/          # Helpers (PrivateRoute, formatters)
├── config/         # Constantes de configuração (se houver)
├── App.jsx         # Roteamento principal + PrivateRoute
├── main.jsx        # Entry point (React 18 createRoot)
└── index.css       # Tailwind directives + globals
public/
├── icon-192.png    # PWA icon 192x192
├── icon-512.png    # PWA icon 512x512
└── vite.svg
```

---

## 🔐 Autenticação (Realidade Técnica)

### Como funciona hoje
- **Token**: JWT access token (expiração 1h) armazenado em **Cookies HttpOnly** — inacessível via JavaScript, protegido contra XSS
- **Envio**: Automático via cookie — **não há header `Authorization` manual** (configurado `withCredentials: true` no Axios)
- **Refresh Token Rotation**: Interceptor Axios trata erros 401 → chama `POST /api/auth/refresh` silenciosamente → reenvia requisição original
- **Validação de sessão no mount**: `PrivateRoute` chama `GET /api/auth/status` via `checkAuthStatus()` — se 200, sessão válida
- **Logout**: Chama `POST /api/auth/logout` (backend limpa cookie) + dispara evento `auth:expired` → redireciona via React Router

> ✅ **Resolvido (P1 do Roadmap)**: Tokens não ficam mais expostos a XSS. Migração completa para **Cookies HttpOnly + Refresh Token Rotation** implementada.

---

## 🔌 Endpoints Consumidos (todos com prefixo `/api`)

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/api/auth/login` | Login (servidor define cookie HttpOnly) |
| POST | `/api/auth/logout` | Limpar cookie no backend |
| GET | `/api/auth/status` | Validar sessão no mount (`logged_in: true`) |
| POST | `/api/auth/refresh` | Refresh automático via interceptor Axios |
| GET/POST/PUT/DELETE | `/api/colaboradores` | CRUD colaboradores |
| GET/POST/PUT/DELETE | `/api/despesas?mes_vigente=YYYY-MM` | CRUD despesas |
| GET/POST/PUT/DELETE | `/api/rendas?mes=YYYY-MM` | CRUD rendas mensais |
| GET | `/api/resumo/<YYYY-MM>` | Resumo do mês (path param) |
| GET | `/api/divisao/<YYYY-MM>` | Status da divisão proporcional |
| POST | `/api/divisao/<YYYY-MM>/marcar-pago` | Marcar parcela como paga |
| POST | `/api/divisao/<YYYY-MM>/desmarcar-pago` | Desmarcar parcela |

> O cliente HTTP (`services/api.js`) normaliza rotas via `buildUrl()` — garante prefixo `/api` e barra inicial.

---

## 🌐 Cliente HTTP (`services/api.js`)

- **Timeout**: 30 segundos (acomoda cold start do Render free tier)
- **Retry**: Exponencial (3 tentativas, 2s/4s/6s) — **apenas para 5xx e erros de rede** (nunca 4xx)
- **Cancelamento**: `AbortController` por request
- **Normalização**: `buildUrl()` injeta `/api` automaticamente
- **Cookies HttpOnly**: `withCredentials: true` envia cookies automaticamente
- **Interceptor 401**: Refresh Token automático + reenvia requisição original
- **Evento `auth:expired`**: Disparado quando refresh falha → app redireciona para login

---

## 📱 PWA (Progressive Web App)

Configurado via `vite-plugin-pwa` (Workbox) em `vite.config.js`:

- **registerType**: `autoUpdate` (atualização automática do SW)
- **skipWaiting**: `true` — novo SW assume controle imediato
- **clientsClaim**: `true` — SW assume clientes existentes sem reload
- **cleanupOutdatedCaches**: `true` — remove caches de versões antigas
- **Manifest**: `version` sincronizado com `package.json` (cache busting automático)
- **Ícones**: 192x192 e 512x512 em `public/`
- **Dev**: PWA desabilitado (`devOptions.enabled: false`)

---

## 🚀 Deploy na Vercel

- **Auto-deploy**: A cada push na branch `main`
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA Rewrite**: `vercel.json` rewrites `/*` → `/index.html`
- **Environment Variables** (configurar no painel da Vercel):
  - `VITE_API_URL=https://controle-familiar.onrender.com`

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 📝 CHANGELOG

Todas as mudanças seguem [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) + [SemVer](https://semver.org/lang/pt-br/).

Veja **[CHANGELOG.md](CHANGELOG.md)** para histórico completo.

### Releases recentes
- **v0.4.0** — Infraestrutura completa: Docker, Playwright E2E, CI/CD e validação automatizada
- **v0.3.3** — Correção final de bug visual na navbar (texto duplicado)
- **v0.3.2** — Correção crítica de navegação entre abas (separação id vs label)
- **v0.3.1** — Otimização visual da navbar (compacta, fontes text-xs, títulos abreviados)
- **v0.3.0** — Cards responsivos na guia Resumo, avatares, badges e barra de progresso
- **v0.2.0** — SPA-safe auth flow (removido `IdleLogout`; logout via `navigate`)
- **v0.1.4** — PWA: validação de sessão via `/api/auth/status` + auto-update
- **v0.1.3** — `resumo/{mesAno}` migrado para path param

---

## 🙋 Autor

**Alan Silva Vieira**

- GitHub: [@alan-vieira](https://github.com/alan-vieira)
- Projeto: Controle Financeiro Familiar