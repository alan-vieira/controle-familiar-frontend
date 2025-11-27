// src/pages/Login.jsx (trecho do formulário)
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <input
      type="text"
      name="username"
      autoComplete="username" // 👈 adicione isso
      placeholder="Usuário"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div>
    <input
      type="password"
      name="password"
      autoComplete="current-password" // 👈 adicione isso
      placeholder="Senha"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <button
    type="submit"
    className="w-full rounded bg-blue-600 py-2 text-white font-medium hover:bg-blue-700"
  >
    Entrar
  </button>
</form>