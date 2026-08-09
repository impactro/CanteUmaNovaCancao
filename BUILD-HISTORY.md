# Histórico de builds

Registro versionável e sanitizado das compilações do **Cante Uma Nova Canção**.
Não incluir segredos, caminhos privados de credenciais, dados de aparelhos,
logs brutos, APKs ou AABs.

## 2026-08-09 - Ciclo FAST de identidade, controles, dependências e build debug

### Identificação

- Objetivo: absorver o commit remoto do splash CrânIA, avançar `BRAND-002`,
  `UX-003` e o trecho atual de `LEGAL-001`, aplicar o autofix npm compatível,
  refatorar controles, executar os gates e produzir um development APK
  auditado.
- Branch e base remota: `release/3.3.51`, commit `fe33241`.
- Estado da candidata de fonte: base remota mais alterações locais ainda sem
  commit no lockfile, documentação, tela Sobre, filtros e quatro testes
  portáteis. Nenhum commit ou push foi feito neste ciclo.
- Papéis: DEV-Mobile implementou e testou; OPS resolveu o runtime somente nos
  comandos da rodada; a validação foi local e não independente.

### Implementação

- Splash nativo e Loader React Native usam o mesmo livro aberto da CrânIA,
  fundo branco, `contain`, transparência e sem espera artificial.
- A tela Sobre apresenta CrânIA EcoSystem, Fábio Souza, versão instalada e
  link oficial, sem expor e-mail pessoal na interface; o layout passou a ser
  responsivo, com cartões legíveis e ações de largura adaptativa.
- Os botões da tela Sobre foram consolidados em uma única estrutura, com área
  mínima de toque, feedback de pressão, rótulo e dica de acessibilidade.
- O filtro mantido do catálogo usa `ICI`; seu estado agora é derivado de forma
  imutável, com chave estável, seleção acessível, alvo de toque de 44 dp e
  recuperação de rolagem. Autoria e créditos históricos foram preservados.
- Foram adicionados testes para o contrato do splash, identidade da tela Sobre
  separação entre interface atual, autoria e histórico, responsividade e
  acessibilidade dos controles.
- `npm audit fix`, sem `--force`, atualizou somente transitivas corrigidas:
  `brace-expansion`, `fast-uri`, `js-yaml` e `nanoid`, além da deduplicação
  registrada no lockfile. Nenhuma dependência direta mudou.

### Artefato

- Variante: debug multi-ABI com development client; não é candidata de loja.
- Arquivo: `CanteUmaNovaCancao-3.3.50-vc50-debug-fe33241-worktree.apk`.
- Package: `br.org.icoc.novacancao`.
- Versão: `versionName 3.3.50`, `versionCode 50`.
- SDK: mínimo `24`, compilação e alvo `36`.
- ABIs: `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`.
- Tamanho: `213.830.324` bytes, aproximadamente `203,9 MiB`.
- SHA-256: `314BC587EB5C9BAC5C2B79905690D7651B9CD43C5BED76351AC0BDCF3325C2B9`.
- Armazenamento externo:
  `<ARTIFACTS_ROOT>/CanteUmaNovaCancao/20260809-debug-build-04/`.
- Assinatura: certificado Android Debug, esquema APK v2.
- Alinhamento: `zipalign -c -P 16 -v 4` aprovado.
- Limite da variante: o APK não embute `index.android.bundle`; as mudanças
  JavaScript foram validadas pelo bundle Metro e são carregadas pelo development
  client. O APK prova a camada nativa e exige Metro para o fluxo completo.

### Tempos reais

- Autofix npm seguro: `13,0 s`.
- Reinstalação reproduzível, `npm ci`: `34,7 s`.
- Gate completo: `75,5 s`.
- Prebuild Android limpo: `9,4 s`.
- Build completo observado: aproximadamente `23 min 15 s`; o supervisor
  atingiu `20 min 04 s`, mas o mesmo Gradle continuou até criar o APK, sem uma
  segunda compilação concorrente.
- Verificação incremental final: `84,2 s`, `609` tarefas (`54` executadas e
  `555` atualizadas), com `BUILD SUCCESSFUL in 1m 23s`.

### Validação

- `npm run ci:check`: aprovado; `17/18` checks do Expo Doctor, mantendo apenas
  a exceção documentada de `@expo/config-plugins`.
- Bundle Metro: aprovado com `1.502` módulos.
- Testes de splash, Sobre, linguagem da interface e controles acessíveis:
  aprovados.
- Catálogo, áudio, cache, busca, histórico, ciclo de vida, layout adaptativo,
  Analytics, Firebase, assinatura e manifesto: aprovados.
- Recurso `splashscreen_logo.png` encontrado em cinco densidades dentro do APK;
  a variante `xxxhdpi` extraída do artefato foi inspecionada visualmente e
  preservou fundo branco, proporção e margens seguras.
- `apksigner`, `zipalign`, package, versão, quatro ABIs e ausência de nomes de
  credencial no ZIP: aprovados.
- `npm audit`: reduzido de `29` para `25` vulnerabilidades transitivas. Foram
  removidas `4` altas; permanecem `13` moderadas, `12` altas e `0` críticas na
  cadeia Expo/Metro/React Native.
- O npm oferece correção das `25` restantes somente com `--force`, instalando
  Expo `57.0.11`, mudança principal e incompatível com a base Expo 54 atual;
  essa migração destrutiva não foi aplicada neste ciclo.
- QA funcional: `BLOQUEADO`. Não havia aparelho conectado; o AVD x86_64 não
  possui aceleração e a tentativa somente leitura por software encerrou antes
  de aparecer no `adb`.

### Problemas, limites e aprendizados

```text
learning_candidate:
  papel: DEV-Mobile/SEC
  erro: 29 vulnerabilidades transitivas no lockfile
  causa: versões vulneráveis pontuais e avisos agregados da cadeia Expo 54/Metro
  correcao: npm audit fix sem force atualizou quatro famílias transitivas
  prevencao: auditar lockfile em cada ciclo e migrar SDK em ramo isolado
  evidencia: audit passou de 13 moderadas e 16 altas para 13 moderadas e 12 altas
  status: parcialmente comprovado; 25 ocorrencias exigem migração principal

learning_candidate:
  papel: DEV-Mobile
  erro: filtros alteravam objetos do estado diretamente e podiam perder seleção
  causa: array persistente com forEach e mutação de selected
  correcao: seleção derivada de newOrder com map imutável
  prevencao: estado visual derivado nunca deve ser mutado fora do setter
  evidencia: teste de controles e bundle Metro aprovados
  status: comprovado

learning_candidate:
  papel: DEV-Mobile/OPS
  erro: supervisor atingiu 20 minutos antes do fim do build CMake
  causa: quatro ABIs nativas excederam o limite externo após prebuild limpo
  correcao: provar processo e compiladores ativos, aguardar o mesmo Gradle e confirmar incrementalmente
  prevencao: reservar ao menos 30 minutos e monitorar log/PID no primeiro build após prebuild
  evidencia: APK criado e assembleDebug incremental fechou BUILD SUCCESSFUL
  status: comprovado

learning_candidate:
  papel: DEV-Mobile
  erro: teste novo presumiu que o PNG tinha exatamente 1280 por 1280 pixels
  causa: dimensao inferida da visualizacao, sem ler o cabecalho real do PNG
  correcao: validar resolucao minima, canal alpha e contrato funcional do ativo
  prevencao: testes de asset devem provar requisitos, nao dimensoes presumidas
  evidencia: PNG 1254 por 1254 RGBA e testes direcionados aprovados
  status: comprovado

learning_candidate:
  papel: DEV-Mobile/OPS
  erro: primeira chamada do apksigner nao encontrou Java
  causa: JAVA_HOME estava limitado ao comando anterior
  correcao: declarar JDK explicitamente no comando de auditoria
  prevencao: cada etapa externa recebe ambiente completo e reproduzivel
  evidencia: assinatura debug v2 verificada na repeticao
  status: comprovado

learning_candidate:
  papel: DEV-Mobile
  erro: o build completo foi iniciado antes do ultimo ajuste JavaScript do ciclo
  causa: fechamento legal foi identificado durante a auditoria do roadmap
  correcao: repetir gate completo e build incremental apos congelar o diff
  prevencao: fechar todos os itens de fonte antes de nomear a candidata final
  evidencia: gate final em 73,1 s e assembleDebug incremental aprovado
  status: comprovado

learning_candidate:
  papel: OPS/QA
  erro: AVD por software encerrou antes de se registrar no adb
  causa: hipotese de incompatibilidade ou inviabilidade do x86_64 sem aceleracao
  correcao: ainda nao comprovada; usar hipervisor autorizado ou aparelho fisico
  prevencao: tratar accel-check como gate antes do QA funcional em AVD
  evidencia: accel-check 6 e tentativa software sem dispositivo adb
  status: pendente
```

### Entrega e próximo gate

- Entregue: lockfile com autofix seguro, interface/controles refatorados, fonte
  testada localmente e development APK nativo auditado.
- Não entregue: commit/push deste ciclo, APK/AAB release, assinatura histórica,
  instalação em aparelho, QA independente ou publicação.
- Próximo gate: revisar o diff público, autorizar commit/push e executar em
  aparelho físico ou AVD acelerado a matriz de splash, Sobre, acessibilidade,
  rotação, áudio e retorno repetido da música.

## 2026-08-09 - Primeira compilação debug na estação remota

### Identificação

- Objetivo: provar o toolchain Android local e gerar APK debug verificável.
- Branch e commit: `release/3.3.51`, `d32a646`.
- Estado inicial: checkout limpo; `google-services.json` presente, validado e
  ignorado pelo Git.
- Estado final versionável: novos `AGENTS.md` e `BUILD-HISTORY.md`; código do
  aplicativo inalterado.
- Papéis: OPS provisionou o ambiente; DEV-Mobile executou prebuild e build;
  QA local não independente auditou artefato e testes.

### Artefato

- Variante: debug multi-ABI; não é candidata de loja.
- Arquivo: `CanteUmaNovaCancao-3.3.50-vc50-debug.apk`.
- Package: `br.org.icoc.novacancao`.
- Versão: `versionName 3.3.50`, `versionCode 50`.
- SDK: mínimo `24`, compilação e alvo `36`.
- ABIs: `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`.
- Tamanho: `213.610.336` bytes, aproximadamente `203,7 MiB`.
- SHA-256: `F6855643CA6F778888EC5D57A194A67D0C4F031E26E60D6262892D646A4C3ABA`.
- Armazenamento externo: `<ARTIFACTS_ROOT>/CanteUmaNovaCancao/20260809-debug-build-01/`.
- Assinatura: certificado Android Debug, esquema APK v2; não usa a keystore
  histórica de upload.
- Alinhamento: `zipalign -c -P 16 -v 4` aprovado.

### Tempos reais

- `npm ci` inicial: `29,6 s`.
- Gate anterior ao build, `npm run ci:check`: `89,2 s`.
- Prebuild Android limpo: `24,8 s`.
- Primeira tentativa supervisionada: interrompida pelo limite do executor após
  `20 min 04 s`; não produziu artefato e não conta como compilação entregue.
- Compilação entregue, `:app:assembleDebug --no-daemon`: `37 min 36 s`, de
  `10:13:15` a `10:50:51`, com cache inicial e quatro ABIs.
- Gate completo pós-build: `65,5 s`.

Não comparar esses números diretamente com build incremental: esta rodada
baixou metadados e dependências, instalou Build Tools `35.0.0` adicional e
compilou a árvore C++ para quatro ABIs.

### Ambiente

- Node `22.23.1`; npm `10.9.8`.
- Temurin JDK `17.0.20`.
- Gradle `8.14.3`; Kotlin `2.1.20`.
- Android SDK/target `36`; Build Tools do projeto `36.0.0`.
- Build Tools adicional resolvido durante o build: `35.0.0`.
- NDK `27.1.12297006`.
- Dispositivo/AVD: não executado; o hipervisor do Windows permanece pendente.

### Validação

- `npm run ci:check`: aprovado em `65,5 s` após o build; `17/18` checks do
  Expo Doctor, com a única exceção documentada para `@expo/config-plugins`.
- Bundle Metro: aprovado com `1.502` módulos.
- Catálogo: `199` músicas; checks de áudio, cache, busca, histórico, ciclo de
  vida, conteúdo, layout adaptativo, Analytics, Firebase e assinatura
  aprovados.
- Manifesto Android gerado: aprovado pelo teste de privacidade do projeto.
- `apksigner verify --verbose --print-certs`: aprovado com assinatura debug v2.
- `zipalign -c -P 16 -v 4`: aprovado para alinhamento de `16 KB`.
- Conteúdo do ZIP: nenhum arquivo com nome de credencial, keystore, `.env` ou
  `google-services.json` encontrado.
- Resultado QA técnico local: `APROVADO` para compilação debug.
- Resultado QA funcional: `BLOQUEADO`, pois o APK ainda não foi instalado nem
  exercitado em AVD ou aparelho físico.

### Problemas, limites e riscos

- `BLOCK`, primeira tentativa: o executor encerrou o supervisor após 20 minutos
  enquanto o Gradle filho continuou órfão. A árvore exata foi diagnosticada e
  encerrada antes da nova tentativa.
- `MEDIUM`, processo: duas formas de `Start-Process` iniciaram Gradles com 25
  segundos de sobreposição porque a primeira não devolveu PID. A segunda árvore
  foi identificada e encerrada; somente a primeira produziu a candidata final.
- `NOTE`, ambiente novo: resolução remota de manifestos foi lenta e o Gradle
  instalou Build Tools `35.0.0` como dependência adicional.
- `NOTE`, dependências: avisos Kotlin/Gradle depreciados e avisos D8 de stack
  map em `play-services-auth 21.5.0`; build concluído, mas o risco de runtime
  precisa ser coberto no teste em aparelho.
- `NOTE`, development client: o manifesto debug inclui
  `SYSTEM_ALERT_WINDOW`; permissões de uma futura release devem ser auditadas
  separadamente.
- `SEC pendente`: `npm ci` reportou `13` vulnerabilidades moderadas e `16`
  altas; nenhuma atualização automática ou `--force` foi aplicada.

### Aprendizados comprovados

```text
learning_candidate:
  papel: DEV-Mobile/OPS
  erro: supervisor com timeout menor que o primeiro build deixou Gradle órfão
  causa: o timeout encerrou o shell, mas não a árvore Java descendente
  correcao: identificar e encerrar a árvore exata; executar com log persistente fora do Git
  prevencao: primeiro build usa job observável, PID capturado e log por tentativa
  evidencia: árvore antiga encerrada e assembleDebug concluído em 37 min 36 s
  status: comprovado

learning_candidate:
  papel: DEV-Mobile
  erro: duas tentativas de launcher iniciaram Gradles concorrentes
  causa: Start-Process com batch não devolveu saída confiável, mas iniciou o processo
  correcao: listar processos pelo comando do projeto e encerrar a segunda árvore
  prevencao: antes de relançar, provar ausência de gradlew do projeto; usar um log e PID únicos por tentativa
  evidencia: somente a primeira árvore permaneceu e gerou APK validado
  status: comprovado
```

### Entrega e próximo gate

- Entregue: APK debug multi-ABI com hash e logs externos.
- Não entregue: APK/AAB release, assinatura histórica, instalação ou publicação.
- Próximo gate: habilitar o hipervisor ou conectar aparelho físico; instalar o
  APK e executar a matriz funcional de telefone/tablet, áudio, rotação e retorno
  repetido da música.

## Modelo de entrega

```text
Data:
Objetivo:
Branch e commit:
Checkout:
Papel e independência:

Artefato:
- variante:
- package:
- versionName/versionCode:
- ABIs:
- tamanho:
- SHA-256:
- armazenamento externo:

Tempos reais:
- instalação/dependências:
- gates:
- prebuild:
- compilação:
- testes pós-build:

Ambiente:
- Node/npm:
- JDK:
- SDK/Build Tools/NDK/Gradle:
- dispositivo ou AVD:

Validação:
- comando | resultado | evidência

Problemas e limites:
- severidade | observado | causa/hipótese | impacto | próximo passo

Aprendizados:
learning_candidate:
  papel:
  erro:
  causa:
  correcao:
  prevencao:
  evidencia:
  status:

Entrega e próximo gate:
```
