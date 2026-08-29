$ErrorActionPreference = "SilentlyContinue"
$ProjectDir = $PSScriptRoot

$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Expo's web dev server picks its own port and opens the browser itself once
# ready, so this just needs to start it hidden in the background.
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run web > web-out.log 2>web-err.log" `
    -WorkingDirectory $ProjectDir `
    -WindowStyle Hidden
