Add-Type -AssemblyName System.Drawing
$path = Convert-Path "assets\images of concepts\IMG_1289.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($path)
Write-Host "IMG_1289: $($bmp.Width) x $($bmp.Height)"
$bmp.Dispose()
