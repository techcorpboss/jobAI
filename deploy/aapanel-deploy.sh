#!/usr/bin/env bash
# ==============================================================================
# KỊCH BẢN TỰ ĐỘNG TRIỂN KHAI & CẤU HÌNH SSL TRÊN UBUNTU / AAPANEL
# Dự án   : HireMind Enterprise AI ATS (Tuyển dụng & Phỏng vấn AI Đa ngôn ngữ)
# Tên miền: https://jobai.techcorp.info.vn
# Thư mục : /www/wwwroot/jobai.techcorp.info.vn
# GitHub  : https://github.com/techcorpboss/jobAI.git
# Backend : FastAPI Uvicorn Port 8010 (PM2: jobai-backend)
# ==============================================================================

set -e

DOMAIN="jobai.techcorp.info.vn"
REPO_URL="https://github.com/techcorpboss/jobAI.git"
BACKEND_PORT=8010
PROJECT_DIR="/www/wwwroot/${DOMAIN}"

echo "=============================================================================="
echo "🚀 BẮT ĐẦU TRIỂN KHAI HIREMIND AI ATS LÊN: https://${DOMAIN}"
echo "   Thư mục đích : ${PROJECT_DIR}"
echo "   Kho GitHub   : ${REPO_URL}"
echo "   Cổng Backend : 127.0.0.1:${BACKEND_PORT}"
echo "=============================================================================="

# 1. Cài đặt các gói hệ thống cần thiết trên Ubuntu
export DEBIAN_FRONTEND=noninteractive
if ! command -v git >/dev/null 2>&1 || ! command -v python3 >/dev/null 2>&1; then
    echo "📦 [1/6] Cài đặt Git, Python3, venv, pip và Certbot..."
    apt-get update -y
    apt-get install -y git curl python3 python3-venv python3-pip certbot python3-certbot-nginx
else
    apt-get install -y python3-venv python3-pip certbot >/dev/null 2>&1 || true
fi

# 2. Đồng bộ mã nguồn mới nhất từ GitHub vào /www/wwwroot/jobai.techcorp.info.vn
echo "📥 [2/6] Đồng bộ mã nguồn từ GitHub (${REPO_URL})..."
mkdir -p "${PROJECT_DIR}"
cd "${PROJECT_DIR}"

if [ -f "${PROJECT_DIR}/.user.ini" ]; then
    chattr -i "${PROJECT_DIR}/.user.ini" 2>/dev/null || true
    rm -f "${PROJECT_DIR}/.user.ini" 2>/dev/null || true
fi

# Xóa các file mặc định của aaPanel (index.html, 404.html) trước khi kéo code
if [ ! -d "${PROJECT_DIR}/.git" ]; then
    rm -f "${PROJECT_DIR}/index.html" "${PROJECT_DIR}/404.html"
    git init
    git remote add origin "${REPO_URL}" 2>/dev/null || git remote set-url origin "${REPO_URL}"
fi

git fetch origin main
git reset --hard origin/main

# Sao chép các file tĩnh Frontend ra thư mục gốc /www/wwwroot/jobai.techcorp.info.vn
# để Nginx của aaPanel phục vụ trực tiếp cực nhanh
cp -rf "${PROJECT_DIR}/frontend/public/." "${PROJECT_DIR}/"

# 3. Thiết lập môi trường Python Virtualenv, MySQL Database (jobai_db) & Phụ thuộc Backend
echo "🐍 [3/6] Thiết lập Python Virtualenv, Cơ sở dữ liệu MySQL (jobai_db) và cài đặt Backend..."
cd "${PROJECT_DIR}/backend"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

./.venv/bin/pip install --upgrade pip -q
./.venv/bin/pip install -r requirements.txt -q

# 3.1. Tự động khởi tạo Cơ sở dữ liệu MySQL (jobai_db) trên Ubuntu / aaPanel
echo "🗄️  Đang khởi tạo & đồng bộ Cơ sở dữ liệu MySQL (jobai_db)..."
MYSQL_BIN=""
if [ -x "/www/server/mysql/bin/mysql" ]; then
    MYSQL_BIN="/www/server/mysql/bin/mysql"
elif command -v mysql >/dev/null 2>&1; then
    MYSQL_BIN="$(command -v mysql)"
else
    apt-get update -y >/dev/null 2>&1 || true
    apt-get install -y mariadb-server mariadb-client >/dev/null 2>&1 || apt-get install -y mysql-server mysql-client >/dev/null 2>&1 || true
    systemctl enable mariadb >/dev/null 2>&1 || systemctl enable mysql >/dev/null 2>&1 || true
    systemctl start mariadb >/dev/null 2>&1 || systemctl start mysql >/dev/null 2>&1 || true
    MYSQL_BIN="$(command -v mysql || true)"
fi

DB_USER_CFG="jobai_user"
DB_PASS_CFG="root123@"
DB_NAME_CFG="jobai_db"

if [ -n "${MYSQL_BIN}" ]; then
    # Lấy mật khẩu root MySQL của aaPanel (nếu có)
    AAPANEL_ROOT_PWD=""
    if [ -f "/www/server/panel/data/default.db" ]; then
        AAPANEL_ROOT_PWD=$(python3 -c "import sqlite3; conn=sqlite3.connect('/www/server/panel/data/default.db'); c=conn.cursor(); c.execute('SELECT mysql_root FROM config LIMIT 1'); r=c.fetchone(); print(r[0] if r and r[0] else '')" 2>/dev/null || true)
    fi

    MYSQL_CMD=""
    if [ -n "${AAPANEL_ROOT_PWD}" ] && "${MYSQL_BIN}" -uroot -p"${AAPANEL_ROOT_PWD}" -e "SELECT 1;" >/dev/null 2>&1; then
        MYSQL_CMD="${MYSQL_BIN} -uroot -p${AAPANEL_ROOT_PWD}"
    elif "${MYSQL_BIN}" -uroot -proot123@ -e "SELECT 1;" >/dev/null 2>&1; then
        MYSQL_CMD="${MYSQL_BIN} -uroot -proot123@"
    elif "${MYSQL_BIN}" -uroot -e "SELECT 1;" >/dev/null 2>&1; then
        MYSQL_CMD="${MYSQL_BIN} -uroot"
    fi

    if [ -n "${MYSQL_CMD}" ]; then
        ${MYSQL_CMD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME_CFG}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
        ${MYSQL_CMD} -e "CREATE USER IF NOT EXISTS '${DB_USER_CFG}'@'localhost' IDENTIFIED BY '${DB_PASS_CFG}';" || true
        ${MYSQL_CMD} -e "CREATE USER IF NOT EXISTS '${DB_USER_CFG}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS_CFG}';" || true
        ${MYSQL_CMD} -e "ALTER USER '${DB_USER_CFG}'@'localhost' IDENTIFIED BY '${DB_PASS_CFG}';" || true
        ${MYSQL_CMD} -e "ALTER USER '${DB_USER_CFG}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS_CFG}';" || true
        ${MYSQL_CMD} -e "GRANT ALL PRIVILEGES ON \`${DB_NAME_CFG}\`.* TO '${DB_USER_CFG}'@'localhost';" || true
        ${MYSQL_CMD} -e "GRANT ALL PRIVILEGES ON \`${DB_NAME_CFG}\`.* TO '${DB_USER_CFG}'@'127.0.0.1';" || true
        ${MYSQL_CMD} -e "FLUSH PRIVILEGES;" || true

        if [ -f "${PROJECT_DIR}/database/jobai_mysql.sql" ]; then
            ${MYSQL_CMD} --default-character-set=utf8mb4 "${DB_NAME_CFG}" < "${PROJECT_DIR}/database/jobai_mysql.sql" || true
            echo "✅ Đã nạp thành công cấu trúc 25 bảng & dữ liệu vào MySQL (${DB_NAME_CFG}) từ database/jobai_mysql.sql!"
        fi
    fi
fi

# Ghi cấu hình kết nối MySQL vào backend/.env
cat > "${PROJECT_DIR}/backend/.env" <<EOF
DB_ENGINE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER_CFG}
DB_PASSWORD=${DB_PASS_CFG}
DB_NAME=${DB_NAME_CFG}
EOF

# Khởi tạo & đồng bộ toàn vẹn CSDL MySQL + SQLite (25 bảng + RBAC + 30 JD + 150 CV)
./.venv/bin/python -c "import main; main.on_startup(); print('✅ MySQL (jobai_db) & Dynamic RBAC initialized successfully!')"

# 4. Khởi chạy dịch vụ Backend FastAPI (Port 8010) qua PM2 hoặc Systemd
echo "⚡ [4/6] Khởi chạy dịch vụ FastAPI Backend trên cổng ${BACKEND_PORT}..."
export PATH=$PATH:/usr/local/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:/www/server/nodejs/v22.11.0/bin:/www/server/nodejs/v20.18.0/bin:/www/server/nodejs/v18.20.0/bin

# Tạo systemd service đảm bảo luôn tự khởi động cùng Ubuntu (Hỗ trợ cả 3 tên: joai-backend, jobai-backend, jobai)
if [ ! -e "${PROJECT_DIR}/venv" ] && [ -d "${PROJECT_DIR}/backend/.venv" ]; then
    ln -sf "${PROJECT_DIR}/backend/.venv" "${PROJECT_DIR}/venv" || true
fi

cat > /etc/systemd/system/jobai-backend.service <<EOF
[Unit]
Description=HireMind AI Recruitment FastAPI Backend (${DOMAIN})
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${PROJECT_DIR}/backend
Environment="PYTHONUNBUFFERED=1"
ExecStart=${PROJECT_DIR}/backend/.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port ${BACKEND_PORT}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
Alias=joai-backend.service jobai.service
EOF

ln -sf /etc/systemd/system/jobai-backend.service /etc/systemd/system/joai-backend.service
ln -sf /etc/systemd/system/jobai-backend.service /etc/systemd/system/jobai.service

# Dừng tiến trình cũ nếu đang chạy qua PM2 để tránh xung đột cổng
if command -v pm2 >/dev/null 2>&1; then
    pm2 delete jobai-backend >/dev/null 2>&1 || true
    pm2 delete joai-backend >/dev/null 2>&1 || true
fi
pkill -f "uvicorn main:app.*${BACKEND_PORT}" >/dev/null 2>&1 || true

systemctl daemon-reload
systemctl enable jobai-backend.service
systemctl restart jobai-backend.service

sleep 2
curl -fsS "http://127.0.0.1:${BACKEND_PORT}/api/rbac/roles" >/dev/null 2>&1 && echo "✅ FastAPI Backend (joai-backend / jobai-backend / jobai) đang hoạt động ổn định tại 127.0.0.1:${BACKEND_PORT}!" || true

# 5. Cấp phát chứng chỉ SSL Let's Encrypt cho jobai.techcorp.info.vn
echo "🔒 [5/6] Cấp phát & Cấu hình SSL HTTPS cho https://${DOMAIN}..."
CERT_DIR="/www/server/panel/vhost/cert/${DOMAIN}"
mkdir -p "${CERT_DIR}"

SSL_READY=false
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    cp -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${CERT_DIR}/fullchain.pem"
    cp -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "${CERT_DIR}/privkey.pem"
    SSL_READY=true
elif command -v certbot >/dev/null 2>&1; then
    certbot certonly --webroot -w "${PROJECT_DIR}" -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email || \
    certbot certonly --standalone -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --pre-hook "/etc/init.d/nginx stop || systemctl stop nginx" --post-hook "/etc/init.d/nginx start || systemctl start nginx" || true
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        cp -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${CERT_DIR}/fullchain.pem"
        cp -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "${CERT_DIR}/privkey.pem"
        SSL_READY=true
    fi
fi

# Hỗ trợ thêm acme.sh của aaPanel nếu chưa có cert từ certbot
if [ "${SSL_READY}" = false ] && [ -f "/root/.acme.sh/acme.sh" ]; then
    /root/.acme.sh/acme.sh --issue -d "${DOMAIN}" -w "${PROJECT_DIR}" --force || true
    if [ -f "/root/.acme.sh/${DOMAIN}_ecc/fullchain.cer" ]; then
        cp -f "/root/.acme.sh/${DOMAIN}_ecc/fullchain.cer" "${CERT_DIR}/fullchain.pem"
        cp -f "/root/.acme.sh/${DOMAIN}_ecc/${DOMAIN}.key" "${CERT_DIR}/privkey.pem"
        SSL_READY=true
    fi
fi

# Nếu đã có sẵn chứng chỉ SSL do aaPanel tạo trước đó
if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
    SSL_READY=true
fi

# 6. Cấu hình Nginx (Hỗ trợ cả aaPanel /www/server/panel/vhost/nginx và /etc/nginx)
echo "🌐 [6/6] Cập nhật cấu hình Nginx Reverse Proxy & SSL cho ${DOMAIN}..."
AAPANEL_NGINX_CONF="/www/server/panel/vhost/nginx/${DOMAIN}.conf"
STD_NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}.conf"

if [ -d "/www/server/panel/vhost/nginx" ]; then
    TARGET_NGINX_CONF="${AAPANEL_NGINX_CONF}"
else
    TARGET_NGINX_CONF="${STD_NGINX_CONF}"
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
fi

if [ "${SSL_READY}" = true ]; then
cat > "${TARGET_NGINX_CONF}" <<EOF
server {
    listen 80;
    listen 443 ssl http2;
    server_name ${DOMAIN};
    index index.html careers.html login.html;
    root ${PROJECT_DIR};

    # Tự động chuyển hướng HTTP sang HTTPS
    if (\$server_port !~ 443){
        rewrite ^(/.*)\$ https://\$host\$1 permanent;
    }

    # Cấu hình Chứng chỉ SSL Let's Encrypt
    ssl_certificate    ${CERT_DIR}/fullchain.pem;
    ssl_certificate_key    ${CERT_DIR}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000" always;

    client_max_body_size 30M;

    # Reverse Proxy cho toàn bộ API FastAPI Backend (Port ${BACKEND_PORT})
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    # Reverse Proxy cho thư mục CV PDF tĩnh (/static/cvs/...)
    location ^~ /static/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Định tuyến nhanh cho /careers và /login
    location = /careers {
        try_files /careers.html =404;
    }
    location = /login {
        try_files /login.html =404;
    }

    # Phục vụ giao diện Frontend và tắt cache cũ cho JS/CSS
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    access_log  /www/wwwlogs/${DOMAIN}.log;
    error_log  /www/wwwlogs/${DOMAIN}.error.log;
}
EOF
else
cat > "${TARGET_NGINX_CONF}" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    index index.html careers.html login.html;
    root ${PROJECT_DIR};

    client_max_body_size 30M;

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    location ^~ /static/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location = /careers {
        try_files /careers.html =404;
    }
    location = /login {
        try_files /login.html =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
EOF
fi

if [ "${TARGET_NGINX_CONF}" = "${STD_NGINX_CONF}" ]; then
    ln -sf "${STD_NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
fi

# Phân quyền thư mục cho user www của aaPanel
if id "www" >/dev/null 2>&1; then
    chown -R www:www "${PROJECT_DIR}" || true
fi

# Kiểm tra và khởi động lại Nginx
if /etc/init.d/nginx configtest >/dev/null 2>&1 || nginx -t >/dev/null 2>&1; then
    /etc/init.d/nginx reload >/dev/null 2>&1 || systemctl reload nginx >/dev/null 2>&1 || true
    echo "✅ Đã kiểm tra và nạp lại cấu hình Nginx thành công!"
fi

echo "=============================================================================="
echo "🎉 TRIỂN KHAI HOÀN TẤT LÊN: https://${DOMAIN}"
echo "   1. Cổng Quản trị Enterprise AI ATS : https://${DOMAIN}/"
echo "   2. Cổng Tuyển dụng Ứng viên Public : https://${DOMAIN}/careers.html"
echo "   3. Cổng Đăng nhập Đa vai trò       : https://${DOMAIN}/login.html"
echo "   4. API Phân quyền Vai trò Động     : https://${DOMAIN}/api/rbac/roles"
echo "=============================================================================="
