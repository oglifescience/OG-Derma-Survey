Add-Type -AssemblyName System.Drawing
$images = Get-ChildItem -Path "assets\images of concepts" -Filter "*.jpg"
foreach ($img in $images) {
    $bmp = [System.Drawing.Bitmap]::FromFile($img.FullName)
    Write-Host "$($img.Name): $($bmp.Width) x $($bmp.Height)"
    $bmp.Dispose()
}
