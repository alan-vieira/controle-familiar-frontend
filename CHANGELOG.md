# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-br/).

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