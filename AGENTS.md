# AGENTS.md

Contrato local de agentes do aplicativo público **Cante Uma Nova Canção**.
Regra local concreta deste projeto vence orientação geral quando houver conflito
operacional explícito. Os padrões compartilhados continuam pertencendo ao
CServer e não devem ser copiados integralmente para este repositório.

## Localização portátil do CServer

Antes de agir, resolver `<CSERVER_ROOT>` nesta ordem:

1. variável de ambiente `CRANIA_CSERVER_ROOT`, apontando para a raiz do checkout
   `CServer` da máquina atual;
2. caminho relativo `../CServer`;
3. caminho relativo `../../CES/CServer`;
4. caminho relativo `../../../CES/CServer`;
5. inventário local da máquina, informado pelo operador e mantido fora do Git.

Um caminho absoluto de uma máquina não deve ser gravado neste repositório. Se
nenhuma opção resolver o CServer, parar e pedir o mapeamento; não reconstruir os
padrões por memória.

## Bootstrap

Ler, nesta ordem e somente no escopo necessário:

1. este `AGENTS.md`;
2. `<CSERVER_ROOT>/CES/padroes/README.md`;
3. `<CSERVER_ROOT>/CES/padroes/guidelines.md`;
4. `<CSERVER_ROOT>/CES/padroes/role-context-contract.md`;
5. os arquivos dos papéis selecionados;
6. `README.md`, `ROADMAP.md`, `TASK.md`, `HISTORY.md` e `BUILD-HISTORY.md`,
   quando existirem e forem relevantes.

Sem modo explícito, iniciar em `USO`. Criação ou alteração curta e autorizada
usa `FAST`. Somente `FULL`, autorizado por Fábio, cria subagentes e permite
gates independentes por papéis separados.

## Seleção de papéis

- ambiente, instalação, SDK, JDK, AVD, credencial, assinatura e publicação:
  `OPS-agent.md`;
- código e testes técnicos: `DEV-agent.md`, seguido de `DEV-node-agent.md` e
  `DEV-mobile-agent.md`;
- critérios, escopo e ciclo: `PM-agent.md`;
- validação funcional: `QA-agent.md`;
- experiência, responsividade e identidade: `DESIGN-agent.md`;
- segurança, privacidade e segredos: `SEC-agent.md`;
- coerência final e manutenibilidade: `REV-agent.md`;
- documentação e treinamento: `DOC-agent.md`.

Em `FAST`, o agente pode mudar de papel após anunciar o handoff, mas sua própria
rechecagem não é QA, REV ou SEC independente. Em `FULL`, cada papel autorizado
opera em contexto próprio e recebe a mesma candidata identificada.

## Limites permanentes

- Android é prioridade; não abrir ciclo específico de iOS sem autorização.
- Preservar o package `br.org.icoc.novacancao`, assinatura histórica e
  versionamento monotônico.
- Não alterar Analytics, política, package name, assinatura, `versionCode` ou
  publicação sem tarefa explícita.
- Nunca versionar ou exibir `google-services.json`, keystore, senha, token,
  conta de serviço, APK, AAB, dado de aparelho ou evidência pessoal.
- Artefatos e evidências pesadas ficam fora do Git.
- Não acessar o Google Play Console, promover trilha ou publicar em produção
  nesta estação sem autorização específica.
- Commit e push somente após autorização de Fábio e revisão do diff público.
- Não usar `--force`, atualização em massa ou bypass para silenciar gates.

## Fluxo técnico mínimo

1. confirmar remoto, branch, commit e checkout limpo;
2. inventariar ambiente sem expor variáveis completas;
3. executar `npm ci` pelo lockfile;
4. executar `npm run ci:check`;
5. validar o gate privado do Firebase sem exibir seu conteúdo;
6. executar `npm run prebuild:android`;
7. compilar uma única instância Gradle por vez;
8. validar APK/AAB, package, versão, assinatura aplicável, alinhamento, ABIs,
   manifesto, permissões e SHA-256;
9. testar no escopo proporcional em telefone/tablet ou declarar o bloqueio;
10. registrar a entrega em `BUILD-HISTORY.md`.

Build debug prova compilação e instalação de desenvolvimento. Build release só
é candidato de distribuição quando usa a keystore histórica validada. AAB não
autoriza upload nem publicação.

## Contrato obrigatório de cada entrega

Toda compilação entregue deve registrar em `BUILD-HISTORY.md`:

- data, objetivo, branch, commit e estado do checkout;
- variante, package, `versionName`, `versionCode` e ABIs;
- caminho externo do artefato, tamanho e SHA-256;
- tempos reais, separados em instalação, gates, prebuild, compilação e testes;
- comandos e matriz executada, com aprovado, reprovado, bloqueado ou não
  testado;
- ambiente usado: JDK, SDK, Build Tools, NDK, Gradle e dispositivo/AVD;
- problemas encontrados, causa comprovada ou hipótese ainda aberta, correção,
  limitação e risco residual;
- papel que executou cada fase e se o gate foi independente;
- próximo passo e autorização ainda necessária.

Tempo deve vir de medição real de início/fim ou duração da ferramenta. Estimativa
deve ser identificada como estimativa. Nunca somar instalação inicial ao tempo
de compilação nem comparar primeiro build de cache vazio com build incremental
sem declarar a diferença.

## QA e retroalimentação

DEV testa a própria entrega. QA recebe uma candidata imutável e não corrige o
produto durante o parecer. Em `FAST`, registrar `QA local não independente`; QA
formal e independente exige `FULL` e autorização.

Falha, reprovação ou retrabalho relevante gera no histórico:

```text
learning_candidate:
  papel: <DEV-Mobile|OPS|QA|outro>
  erro: <o que ocorreu>
  causa: <comprovada ou hipótese>
  correcao: <o que resolveu>
  prevencao: <como evitar repetição>
  evidencia: <como foi validado>
  status: pendente | comprovado
```

Somente aprendizado com correção e evidência vira conhecimento confirmado do
projeto. Aprendizados comprovados alimentam automaticamente o próximo plano e
permanecem em `BUILD-HISTORY.md` ou `HISTORY.md`. Mudança deste `AGENTS.md` exige
decisão durável de projeto; promoção para `<CSERVER_ROOT>/CES/padroes` exige
aviso de alcance e autorização específica, sem edição silenciosa.
