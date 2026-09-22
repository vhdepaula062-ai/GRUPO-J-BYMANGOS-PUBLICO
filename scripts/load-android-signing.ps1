# Credentials saved with Windows DPAPI can only be opened by the same Windows user.
$signingRoot = Join-Path $env:LOCALAPPDATA 'GrupoJ\signing'
$credentialFile = Join-Path $signingRoot 'staging-password.dpapi'
if (!$env:GJ_STAGING_KEYSTORE_PATH -and (Test-Path -LiteralPath $credentialFile)) {
  $env:GJ_STAGING_KEYSTORE_PATH = Join-Path $signingRoot 'staging.p12'
}
if (!$env:GJ_STAGING_KEYSTORE_PASSWORD -and (Test-Path -LiteralPath $credentialFile)) {
  $signingSecurePassword = (Get-Content -LiteralPath $credentialFile -Raw).Trim() | ConvertTo-SecureString
  $signingPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($signingSecurePassword)
  try { $env:GJ_STAGING_KEYSTORE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($signingPointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($signingPointer); $signingSecurePassword.Dispose() }
}
