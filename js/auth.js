(function(){
  const API_BASE = window.API_BASE || '/api';
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const btn = document.getElementById('btnLogin');

  function show(text, isError=false){
    msg.textContent = text;
    msg.className = isError ? 'msg error' : 'msg success';
  }

  async function checkStatusAndRedirect(){
    try {
      const res = await fetch(`${API_BASE}/auth/status`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return;
      const j = await res.json();
      if (j && j.logged_in) window.location.href='/despesas.html';
    } catch(e){}
  }

  async function doLogin(username, password){
    try{
      btn.disabled=true;
      show('Entrando...');
      const res=await fetch(`${API_BASE}/login`,{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({username,password})
      });
      const text=await res.text();
      let payload=null; try{payload=JSON.parse(text);}catch(e){}
      if(!res.ok){
        const err=payload&&(payload.error||payload.message)?(payload.error||payload.message):`Erro ${res.status}`;
        throw new Error(err);
      }
      show(payload&&payload.message?payload.message:'Login bem-sucedido');
      setTimeout(()=>window.location.href='/despesas.html',300);
    }catch(err){
      show(err.message||'Erro desconhecido',true);
    }finally{
      btn.disabled=false;
    }
  }

  form.addEventListener('submit',(ev)=>{
    ev.preventDefault();
    const u=document.getElementById('username').value.trim();
    const p=document.getElementById('password').value;
    if(!u||!p){show('Preencha usuário e senha',true);return;}
    doLogin(u,p);
  });

  document.addEventListener('DOMContentLoaded',checkStatusAndRedirect);
})();