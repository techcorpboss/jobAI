#!/usr/bin/env bash
# ==============================================================================
# KỊCH BẢN TỰ ĐỘNG KHỞI TẠO & CHẠY DỊCH VỤ JOAI-BACKEND TRONG PM2 (PORT 8010)
# Đồng thời dọn tiến trình lỗi '-a' (trùng cổng 4005) và lưu cấu hình PM2 tự động
# ==============================================================================

set -e

DOMAIN="jobai.techcorp.info.vn"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
BACKEND_PORT=8010

export PATH=$PATH:/usr/local/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:/www/server/nodejs/v22.11.0/bin:/www/server/nodejs/v20.18.0/bin:/www/server/nodejs/v18.20.0/bin

echo "=============================================================================="
echo "🚀 ĐANG TỰ ĐỘNG TẠO & KÍCH HOẠT JOAI-BACKEND TRÊN PM2 (PORT ${BACKEND_PORT})"
echo "=============================================================================="

cd "${PROJECT_DIR}"

# 1. Kéo mã nguồn mới nhất từ GitHub và cập nhật giao diện Frontend
echo "📥 [1/5] Đồng bộ mã nguồn mới nhất từ GitHub..."
git checkout -- backend/hiremind_vn.db 2>/dev/null || true
git fetch origin main
git reset --hard origin/main
cp -rf "${PROJECT_DIR}/frontend/public/." "${PROJECT_DIR}/"

# 2. Phát hiện hoặc tạo Python Virtualenv (/venv hoặc /backend/.venv)
echo "🐍 [2/5] Kiểm tra môi trường Python Virtualenv & cài đặt thư viện..."
if [ -x "${PROJECT_DIR}/venv/bin/python" ]; then
    VENV_DIR="${PROJECT_DIR}/venv"
    [ ! -e "${PROJECT_DIR}/backend/.venv" ] && ln -s "${PROJECT_DIR}/venv" "${PROJECT_DIR}/backend/.venv" || true
elif [ -x "${PROJECT_DIR}/backend/.venv/bin/python" ]; then
    VENV_DIR="${PROJECT_DIR}/backend/.venv"
    [ ! -e "${PROJECT_DIR}/venv" ] && ln -s "${PROJECT_DIR}/backend/.venv" "${PROJECT_DIR}/venv" || true
else
    python3 -m venv "${PROJECT_DIR}/venv"
    VENV_DIR="${PROJECT_DIR}/venv"
    ln -sf "${PROJECT_DIR}/venv" "${PROJECT_DIR}/backend/.venv" || true
fi

"${VENV_DIR}/bin/pip" install --upgrade pip -q
"${VENV_DIR}/bin/pip" install -r "${PROJECT_DIR}/backend/requirements.txt" -q

# 3. Đồng bộ Cơ sở dữ liệu MySQL (jobai_db) & SQLite
echo "🗄️  [3/5] Đồng bộ Cơ sở dữ liệu MySQL (jobai_db) & SQLite..."
"${VENV_DIR}/bin/python" "${PROJECT_DIR}/backend/mysql_setup.py" || true

# 4. Dọn tiến trình PM2 bị lỗi '-a' (trùng cổng 4005) và giải phóng cổng 8010
echo "🧹 [4/5] Dọn dẹp tiến trình PM2 lỗi (-a) và giải phóng cổng ${BACKEND_PORT}..."
systemctl stop jobai-backend.service 2>/dev/null || true
systemctl disable jobai-backend.service 2>/dev/null || true
pkill -f "uvicorn main:app.*${BACKEND_PORT}" >/dev/null 2>&1 || true

if command -v pm2 >/dev/null 2>&1; then
    # Xóa tiến trình bị đặt nhầm tên '-a' gây lỗi EADDRINUSE port 4005
    pm2 delete -- "-a" >/dev/null 2>&1 || pm2 delete 15 >/dev/null 2>&1 || true
    pm2 delete joai-backend >/dev/null 2>&1 || true
    pm2 delete jobai-backend >/dev/null 2>&1 || true

    echo "⚡ [5/5] Khởi tạo tự động 'joai-backend' trong PM2 (Cổng ${BACKEND_PORT})..."
    cd "${PROJECT_DIR}/backend"
    pm2 start "${VENV_DIR}/bin/python" \
        --name "joai-backend" \
        --interpreter none \
        --cwd "${PROJECT_DIR}/backend" \
        -- -m uvicorn main:app --host 127.0.0.1 --port ${BACKEND_PORT}

    pm2 save
    sleep 2
    pm2 status
else
    echo "⚠️ Không tìm thấy PM2, đang khởi chạy qua Systemd..."
    systemctl enable --now jobai-backend.service
fi

echo "=============================================================================="
echo "✅ HOÀN TẤT! Dịch vụ 'joai-backend' đã chạy tự động trong PM2 tại cổng ${BACKEND_PORT}!"
echo "   • Xem trạng thái : pm2 status"
echo "   • Xem log        : pm2 logs joai-backend --lines 30"
echo "   • Khởi động lại  : pm2 restart joai-backend"
echo "=============================================================================="
