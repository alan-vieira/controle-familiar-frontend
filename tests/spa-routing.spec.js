import { test, expect } from '@playwright/test';

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
});