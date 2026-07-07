Add-Type -AssemblyName PresentationCore,WindowsBase
$files = Get-ChildItem .\assets\personajes -File | Where-Object { $_.Extension -ieq '.png' }
if (-not $files) { Write-Host 'NO PNG FILES'; exit 0 }
foreach ($f in $files) {
    $path = $f.FullName
    $uri = [Uri]::new($path)
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($uri, [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $frame = $decoder.Frames[0]
    $format = [System.Windows.Media.PixelFormats]::Bgra32
    if ($frame.Format -ne $format) {
        $frame = [System.Windows.Media.Imaging.FormatConvertedBitmap]::new($frame, $format, $null, 0)
    }
    $width = $frame.PixelWidth
    $height = $frame.PixelHeight
    $stride = $width * 4
    $pixels = New-Object byte[] ($height * $stride)
    $frame.CopyPixels($pixels, $stride, 0)
    $changed = $false
    for ($i = 0; $i -lt $pixels.Length; $i += 4) {
        $b = $pixels[$i]
        $g = $pixels[$i + 1]
        $r = $pixels[$i + 2]
        $a = $pixels[$i + 3]
        if ($a -gt 10) {
            $max = [Math]::Max([Math]::Max($r, $g), $b)
            $min = [Math]::Min([Math]::Min($r, $g), $b)
            if ($max -gt 220 -and ($max - $min) -lt 40) {
                $pixels[$i + 3] = 0
                $changed = $true
            }
        }
    }
    if ($changed) {
        $wb = [System.Windows.Media.Imaging.WriteableBitmap]::new($width, $height, 96, 96, $format, $null)
        $wb.WritePixels([System.Windows.Int32Rect]::new(0, 0, $width, $height), $pixels, $stride, 0)
        $tmp = Join-Path $f.DirectoryName ('tmp_' + $f.Name)
        $encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
        $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($wb))
        $fs = [System.IO.File]::Open($tmp, [System.IO.FileMode]::Create)
        $encoder.Save($fs)
        $fs.Close()
        Remove-Item $path
        Rename-Item $tmp $path
        Write-Host "PROCESSED $($f.Name)"
    } else {
        Write-Host "SKIPPED $($f.Name)"
    }
}
