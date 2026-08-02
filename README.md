# Cante Uma Nova Canção

Aplicativo Android de letras, cifras e reprodução de músicas, mantido com um
catálogo embarcado para continuar útil sem depender de um serviço remoto para
listar o conteúdo.

O código é desenvolvido em repositório público. Configurações privadas,
credenciais, artefatos assinados e dados operacionais não fazem parte do
projeto versionado.

## Estado técnico

- versão: `3.3.50` (`versionCode 50`);
- Expo SDK 54 e React Native 0.81;
- Android `minSdk 24`, `compileSdk 36` e `targetSdk 36`;
- pacote Android e bundle iOS preservados: `br.org.icoc.novacancao`;
- prioridade operacional: Android; compatibilidade básica com iOS é preservada;
- o app usa development build, não Expo Go, para validar integrações nativas.

## Responsabilidade e projeto

- proprietário e mantenedor atual: **Fábio Souza**;
- site do ecossistema responsável: **https://crania.ia.br**;
- contatos formais de suporte e privacidade permanecem na ficha do aplicativo
  e na política pública;
- interface e desenvolvimento da fase anterior: **Anthony Oliveira** e demais
  colaboradores preservados no histórico do Git.

## Preparação

Requisitos recomendados:

- Node.js 20.19 ou superior;
- npm 10 ou superior;
- JDK 17;
- Android Studio/SDK com API 36;
- `adb` para instalação e diagnóstico em dispositivo ou AVD.

```powershell
npm ci
npm run ci:check
```

O arquivo `google-services.json` é necessário para os builds Android atuais,
mas contém configuração do ambiente e permanece fora do Git. Keystores, senhas
e credenciais também nunca devem ser versionados.

## Execução e build Android

```powershell
npm start
npm run android
npm run build:android-local:apk
npm run build:android-local:aab
```

O APK é destinado a testes. A publicação na Play Store usa AAB e deve preservar
a chave de assinatura histórica, o package name e um `versionCode` monotônico.

## Gate local e CI

`npm run ci:check` executa o Expo Doctor e os testes portáveis de catálogo,
cache de áudio, busca, histórico, configuração nativa, assinatura e telemetria.
O único aviso aceito automaticamente é a dependência direta
`@expo/config-plugins`, mantida por decisão explícita para os plugins locais;
uma indisponibilidade identificada da API de esquema da Expo é registrada como
aviso de rede. Qualquer outro diagnóstico do Expo Doctor reprova o gate.
O teste do manifesto Android também é chamado; quando ainda não existe um
manifesto mesclado ele informa que a validação do artefato depende do build.

O workflow em `.github/workflows/ci.yml` não usa segredos nem assina artefatos.
Builds de distribuição continuam no fluxo protegido de release.

## Conteúdo e evolução

O catálogo atual fica em `src/utils/mockMusicData.json`. A busca usa índice
Fuse.js normalizado, tolera acentos e pequenos erros, consulta número, título,
autor e letra, ordena resultados e elimina duplicidades pelo número da música.

O plano para pacotes futuros de músicas, importação do usuário, licenças e
atualizações seguras está em `docs/music-pack-roadmap.md`. Ele é planejamento;
nenhuma arquitetura de pacotes foi ativada nesta versão.

O backlog público, os bugs priorizados e o planejamento das próximas versões
estão em [ROADMAP.md](ROADMAP.md). Ideias propostas permanecem separadas das
funcionalidades já aprovadas, planejadas ou entregues.
