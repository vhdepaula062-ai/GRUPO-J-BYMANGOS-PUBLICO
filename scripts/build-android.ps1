param(
  [string]$BuildRoot,
  [string]$JavaHome = $env:JAVA_HOME,
  [string]$AndroidSdk = $env:ANDROID_HOME
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
if (!$JavaHome) {
  $JavaHome = Split-Path -Parent (Split-Path -Parent (Get-Command java.exe -ErrorAction Stop).Source)
}
if (!$AndroidSdk) { $AndroidSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (!(Test-Path -LiteralPath (Join-Path $JavaHome 'bin\java.exe'))) { throw 'JDK ausente. Configure JAVA_HOME com o JDK 17.' }
if (!(Test-Path -LiteralPath (Join-Path $AndroidSdk 'platform-tools\adb.exe'))) { throw 'Android SDK ausente. Configure ANDROID_HOME.' }
if (!$BuildRoot) {
  $BuildRoot = Join-Path ($env:SystemDrive + '\gjb') ([guid]::NewGuid().ToString('N').Substring(0, 8))
}
$BuildRoot = [IO.Path]::GetFullPath($BuildRoot)
if ($BuildRoot -match '[^\x20-\x7E]|\s') { throw 'BuildRoot precisa ser um caminho curto sem espacos nem acentos, por exemplo C:\gjb\build-01.' }
if ($BuildRoot.Length -gt 20) { throw 'BuildRoot deve ter no maximo 20 caracteres: o Ninja do Android SDK falha com caminhos internos de 260 caracteres. Use C:\gjb\build-01.' }
if (Test-Path -LiteralPath $BuildRoot) { throw 'Use um BuildRoot novo para evitar arquivos e caches de builds anteriores.' }
if ($BuildRoot.StartsWith($repoRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'BuildRoot deve estar fora do repositorio.' }
New-Item -ItemType Directory -Path $BuildRoot | Out-Null

# Uma copia fisica evita que CMake/Node resolvam junctions de volta ao caminho com acentos.
# Nao copiar arquivos de ambiente do backend para o contexto do aplicativo.
& robocopy $repoRoot $BuildRoot /E /XD node_modules .git .next .turbo build dist out .gradle .cxx .idea .expo .vercel .ecosystem-data artifacts /XF .env .env.* *.log *.tsbuildinfo local.properties /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) { throw "Falha ao preparar copia do projeto: robocopy $LASTEXITCODE" }

$androidRoot = Join-Path $BuildRoot 'apps\customer-mobile\android'
('sdk.dir=' + $AndroidSdk.Replace('\', '/')) | Set-Content -LiteralPath (Join-Path $androidRoot 'local.properties') -Encoding ascii
$previousJavaHome = $env:JAVA_HOME
$previousNodeEnv = $env:NODE_ENV
$previousExpoNoDotenv = $env:EXPO_NO_DOTENV
$previousAndroidHome = $env:ANDROID_HOME
$outputRoot = Join-Path $repoRoot 'artifacts\android'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
try {
  $env:JAVA_HOME = $JavaHome
  $env:ANDROID_HOME = $AndroidSdk
  $env:EXPO_NO_DOTENV = '1'
  Push-Location $BuildRoot
  try {
    & pnpm.cmd install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependencias.' }
    & pnpm.cmd --filter customer-mobile typecheck
    if ($LASTEXITCODE -ne 0) { throw 'Typecheck do aplicativo falhou.' }
  } finally { Pop-Location }
  $env:NODE_ENV = 'production'
  Push-Location $androidRoot
  try {
    & cmd.exe /d /c '.\gradlew.bat assembleRelease --console=plain --max-workers=2 2>&1' | Tee-Object -FilePath (Join-Path $outputRoot 'build.log')
    if ($LASTEXITCODE -ne 0) { throw 'Build Android falhou. Consulte artifacts/android/build.log.' }
  } finally { Pop-Location }

  $apk = Join-Path $androidRoot 'app\build\outputs\apk\release\app-release.apk'
  if (!(Test-Path -LiteralPath $apk)) { throw 'Gradle terminou sem gerar o APK esperado.' }
  $destination = Join-Path $outputRoot 'grupo-j-staging.apk'
  & (Join-Path $PSScriptRoot 'verify-android-apk.ps1') -SourceApk $apk -AndroidSdk $AndroidSdk -Destination $destination
  Write-Host "APK de staging verificado: $destination"
  Write-Host "Copia do build preservada em: $BuildRoot"
  Write-Host 'Este build nao certifica integracoes nem prontidao de producao. Consulte docs/ANDROID_BUILD_AUDIT.md.'
} finally {
  $env:JAVA_HOME = $previousJavaHome
  $env:NODE_ENV = $previousNodeEnv
  $env:EXPO_NO_DOTENV = $previousExpoNoDotenv
  $env:ANDROID_HOME = $previousAndroidHome
}
