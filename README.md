# HireMind AI Vietnam — Nền tảng Quản lý Tuyển dụng & Phỏng vấn bằng AI Đa Ngôn Ngữ

Ứng dụng Web Quản lý Tuyển dụng (ATS), Sàng lọc CV bằng AI Đa ngôn ngữ (`pgvector` + LLM) và Phòng Phỏng vấn AI Thích ứng (Voice STT/TTS & Text) được thiết kế chuyên biệt cho **thị trường Việt Nam & khối doanh nghiệp FDI (Việt • Anh • Nhật • Hàn • Trung)**, tuân thủ **Nghị định 13/2023/NĐ-CP** và nguyên tắc **Human-in-the-loop**.

---

## 1. Cấu trúc Dự án

```text
Tuyendung/
├── docker-compose.yml                  # Triển khai Docker (PostgreSQL 16 + pgvector, Redis 7, MinIO S3, Backend, Frontend)
├── Ke hoach trien khai tuyen dung AI.docx
├── backend/
│   ├── main.py                         # FastAPI Server (REST API cho ATS, AI Screening, AI Interview, Fairness Audit)
│   ├── ai_engine.py                    # Pipeline AI 3 Tầng: Parse PDF/DOCX, Anti-Prompt Injection, Semantic Vector, Rubric
│   ├── database.py                     # Quản lý CSDL Multi-tenant & Dữ liệu mẫu thực tế tại Việt Nam (FDI Nhật/Hàn & Tech)
│   ├── schema_postgres_pgvector.sql    # Schema PostgreSQL 16 + pgvector kèm Row-Level Security (RLS) theo org_id
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── server.js                       # Web Server cổng 3000
    ├── package.json
    ├── Dockerfile
    └── public/
        ├── index.html                  # Giao diện Đa ngôn ngữ (Dark/Light mode, Responsive WCAG 2.1 AA)
        └── app.js                      # Logic 6 phân hệ: Dashboard, Kanban & Upload CV, AI JD, Phòng Phỏng vấn AI, Rubric, ROI
```

---

## 2. Hướng dẫn Chạy Nhanh (Local Windows / Linux)

### Bước 1: Khởi động Backend (FastAPI - Cổng 8010)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8010 --reload
```
* Tài liệu Swagger API tự động: `http://localhost:8010/docs`

### Bước 2: Khởi động Frontend (Web App - Cổng 3009)
```bash
cd frontend
node server.js
```
* Mở trình duyệt tại: `http://localhost:3009`

### Chạy bằng Docker Compose (Ubuntu Production / Cloud)
```bash
docker compose up --build -d
```
Cấu hình đầy đủ gồm PostgreSQL 16 (`pgvector` + Row-Level Security), Redis 7, MinIO S3 (`:9000`/`:9001`), Backend (`:8010`) và Frontend (`:3009`).
