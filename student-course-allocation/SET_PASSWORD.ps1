$password = Read-Host "Enter your MySQL root password"
$envPath = "backend\.env"
$content = @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$password
DB_NAME=course_allocation
JWT_SECRET_KEY=super-secret-jwt-key-2024
"@
Set-Content -Path $envPath -Value $content
Write-Host "✓ .env updated with password"
Write-Host ""
Write-Host "Now running database setup..."
Set-Location backend\database
python autosetup.py
Set-Location ..
Write-Host ""
Write-Host "Starting Flask backend..."
python app.py
