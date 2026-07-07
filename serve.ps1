$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host 'Servidor listo en http://localhost:8000/'
try {
  while ($true) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.AbsolutePath
    if ([string]::IsNullOrWhiteSpace($path) -or $path -eq '/') { $path = '/index.html' }
    if ($path -eq '/api/personajes' -or $path -eq '/api/personajes/' -or $path -eq '/assets/personajes/' -or $path -eq '/assets/personajes') {
      $dir = Join-Path (Get-Location) 'assets\personajes'
      $files = @()
      if (Test-Path $dir -PathType Container) {
        $files = Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -match '^(\.png|\.jpg|\.jpeg|\.gif|\.webp)$' } | Sort-Object Name | Select-Object -ExpandProperty Name
      }
      $json = $files | ConvertTo-Json -Compress
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
      $context.Response.ContentType = 'application/json'
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }
    $safePath = $path.TrimStart('/')
    $fullPath = Join-Path (Get-Location) $safePath
    if (-not (Test-Path $fullPath -PathType Leaf)) { $fullPath = Join-Path (Get-Location) 'index.html' }
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    switch ($ext) {
      '.css' { $contentType = 'text/css' }
      '.js' { $contentType = 'application/javascript' }
      '.png' { $contentType = 'image/png' }
      '.jpg' { $contentType = 'image/jpeg' }
      '.jpeg' { $contentType = 'image/jpeg' }
      '.mp3' { $contentType = 'audio/mpeg' }
      '.mpeg' { $contentType = 'video/mpeg' }
      default { $contentType = 'text/html' }
    }
    $context.Response.ContentType = $contentType
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
