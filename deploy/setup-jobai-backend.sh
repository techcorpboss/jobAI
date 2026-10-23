#!/usr/bin/env bash
# ==============================================================================
# KỊCH BẢN TỰ ĐỘNG KHỞI TẠO & KÍCH HOẠT DỊCH VỤ JOAI-BACKEND / JOBAI-BACKEND
# Hỗ trợ đồng thời cả 3 tên dịch vụ: joai-backend | jobai-backend | jobai
# Tự động đồng bộ code, cập nhật Frontend, MySQL và khởi chạy FastAPI Port 8010
# ==============================================================================

set -e

DOMAIN="jobai.techcorp.info.vn"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
BACKEND_PORT=8010

echo "=============================================================================="
echo "⚙️  ĐANG TỰ ĐỘNG KHỞI TẠO DỊCH VỤ JOAI-BACKEND / JOBAI-BACKEND (PORT ${BACKEND_PORT})"
echo "=============================================================================="

cd "${PROJECT_DIR}"

# 1. Tự động bỏ qua xung đột file SQLite tạm và kéo code mới nhất từ GitHub
echo "📥 [1/5] Đồng bộ mã nguồn mới nhất từ GitHub..."
git checkout -- backend/hiremind_vn.db 2>/dev/null || true
git fetch origin main
git reset --hard origin/main

# 2. Đồng bộ các file giao diện Frontend mới nhất ra thư mục gốc cho Nginx
echo "🎨 [2/5] Cập nhật giao diện Quản trị AI Copilot & Public Portal..."
cp -rf "${PROJECT_DIR}/frontend/public/." "${PROJECT_DIR}/"

# 3. Tự động phát hiện hoặc khởi tạo Python Virtualenv (/venv và /backend/.venv)
echo "🐍 [3/5] Kiểm tra môi trường Python Virtualenv & cài đặt thư viện..."
if [ -x "${PROJECT_DIR}/venv/bin/python" ]; then
    VENV_DIR="${PROJECT_DIR}/venv"
    if [ ! -e "${PROJECT_DIR}/backend/.venv" ]; then
        ln -s "${PROJECT_DIR}/venv" "${PROJECT_DIR}/backend/.venv" || true
    fi
elif [ -x "${PROJECT_DIR}/backend/.venv/bin/python" ]; then
    VENV_DIR="${PROJECT_DIR}/backend/.venv"
    if [ ! -e "${PROJECT_DIR}/venv" ]; then
        ln -s "${PROJECT_DIR}/backend/.venv" "${PROJECT_DIR}/venv" || true
    fi
else
    python3 -m venv "${PROJECT_DIR}/venv"
    VENV_DIR="${PROJECT_DIR}/venv"
    ln -sf "${PROJECT_DIR}/venv" "${PROJECT_DIR}/backend/.venv" || true
fi

"${VENV_DIR}/bin/pip" install --upgrade pip -q
"${VENV_DIR}/bin/pip" install -r "${PROJECT_DIR}/backend/requirements.txt" -q

# 4. Đồng bộ cơ sở dữ liệu MySQL & SQLite
echo "🗄️  [4/5] Đồng bộ cơ sở dữ liệu MySQL (jobai_db) & SQLite..."
"${VENV_DIR}/bin/python" "${PROJECT_DIR}/backend/mysql_setup.py" || true

# 5. Tạo tự động Systemd Service cho cả 3 tên: joai-backend, jobai-backend và jobai
echo "🚀 [5/5] Tạo tự động dịch vụ Systemd (joai-backend / jobai-backend / jobai)..."

if command -v pm2 >/dev/null 2>&1; then
    pm2 delete jobai-backend >/dev/null 2>&1 || true
    pm2 delete joai-backend >/dev/null 2>&1 || true
fi
pkill -f "uvicorn main:app.*${BACKEND_PORT}" >/dev/null 2>&1 || true

cat > /etc/systemd/system/jobai-backend.service <<EOF
[Unit]
Description=HireMind AI Recruitment FastAPI Backend (${DOMAIN})
After=network.target mysql.service mariadb.service

[Service]
Type=simple
User=root
WorkingDirectory=${PROJECT_DIR}/backend
Environment="PYTHONUNBUFFERED=1"
ExecStart=${VENV_DIR}/bin/python -m uvicorn main:app --host 127.0.0.1 --port ${BACKEND_PORT}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
Alias=joai-backend.service jobai.service
EOF

# Tạo symlink trực tiếp để systemctl restart joai-backend | jobai-backend | jobai đều hoạt động 100%
ln -sf /etc/systemd/system/jobai-backend.service /etc/systemd/system/joai-backend.service
ln -sf /etc/systemd/system/jobai-backend.service /etc/systemd/system/jobai.service

systemctl daemon-reload
systemctl enable jobai-backend.service >/dev/null 2>&1 || true
systemctl restart jobai-backend.service

sleep 2

if systemctl is-active --quiet jobai-backend.service; then
    echo "=============================================================================="
    echo "✅ DỊCH VỤ ĐÃ KHỞI CHẠY THÀNH CÔNG & TỰ ĐỘNG BẬT CÙNG HỆ THỐNG!"
    echo "   • Trạng thái      : ACTIVE (RUNNING) trên cổng 127.0.0.1:${BACKEND_PORT}"
    echo "   • Lệnh hỗ trợ     : systemctl restart joai-backend"
    echo "                       systemctl restart jobai-backend"
    echo "                       systemctl restart jobai"
    echo "   • Website Quản trị: https://${DOMAIN}/"
    echo "=============================================================================="
else
    echo "⚠️ Dịch vụ chưa khởi động được, kiểm tra log bằng: journalctl -u joai-backend -n 50 --no-pager"
    exit 1
fi
