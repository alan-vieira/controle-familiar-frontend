// tests/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Frontend com Mocks)', () => {
  test('deve fazer login com sucesso e acessar o dashboard', async ({ page }) => {
    // 1. MOCK DA API: Intercepta as chamadas de login e status
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, username: 'testuser', email: 'teste@exemplo.com' }
        })
      });
    });

    // Mock para /api/auth/status - retorna autenticado
    await page.route('**/api/auth/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logged_in: true,
          user: { id: 1, username: 'testuser', email: 'teste@exemplo.com' }
        })
      });
    });

    // 2. Acessa a página de login
    await page.goto('/login');

    // 3. Preencher o formulário 
    // O componente Login.jsx usa placeholder "Usuário" e "Senha"
    await page.getByPlaceholder('Usuário').fill('teste@exemplo.com');
    await page.getByPlaceholder('Senha').fill('senha123');

    // 4. Preparar a espera da resposta ANTES de clicar
    const responsePromise = page.waitForResponse('**/api/auth/login');
    
    // 5. Clicar no botão de entrar (usa role button com nome "Entrar")
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 6. Garantir que o mock foi acionado e respondeu com 200
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // 7. O login redireciona para "/" (padrão quando não há state.from)
    // Como o PrivateRoute permite acesso, a rota /* renderiza o Dashboard
    await expect(page).toHaveURL(/\//, { timeout: 10000 });

    // 8. Prova final: verificar se NÃO está na página de login
    await expect(page.locator('body')).not.toContainText('Login');
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      });
    });

    // Mock status para não autenticado (necessário para carregar a página de login)
    await page.route('**/api/auth/status', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Token de autorização ausente', code: 'TOKEN_MISSING' })
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder('Usuário').fill('errado@exemplo.com');
    await page.getByPlaceholder('Senha').fill('senhaerrada');
    
    const responsePromise = page.waitForResponse('**/api/auth/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await responsePromise;

    // Verifica se a URL NÃO mudou (continua em /login)
    await expect(page).toHaveURL(/.*login/);
    
    // Verifica se a mensagem de erro aparece
    await expect(page.getByText(/inválidas|erro/i)).toBeVisible();
  });
});