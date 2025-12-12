# Controle Financeiro Familiar — Frontend

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://controle-familiar-frontend.vercel.app)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Not%20directly%20used-3ECF8E?logo=supabase)](https://supabase.com)

Aplicação web feita em **React + Vite** para o sistema **Controle Financeiro Familiar**.  
Interface responsiva para cadastro de despesas, rendas, colaboradores e visualização do resumo mensal, com foco em usabilidade e clareza financeira.

> ⚠️ **Importante**: O frontend **não se conecta diretamente ao Supabase**. Toda comunicação com o banco de dados é feita via **API backend** (Flask).

---

## 🌐 Links Úteis

- **App em produção**: https://controle-familiar-frontend.vercel.app  
- **Backend (API)**: https://github.com/alan-vieira/controle-familiar  
- **API em produção**: https://controle-familiar.onrender.com  
- **Banco de dados**: Supabase (acessado apenas pelo backend)

---

## 📦 Funcionalidades

- ✅ Tela de **login/logout** (gerenciada via cookies/sessão da API)
- 👥 Gerenciamento de **colaboradores**
- 💸 Registro e listagem de **despesas** com:
  - Data
  - Descrição
  - Categoria
  - Valor (formatado em **BRL**: `R$ 1.234,56`)
- 💰 Registro e listagem de **rendas mensais**
- 📅 Configuração do **dia de fechamento** do mês
- 📊 Botão **“Carregar Resumo”** com cálculo automático de:
  - Total de rendas
  - Total de despesas
  - Saldo líquido
- 📱 Layout **responsivo** (funciona bem em celulares e desktops)

---

## 🛠️ Tecnologias

- **Framework**: React (com Hooks)
- **Bundler**: Vite
- **Estilização**: CSS puro (ou Tailwind/CSS Modules, se aplicável — ajuste conforme seu uso)
- **Gerenciamento de estado**: Local state + chamadas HTTP diretas (`fetch`)
- **Formatação de moeda**: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- **Deploy**: Vercel

---

## 🚀 Rodando Localmente

1. **Clone o repositório**
   ```bash
   git clone https://github.com/alan-vieira/controle-familiar-frontend.git
   cd controle-familiar-frontend
   ```

2. **Instale as dependências**

    ```bash
    npm install
    ```

3. **Configure as variáveis de ambiente**

Crie um arquivo .env.local na raiz do projeto:

    
    VITE_API_BASE_URL=http://localhost:5000

>🔁 Em produção (Vercel), essa variável deve apontar para:
>`VITE_API_BASE_URL=https://controle-familiar.onrender.com`

4. **Inicie o servidor de desenvolvimento**

    ```bash
    npm run dev
    ```

Acesse http://localhost:5173 (ou a porta exibida no terminal)

## 📤 Deploy no Vercel

O projeto está configurado para auto-deploy no Vercel a partir da branch `main`.

Para configurar manualmente:

1. Conecte este repositório ao Vercel
2. Em **Environment Variables**, adicione:

> ✅ Não é necessário build script personalizado

## 🔌 Integração com a API

Todas as requisições são feitas para os endpoints da sua API Flask:

- Login: `POST /login`
- Logout: `POST /logout`
- Dados: `GET|POST /api/colaboradores`, `/api/despesas`, etc.

A autenticação é mantida via **cookies HTTP-only** (gerenciados pelo backend), então o frontend **não armazena tokens**.

## 📝 Observações

- Valores monetários são exibidos no formato **brasileiro**: `R$ 1.234,56`
- O frontend **não valida regras de negócio complexas** — essa responsabilidade está na API
- Mensagens de erro da API são exibidas diretamente ao usuário (melhorar com toast/feedback visual, se desejado)

## 🙋 Autor

Alan Silva Vieira

- GitHub: @alan-vieira
- Projeto: Controle Financeiro Familiar