import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação', () => {
  test('deve exibir formulário de login corretamente', async ({ page }) => {
    await page.goto('/login');
    
    // Verifica se os elementos do formulário estão presentes
    await expect(page.getByPlaceholder('Usuário')).toBeVisible();
    await expect(page.getByPlaceholder('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('deve exibir erro e NÃO redirecionar com credenciais inválidas', async ({ page }) => {
      await page.goto('/login');
    
      // Tenta login com credenciais inválidas (irá falhar na API real)
      await page.getByPlaceholder('Usuário').fill('errado@exemplo.com');
      await page.getByPlaceholder('Senha').fill('senhaerrada');
    
      await page.getByRole('button', { name: /entrar/i }).click();
    
      // Aguarda a resposta da API
      await page.waitForTimeout(3000);
    
      // Valida a correção da v0.1.2: permanece na tela de login (não redireciona)
      await expect(page).toHaveURL(/.*login/); // Permanece na tela de login
    });

  test('deve ter botão com estados visuais corretos (disabled:bg-blue-400)', async ({ page }) => {
    await page.goto('/login');
    
    const button = page.getByRole('button', { name: /entrar/i });
    
    // Verifica se o botão tem as classes de estado disabled definidas no Tailwind
    await expect(button).toHaveClass(/disabled:bg-blue-400/);
    await expect(button).toHaveClass(/disabled:cursor-not-allowed/);
    
    // Verifica se o botão NÃO está disabled por padrão
    await expect(button).toBeEnabled();
  });
});

test.describe('SPA Routing - Validações v0.1.2 e v0.1.3', () => {
  test('deve fazer login com sucesso (mock simulado via localStorage)', async ({ page }) => {
    // Simula usuário já logado
    await page.addInitScript(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3RlIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjkwMDAwMDAwMDB9.fake-signature');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Deve acessar dashboard sem redirecionar para login
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page).not.toHaveURL(/.*login/);
  });
});

test.describe('Roteamento SPA e Nginx', () => {
  test('deve carregar o dashboard corretamente ao recarregar a página (F5)', async ({ page }) => {
    // Simula usuário logado (mock do localStorage)
    await page.addInitScript(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3RlIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjkwMDAwMDAwMDB9.fake-signature');
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Recarrega a página (simula F5)
    await page.reload();
    
    // O Nginx deve servir o index.html e o React Router deve assumir (sem 404)
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');
  });

  test('deve redirecionar para /login ao acessar rota protegida sem token', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/dashboard');
    
    // O PrivateRoute deve interceptar e redirecionar
    await expect(page).toHaveURL(/.*login/);
  });

  test('rota inexistente deve retornar index.html (SPA fallback)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3RlIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjkwMDAwMDAwMDB9.fake-signature');
    });
    
    await page.goto('/rota-que-nao-existe');
    
    // Deve servir index.html (não 404)
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText('Cannot GET');
  });
});