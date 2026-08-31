[CmdletBinding()]
param(
    [switch]$SkipNpm,
    [switch]$IncludeAvdImage
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Resolve-SdkManager {
    $candidates = @()
    foreach ($name in @('ANDROID_HOME', 'ANDROID_SDK_ROOT')) {
        $value = [Environment]::GetEnvironmentVariable($name)
        if ($value) {
            $candidates += Join-Path $value 'cmdline-tools\latest\bin\sdkmanager.bat'
            $candidates += Join-Path $value 'cmdline-tools\bin\sdkmanager.bat'
        }
    }
    $command = Get-Command sdkmanager.bat -ErrorAction SilentlyContinue
    if ($command) { $candidates += $command.Source }
    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (Test-Path -LiteralPath $candidate) { return $candidate }
    }
    throw 'sdkmanager.bat não encontrado. Instale o Android Command-line Tools ou configure ANDROID_HOME.'
}

if (-not $SkipNpm) {
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw 'npm não encontrado no PATH.'
    }
    Push-Location $projectRoot
    try { npm.cmd ci } finally { Pop-Location }
}

$sdkManager = Resolve-SdkManager
$packages = @(
    'platform-tools',
    'platforms;android-36',
    'build-tools;36.0.0',
    'emulator',
    'ndk;27.1.12297006',
    'cmake;3.22.1'
)
if ($IncludeAvdImage) {
    $packages += 'system-images;android-36;google_apis;x86_64'
}

& $sdkManager $packages
if ($LASTEXITCODE -ne 0) {
    throw "sdkmanager terminou com código $LASTEXITCODE. Verifique licenças e rede."
}

Write-Output 'Dependências Android prontas. O AVD só foi solicitado quando -IncludeAvdImage foi usado.'
