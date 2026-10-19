# Ambiente Android local

Preparação em 17/10/2026 no AISTEIN-LAB, papel OPS, modo FAST. O inventário
físico pertence ao CServer, em `servers/AISTEIN-LAB/README.md`.

## Ferramentas verificadas

- Node 24.21.0 e Temurin JDK 17.0.20.1.
- Android API 36, Build Tools 36.0.0, Platform Tools 37.0.1.
- NDK 27.1.12297006, CMake 3.22.1 e Emulator 37.2.12.
- Imagem `system-images;android-36;google_apis;x86_64`, revisão 7.
- AVDs `CUNC_Phone_API36` (Pixel 6) e `CUNC_Tablet_API36` (Pixel Tablet),
  com dois núcleos e 2 GB de RAM cada. Executar um por vez nesta estação.

JDK e SDK são ferramentas compartilhadas. `ANDROID_USER_HOME`,
`ANDROID_AVD_HOME` e `GRADLE_USER_HOME` direcionam dados e caches para fora
do código. As variáveis foram configuradas no perfil do usuário; terminais
existentes podem precisar ser reabertos.

## Uso

```powershell
java -version
adb version
emulator -accel-check
emulator -list-avds
emulator -avd CUNC_Phone_API36
# Ou, após encerrar o telefone:
emulator -avd CUNC_Tablet_API36
```

A preparação usou o script existente:

```powershell
.\scripts\android-dependencies.bat initialize -IncludeAvdImage
npm ci
npm run ci:check
npm run test:ci
```

## Resultados e limites

O `npm ci` instalou 857 pacotes pelo lockfile. Os testes de `test:ci`
passaram; a inspeção do manifesto mesclado foi explicitamente pulada porque
depende do build. O `ci:check` reprovou no Expo Doctor: versões esperadas
`expo ~54.0.37`, `expo-file-system ~19.0.24` e `expo-updates ~29.0.20`,
contra `54.0.36`, `19.0.23` e `29.0.19` instaladas. O aviso já conhecido sobre
`@expo/config-plugins` também apareceu. Nenhuma exclusão ou atualização foi
aplicada para ocultar o resultado.

O npm reportou 62 vulnerabilidades: 22 moderadas, 39 altas e uma crítica.
Correções exigem análise e testes de compatibilidade; o lockfile foi preservado.

O recurso Windows Hypervisor Platform foi habilitado sem reinicialização
automática. O Windows solicitou reiniciar; entretanto, `emulator -accel-check`
já reconheceu WHPX utilizável. Ambos os AVDs concluíram boot com
`sys.boot_completed=1`: telefone em 138008 ms e tablet em 189022 ms.
As instâncias foram encerradas após a verificação.

O `google-services.json` privado ainda não está disponível nesta estação.
Sem ele, o gate Firebase bloqueia corretamente prebuild e build. Nenhum APK,
AAB, assinatura ou publicação foi produzido nesta preparação. Os resultados
são verificações locais de OPS, sem gate independente de QA.
