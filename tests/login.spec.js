// tests/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Frontend com Mocks)', () => {
  test('deve fazer login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    // 1. MOCK DA API: Intercepta a chamada de login antes dela acontecer
    // ⚠️ AJUSTE: Se sua api.js chama 'http://localhost:5000/login', use '**/login'
    await page.route('**/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token-123',
          user: { id: 1, nome: 'Usuário Teste' }
        }),
        headers: {
          'Set-Cookie': 'auth_token=mock-jwt-token-123; HttpOnly; Path=/'
        }
      });
    });

    // 2. Acessar a página de login
    await page.goto('/login');

    // 3. Preencher o formulário 
    // 💡 DICA: Usar data-testid é o mais seguro. Se não tiver, use getByLabel ou getByPlaceholder
    await page.getByTestId('input-email').fill('teste@exemplo.com');
    await page.getByTestId('input-senha').fill('senha123');

    // 4. Preparar a espera da resposta ANTES de clicar
    const responsePromise = page.waitForResponse('**/login');
    
    // 5. Clicar no botão de entrar
    await page.getByTestId('btn-entrar').click();

    // 6. Garantir que o mock foi acionado e respondeu com 200
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // 7. Verificar o redirecionamento (Playwright faz retry automático até passar ou dar timeout)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // 8. Prova final: verificar se um elemento típico do Dashboard está na tela
    // (Isso evita falsos positivos de roteamento vazio)
    await expect(page.getByText('Resumo Financeiro')).toBeVisible({ timeout: 5000 });
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.route('**/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      });
    });

    await page.goto('/login');
    await page.getByTestId('input-email').fill('errado@exemplo.com');
    await page.getByTestId('input-senha').fill('senhaerrada');
    
    const responsePromise = page.waitForResponse('**/login');
    await page.getByTestId('btn-entrar').click();
    await responsePromise;

    // Verifica se a URL NÃO mudou
    await expect(page).toHaveURL(/.*login/);
    
    // Verifica se a mensagem de erro aparece (ajuste o texto conforme seu componente)
    await expect(page.getByText(/inválidas|erro/i)).toBeVisible();
  });
});