# PowerShell script to download and setup readpst for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Downloading readpst for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create tools directory
$toolsDir = "$PSScriptRoot\tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Host "Created tools directory"
}

# Download URL for libpst Windows binaries
$downloadUrl = "https://github.com/pst-format/libpst/releases/download/v0.6.76/libpst-0.6.76-mingw32.zip"
$zipFile = "$toolsDir\libpst.zip"
$extractDir = "$toolsDir\libpst"

try {
    # Download the file
    Write-Host "Downloading libpst..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile
    
    # Extract the zip file
    Write-Host "Extracting files..."
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    
    # Find readpst.exe
    $readpstPath = Get-ChildItem -Path $extractDir -Recurse -Filter "readpst.exe" | Select-Object -First 1
    
    if ($readpstPath) {
        # Copy to tools directory
        Copy-Item $readpstPath.FullName "$toolsDir\readpst.exe" -Force
        Write-Host "readpst.exe installed to: $toolsDir\readpst.exe" -ForegroundColor Green
        
        # Add to PATH for current session
        $env:PATH = "$toolsDir;$env:PATH"
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Installation Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "readpst.exe has been downloaded to the tools folder."
        Write-Host "The program will now be able to import PST files."
    } else {
        Write-Host "Error: readpst.exe not found in the downloaded package" -ForegroundColor Red
    }
    
    # Cleanup
    Remove-Item $zipFile -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error downloading or extracting libpst: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://www.five-ten-sg.com/libpst/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")