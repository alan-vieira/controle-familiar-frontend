# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-br/).

## [0.4.1] - 2026-08-22

### 🔒 Segurança (Resolução da Tarefa P1 do Roadmap)
- Migração de tokens JWT de localStorage para Cookies HttpOnly
- Implementação de Refresh Token automático via interceptor Axios
- Remoção completa de dependência de localStorage para autenticação
- Validação de sessão via API (/api/auth/status) no mount do app

### 🛠️ Melhorias Técnicas
- Adicionado `withCredentials: true` no cliente Axios
- Interceptor de resposta trata erros 401 e renova token silenciosamente
- Logout agora depende apenas do backend para limpar cookie

### 📚 Documentação
- README atualizado com novas práticas de segurança

## [0.4.0] - 2026-08-21
### Added
- **Infraestrutura Docker completa** fiel ao ambiente Vercel:
  - `Dockerfile` multi-stage (Node 22 Alpine → Nginx 1.27 Alpine ~25MB)
  - `nginx/nginx.conf` com SPA routing, cache headers inteligentes, compressão gzip e headers de segurança
  - `docker-compose.yml` (dev), `docker-compose.test.yml` (E2E) e `docker-compose.fullstack.yml` (DB+API+Frontend)
- **Suite de testes E2E com Playwright** (9 testes cobrindo autenticação e roteamento SPA)
- **Pipeline de CI/CD com GitHub Actions** (`.github/workflows/ci.yml`):
  - Build automatizado, validação de infraestrutura, testes E2E e deploy de preview em PRs
- **Script de validação automatizada** (`test-docker.sh`): 12 testes de health check, cache, gzip e segurança
- **Documentação expandida**: Seções de Docker, Testes e CI/CD adicionadas ao README com badges atualizados

### Changed
- Scripts de teste adicionados ao `package.json` (`test:e2e`, `test:e2e:ui`, `test:infra`)
- Versão do projeto atualizada para `0.4.0` para refletir o novo patamar de maturidade em engenharia e automação

### Security
- Headers de segurança (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) aplicados em todos os locations do Nginx
- Bloqueio de arquivos sensíveis (`.env`, `.git`, `.md`) via Nginx (retorna 403)
- Configuração preparada para Content-Security-Policy (CSP)

### Impact
- Ambiente de desenvolvimento local 100% fiel à produção (Vercel)
- Testes E2E automatizados previnem regressões em fluxos críticos
- Pipeline de CI/CD garante que nenhuma alteração quebre o build ou os testes antes do merge

## [0.3.3] - 2026-08-21
### Fixed
- **Correção definitiva de bug visual na navbar:** Remoção de texto duplicado nas abas.
- Exibição limpa e simplificada dos nomes abreviados: "Desp", "Rend", "Colab", "Resumo".
### Changed
- Simplificação do código no componente `Navigation.jsx` para garantir apenas a renderização do label correto.
- Adição de infraestrutura completa de testes e automação (Docker, Playwright, CI/CD).

## [0.3.2] - 2026-08-17
### Fixed
- **Correção crítica de navegação:** Restaurada a funcionalidade de troca de abas que foi quebrada na v0.3.1 pela abreviação dos títulos.
### Changed
- Separação de responsabilidades em `Navigation.jsx`: os identificadores internos (`id`) agora são preservados para a lógica de negócio, enquanto os nomes de exibição (`label`) são usados exclusivamente na interface.

## [0.3.1] - 2026-08-17
### Added
- Otimização visual da navbar para melhorar a experiência mobile e liberar espaço vertical.
### Changed
- **Navbar compacta:** Redução de padding vertical e horizontal em `Navigation.jsx` e harmonização no `Header.jsx`.
- **Fontes ajustadas:** Diminuição do tamanho da fonte para `text-xs` nos títulos e botões das abas.
- **Títulos abreviados:** Adaptação para evitar quebra de linha e scroll horizontal em telas menores ("Desp", "Rend", "Colab", "Resumo").
- **Refinamento visual:** Adição de bordas sutis (`border-gray-200`) e transições suaves (`transition-colors`) nos estados de hover e inativo.

## [0.3.0] - 2026-08-16
### Added
- **Guia Resumo totalmente redesenhada com Cards Responsivos:**
  - Substituição da tabela por cards modernos para a divisão por colaborador.
  - Avatar circular com iniciais para cada colaborador.
  - Badge de status visual: "Pagou a mais" (verde) ou "Ainda deve" (vermelho).
  - Barra de progresso visual mostrando o percentual do valor devido que já foi pago.
- **Responsividade aprimorada na divisão:** Mobile (1 card), Tablet (2 cards), Desktop (3 cards).
### Changed
- Extração do componente `DivisaoPorColaborador` para melhor manutenibilidade e reutilização.
### Fixed
- Formatação de moeda nos totais do resumo (corrigido de padrão americano para o padrão brasileiro: `R$ 1.234,56`).

## [0.2.0] - 2026-08-15
### Security
- `Header.jsx`: logout agora usa `useNavigate` + `auth.logout()` em vez de `window.location.href`, evitando full reload e preservando o fluxo SPA.
### Removed
- `IdleLogout` em `App.jsx` removido — duplicava a lógica já presente em `PrivateRoute` (interceptor 401 + eventos `auth:expired`/`auth:logout`) e forçava `window.location.reload()`, quebrando o estado React a cada 15 minutos.
### Fixed
- Correção do aviso "sem page reload" em `services/api.js:40` que contradizia o comportamento do `IdleLogout`.

## [0.1.4] - 2026-08-09
### Fixed
- Endpoint de validação de sessão corrigido: Frontend chamava `/api/auth/validate` (404 inexistente), agora usa `/api/auth/status` (endpoint real do backend que retorna `{logged_in: true, user: {...}}`).
- PWA configurado para auto-update: Adicionados `skipWaiting`, `clientsClaim` e `cleanupOutdatedCaches` no `vite-plugin-pwa` para forçar atualização automática do Service Worker quando nova versão é deployada.
- Cache busting ativado: `manifest.version` sincronizado com `package.json` version para invalidar cache automaticamente em novas versões.
### Changed
- `package.json` versão atualizada para `0.1.4` (era `0.1.0` fixo, impedindo cache busting).
- `vite.config.js` PWA configurado completamente com opções de auto-update.
- `src/services/auth.js` função `validateTokenWithServer()` agora chama `/api/auth/status` e verifica campo `logged_in`.
### Impact
- Resolve problema de desktop preso em bundle antigo (Service Worker não atualizava).
- Validação de sessão agora funciona corretamente (antes falhava silenciosamente).
- Futuros deploys atualizarão automaticamente sem necessidade de limpar cache manual.

## [0.1.3] - 2026-08-09
### Fixed
- Corrigidas rotas de resumo e divisão: Backend espera path parameters (`/resumo/2026-07`), mas frontend estava enviando como query strings (`/resumo/mensal?mes=2026-07`), causando erros `INVALID_MONTH`.
- Ajustadas chamadas em `ResumoMensal.jsx` para usar formato correto:
  - `/api/resumo/{mesAno}` em vez de `/api/resumo/mensal?mes={mesAno}`
  - `/api/divisao/{mesAno}` em vez de `/api/divisao/mensal?mes={mesAno}`
  - `/api/divisao/{mesAno}/marcar-pago` e `/desmarcar-pago`
- Adicionados logs de debug no `auth.js` para facilitar troubleshooting.
### Changed
- `src/components/ResumoMensal.jsx` atualizado para usar path parameters nas chamadas de API.
- `src/services/auth.js` agora inclui `console.log` para debug do fluxo de login.

## [0.1.2] - 2026-08-09
### Fixed
- Login agora verifica credenciais corretamente: `Login.jsx` não verificava `result.success` retornado por `login()`, navegando para dashboard mesmo com credenciais inválidas.
- Erro visível ao usuário: Credenciais inválidas agora mostram mensagem de erro clara em vez de navegar para dashboard vazio.
- Loading state: Botão desabilitado durante tentativa de login para evitar duplo-clique.
- Debug logging: Console mostra resultado do login para facilitar troubleshooting.
### Changed
- `src/pages/Login.jsx` agora verifica `result.success` antes de navegar.
- Adicionado estado de loading no formulário de login.
- UI do erro melhorada (caixa vermelha em vez de texto simples).

## [0.1.1] - 2026-08-09
### Fixed
- Corrigidos paths de autenticação para `/api/auth/login` e `/api/auth/logout` (estavam como `/api/login` e `/api/logout`, retornando 404).
- Alinhamento com endpoints reais do backend (documentação do README estava desatualizada).
### Changed
- Mensagens de erro agora incluem `error.message` como fallback adicional.

## [0.1.0] - 2026-08-09
### Added
- Retry automático com backoff progressivo para erros de rede e 5xx (máx. 3 tentativas).
- Timeout configurável por request (padrão 30s para acomodar cold start do Render).
- Decodificação de JWT no cliente (`decodeToken`) para verificar expiração localmente.
- Detecção proativa de token expirado com margem de segurança de 30s (`isTokenExpired`).
- Eventos customizados `auth:expired` e `auth:logout` para sincronização reativa entre módulos.
- Loading state no `PrivateRoute` durante a validação de sessão.
- Preservação da rota de origem no redirect para login (`state.from`).
### Changed
- `src/services/api.js` reescrito com interceptors estruturados, `AbortController` e erros tipados.
- `src/services/auth.js` reorganizado em funções puras e testáveis (`getToken`, `setToken`, `isAuthenticated`).
- `src/utils/PrivateRoute.jsx` agora escuta eventos globais de autenticação em vez de validar apenas no mount.
- Mensagens de erro agora extraem `msg` da resposta do backend com fallback genérico.
### Fixed
- Interceptor 401 não recarrega mais a página inteira (removido `window.location.href`), preservando estado da SPA.
- `PrivateRoute` agora detecta token expirado durante a navegação, não apenas na entrada.
- Redirecionamento para login agora é feito via React Router (`Navigate`), sem "piscada" na tela.
### Security
- Verificação de expiração de token com 30s de margem antes de qualquer request.
- Remoção automática do token em qualquer resposta 401.

## [0.0.0] - 2025-11-18
### Added
- Versão inicial do frontend (React 18 + Vite + TailwindCSS).
- CRUD de colaboradores, rendas e despesas.
- Resumo mensal com divisão por colaborador.
- Autenticação básica com JWT armazenado em localStorage.