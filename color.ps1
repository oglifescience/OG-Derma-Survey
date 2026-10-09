Add-Type -AssemblyName System.Drawing;
$bmp = [System.Drawing.Bitmap]::FromFile('assets\images of concepts\IMG_1289.jpg');
$c = $bmp.GetPixel(0,0);
Write-Host "Skn: $($c.R) $($c.G) $($c.B)";
$bmp2 = [System.Drawing.Bitmap]::FromFile('assets\images of concepts\IMG_1297.jpg');
$c2 = $bmp2.GetPixel(0,0);
Write-Host "Veritas: $($c2.R) $($c2.G) $($c2.B)";
