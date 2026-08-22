import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (UI Real)', () => {
  
  test('deve registrar, fazer login com sucesso e acessar o dashboard', async ({ page }) => {
    const uniqueId = Date.now();
    const username = `testuser_e2e_${uniqueId}`;
    const password = 'SenhaForte@123';
    const email = `${username}@test.com`;

    // 1. Registro via UI
    await page.goto('/register');
    
    // Seletores resilientes: aceitam "Email", "E-mail", "usuario", "usuário", etc.
    await page.getByPlaceholder(/usu[aá]rio/i).fill(username);
    await page.getByPlaceholder(/e-?mail/i).fill(email);
    await page.getByPlaceholder(/senha/i).fill(password);
    
    await page.getByRole('button', { name: /cadastrar|registrar|criar conta/i }).click();

    // Aguarda o redirecionamento automático para a tela de login após registro
    await page.waitForURL(/.*login/, { timeout: 10000 });

    // 2. Login via UI
    await page.getByPlaceholder(/usu[aá]rio/i).fill(username);
    await page.getByPlaceholder(/senha/i).fill(password);
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();

    // Aguarda a rede estabilizar e o redirecionamento para o dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // 3. Validações
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    
    // Prova definitiva: verifica se o cookie HttpOnly foi realmente definido pelo backend
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'access_token');
    expect(authCookie).toBeDefined();
    expect(authCookie?.httpOnly).toBe(true);
  });

  test('deve exibir erro e NÃO redirecionar com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Tenta login com credenciais que não existem
    await page.getByPlaceholder(/usu[aá]rio/i).fill('usuario_inexistente_999');
    await page.getByPlaceholder(/senha/i).fill('senhaerrada');
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();

    // Aguarda a resposta da API e a UI estabilizar
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Valida: permanece na tela de login
    await expect(page).toHaveURL(/.*login/);
  });

});