# Assinatura Android release

O `bundleRelease` usa exclusivamente a chave de upload configurada no ambiente.
O prebuild e os builds debug não precisam dessas variáveis.

Variáveis obrigatórias:

- `ANDROID_UPLOAD_KEYSTORE`: caminho absoluto do arquivo de keystore;
- `ANDROID_UPLOAD_KEY_ALIAS`: alias da chave de upload;
- `ANDROID_UPLOAD_STORE_PASSWORD`: senha do keystore;
- `ANDROID_UPLOAD_KEY_PASSWORD`: senha da chave.

Exemplo de sessão PowerShell, sem valores reais:

```powershell
$env:ANDROID_UPLOAD_KEYSTORE = 'C:\caminho-seguro\upload-key.jks'
$env:ANDROID_UPLOAD_KEY_ALIAS = '<alias>'
$env:ANDROID_UPLOAD_STORE_PASSWORD = '<senha-do-keystore>'
$env:ANDROID_UPLOAD_KEY_PASSWORD = '<senha-da-chave>'
npm run build:android-local:aab
```

O arquivo e as senhas não devem ser copiados para este repositório, para
`gradle.properties`, para a documentação, para logs ou para artefatos de
agentes. A configuração persistente fica no config plugin
`plugins/withAndroidReleaseSigning.cjs`, que é reaplicado por
`npm run prebuild:android`.

Quando alguma variável estiver ausente, o caminho não for absoluto ou o arquivo
não existir, `bundleRelease` encerra com uma mensagem explícita antes de
executar as tarefas do build. Isso evita publicar acidentalmente um AAB
assinado com `debug.keystore`.
