Add-Type -AssemblyName System.Drawing
$imgPath = "C:\AppDev\news_app\static\icon-192.png"
$adaptivePath = "C:\AppDev\news_app\mobile\assets\adaptive-icon.png"

$img = [System.Drawing.Image]::FromFile($imgPath)
# 512x512 is standard resolution for Expo icons
$bmp = New-Object System.Drawing.Bitmap 512, 512
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.Clear([System.Drawing.Color]::Transparent)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# The inner safe zone is roughly the middle 66%.
# We will draw the image inside a 300x300 box in the center.
# (512 - 300) / 2 = 106
$graph.DrawImage($img, 106, 106, 300, 300)
$bmp.Save($adaptivePath, [System.Drawing.Imaging.ImageFormat]::Png)

$graph.Dispose()
$bmp.Dispose()
$img.Dispose()
