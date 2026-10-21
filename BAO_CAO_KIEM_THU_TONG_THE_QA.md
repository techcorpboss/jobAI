# 📋 BÁO CÁO KIỂM THỬ TỔNG THỂ HỆ THỐNG (COMPREHENSIVE QA & SECURITY AUDIT REPORT)

- **Tên dự án**: Hệ sinh thái Tuyển dụng & Đánh giá Nhân sự Đa quốc gia **HireMind AI Enterprise (Multi-Tenant ATS & Two-Sided Career Marketplace)**
- **Phiên bản kiểm thử**: `v2026.10.21-Enterprise-Release`
- **Vai trò thực hiện**: Senior QA Automation & Application Security Engineer (ISTQB Expert / OWASP ASVS L2)
- **Ngày lập báo cáo**: 21/10/2026
- **Môi trường kiểm thử**:
  - **Backend API**: FastAPI (Python 3.14) + SQLite/MySQL Dual-Engine (`backend/main.py`, 22 bảng dữ liệu chuẩn hóa)
  - **AI Engine**: Cổng AI `https://motapis.com/v1` (`claude-sonnet-4-6` Primary + `DeepSeek-V4-Flash-0731` Fallback)
  - **Frontend Portal**: Quản trị ATS Đa Tầng (`/index.html`), Cổng Việc làm Hai Chiều B2B/B2C (`/careers.html`), Trung tâm Đăng nhập & Bảo mật (`/login.html`)
- **Tổng số kịch bản kiểm thử (Test Cases)**: **100 Test Cases (Thực thi tự động End-to-End)**
- **Kết quả đạt được**: **100 / 100 PASS (Tỷ lệ đạt: 100.0%)**

---

## 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Đợt kiểm thử tổng thể được thực hiện từ những khâu nhỏ nhất của giao diện (input, autocomplete, nút bấm ẩn/hiện, bộ nhớ đệm BFCache trình duyệt) cho đến tầng cơ sở dữ liệu (ràng buộc khóa, cô lập `org_id` Multi-Tenant, băm mật khẩu mật mã học) và toàn bộ vòng đời nghiệp vụ **Xem (Read) – Thêm mới (Create) – Sửa (Update) – Xoá (Delete) – In ấn (Print ISO/PDF) – Xuất/Nhập Excel (CSV/XLS UTF-8 BOM)**.

| Hạng mục Kiểm thử | Số lượng Test Case | Đạt (PASS) | Lỗi (FAIL) | Tỷ lệ Đạt | Đánh giá Chất lượng |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Đăng nhập, Đăng xuất, Mã hóa Mật khẩu & Chốt chặn Route (Auth Guard)** | 14 | 14 | 0 | **100%** | Đạt chuẩn OWASP / NIST SP 800-132 |
| **2. Kiểm thử Ma trận Phân quyền Động theo Từng Vai trò (7 Vai trò RBAC)** | 11 | 11 | 0 | **100%** | Phân tách đặc quyền & phạm vi dữ liệu chặt chẽ |
| **3. Kiểm thử CRUD Toàn diện 13 Phân hệ Nghiệp vụ (Xem, Thêm, Sửa, Xoá)** | 64 | 64 | 0 | **100%** | Đồng bộ tức thời SQLite/MySQL 2 chiều |
| **4. Kiểm thử In ấn (5 Biểu mẫu ISO 9001:2015 & Báo cáo A4) + Xuất/Nhập Excel** | 11 | 11 | 0 | **100%** | Đầy đủ trên toàn bộ 11 trang quản trị & Public |
| **TỔNG CỘNG TOÀN HỆ THỐNG** | **100** | **100** | **0** | **100.0%** | **SẴN SÀNG VẬN HÀNH THƯƠNG MẠI (PRODUCTION READY)** |

---

## 2. KIỂM THỬ BẢO MẬT ĐĂNG NHẬP, ĐĂNG XUẤT, SESSION & MÃ HÓA MẬT KHẨU

### 2.1. Kiểm thử Mã hóa Mật khẩu & Xác thực phía Server (`backend/main.py`)
- **Thuật toán áp dụng**: `PBKDF2-HMAC-SHA256` với **260.000 vòng lặp (iterations)** và **Muối ngẫu nhiên 128-bit (16 bytes cryptographic salt)** cho từng tài khoản riêng biệt.
- **So sánh chống tấn công thời gian (Timing Attack Protection)**: Sử dụng `hmac.compare_digest()` khi đối chiếu chuỗi băm mật khẩu.
- **Cơ chế cấp phát Session Token**: Khi đăng nhập thành công, Backend sinh chuỗi token có chữ ký số HMAC-SHA256 (`hm_jwt.<payload_base64>.<hmac_sha256_signature>`).

### 2.2. Bảng Kết quả Kiểm thử Chi tiết Khâu Login / Logout & Route Security

| Mã TC | Vai trò Kiểm thử | Kịch bản Kiểm thử Chi tiết | Đầu vào / Hành động | Kết quả Thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-AUTH-01` | Anonymous | Đăng nhập để trống cả Email & Mật khẩu | `POST /api/auth/login` `{"email": "", "password": ""}` | Chặn `HTTP 401`: *"Vui lòng nhập đầy đủ Email và Mật khẩu đăng nhập."* | ✅ **PASS** |
| `TC-AUTH-02` | Candidate | Đăng nhập chỉ nhập Email, bỏ trống Mật khẩu | `POST /api/auth/login` `{"email": "minhhoang.exec@hiremind.vn", "password": ""}` | Chặn `HTTP 401`: Không cho phép đăng nhập không mật khẩu | ✅ **PASS** |
| `TC-AUTH-03` | Candidate | Đăng nhập sai mật khẩu | `POST /api/auth/login` `{"email": "minhhoang.exec@hiremind.vn", "password": "wrong"}` | Chặn `HTTP 401`: *"Mật khẩu đăng nhập không chính xác."* | ✅ **PASS** |
| `TC-AUTH-04` | Anonymous | Đăng nhập bằng Email không tồn tại | `POST /api/auth/login` `{"email": "ghost@hiremind.vn", "password": "123456"}` | Chặn `HTTP 401`: *"Không tìm thấy tài khoản với Email này."* | ✅ **PASS** |
| `TC-AUTH-05` | Candidate (B2C) | Đăng nhập tài khoản Ứng viên VIP | `minhhoang.exec@hiremind.vn` | `HTTP 200`, `role=candidate`, cấp `session_token` hợp lệ, điều hướng về `/careers.html` | ✅ **PASS** |
| `TC-AUTH-06` | Candidate (B2C) | Đăng nhập tài khoản Ứng viên Khối FDI | `baongoc.fdi@hiremind.vn` | `HTTP 200`, `role=candidate`, khôi phục đúng hồ sơ CV & ngành nghề ưu tiên | ✅ **PASS** |
| `TC-AUTH-07` | Employer B2B | Đăng nhập Nhà tuyển dụng TechVina (`TENANT-VN-01`) | `hr.director@techvina.vn` | `HTTP 200`, `role=employer`, cô lập dữ liệu `org_id=TENANT-VN-01` | ✅ **PASS** |
| `TC-AUTH-08` | Employer FDI | Đăng nhập Nhà tuyển dụng Nhật Bản (`TENANT-JP-02`) | `sato.kenji@sakura-fdi.co.jp` | `HTTP 200`, `role=employer`, cô lập dữ liệu `org_id=TENANT-JP-02` | ✅ **PASS** |
| `TC-AUTH-09` | Super Admin | Đăng nhập Quản trị Tối cao Toàn Tập đoàn | `hr.director@hiremind.vn` / `superadmin@hiremind.vn` | `HTTP 200`, `org_id=ALL`, `rbac_role_id=hr_admin`, cấp quyền truy cập 15/15 phân hệ | ✅ **PASS** |
| `TC-AUTH-10` | Super Admin | Chặn đăng nhập Super Admin khi sai mật khẩu | `hr.director@hiremind.vn` + mật khẩu sai | Chặn `HTTP 401` tuyệt đối (đã xóa bỏ cơ chế bypass cũ) | ✅ **PASS** |
| `TC-AUTH-11` | Auditor / DPO | Kiểm toán mã hóa mật khẩu toàn hệ thống | `GET /api/auth/security-audit` | `100%` tài khoản (`10/10`) được băm chuẩn `PBKDF2-HMAC-SHA256` (`260,000` vòng lặp) | ✅ **PASS** |
| `TC-FE-01` | Anonymous / Candidate | Chặn truy cập trực tiếp trang Quản trị `/index.html` khi chưa đăng nhập hoặc đã đăng xuất | Truy cập `/index.html` hoặc nhấn nút Back trình duyệt sau khi Logout | Script `enforceAtsAuthGuard()` trong `<head>` lập tức chuyển hướng về `/login.html?role=admin_ats&auth_required=1`. Ứng viên B2C cố vào `/index.html` bị đẩy về `/careers.html?portal_notice=candidate_only` | ✅ **PASS** |
| `TC-FE-02` | All Roles | Kiểm tra ô nhập liệu `/login.html` và dọn sạch phiên khi Đăng xuất | Mở `/login.html` & bấm nút **Đăng xuất** | Ô Email và Password mặc định rỗng (`value=""`, `autocomplete="off"`), không điền sẵn tài khoản. Khi Logout xóa sạch toàn bộ khóa `localStorage` & `sessionStorage` | ✅ **PASS** |
| `TC-FE-03` | Public Visitor | Kiểm tra hành vi sau khi Logout rồi bấm **"Cổng Việc làm Public"** | Đăng xuất -> Mở `/careers.html` | Hệ thống nhận diện trạng thái khách vãng lai (Guest), hiển thị nút **"🔐 Đăng nhập / Đăng ký"**; ẩn hoàn toàn các nút **"⚙️ Quản trị ATS"**, **"📢 Tạo QC"** và link ATS dưới Footer | ✅ **PASS** |

---

## 3. KIỂM THỬ CHI TIẾT TỪNG VAI TRÒ NGƯỜI DÙNG (ROLE-BY-ROLE RBAC VERIFICATION)

Hệ thống phân quyền động (**Dynamic Role-Based Access Control - RBAC**) đã được kiểm thử chi tiết trên cả 7 vai trò chuẩn doanh nghiệp:

| Mã TC | Mã Vai trò (`role_id`) | Tên Vai trò & Phạm vi Dữ liệu (`data_scope`) | Các Phân hệ Được phép Truy cập (`allowed_tabs`) | Quyền Thao tác Chi tiết (`permissions`) | Kết quả Kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-RBAC-01` | `ALL_ROLES` | Kiểm tra danh sách 7 vai trò hệ thống (`GET /api/rbac/roles`) | Toàn bộ 7 vai trò đồng bộ từ bảng `rbac_roles` | Trả về đầy đủ cấu hình JSON & số lượng thành viên | ✅ **PASS** |
| `TC-RBAC-02` | `hr_admin` | **👑 Super Admin / HR Director**<br>Phạm vi: `ALL_TENANTS` (Toàn bộ 6 Tập đoàn) | **15/15 Tab**: `dashboard`, `requisitions`, `jobs`, `pipeline`, `interviews`, `assessments`, `compare`, `offers`, `talent_pool`, `analytics`, `tenants`, `products`, `users`, `rbac_roles`, `categories` | `can_create=✔`, `can_edit=✔`, `can_delete=✔`, `can_approve=✔`, `can_ai_evaluate=✔`, `can_view_pii=✔`, `can_export=✔`, `can_manage_rbac=✔` | ✅ **PASS** |
| `TC-RBAC-03` | `hiring_manager` | **🏢 Giám đốc Tuyển dụng Khối (Hiring Manager)**<br>Phạm vi: `DEPARTMENT_ONLY` | **6 Tab**: `dashboard`, `requisitions`, `jobs`, `interviews`, `assessments`, `compare` | Tạo yêu cầu định biên, chấm điểm phỏng vấn, đối sánh ứng viên, ghi đè điểm AI (Human-in-the-loop). Không có quyền xóa dữ liệu gốc hoặc sửa RBAC | ✅ **PASS** |
| `TC-RBAC-04` | `ta_recruiter` | **🎯 Chuyên viên Tuyển dụng (TA Recruiter)**<br>Phạm vi: `OWN_TENANT` | **8 Tab**: `dashboard`, `jobs`, `pipeline`, `interviews`, `assessments`, `compare`, `talent_pool`, `categories` | Đăng tin JD, sàng lọc CV AI, kéo thả Kanban, đặt lịch phỏng vấn, xuất Excel/In biểu mẫu. Chặn quyền xóa trái phép & chặn cấu hình hệ thống | ✅ **PASS** |
| `TC-RBAC-05` | `cb_specialist` | **💰 Chuyên viên Lương & Phúc lợi (C&B Specialist)**<br>Phạm vi: `OWN_TENANT` | **5 Tab**: `dashboard`, `requisitions`, `offers`, `analytics`, `products` | Tính lương Gross ⇄ Net, lập & điều chỉnh thư mời nhận việc (Offer Letter), theo dõi Onboarding 30-60-90 ngày | ✅ **PASS** |
| `TC-RBAC-06` | `auditor_dpo` | **🛡️ Kiểm toán Bảo mật & DPO (Data Protection Officer)**<br>Phạm vi: `ALL_TENANTS` | **5 Tab**: `dashboard`, `pipeline`, `compare`, `analytics`, `rbac_roles` | Chế độ Chỉ đọc (`Read-Only`) + Kiểm toán nhật ký bất biến (`audit_logs`) + Kiểm tra chế độ Ẩn danh chống thiên kiến (`Blind Screening Mode` che giấu PII) | ✅ **PASS** |
| `TC-RBAC-07` | `candidate_portal` | **👨‍💼 Ứng viên (Candidate Self-Service Portal)**<br>Phạm vi: `SELF_ONLY` | Chỉ truy cập `/careers.html` & Phòng phỏng vấn `/interview/{token}` | Tìm việc, nộp CV 1 chạm, làm bài phỏng vấn giọng nói AI đa ngôn ngữ, tính lương Gross-Net, tra cứu tiến độ 5 bước. Bị chặn hoàn toàn khỏi `/index.html` | ✅ **PASS** |
| `TC-RBAC-08..11` | `custom_role_*` | **Kiểm thử CRUD Vai trò Tùy chỉnh (Thêm / Sửa / Bật-Tắt Quyền / Xóa)** | Tạo vai trò `QA Automation Auditor Role` -> Sửa tên & phạm vi -> Toggle `can_delete=False` -> Xóa vai trò | Toàn bộ thao tác `POST`, `PUT`, `PATCH`, `DELETE /api/rbac/roles` hoạt động chính xác và ghi vết vào `audit_logs` | ✅ **PASS** |

---

## 4. KIỂM THỬ CHI TIẾT CHỨC NĂNG XEM – THÊM MỚI – SỬA – XOÁ (FULL CRUD) TRÊN 13 PHÂN HỆ

Tất cả các thực thể trong hệ thống đều đã được kiểm thử tự động chu trình khép kín: **Xem danh sách (GET) ➔ Thêm mới bản ghi (POST) ➔ Kiểm tra hiển thị ➔ Chỉnh sửa cập nhật (PUT/PATCH) ➔ Xoá bản ghi kiểm thử (DELETE)**.

### Phân hệ 1: Định biên & Yêu cầu Tuyển dụng (`hr_requisitions`)
- `TC-REQ-01` (**Xem**): `GET /api/hr-ops?org_id=ALL` — Trả về danh sách phiếu yêu cầu định biên kèm trạng thái phê duyệt. (**PASS**)
- `TC-REQ-02` (**Thêm mới**): `POST /api/hr-ops/requisitions` — Tạo mới phiếu `REQ-2026-05` (*QA Lead Engineer*, `headcount=3`). (**PASS**)
- `TC-REQ-03` (**Sửa**): `PUT /api/hr-ops/requisitions/REQ-2026-05` — Cập nhật tiêu đề & nâng định biên lên `headcount=5`, mức ngân sách `70 - 100 Triệu VNĐ`. (**PASS**)
- `TC-REQ-04` (**Phê duyệt**): `POST /api/hr-ops/requisitions/REQ-2026-05/approve` — Chuyển trạng thái sang `approved` kèm chữ ký số HRBP & CFO. (**PASS**)
- `TC-REQ-05` (**Xoá**): `DELETE /api/hr-ops/requisitions/REQ-2026-05` — Xoá phiếu thành công (`deleted=True`). (**PASS**)

### Phân hệ 2: Vị trí Tuyển dụng & AI JD Studio (`jobs`)
- `TC-JOB-01` (**Xem**): `GET /api/jobs?org_id=ALL` — Tải danh sách 33+ vị trí tuyển dụng kèm bộ lọc Multi-Tenant `org_id`. (**PASS**)
- `TC-JOB-02` (**AI Sinh JD**): `POST /api/jobs/generate-jd` — AI tự động biên soạn JD chuẩn quản lý cấp cao (1.130+ ký tự) kèm ma trận trọng số chấm điểm Rubric và bộ câu hỏi phỏng vấn STAR. (**PASS**)
- `TC-JOB-03` (**Thêm mới**): `POST /api/jobs` — Đăng tin tuyển dụng mới cho `TENANT-VN-01`, tự động đồng bộ sang cổng Việc làm Public `/careers.html`. (**PASS**)
- `TC-JOB-04` (**Sửa**): `PUT /api/jobs/{job_id}` — Chỉnh sửa chức danh, dải lương (`80 - 110 Triệu VNĐ`) và số năm kinh nghiệm tối thiểu (`6 năm`). (**PASS**)
- `TC-JOB-05` (**Xoá**): `DELETE /api/jobs/{job_id}` — Xoá vị trí tuyển dụng và dọn dẹp liên kết an toàn. (**PASS**)

### Phân hệ 3: Hồ sơ Ứng viên, Sàng lọc AI 4 Trụ cột & Bảng kéo thả Kanban (`applications`)
- `TC-APP-01` (**Xem đầy đủ PII**): `GET /api/applications?blind_mode=false` — Hiển thị đầy đủ 150+ hồ sơ ứng viên, điểm AI, email, số điện thoại và link CV PDF. (**PASS**)
- `TC-APP-02` (**Xem chế độ Ẩn danh Blind Mode**): `GET /api/applications?blind_mode=true` — Tự động che giấu tên thật thành mã ẩn danh (`MGR #JOB_20-R1`), ẩn email thành `hidden@blind-mode.vn` để chống thiên kiến tuyển dụng. (**PASS**)
- `TC-APP-03` (**Thêm mới & Chấm điểm CV bằng AI**): `POST /api/screening/upload` — Tải lên CV ứng viên mới, AI tự động bóc tách kỹ năng, kiểm tra chống trùng lặp SHA-256, quét tường lửa chống Prompt Injection và chấm điểm 4 trụ cột (`Must-have 40%`, `Semantic 30%`, `Experience 20%`, `Formatting 10%`). (**PASS**)
- `TC-APP-04` (**Sửa hồ sơ**): `PUT /api/applications/{app_id}` — Cập nhật thông tin ứng viên, điểm tổng hợp (`92.5`) và giai đoạn tuyển dụng. (**PASS**)
- `TC-APP-05` (**Chuyển bước Kanban**): `PATCH /api/applications/{app_id}/stage` — Kéo thả ứng viên sang cột `interview` và ghi nhật ký `audit_logs`. (**PASS**)
- `TC-APP-06` (**Ghi đè điểm Human-in-the-loop**): `POST /api/applications/{app_id}/override` — Giám đốc tuyển dụng ghi đè điểm (`95.0`) kèm lý do giải trình. (**PASS**)
- `TC-APP-07` (**Xoá hồ sơ**): `DELETE /api/applications/{app_id}` — Xoá hồ sơ ứng viên kiểm thử sạch sẽ khỏi các bảng liên quan. (**PASS**)

### Phân hệ 4: Lịch Phỏng vấn & Phòng Phỏng vấn Giọng nói AI Đa ngôn ngữ (`hr_schedules` & `interviews`)
- `TC-INT-01` (**Thêm mới lịch phỏng vấn**): `POST /api/hr-ops/schedules` — Đặt lịch phỏng vấn mới (`SCH-04`) kèm hội đồng phỏng vấn và nhắc lịch Zalo ZNS. (**PASS**)
- `TC-INT-02` (**Sửa lịch phỏng vấn**): `PUT /api/hr-ops/schedules/SCH-04` — Cập nhật tên vòng phỏng vấn và chuyển trạng thái `status=completed`. (**PASS**)
- `TC-INT-03` (**Xoá lịch phỏng vấn**): `DELETE /api/hr-ops/schedules/SCH-04` — Xoá lịch phỏng vấn thành công. (**PASS**)
- `TC-INT-04` (**Xem Phòng phỏng vấn AI**): `GET /api/interviews/tok_job_01_r1` — Tải kịch bản câu hỏi phỏng vấn và điểm từng lượt trả lời. (**PASS**)
- `TC-INT-05` (**Chấm điểm câu trả lời theo chuẩn STAR**): `POST /api/interviews/tok_job_01_r1/answer` — AI phân tích cấu trúc *Situation – Task – Action – Result*, chấm điểm và sinh câu hỏi đào sâu (Follow-up question). (**PASS**)

### Phân hệ 5: Sàn Kiểm tra Code/Ngoại ngữ Sandbox & Ma trận Đối sánh Ứng viên (`assessments` & `compare`)
- `TC-ASSESS-01` (**Chấm bài Code & Ngoại ngữ tự động**): `POST /api/hr-ops/sandbox-evaluate` — Thực thi đánh giá thuật toán Python Async (`95.0/100 điểm`, vượt qua `5/5 test cases`). (**PASS**)
- `TC-ASSESS-02` (**Xem Ma trận Đối sánh Ứng viên**): `GET /api/compare?job_id=job_01` — Đối sánh trực quan 5 ứng viên hàng đầu theo từng tiêu chí kỹ năng. (**PASS**)
- `TC-ASSESS-03` (**AI Tuyển chọn Top 1 Ứng viên Xuất sắc nhất**): `POST /api/jobs/job_01/evaluate-and-select-best` — Kết hợp `45% Điểm CV + 55% Điểm Phỏng vấn AI` để xếp hạng từ `#1` đến `#5` và đề xuất ứng viên `STRONG_HIRE`. (**PASS**)

### Phân hệ 6: Thư mời Nhận việc (Offer Letter), Tính lương Gross ⇄ Net & Onboarding 30-60-90 (`hr_offers`)
- `TC-OFFER-01` (**Tính lương Gross ⇄ Net chuẩn Luật Lao động VN**): `POST /api/hr-ops/gross-to-net` — Lương Gross `60.000.000 VNĐ` (1 người phụ thuộc, Vùng 1) ➔ Khấu trừ BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến ➔ Lương Net thực nhận `48.315.500 VNĐ`. (**PASS**)
- `TC-OFFER-02` (**Thêm mới Offer Letter**): `POST /api/hr-ops/offers` — Phát hành thư mời nhận việc mới (`OFF-2026-03`), tự động tính chỉ số `Compa-Ratio`. (**PASS**)
- `TC-OFFER-03` (**Sửa Offer Letter**): `PUT /api/hr-ops/offers/OFF-2026-03` — Điều chỉnh mức lương cơ bản lên `92.000.000 VNĐ` và cập nhật trạng thái `signed_onboarded`. (**PASS**)
- `TC-OFFER-04` (**Cập nhật tiến độ Onboarding 30-60-90**): `POST /api/hr-ops/offers/OFF-2026-03/toggle-task/0` — Đánh dấu hoàn thành hạng mục hội nhập nhân sự mới. (**PASS**)
- `TC-OFFER-05` (**Xoá Offer Letter**): `DELETE /api/hr-ops/offers/OFF-2026-03` — Xoá bản ghi Offer kiểm thử thành công. (**PASS**)

### Phân hệ 7: Quản trị Doanh nghiệp Thuê bao B2B Multi-Tenant (`saas_tenants`)
- `TC-TENANT-01` (**Xem danh sách Tập đoàn B2B**): `GET /api/saas/tenants` — Hiển thị 6 tập đoàn đa quốc gia (Việt Nam, Nhật Bản, Hàn Quốc, Thái Lan, Lào, Campuchia) kèm thống kê doanh thu MRR/ARR và hạn mức AI Token. (**PASS**)
- `TC-TENANT-02` (**Thêm mới Tập đoàn B2B**): `POST /api/saas/tenants` — Cấp phát không gian thuê bao mới (`TENANT-07`, gói `Enterprise Unlimited`). (**PASS**)
- `TC-TENANT-03` (**Sửa Tập đoàn B2B**): `PUT /api/saas/tenants/TENANT-07` — Nâng hạn mức `ai_quota_limit=100,000` và cấu hình SSO `Okta SAML 2.0`, tự động đồng bộ tên công ty sang bảng tài khoản nhà tuyển dụng. (**PASS**)
- `TC-TENANT-04` (**Xoá Tập đoàn B2B**): `DELETE /api/saas/tenants/TENANT-07` — Xoá thuê bao kiểm thử thành công. (**PASS**)

### Phân hệ 8: Quản trị Sản phẩm & Gói Dịch vụ VIP (`saas_products`)
- `TC-PROD-01` (**Xem danh sách Sản phẩm**): `GET /api/products` — Trả về 9 gói sản phẩm & dịch vụ tuyển dụng VIP kèm tổng doanh thu. (**PASS**)
- `TC-PROD-02` (**Thêm mới Sản phẩm**): `POST /api/products` — Tạo mới gói `PRD-NEW-10` (*Gói Kiểm thử AI Enterprise QA Suite*, giá `35.000.000 VNĐ`). (**PASS**)
- `TC-PROD-03` (**Sửa Sản phẩm**): `PUT /api/products/PRD-NEW-10` — Cập nhật giá bán (`42.000.000 VNĐ`), hạn mức `500.000 AI Tokens` và `100 Job Slots`. (**PASS**)
- `TC-PROD-04` (**Xoá Sản phẩm**): `DELETE /api/products/PRD-NEW-10` — Xoá gói sản phẩm kiểm thử thành công. (**PASS**)

### Phân hệ 9: Quản trị Tài khoản Thành viên B2B & B2C (`portal_users`)
- `TC-USER-01` (**Xem danh sách Thành viên & Kiểm tra che mật khẩu**): `GET /api/users` — Hiển thị danh sách thành viên, trường mật khẩu được che hoàn toàn thành `•••••••• (PBKDF2-SHA256)`, tuyệt đối không lộ mật khẩu gốc. (**PASS**)
- `TC-USER-02` (**Thêm mới Thành viên**): `POST /api/users` — Tạo mới tài khoản `USR-CAND-11` (`tranbao.qatest@hiremind.vn`), mật khẩu lập tức được mã hóa `PBKDF2-HMAC-SHA256`. (**PASS**)
- `TC-USER-03` (**Đăng nhập bằng Tài khoản vừa tạo**): `POST /api/auth/login` — Đăng nhập thành công với mật khẩu vừa tạo (`QaPassword@2026`). (**PASS**)
- `TC-USER-04` (**Sửa thông tin Thành viên**): `PUT /api/users/USR-CAND-11` — Nâng hạng VIP lên `CAND_VIP_EXEC` và cập nhật `10 năm` kinh nghiệm. (**PASS**)
- `TC-USER-05` (**Đổi mật khẩu người dùng**): `POST /api/auth/change-password` — Đổi mật khẩu từ `QaPassword@2026` sang `NewSecurePassword#2026`. (**PASS**)
- `TC-USER-06` (**Xác minh mật khẩu cũ bị vô hiệu hóa**): Đăng nhập bằng mật khẩu cũ trả về `HTTP 401`, đăng nhập bằng mật khẩu mới trả về `HTTP 200`. (**PASS**)
- `TC-USER-07` (**Xoá Thành viên**): `DELETE /api/users/USR-CAND-11` — Xoá tài khoản kiểm thử và thu hồi phân quyền RBAC liên quan. (**PASS**)

### Phân hệ 10: Quản trị Chiến dịch Quảng cáo Banner VIP (`ad_banners`)
- `TC-ADS-01` (**Xem danh sách Banner VIP**): `GET /api/ad-banners` — Trả về 8 chiến dịch quảng cáo (4 Hero Spotlight + 4 Banner Dọc 2 bên sườn Trái/Phải). (**PASS**)
- `TC-ADS-02` (**Thêm mới Banner Quảng cáo**): `POST /api/ad-banners` — Tạo chiến dịch mới `AD-VIP-09`. (**PASS**)
- `TC-ADS-03` (**Sửa Banner Quảng cáo**): `PUT /api/ad-banners/AD-VIP-09` — Đổi vị trí hiển thị sang `right_top` và cập nhật tiêu đề. (**PASS**)
- `TC-ADS-04` (**Bật/Tắt trạng thái hiển thị**): `POST /api/ad-banners/AD-VIP-09/toggle` — Chuyển đổi trạng thái `active` tức thời. (**PASS**)
- `TC-ADS-05` (**Đếm lượt Click & Impressions thực tế**): `POST /api/ad-banners/AD-VIP-09/click` — Tăng bộ đếm `clicks` và `impressions` chính xác. (**PASS**)
- `TC-ADS-06` (**Xoá Banner Quảng cáo**): `DELETE /api/ad-banners/AD-VIP-09` — Xoá chiến dịch kiểm thử thành công. (**PASS**)

### Phân hệ 11: Quản trị Danh mục Ngành nghề & 63 Tỉnh thành / Khu Công nghiệp (`job_categories` & `recruitment_locations`)
- `TC-CAT-01..04` (**CRUD Danh mục Ngành nghề**): Xem 17 ngành nghề ➔ Thêm mới ngành `cat_18` ➔ Sửa tên & trọng số AI ➔ Xoá ngành `cat_18`. Tự động đồng bộ tên phòng ban sang bảng `jobs` và `hr_requisitions`. (**PASS**)
- `TC-LOC-01..04` (**CRUD Tỉnh thành & Khu Công nghiệp FDI**): Xem 12 vùng kinh tế trọng điểm ➔ Thêm mới địa phương & KCN (`Quảng Ninh - KCN Đông Mai, Sông Khoai`) ➔ Sửa thông tin KCN ➔ Xoá địa phương kiểm thử. (**PASS**)

### Phân hệ 12 & 13: Cổng Việc làm Public (`/careers.html`) & Nhập dữ liệu hàng loạt từ Excel/CSV (`bulk-import`)
- `TC-PUB-01..03`: Xem dữ liệu Marketplace hai chiều (`GET /api/public/marketplace`), tra cứu tiến độ hồ sơ 5 bước (`GET /api/public/track`), và thống kê lưu lượng truy cập thời gian thực (`GET /api/public/traffic-stats`). (**PASS**)
- `TC-BULK-01..02`: Nhập hàng loạt vị trí tuyển dụng (`POST /api/bulk-import/jobs`) và nhập hàng loạt ứng viên kèm chấm điểm AI tự động (`POST /api/bulk-import/candidates`). (**PASS**)

---

## 5. KIỂM THỬ CHỨC NĂNG IN ẤN (PRINT ENGINE) & XUẤT/NHẬP EXCEL TRÊN TẤT CẢ CÁC TRANG

Hệ thống được trang bị **Universal Data Export, Import & Print Engine** (`frontend/public/app.js`), cung cấp thanh công cụ đồng nhất (**🖨️ In trang này**, **📊 Xuất Excel (.xls)**, **📥 Nhập Excel/CSV**) trên toàn bộ 11 phân hệ quản trị cũng như Trung tâm In 5 Biểu mẫu Chuẩn ISO 9001:2015:

| Mã TC | Chức năng In ấn & Xuất/Nhập Excel | Hàm Thực thi Chính (`app.js`) | Phạm vi Áp dụng | Kết quả Kiểm thử |
| :--- | :--- | :--- | :--- | :---: |
| `TC-PRINT-01` | **In 5 Biểu mẫu Tuyển dụng Chuẩn ISO 9001:2015** (Phiếu Yêu cầu Định biên, Phiếu Đánh giá Phỏng vấn STAR, Báo cáo Đối sánh Ứng viên, Thư mời Nhận việc Offer Letter, Danh mục Kiểm tra Hội nhập Onboarding) | `printStandardEnterpriseForm()` | Toàn hệ thống ATS (Khổ A4 dọc/ngang, Quốc hiệu Tiêu ngữ, khung chữ ký số) | ✅ **PASS** |
| `TC-PRINT-02` | **In Báo cáo Động cho Tất cả 11 Trang Phân hệ Quản trị** | `printActivePageReport()` | Requisitions, Jobs, Pipeline, Interviews, Assessments, Compare, Offers, Tenants, Products, Users, Categories | ✅ **PASS** |
| `TC-PRINT-03` | **Xuất & In Hồ sơ Đánh giá Ứng viên Chuyên sâu (PDF/A4)** | `exportCandidatePDF()` | Hồ sơ chi tiết từng ứng viên & kết quả phỏng vấn giọng nói AI | ✅ **PASS** |
| `TC-PRINT-04` | **Trung tâm Chọn & Xem trước Biểu mẫu In ấn Doanh nghiệp** | `openPrintCenterModal()` | Giao diện chọn nhanh biểu mẫu cần in từ bất kỳ màn hình nào | ✅ **PASS** |
| `TC-PRINT-05` | **Bộ Trích xuất & Chuẩn hóa Dữ liệu Đa Phân hệ cho In ấn** | `getModuleDatasetForExportAndPrint()` | Tự động ánh xạ cột tiếng Việt chuẩn xác cho từng trang đang mở | ✅ **PASS** |
| `TC-EXCEL-01` | **Xuất Excel (`.xls` chuẩn UTF-8 BOM hiển thị đúng Tiếng Việt/Nhật/Hàn)** cho từng trang đang mở | `exportActivePageExcel()` | Toàn bộ 11 phân hệ Quản trị ATS | ✅ **PASS** |
| `TC-EXCEL-02` | **Xuất Báo cáo Đa Sheet Toàn Hệ thống (Multi-Sheet Executive Excel)** | `exportMultiSheetExcel()` | Kết xuất tổng hợp Jobs + Candidates + Offers + Tenants + Products + Users | ✅ **PASS** |
| `TC-EXCEL-03` | **Xuất Danh sách Ứng viên & Điểm AI ra CSV/Excel** | `exportCandidatesCSV()` | Phân hệ Sàng lọc CV & Kanban Pipeline | ✅ **PASS** |
| `TC-EXCEL-04` | **Hộp thoại Nhập Dữ liệu Hàng loạt (Universal Bulk Import Excel/CSV)** | `openUniversalBulkImportModal()` | Hỗ trợ tải file `.csv/.txt` hoặc dán trực tiếp từ bảng tính Excel | ✅ **PASS** |
| `TC-EXCEL-05` | **Tải File Mẫu Excel/CSV Chuẩn cho Từng Phân hệ** | `downloadUniversalImportTemplate()` | Cung cấp file mẫu đúng cấu trúc cột cho từng trang | ✅ **PASS** |
| `TC-EXCEL-06` | **Thực thi Đồng bộ Dữ liệu Nhập Excel vào SQLite/MySQL** | `submitUniversalBulkImport()` | Lưu bền vững xuống Database và làm mới giao diện tức thời | ✅ **PASS** |

---

## 6. CÁC PHÁT HIỆN KỸ THUẬT ĐÃ ĐƯỢC KHẮC PHỤC TRIỆT ĐỂ TRONG ĐỢT KIỂM THỬ

Trong quá trình kiểm thử hộp trắng (White-box) và hộp đen (Black-box), đội ngũ QA đã phát hiện và khắc phục ngay **04 điểm lỗi/tiềm ẩn** để đưa tỷ lệ 통과 (Pass Rate) lên tuyệt đối **100%**:

1. **[Đã khắc phục - Bảo mật Phiên đăng nhập & Đăng xuất (`login.html`, `index.html`, `careers.js`, `main.py`)]**:
   - **Hiện tượng cũ**: Sau khi đăng xuất về `/login.html`, nếu bấm chuyển sang `/careers.html` hoặc nhấn nút Back, hệ thống vẫn lưu trạng thái tài khoản cũ hoặc hiển thị nút vào thẳng trang Quản trị ATS mà không yêu cầu đăng nhập lại; form `/login.html` từng điền sẵn mật khẩu mặc định.
   - **Giải pháp đã xử lý**: Xóa toàn bộ giá trị điền sẵn trên `/login.html`; bổ sung hàm dọn sạch toàn diện `localStorage`/`sessionStorage` khi Logout; gắn chốt chặn đồng bộ `enforceAtsAuthGuard()` ngay trong `<head>` của `/index.html` (kèm sự kiện `pageshow` chống BFCache); ẩn toàn bộ liên kết Quản trị ATS trên `/careers.html` khi chưa đăng nhập tài khoản Employer/Admin hợp lệ.
2. **[Đã khắc phục - Đồng bộ hàm ghi Nhật ký Kiểm toán RBAC (`backend/main.py`)]**:
   - **Hiện tượng cũ**: Các API tạo/sửa vai trò RBAC gọi `log_audit(...)` thay vì `_log_audit(...)`.
   - **Giải pháp đã xử lý**: Đồng bộ định danh `_log_audit` và hỗ trợ đồng thời cả hai phương thức `PUT` và `PATCH` cho API `/api/rbac/roles/{role_id}/toggle-permission`.
3. **[Đã khắc phục - Bổ sung đầy đủ API Sửa/Xoá Lịch Phỏng vấn (`backend/main.py`)]**:
   - **Giải pháp đã xử lý**: Bổ sung trọn bộ `PUT /api/hr-ops/schedules/{sch_id}` và `DELETE /api/hr-ops/schedules/{sch_id}` để phân hệ Lịch phỏng vấn đạt 100% CRUD giống các phân hệ khác.
4. **[Đã khắc phục - Chuẩn hóa tham số `org_id` khi gọi nội bộ (`backend/main.py`)]**:
   - **Giải pháp đã xử lý**: Chuẩn hóa kiểm tra kiểu dữ liệu `isinstance(org_id, str)` trong `list_jobs`, `list_applications` và `get_dashboard`, giúp API đối sánh ứng viên `GET /api/compare` hoạt động mượt mà trong mọi ngữ cảnh gọi.

---

## 7. KẾT LUẬN & KHUYẾN NGHỊ VẬN HÀNH

1. **Đánh giá Tổng thể**: Dự án **HireMind AI Enterprise** đã vượt qua **100/100 kịch bản kiểm thử chi tiết** ở cả tầng Giao diện (Frontend), Tầng Giao tiếp API (RESTful Backend), Tầng Cơ sở dữ liệu (SQLite/MySQL) và Tầng Bảo mật Xác thực (`PBKDF2-HMAC-SHA256` + `RBAC` + `Multi-Tenant Isolation`).
2. **Tập tin Kịch bản Kiểm thử Tự động**: Lưu tại `tests/qa_full_test_suite.py` (có thể chạy lại bất kỳ lúc nào bằng lệnh `python tests/qa_full_test_suite.py` để kiểm thử hồi quy trước mỗi lần cập nhật).
