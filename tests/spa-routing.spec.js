import { test, expect } from '@playwright/test';

test.describe('Roteamento SPA e Nginx (Frontend Isolado com Mocks)', () => {

  test('deve redirecionar para /login ao tentar acessar rota protegida sem cookie', async ({ page }) => {
    // 1. Garante que não há cookies salvos
    await page.context().clearCookies();

    // 2. Mock do status retornando 401 (não autenticado)
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Token de autorização ausente', code: 'TOKEN_MISSING' })
      });
    });

    // 3. Mock do refresh também falhando (para evitar loops no interceptor do Axios)
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Refresh failed', code: 'REFRESH_FAILED' })
      });
    });

    // 4. Tenta acessar o dashboard diretamente
    await page.goto('/dashboard');
    
    // 5. O AuthContext/PrivateRoute deve detectar o 401 e redirecionar para o login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('deve carregar o dashboard corretamente e persistir ao recarregar a página (F5)', async ({ page }) => {
    // 1. Injeta manualmente o cookie HttpOnly no contexto do navegador antes de navegar
    // Domínio 'frontend' corresponde ao nome do serviço no docker-compose de teste
    await page.context().addCookies([{
      name: 'access_token',
      value: 'mock-jwt-token-persistente',
      domain: 'frontend',
      path: '/',
      httpOnly: true,
      secure: false // false porque o ambiente de teste é HTTP
    }]);

    // 2. Mock da verificação de status retornando 200 (autenticado)
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logged_in: true,
          user: { id: 1, username: 'testuser', email: 'test@test.com' }
        })
      });
    });

    // 3. Mocks básicos para evitar que o dashboard fique carregando infinitamente ou gere erros 404 no console
    await page.route('**/api/despesas**', route => route.fulfill({ status: 200, body: '[]', headers: { 'Content-Type': 'application/json' } }));
    await page.route('**/api/rendas**', route => route.fulfill({ status: 200, body: '[]', headers: { 'Content-Type': 'application/json' } }));
    await page.route('**/api/colaboradores**', route => route.fulfill({ status: 200, body: '[]', headers: { 'Content-Type': 'application/json' } }));

    // 4. Navega para o dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(500); // Aguarda o React montar e fazer a chamada de status
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');

    // 5. Simula o recarregamento da página (F5)
    await page.reload();
    await page.waitForTimeout(500);

    // 6. Validações pós-recarregamento
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    const cookies = await page.context().cookies();
    expect(cookies.find(c => c.name === 'access_token')).toBeDefined();
    expect(cookies.find(c => c.name === 'access_token')?.httpOnly).toBe(true);
  });

});