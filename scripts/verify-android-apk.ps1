param(
  [Parameter(Mandatory = $true)][string]$SourceApk,
  [Parameter(Mandatory = $true)][string]$AndroidSdk,
  [Parameter(Mandatory = $true)][string]$Destination
)

$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath $SourceApk)) { throw 'APK nao encontrado.' }
& (Join-Path $AndroidSdk 'build-tools\35.0.0\apksigner.bat') verify --verbose $SourceApk
if ($LASTEXITCODE -ne 0) { throw 'Assinatura APK invalida.' }
& (Join-Path $AndroidSdk 'build-tools\35.0.0\zipalign.exe') -c 4 $SourceApk
if ($LASTEXITCODE -ne 0) { throw 'Alinhamento APK invalido.' }
New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
Copy-Item -LiteralPath $SourceApk -Destination $Destination
# Usar .NET tambem funciona em hosts sem o modulo que fornece Get-FileHash.
$stream = [IO.File]::OpenRead($Destination)
$sha256 = [Security.Cryptography.SHA256]::Create()
try {
  $digest = [BitConverter]::ToString($sha256.ComputeHash($stream)).Replace('-', '')
  $digest | Set-Content -LiteralPath ($Destination + '.sha256') -Encoding ascii
} finally {
  $stream.Dispose()
  $sha256.Dispose()
}
Write-Host "APK verificado: $Destination"
Write-Host "SHA-256: $digest"
