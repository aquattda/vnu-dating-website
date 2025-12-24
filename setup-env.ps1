# Create .env file from template
Copy-Item .env.example .env

Write-Host "✅ Created .env file from template" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please update .env file with:" -ForegroundColor Yellow
Write-Host "   1. Strong JWT_SECRET (random 32+ characters)" -ForegroundColor White
Write-Host "   2. MongoDB connection string from Atlas" -ForegroundColor White
Write-Host ""
Write-Host "📚 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
