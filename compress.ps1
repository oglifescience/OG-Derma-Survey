Add-Type -AssemblyName System.Drawing
$folder = 's:\OG Derma Website\survey project\assets\images of concepts'
$files = Get-ChildItem -Path $folder -Filter '*.PNG'
foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        $newWidth = $img.Width
        $newHeight = $img.Height
        if ($img.Width -gt 800) {
            $newWidth = 800
            $newHeight = [int](($img.Height * 800) / $img.Width)
        }
        
        $bmp = New-Object System.Drawing.Bitmap $newWidth, $newHeight
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.Clear([System.Drawing.Color]::White)
        $g.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        $outPath = [System.IO.Path]::ChangeExtension($file.FullName, '.jpg')
        
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]75)
        
        $bmp.Save($outPath, $encoder, $encoderParams)
        
        $g.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        
        Write-Host "Resized and compressed $($file.Name) to JPG"
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}
