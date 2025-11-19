// app.js
const API_BASE = window.API_BASE || '/api';

async function fetchAuth(path, opts = {}) {
  if (!opts) opts = {};
  opts.credentials = 'include';
  if (!opts.headers) opts.headers = {};
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 401) {
    window.location.href = '/';
    throw new Error('Não autorizado');
  }
  return res;
}

async function loadDespesas() {
  const status = document.getElementById('statusMsg');
  const tbl = document.getElementById('tbl');
  const tbody = document.getElementById('tbody');
  try {
    status.textContent = 'Buscando despesas...';
    const res = await fetchAuth('/despesas', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) { status.textContent='Falha ao buscar despesas.'; return;}
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.despesas || []);
    if (!list.length) { status.textContent='Nenhuma despesa encontrada.'; return;}
    tbody.innerHTML='';
    for (const d of list) {
      const tr=document.createElement('tr');
      const dt=document.createElement('td');
      const desc=document.createElement('td');
      const val=document.createElement('td');
      dt.style.padding=desc.style.padding=val.style.padding='8px';
      dt.textContent=d.data||d.date||'';
      desc.textContent=d.descricao||d.desc||d.description||'';
      val.textContent=(d.valor!==undefined)?Number(d.valor).toFixed(2):(d.value!==undefined?Number(d.value).toFixed(2):'');
      val.style.textAlign='right';
      tr.appendChild(dt);tr.appendChild(desc);tr.appendChild(val);
      tbody.appendChild(tr);
    }
    status.style.display='none';
    tbl.style.display='table';
  } catch(e){console.error(e);status.textContent='Erro ao carregar despesas.';}
}