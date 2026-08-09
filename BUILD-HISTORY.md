# Histórico de builds

Registro versionável e sanitizado das compilações do **Cante Uma Nova Canção**.
Não incluir segredos, caminhos privados de credenciais, dados de aparelhos,
logs brutos, APKs ou AABs.

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
