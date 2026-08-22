import { test, expect } from '@playwright/test';

test.describe('Roteamento SPA e Nginx (Com Autenticação)', () => {

  // Helper para fazer login e retornar para o dashboard
  async function loginAndGoToDashboard(page) {
    const uniqueId = Date.now();
    const username = `testuser_f5_${uniqueId}`;
    const password = 'SenhaForte@123';

    // Registro rápido
    await page.goto('/register');
    await page.getByPlaceholder(/usu[aá]rio/i).fill(username);
    await page.getByPlaceholder(/e-?mail/i).fill(`${username}@test.com`);
    await page.getByPlaceholder(/senha/i).fill(password);
    await page.getByRole('button', { name: /cadastrar|registrar|criar conta/i }).click();
    
    await page.waitForURL(/.*login/, { timeout: 10000 });

    // Login
    await page.getByPlaceholder(/usu[aá]rio/i).fill(username);
    await page.getByPlaceholder(/senha/i).fill(password);
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();
    
    // Aguarda estar no dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  }

  test('deve carregar o dashboard corretamente ao recarregar a página (F5)', async ({ page }) => {
    // 1. Garante que o usuário está logado e no dashboard
    await loginAndGoToDashboard(page);

    // 2. Simula o recarregamento da página (F5)
    await page.reload();

    // 3. Validações pós-recarregamento
    // O Nginx serve o index.html, o React Router assume, e o cookie HttpOnly é enviado automaticamente
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    
    // Verificar se o cookie persistiu após o reload
    const cookies = await page.context().cookies();
    expect(cookies.find(c => c.name === 'access_token')).toBeDefined();
  });

  test('deve redirecionar para /login ao tentar acessar rota protegida sem cookie', async ({ page }) => {
    // Cria um contexto de navegador totalmente novo (sem cookies)
    const context = await page.context().browser().newContext();
    const newPage = await context.newPage();

    // Tenta acessar o dashboard diretamente
    await newPage.goto('/dashboard');
    await newPage.waitForLoadState('networkidle');

    // O AuthContext deve detectar a falta de token e redirecionar
    await expect(newPage).toHaveURL(/.*login/);
    
    await context.close();
  });

});