[CmdletBinding(SupportsShouldProcess)]
param(
    [switch]$RemoveAvd,
    [switch]$RemoveSdk,
    [switch]$RemoveArtifacts
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Remove-Regenerable([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    if ($PSCmdlet.ShouldProcess($Path, 'remover dependência regenerável')) {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Output "Removido: $Path"
    }
}

Remove-Regenerable (Join-Path $projectRoot 'node_modules')
Remove-Regenerable (Join-Path $projectRoot '.expo')
Remove-Regenerable (Join-Path $projectRoot 'android')

if ($RemoveArtifacts) {
    Remove-Regenerable (Join-Path $projectRoot 'Artifacts')
}

if ($RemoveAvd) {
    $avdRoot = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.android\avd'
    if (Test-Path -LiteralPath $avdRoot) { Remove-Regenerable $avdRoot }
}

if ($RemoveSdk) {
    $sdkRoot = [Environment]::GetEnvironmentVariable('ANDROID_HOME')
    if (-not $sdkRoot) { $sdkRoot = [Environment]::GetEnvironmentVariable('ANDROID_SDK_ROOT') }
    if (-not $sdkRoot) { throw 'Defina ANDROID_HOME ou ANDROID_SDK_ROOT antes de usar -RemoveSdk.' }
    if ((Test-Path -LiteralPath $sdkRoot) -and $PSCmdlet.ShouldProcess($sdkRoot, 'remover Android SDK local')) {
        Remove-Item -LiteralPath $sdkRoot -Recurse -Force
        Write-Output "Removido: $sdkRoot"
    }
}

Write-Output 'Dependências locais finalizadas. Artefatos são preservados por padrão.'
