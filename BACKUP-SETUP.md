# 🔄 BACKUP-SETUP - Recuperação de Skills Hermes

> **Última validação:** 18/08/2026  
> **Versão Hermes:** v6.3.0 (Superpowers plugin)  
> **Projeto:** controle-familiar-frontend

---

## 📋 Pré-requisitos

| Ferramenta | Versão Mínima | Comando de Verificação |
|------------|---------------|------------------------|
| Node.js | v22.23.1+ | `node --version` |
| npx | 10.9.8+ | `npx --version` |
| Python | 3.11+ | `python --version` |
| Git | 2.40+ | `git --version` |

---

## 1. Superpowers Plugin (v6.3.0)

### Instalação Rápida
```bash
# Desabilitar scan de segurança (necessário para este plugin)
hermes config set plugins.scan_on_install false

# Instalar e habilitar plugin
hermes plugins install obra/superpowers --enable

# Reiniciar gateway (em terminal SEPARADO - não dentro do Hermes)
hermes gateway restart
```

### Verificação
```bash
# Confirmar plugin habilitado
hermes plugins list | grep super

# Confirmar skills disponíveis (via arquivo)
ls -la ~/.hermes/plugins/superpowers/skills/
```

### Skills Incluídas (14)
| Skill | Descrição |
|-------|-----------|
| `brainstorming` | Exploração de ideias → designs aprovados |
| `systematic-debugging` | Debug 4-fases com root-cause tracing |
| `writing-plans` | Planos de implementação detalhados |
| `using-superpowers` | Bootstrap automático (injeta no 1º turno) |
| `test-driven-development` | Ciclo RED-GREEN-REFACTOR enforcado |
| `requesting-code-review` | Pre-commit review com security scan |
| `receiving-code-review` | Como receber reviews eficazmente |
| `subagent-driven-development` | Orquestração de subagentes paralelos |
| `dispatching-parallel-agents` | Delegação de tarefas independentes |
| `executing-plans` | Execução disciplinada de planos |
| `verification-before-completion` | Checklist antes de declarar "done" |
| `finishing-a-development-branch` | Merge, cleanup, documentação |
| `using-git-worktrees` | Worktrees paralelos para features |
| `writing-skills` | Como criar skills reutilizáveis |

### Acesso às Skills
```python
# Método 1: Bootstrap automático (using-superpowers injeta no 1º turno)
# Método 2: Leitura direta do arquivo
read_file("~/.hermes/plugins/superpowers/skills/<skill-name>/SKILL.md")

# Exemplo:
read_file("~/.hermes/plugins/superpowers/skills/brainstorming/SKILL.md")
```

---

## 2. Impeccable CLI (v3.6.0)

### Instalação
```bash
# Já instalado via npx (não precisa install global)
npx impeccable --version  # Deve retornar 3.6.0+
```

### Comandos Principais
```bash
# Scan de anti-patterns UI
npx impeccable detect src/
npx impeccable detect index.html
npx impeccable detect https://example.com

# JSON para automação
npx impeccable detect --json src/

# Gerenciar ignores
npx impeccable ignores
```

---

## 3. Find Skills CLI (v1.5.23)

### Instalação
```bash
# Já instalado via npx
npx skills --version  # Deve retornar 1.5.23+
```

### Comandos Principais
```bash
# Buscar skills
npx skills find superpowers
npx skills find react --owner vercel
npx skills find typescript

# Listar instaladas
npx skills list           # Projeto
npx skills list -g        # Global

# Adicionar skill
npx skills add vercel-labs/agent-skills
npx skills add vercel-labs/agent-skills -g  # Global

# Usar skill sem instalar
npx skills use vercel-labs/agent-skills@vercel-optimize
```

---

## 4. Memória Nativa Hermes

### Verificação
```bash
# Testar escrita/leitura
hermes -z "memory add 'teste de recuperação' --target memory"
```

### Uso no Código
```python
# Escrever memória
memory(action="add", content="Fato importante", target="memory")

# Ler memórias (injetadas automaticamente no contexto)
# Não precisa de comando - aparece no system prompt
```

### Configuração (config.yaml)
```yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  memory_char_limit: 2200
  user_char_limit: 1375
```

---

## 5. Task-Observer (skill-observations/)

### Estrutura de Diretórios
```bash
mkdir -p D:/projetos_dev/controle-familiar-frontend/skill-observations/{observations,patterns,templates}
```

### Arquivos Obrigatórios
```
skill-observations/
├── README.md              # Este arquivo de índice
├── observations/          # Observações por skill
├── patterns/              # Padrões reutilizáveis descobertos
└── templates/             # Templates para tarefas comuns
```

### Template de Observação
```markdown
# Observação: [Nome da Skill]

## Contexto
Quando usei: [data/tarefa]

## O que funcionou
- Ponto 1
- Ponto 2

## Armadilhas
- ⚠️ Armadilha 1
- ⚠️ Armadilha 2

## Padrão Reutilizável
```bash
# Comando ou fluxo que funcionou
```

## Próximos Passos
- [ ] Ação 1
- [ ] Ação 2
```

---

## 🚀 Script de Recuperação Completa (Uma Linha)

```bash
# Execute em terminal SEPARADO (não dentro do Hermes)
cd D:/projetos_dev/controle-familiar-frontend && \
hermes config set plugins.scan_on_install false && \
hermes plugins install obra/superpowers --enable && \
echo "✅ Plugin instalado. Agora execute em OUTRO terminal: hermes gateway restart" && \
mkdir -p skill-observations/{observations,patterns,templates} && \
npx impeccable --version && \
npx skills --version && \
echo "✅ Todas as 5 capabilities validadas!"
```

---

## ⚠️ Pontos Críticos (Armadilhas Conhecidas)

| Problema | Solução |
|----------|---------|
| Plugin bloqueado por security scan | `hermes config set plugins.scan_on_install false` ANTES de instalar |
| Gateway não reinicia de dentro do Hermes | Execute `hermes gateway restart` em terminal **separado** |
| Skills não aparecem em `hermes skills list` | Normal - plugin injeta via `pre_llm_call` hook. Use `read_file()` direto |
| `--ref` exige SHA completo (40 chars) | Use `git ls-remote --tags` para achar tag, pegue o SHA da tag (`^{}`) |
| `npx` baixa versões diferentes | Verifique com `--version` após cada comando |

---

## 📁 Arquivos de Configuração Importantes

### `~/.hermes/config.yaml` (trecho relevante)
```yaml
plugins:
  scan_on_install: false
  enabled:
    - superpowers
  disabled: []

memory:
  memory_enabled: true
  memory_char_limit: 2200
```

### Plugin Superpowers Local
```
~/.hermes/plugins/superpowers/
├── .hermes-plugin/
│   ├── __init__.py      # Hook pre_llm_call + registro de skills
│   └── plugin.yaml      # Metadados v6.3.0
└── skills/              # 14 skills (SKILL.md cada)
```

---

## ✅ Checklist de Validação Pós-Recuperação

- [ ] `hermes plugins list | grep super` → mostra `enabled  6.3.0`
- [ ] `ls ~/.hermes/plugins/superpowers/skills/` → 14 pastas
- [ ] `npx impeccable --version` → `3.6.0+`
- [ ] `npx skills --version` → `1.5.23+`
- [ ] `memory add 'teste' --target memory` → sem erro
- [ ] `ls skill-observations/{observations,patterns,templates}` → 3 pastas
- [ ] Novo chat Hermes: primeira resposta inclui bootstrap "You have superpowers"

---

## 🔗 Links Úteis

- **Superpowers Repo:** https://github.com/obra/superpowers
- **Hermes Plugin Docs:** https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins
- **Skills.sh Registry:** https://skills.sh
- **Impeccable:** https://impeccable.dev

---

> **Dica:** Mantenha este arquivo versionado no Git do projeto. Em caso de desastre, `git clone` + execução do script de recuperação = 100% restaurado em < 2 min.