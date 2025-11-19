// frontend/js/crud.js

// --- Defina a URL base da API do seu backend no Render ---
const API_BASE_URL = 'https://controle-familiar.onrender.com/api'; // Substitua pela URL real do seu backend
// --- FIM DA DEFINIÇÃO ---

// Funções utilitárias
function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  if (yyyy && mm && dd) {
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

function formatCategoria(cat) {
  const labels = {
    'moradia': 'Moradia',
    'alimentacao': 'Alimentação',
    'restaurante_lanche': 'Restaurante/Lanche',
    'casa_utilidades': 'Casa/Utilidades',
    'saude': 'Saúde',
    'transporte': 'Transporte',
    'lazer_outros': 'Lazer/Outros'
  };
  return labels[cat] || cat;
}

function mesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Estado global
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];

// Função para lidar com erros de autenticação
async function handleAuthError() {
    abrirModal('loginModal');
    showToast('Sua sessão expirou ou você não está autenticado. Faça login novamente.', true);
}

// Alternar abas
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600'));
    link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
  });
});

// Mostrar feedback
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.className = `fixed bottom-4 right-4 flex items-center p-4 text-sm font-normal rounded-lg shadow ${
    isError ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800' : 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800'
  }`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Função para abrir/fechar modais e controlar overflow do body
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    // Foco no primeiro campo do formulário
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

// [... truncated for brevity ...]
