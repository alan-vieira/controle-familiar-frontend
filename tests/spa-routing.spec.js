import { test, expect } from '@playwright/test';

test.describe('Roteamento SPA e Nginx (Frontend Isolado com Mocks)', () => {

  test('deve redirecionar para /login ao tentar acessar rota protegida sem cookie', async ({ page }) => {
    // 1. Garante que não há cookies salvos
    await page.context().clearCookies();

    // 2. Mock do status retornando 401 (não autenticado)
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Token de autorização ausente', code: 'TOKEN_MISSING' })
      });
    });

    // 3. Tenta acessar o dashboard diretamente
    await page.goto('/dashboard');
    
    // 4. O AuthContext deve detectar o 401 e redirecionar para o login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('deve carregar o dashboard corretamente e persistir ao recarregar a página (F5)', async ({ page }) => {
    // 1. Injeta manualmente o cookie HttpOnly no contexto do navegador antes de navegar
    // (Simula o estado de um usuário que já fez login anteriormente)
    await page.context().addCookies([{
      name: 'access_token',
      value: 'mock-jwt-token-persistente',
      domain: 'localhost', // Domínio padrão dos testes locais/Docker
      path: '/',
      httpOnly: true,
      secure: false // false em testes locais HTTP
    }]);

    // 2. Mock da verificação de status retornando 200 (autenticado)
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: { logged_in: true, user_id: 1 }
        })
      });
    });

    // 3. Mocks básicos para evitar erros 404 no console ao carregar o dashboard
    await page.route('**/api/despesas**', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/rendas**', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/colaboradores**', route => route.fulfill({ status: 200, body: '[]' }));

    // 4. Navega para o dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');

    // 5. Simula o recarregamento da página (F5)
    await page.reload();

    // 6. Validações pós-recarregamento
    // O cookie ainda deve estar lá e a página deve carregar normalmente sem cair no login
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    const cookies = await page.context().cookies();
    expect(cookies.find(c => c.name === 'access_token')).toBeDefined();
    expect(cookies.find(c => c.name === 'access_token')?.httpOnly).toBe(true);
  });

});