# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-br/).

## [0.1.4] - 2026-08-09

### Fixed
- **Endpoint de validação de sessão corrigido:** Frontend chamava `/api/auth/validate` (404 inexistente), agora usa `/api/auth/status` (endpoint real do backend que retorna `{logged_in: true, user: {...}}`).
- **PWA configurado para auto-update:** Adicionados `skipWaiting`, `clientsClaim` e `cleanupOutdatedCaches` no `vite-plugin-pwa` para forçar atualização automática do Service Worker quando nova versão é deployada.
- **Cache busting ativado:** `manifest.version` sincronizado com `package.json` version para invalidar cache automaticamente em novas versões.

### Changed
- `package.json` versão atualizada para `0.1.4` (era `0.1.0` fixo, impedindo cache busting).
- `vite.config.js` PWA configurado completamente com opções de auto-update.
- `src/services/auth.js` função `validateTokenWithServer()` agora chama `/api/auth/status` e verifica campo `logged_in`.

### Impact
- Resolve problema de desktop preso em bundle antigo (Service Worker não atualizava).
- Validação de sessão agora funciona corretamente (antes falhava silenciosamente).
- Futuros deploys atualizarão automaticamente sem necessidade de limpar cache manual.

---

## [0.1.3] - 2026-08-09

### Fixed
- **Corrigidas rotas de resumo e divisão:** Backend espera path parameters (`/resumo/2026-07`), mas frontend estava enviando como query strings (`/resumo/mensal?mes=2026-07`), causando erros `INVALID_MONTH`.
- Ajustadas chamadas em `ResumoMensal.jsx` para usar formato correto:
  - `/api/resumo/{mesAno}` em vez de `/api/resumo/mensal?mes={mesAno}`
  - `/api/divisao/{mesAno}` em vez de `/api/divisao/mensal?mes={mesAno}`
  - `/api/divisao/{mesAno}/marcar-pago` e `/desmarcar-pago`
- Adicionados logs de debug no `auth.js` para facilitar troubleshooting.

### Changed
- `src/components/ResumoMensal.jsx` atualizado para usar path parameters nas chamadas de API.
- `src/services/auth.js` agora inclui `console.log` para debug do fluxo de login.

---

## [0.1.2] - 2026-08-09

### Fixed
- **Login agora verifica credenciais corretamente:** `Login.jsx` não verificava `result.success` retornado por `login()`, navegando para dashboard mesmo com credenciais inválidas.
- **Erro visível ao usuário:** Credenciais inválidas agora mostram mensagem de erro clara em vez de navegar para dashboard vazio.
- **Loading state:** Botão desabilitado durante tentativa de login para evitar duplo-clique.
- **Debug logging:** Console mostra resultado do login para facilitar troubleshooting.

### Changed
- `src/pages/Login.jsx` agora verifica `result.success` antes de navegar.
- Adicionado estado de loading no formulário de login.
- UI do erro melhorada (caixa vermelha em vez de texto simples).

---

## [0.1.1] - 2026-08-09

### Fixed
- Corrigidos paths de autenticação para `/api/auth/login` e `/api/auth/logout` (estavam como `/api/login` e `/api/logout`, retornando 404).
- Alinhamento com endpoints reais do backend (documentação do README estava desatualizada).

### Changed
- Mensagens de erro agora incluem `error.message` como fallback adicional.

---

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
- `PrivateRoute` agora detecta token expirado **durante** a navegação, não apenas na entrada.
- Redirecionamento para login agora é feito via React Router (`Navigate`), sem "piscada" na tela.

### Security
- Verificação de expiração de token com 30s de margem antes de qualquer request.
- Remoção automática do token em qualquer resposta 401.

---

## [0.0.0] - 2025-11-18

### Added
- Versão inicial do frontend (React 18 + Vite + TailwindCSS).
- CRUD de colaboradores, rendas e despesas.
- Resumo mensal com divisão por colaborador.
- Autenticação básica com JWT armazenado em localStorage.