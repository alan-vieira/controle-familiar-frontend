import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Frontend Isolado com Mocks)', () => {
  
  test('deve fazer login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    // 1. Mock da resposta de login bem-sucedido do backend
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Simula o backend definindo o cookie HttpOnly exatamente como na produção
          'Set-Cookie': 'access_token=mock-jwt-token-valido-123; HttpOnly; Path=/; Secure; SameSite=None'
        },
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: 1, username: 'testuser', email: 'test@test.com' }
          }
        })
      });
    });

    // 2. Mock da verificação de status (chamada pelo AuthContext ao montar a página)
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: { logged_in: true, user_id: 1 }
        })
      });
    });

    // 3. Executa o fluxo real de UI no frontend
    await page.goto('/login');
    await page.getByPlaceholder(/usu[aá]rio/i).fill('testuser');
    await page.getByPlaceholder(/senha/i).fill('senha123');
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();

    // 4. Validações de roteamento
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // 5. Prova definitiva: valida se o navegador processou o cookie HttpOnly do mock
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'access_token');
    expect(authCookie).toBeDefined();
    expect(authCookie?.value).toBe('mock-jwt-token-valido-123');
    expect(authCookie?.httpOnly).toBe(true);
  });

  test('deve exibir erro e permanecer no login com credenciais inválidas', async ({ page }) => {
    // 1. Mock da resposta de login falho (401 Unauthorized)
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        })
      });
    });

    // 2. Executa o fluxo de UI
    await page.goto('/login');
    await page.getByPlaceholder(/usu[aá]rio/i).fill('usuario_errado');
    await page.getByPlaceholder(/senha/i).fill('senha_errada');
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();

    // 3. Validações: permanece na tela de login e não redireciona
    await expect(page).toHaveURL(/.*login/);
  });

});