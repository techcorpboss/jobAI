param(
    [string]$VpsHost = "root@103.170.122.138",
    [string]$DeployPath = "/www/wwwroot/jobai.techcorp.info.vn",
    [string]$RepoUrl = "https://github.com/techcorpboss/jobAI.git"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 TRIỂN KHAI HIREMIND AI ATS LÊN SERVER UBUNTU: $VpsHost" -ForegroundColor Cyan
Write-Host "   Tên miền SSL : https://jobai.techcorp.info.vn" -ForegroundColor Cyan
Write-Host "   Thư mục VPS  : $DeployPath" -ForegroundColor Cyan
Write-Host "   GitHub Repo  : $RepoUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ Không tìm thấy lệnh ssh. Vui lòng cài đặt OpenSSH Client cho Windows." -ForegroundColor Red
    exit 1
}

Write-Host "📥 Đang kết nối SSH tới $VpsHost để đồng bộ từ GitHub, khởi chạy FastAPI (Port 8010) và kích hoạt SSL..." -ForegroundColor Yellow

$RemoteCommands = @"
set -e
mkdir -p $DeployPath
cd $DeployPath

if [ -f "$DeployPath/.user.ini" ]; then
    chattr -i "$DeployPath/.user.ini" 2>/dev/null || true
    rm -f "$DeployPath/.user.ini" 2>/dev/null || true
fi

if [ ! -d "$DeployPath/.git" ]; then
    rm -f "$DeployPath/index.html" "$DeployPath/404.html"
    git init
    git remote add origin $RepoUrl 2>/dev/null || git remote set-url origin $RepoUrl
fi

git fetch origin main
git reset --hard origin/main

sed -i 's/\r$//' deploy/aapanel-deploy.sh
chmod +x deploy/aapanel-deploy.sh
bash deploy/aapanel-deploy.sh
"@

ssh -o StrictHostKeyChecking=accept-new $VpsHost $RemoteCommands

Write-Host "`n✅ Hoàn tất triển khai! Truy cập ngay tại: https://jobai.techcorp.info.vn" -ForegroundColor Green
