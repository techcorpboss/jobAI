# -*- coding: utf-8 -*-
"""
Script khởi tạo dữ liệu quy mô lớn cho HireMind Enterprise:
- 30 Tin tuyển dụng (Jobs) cho vai trò Quản lý Cấp trung (Middle Management) & Quản lý Cao cấp (Senior/Executive Management)
  thuộc 10 lĩnh vực hàng đầu tại Việt Nam (3 vị trí x 10 lĩnh vực = 30 Jobs).
- 150 Hồ sơ Ứng viên (5 CV cho mỗi tin tuyển dụng = 150 CVs) kèm 150 file PDF đính kèm thực tế tại backend/static/cvs/.
- Chấm điểm Sàng lọc AI, Phỏng vấn AI chuyên sâu và Đánh giá Lựa chọn Ứng viên Phù hợp Nhất (Top 1 Best Fit) cho từng vị trí.
"""

import json
import os
import sqlite3
import unicodedata
from datetime import datetime, timezone
from typing import Any, Dict, List

from ai_engine import compute_content_hash
from database import DB_PATH, DEFAULT_ORG_ID, init_db, now_iso

STATIC_CV_DIR = os.path.join(os.path.dirname(__file__), "static", "cvs")


def remove_accents(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    cleaned = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return cleaned.replace("đ", "d").replace("Đ", "D")


def generate_valid_pdf_bytes(lines: List[str]) -> bytes:
    """
    Tạo file PDF 1.4 hợp lệ (nhiều dòng văn bản định dạng rõ ràng) không phụ thuộc thư viện ngoài.
    """
    safe_lines = []
    for line in lines:
        ascii_line = remove_accents(line)
        ascii_line = (
            ascii_line.replace("\\", "\\\\")
            .replace("(", "\\(")
            .replace(")", "\\)")
        )
        safe_lines.append(ascii_line[:105])

    content_ops = ["BT", "/F1 10 Tf", "45 790 Td", "14 TL"]
    for idx, l in enumerate(safe_lines[:50]):
        if idx == 0:
            content_ops.append(f"/F2 13 Tf ({l}) Tj /F1 10 Tf")
        elif l.startswith("===") or l.startswith("---"):
            content_ops.append(f"T* /F2 10 Tf ({l}) Tj /F1 10 Tf")
        else:
            content_ops.append(f"T* ({l}) Tj")
    content_ops.append("ET")
    stream_data = "\n".join(content_ops).encode("latin-1", errors="ignore")

    objs: List[bytes] = []
    objs.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objs.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objs.append(
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n"
    )
    objs.append(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    objs.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    objs.append(
        f"6 0 obj\n<< /Length {len(stream_data)} >>\nstream\n".encode("latin-1")
        + stream_data
        + b"\nendstream\nendobj\n"
    )

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for o in objs:
        offsets.append(len(out))
        out.extend(o)

    xref_pos = len(out)
    out.extend(f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode("latin-1"))
    for off in offsets:
        out.extend(f"{off:010d} 00000 n \n".encode("latin-1"))

    out.extend(
        f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
            "latin-1"
        )
    )
    return bytes(out)


# 30 Tin tuyển dụng thuộc 10 lĩnh vực hàng đầu Việt Nam (Quản lý cấp trung & Quản lý cao cấp)
TOP_30_JOBS: List[Dict[str, Any]] = [
    # 1. CÔNG NGHỆ THÔNG TIN, AI & PHẦN MỀM
    {
        "id": "job_01",
        "sector": "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Kỹ thuật & Trí tuệ Nhân tạo (VP of Engineering & AI)",
        "department": "Khối Công nghệ & AI (IT & AI Division)",
        "location": "TP. Hồ Chí Minh / Hà Nội",
        "salary_range": "85 - 140 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["AI / LLM / RAG", "Python", "FastAPI", "Docker / Kubernetes", "PostgreSQL / SQL"],
        "nice_skills": ["English Ielts/Toeic"],
        "jd": "Điều hành toàn bộ khối Kỹ thuật & AI gồm 120 kỹ sư; hoạch định kiến trúc Microservices, nền tảng LLM/RAG đa ngôn ngữ và chịu trách nhiệm SLA 99.99%, tối ưu chi phí hạ tầng Cloud/GPU cho tập đoàn.",
        "questions": [
            {"competency": "Chiến lược Kiến trúc & Quy mô Hệ thống", "question": "Anh/Chị đã từng thiết kế và điều hành kiến trúc AI/Cloud phục vụ hàng triệu người dùng với SLA 99.99% như thế nào? Hãy nêu số liệu tối ưu chi phí thực tế."},
            {"competency": "Quản trị Đội ngũ Kỹ thuật Cấp cao", "question": "Cách Anh/Chị xây dựng KPIs (DORA metrics) và tổ chức các phòng ban Engineering, Data, MLOps trên 100 nhân sự để rút ngắn Time-to-Market?"},
            {"competency": "Bảo mật Dữ liệu & Tuân thủ", "question": "Anh/Chị triển khai cơ chế chống Prompt Injection, bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và ISO 27001 ra sao?"},
        ],
    },
    {
        "id": "job_02",
        "sector": "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Phát triển Phần mềm & Nền tảng Số (Engineering Manager)",
        "department": "Khối Công nghệ & AI (IT & AI Division)",
        "location": "Hà Nội",
        "salary_range": "50 - 78 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Python", "FastAPI", "React / Next.js", "PostgreSQL / SQL", "Docker / Kubernetes"],
        "nice_skills": ["AI / LLM / RAG"],
        "jd": "Quản lý trực tiếp 3 Squad phát triển sản phẩm SaaS/FinTech (25-35 kỹ sư); kiểm soát chất lượng mã nguồn, CI/CD, kiến trúc cơ sở dữ liệu và tiến độ bàn giao Sprint.",
        "questions": [
            {"competency": "Quản lý Dự án Agile & Chất lượng Code", "question": "Anh/Chị xử lý nợ kỹ thuật (Technical Debt) và đảm bảo tốc độ phát triển tính năng của 3 Squad cùng lúc như thế nào?"},
            {"competency": "Tối ưu Hiệu năng Hệ thống", "question": "Hãy chia sẻ một tình huống hệ thống bị nghẽn cổ chai ở tầng Database/API và cách Anh/Chị chỉ đạo đội ngũ xử lý triệt để."},
            {"competency": "Phát triển Nhân tài Kỹ thuật", "question": "Anh/Chị đánh giá năng lực và giữ chân các Senior Engineer chủ chốt trong giai đoạn dự án cao điểm bằng phương pháp nào?"},
        ],
    },
    {
        "id": "job_03",
        "sector": "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Chuyển đổi Số & Quản trị Dữ liệu (Head of Digital Transformation & Data)",
        "department": "Khối Công nghệ & AI (IT & AI Division)",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "75 - 120 Triệu VNĐ",
        "min_exp": 7.0,
        "skills": ["AI / LLM / RAG", "PostgreSQL / SQL", "Bridge SE / BA", "English Ielts/Toeic"],
        "nice_skills": ["Python"],
        "jd": "Chủ trì lộ trình chuyển đổi số toàn tập đoàn, xây dựng Enterprise Data Lakehouse, hệ thống BI/AI tự động hóa quy trình vận hành ERP/CRM và báo cáo trực tiếp cho Tổng Giám đốc.",
        "questions": [
            {"competency": "Hoạch định Lộ trình Chuyển đổi Số", "question": "Anh/Chị đo lường chỉ số ROI thực tế của các dự án Chuyển đổi Số và Data Warehouse ở quy mô tập đoàn như thế nào?"},
            {"competency": "Quản trị Thay đổi Liên phòng ban", "question": "Khi triển khai ERP/AI mới gặp sự kháng cự từ các khối vận hành truyền thống, Anh/Chị giải quyết và thuyết phục các bên ra sao?"},
            {"competency": "Quản trị & Khai thác Dữ liệu Lớn", "question": "Anh/Chị thiết lập khung Data Governance và chất lượng dữ liệu phục vụ báo cáo điều hành thời gian thực như thế nào?"},
        ],
    },

    # 2. TÀI CHÍNH - NGÂN HÀNG - ĐẦU TƯ
    {
        "id": "job_04",
        "sector": "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Khối Quản trị Rủi ro Tín dụng & Basel III (Head of Credit Risk)",
        "department": "Khối Tài chính - Ngân hàng (Banking & Finance)",
        "location": "Hà Nội",
        "salary_range": "90 - 150 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["PostgreSQL / SQL", "AI / LLM / RAG", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["Python"],
        "jd": "Chỉ đạo toàn diện công tác quản trị rủi ro tín dụng, rủi ro thị trường và rủi ro hoạt động theo chuẩn Basel III & quy định Ngân hàng Nhà nước; phê duyệt mô hình AI Credit Scoring và kiểm soát tỷ lệ nợ xấu (NPL) dưới 1.5%.",
        "questions": [
            {"competency": "Quản trị Rủi ro Chuẩn Basel III", "question": "Anh/Chị đã thiết lập khung khẩu vị rủi ro và mô hình chấm điểm tín dụng tự động giúp kiểm soát nợ xấu (NPL) dưới ngưỡng mục tiêu như thế nào?"},
            {"competency": "Phân tích Danh mục & Stress Testing", "question": "Cách Anh/Chị điều hành kịch bản kiểm tra sức chịu đựng (Stress Test) trước biến động lãi suất và tỷ giá vĩ mô tại Việt Nam?"},
            {"competency": "Lãnh đạo Hội đồng Tín dụng", "question": "Anh/Chị cân bằng giữa áp lực tăng trưởng dư nợ của khối Kinh doanh và kỷ luật an toàn vốn của khối Rủi ro ra sao?"},
        ],
    },
    {
        "id": "job_05",
        "sector": "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Khách hàng Doanh nghiệp Lớn & FDI (Corporate Banking Manager)",
        "department": "Khối Tài chính - Ngân hàng (Banking & Finance)",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "50 - 80 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Japanese N2/N3", "Korean TOPIK"],
        "nice_skills": ["Chinese HSK"],
        "jd": "Phát triển và quản lý danh mục khách hàng doanh nghiệp FDI (Nhật Bản, Hàn Quốc, Âu Mỹ) và tập đoàn nội địa; thúc đẩy doanh số tín dụng thương mại, tài trợ chuỗi cung ứng, bảo lãnh và CASA.",
        "questions": [
            {"competency": "Phát triển Danh mục Khách hàng FDI", "question": "Anh/Chị đã xây dựng mạng lưới khách hàng FDI và tăng quy mô huy động CASA/dư nợ tín dụng doanh nghiệp đạt bao nhiêu tỷ VNĐ trong 2 năm qua?"},
            {"competency": "Thẩm định Tài chính Doanh nghiệp", "question": "Khi cấu trúc gói tài trợ vốn lưu động và bảo lãnh cho doanh nghiệp sản xuất xuất khẩu, Anh/Chị chú trọng những chỉ số dòng tiền nào nhất?"},
            {"competency": "Huấn luyện Đội ngũ RM", "question": "Cách Anh/Chị kèm cặp đội ngũ 15 Chuyên viên Quan hệ Khách hàng (RM) chốt các hợp đồng tài chính phức tạp?"},
        ],
    },
    {
        "id": "job_06",
        "sector": "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Đầu tư & Mua bán Sáp nhập (Investment & M&A Director)",
        "department": "Khối Tài chính - Ngân hàng (Banking & Finance)",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "85 - 140 Triệu VNĐ",
        "min_exp": 7.0,
        "skills": ["English Ielts/Toeic", "Bridge SE / BA", "B2B Sales / Telesales"],
        "nice_skills": ["PostgreSQL / SQL"],
        "jd": "Dẫn dắt hoạt động thẩm định đầu tư (Due Diligence), định giá doanh nghiệp (DCF, LBO), cấu trúc thương vụ M&A và huy động vốn quốc tế quy mô từ 10 - 100 triệu USD.",
        "questions": [
            {"competency": "Cấu trúc Thương vụ M&A & Định giá", "question": "Hãy trình bày một thương vụ M&A hoặc huy động vốn lớn nhất mà Anh/Chị từng dẫn dắt từ giai đoạn Due Diligence đến khi ký kết SHA/SPA."},
            {"competency": "Quản trị Danh mục Sau Đầu tư", "question": "Sau khi hoàn tất giải ngân đầu tư, Anh/Chị tham gia tái cấu trúc tài chính để nâng biên lợi nhuận EBITDA của công ty mục tiêu như thế nào?"},
            {"competency": "Đàm phán với Quỹ Đầu tư Quốc tế", "question": "Kinh nghiệm của Anh/Chị khi đàm phán điều khoản bảo vệ nhà đầu tư và cơ chế thoái vốn với các quỹ PE/VC nước ngoài?"},
        ],
    },

    # 3. SẢN XUẤT CÔNG NGHIỆP & FDI ĐIỆN TỬ - BÁN DẪN
    {
        "id": "job_07",
        "sector": "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Nhà máy Sản xuất Điện tử FDI (Plant Director / General Manager)",
        "department": "Khối Sản xuất & Nhà máy FDI (Manufacturing & Plant Ops)",
        "location": "Bắc Ninh / Hải Phòng",
        "salary_range": "80 - 140 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["Manufacturing / QA-QC", "QA / Testing", "Korean TOPIK", "English Ielts/Toeic"],
        "nice_skills": ["Japanese N2/N3"],
        "jd": "Điều hành toàn diện nhà máy sản xuất linh kiện điện tử công nghệ cao quy mô 2.500 công nhân; chịu trách nhiệm chỉ số OEE, năng suất dây chuyền SMT, an toàn EHS, chi phí sản xuất và giao hàng đúng hạn 99.8%.",
        "questions": [
            {"competency": "Điều hành Vận hành Nhà máy Quy mô Lớn", "question": "Anh/Chị đã từng nâng chỉ số OEE và giảm tỷ lệ phế phẩm (Scrap Rate) tại nhà máy trên 1.000 lao động bằng những giải pháp cụ thể nào?"},
            {"competency": "Quản trị Chi phí Sản xuất & P&L", "question": "Cách Anh/Chị kiểm soát định mức tiêu hao nguyên vật liệu, năng lượng và tối ưu chi phí nhân công trực tiếp trên mỗi đơn vị sản phẩm?"},
            {"competency": "Văn hóa An toàn & Quan hệ Lao động", "question": "Anh/Chị làm thế nào để duy trì tỷ lệ nghỉ việc của công nhân dưới 3%/tháng và đạt 0 tai nạn lao động (Zero LTI)?"},
        ],
    },
    {
        "id": "job_08",
        "sector": "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Quản lý Chất lượng Toàn diện (QA/QC & ISO Senior Manager)",
        "department": "Khối Sản xuất & Nhà máy FDI (Manufacturing & Plant Ops)",
        "location": "Bình Dương / Đồng Nai",
        "salary_exp": 5.0,
        "salary_range": "42 - 68 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Manufacturing / QA-QC", "QA / Testing", "Japanese N2/N3", "English Ielts/Toeic"],
        "nice_skills": ["Korean TOPIK"],
        "jd": "Quản lý hệ thống chất lượng IQC, IPQC, OQC theo tiêu chuẩn IATF 16949 & ISO 9001; chủ trì giải quyết khiếu nại khách hàng toàn cầu theo phương pháp 8D, FMEA, SPC và 6 Sigma.",
        "questions": [
            {"competency": "Hệ thống Quản trị Chất lượng IATF/ISO", "question": "Anh/Chị đã áp dụng công cụ 8D, PFMEA và SPC để giảm tỷ lệ lỗi PPM trên dây chuyền sản xuất xuống mức nào?"},
            {"competency": "Đối ứng Kiểm toán Khách hàng Quốc tế", "question": "Kinh nghiệm của Anh/Chị khi chủ trì các đợt Audit khắt khe từ khách hàng Nhật Bản, Hàn Quốc và Âu Mỹ?"},
            {"competency": "Quản lý Chất lượng Nhà cung cấp (SQE)", "question": "Khi lô linh kiện đầu vào gặp lỗi hàng loạt ảnh hưởng tiến độ xuất hàng, Anh/Chị xử lý với nhà cung cấp và bộ phận Sản xuất ra sao?"},
        ],
    },
    {
        "id": "job_09",
        "sector": "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Kỹ thuật Tự động hóa & Cải tiến Lean (Automation & Lean Manager)",
        "department": "Khối Sản xuất & Nhà máy FDI (Manufacturing & Plant Ops)",
        "location": "Bắc Giang / Thái Nguyên",
        "salary_range": "45 - 70 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Manufacturing / QA-QC", "Docker / Kubernetes", "Python", "Chinese HSK"],
        "nice_skills": ["English Ielts/Toeic"],
        "jd": "Triển khai các dự án tự động hóa dây chuyền (PLC, Robot công nghiệp, hệ thống thị giác máy tính AOI) và chương trình cải tiến Kaizen / Lean Six Sigma giúp tăng năng suất nhà máy 25%/năm.",
        "questions": [
            {"competency": "Tự động hóa Dây chuyền & Smart Factory", "question": "Hãy chia sẻ một dự án tích hợp Robot/AOI hoặc MES mà Anh/Chị chủ trì giúp cắt giảm nhân công thao tác thủ công và tăng Takt Time."},
            {"competency": "Thực thi Lean Six Sigma & Kaizen", "question": "Anh/Chị làm thế nào để loại bỏ 7 lãng phí (Muda) trên mặt bằng xưởng và tính toán mức tiết kiệm chi phí hàng năm?"},
            {"competency": "Bảo trì Dự đoán (TPM)", "question": "Cách Anh/Chị tổ chức đội ngũ kỹ sư bảo trì giảm thời gian dừng máy đột xuất (Unplanned Downtime) xuống dưới 1%?"},
        ],
    },

    # 4. BẤT ĐỘNG SẢN & XÂY DỰNG HẠ TẦNG
    {
        "id": "job_10",
        "sector": "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Quản lý Dự án Khu Đô thị & Công nghiệp (Project Director)",
        "department": "Khối Bất động sản & Xây dựng (Real Estate & Construction)",
        "location": "TP. Hồ Chí Minh / Long An",
        "salary_range": "80 - 135 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["Manufacturing / QA-QC", "Bridge SE / BA", "English Ielts/Toeic"],
        "nice_skills": ["B2B Sales / Telesales"],
        "jd": "Chỉ đạo toàn diện tiến độ, ngân sách (trên 3.000 tỷ VNĐ), chất lượng thi công, an toàn lao động và nghiệm thu bàn giao dự án Khu đô thị phức hợp & Khu công nghiệp xanh.",
        "questions": [
            {"competency": "Quản trị Tổng thầu & Ngân sách Dự án", "question": "Anh/Chị kiểm soát tiến độ, chất lượng và chống đội vốn (Cost Overrun) cho các đại dự án quy mô hàng nghìn tỷ đồng bằng cơ chế nào?"},
            {"competency": "Quản lý Hợp đồng FIDIC & Đấu thầu", "question": "Kinh nghiệm của Anh/Chị trong việc xử lý các phát sinh biến động giá vật liệu và tranh chấp hợp đồng với tổng thầu quốc tế?"},
            {"competency": "Nghiệm thu & Bàn giao Đưa vào Vận hành", "question": "Cách Anh/Chị phối hợp các cơ quan chức năng và tư vấn giám sát để hoàn tất nghiệm thu PCCC và đưa dự án vào khai thác đúng cam kết?"},
        ],
    },
    {
        "id": "job_11",
        "sector": "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Phát triển Dự án & Pháp lý Đầu tư (Project Development Manager)",
        "department": "Khối Bất động sản & Xây dựng (Real Estate & Construction)",
        "location": "Hà Nội / Hưng Yên",
        "salary_range": "48 - 75 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Bridge SE / BA", "B2B Sales / Telesales", "English Ielts/Toeic"],
        "nice_skills": ["Manufacturing / QA-QC"],
        "jd": "Chủ trì thủ tục pháp lý dự án bất động sản từ chấp thuận chủ trương đầu tư, quy hoạch 1/500, giao đất, tính tiền sử dụng đất đến giấy phép xây dựng theo Luật Đất đai và Luật Kinh doanh BĐS mới.",
        "questions": [
            {"competency": "Thông hiểu Pháp lý Đầu tư & Quy hoạch", "question": "Anh/Chị đã từng tháo gỡ vướng mắc pháp lý quy hoạch 1/500 và nghĩa vụ tài chính đất đai cho những dự án nào để kịp tiến độ mở bán?"},
            {"competency": "Nghiên cứu Tiền khả thi (FS)", "question": "Khi lập báo cáo nghiên cứu khả thi (Feasibility Study) cho quỹ đất mới, Anh/Chị phối hợp với khối Tài chính và Thiết kế ra sao?"},
            {"competency": "Quan hệ Đối ngoại & Cơ quan Quản lý", "question": "Phương pháp làm việc chuyên nghiệp của Anh/Chị với các Sở Ban Ngành để rút ngắn thời gian thẩm định hồ sơ dự án?"},
        ],
    },
    {
        "id": "job_12",
        "sector": "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Kinh doanh & Phát triển Hệ thống Phân phối BĐS (Sales Director)",
        "department": "Khối Bất động sản & Xây dựng (Real Estate & Construction)",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "70 - 125 Triệu VNĐ",
        "min_exp": 7.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["Chinese HSK"],
        "jd": "Xây dựng chiến lược bán hàng, quản trị mạng lưới 35 đại lý F1 và đội ngũ 200 chuyên viên kinh doanh In-house; chịu trách nhiệm chỉ tiêu doanh số (GMV) 5.000 tỷ VNĐ/năm.",
        "questions": [
            {"competency": "Chiến lược Mở bán & Quản trị Đại lý F1", "question": "Anh/Chị đã từng tổ chức chiến dịch mở bán dự án đạt tỷ lệ hấp thụ (Absorption Rate) trên 85% trong bối cảnh thị trường cạnh tranh như thế nào?"},
            {"competency": "Chính sách Giá & Tài chính Khách hàng", "question": "Cách Anh/Chị phối hợp với Ngân hàng thiết kế gói ân hạn nợ gốc và hỗ trợ lãi suất hấp dẫn người mua thực lẫn nhà đầu tư?"},
            {"competency": "Xây dựng Đội ngũ Kinh doanh Tinh nhuệ", "question": "Anh/Chị thiết kế cơ chế hoa hồng và KPI như thế nào để thúc đẩy cả hệ thống đại lý lẫn đội ngũ bán hàng trực tiếp?"},
        ],
    },

    # 5. BÁN LẺ, THƯƠNG MẠI ĐIỆN TỬ & FMCG
    {
        "id": "job_13",
        "sector": "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Thương mại Đa kênh & E-Commerce (Omnichannel Commercial Director)",
        "department": "Khối Bán lẻ, E-Commerce & FMCG",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "75 - 130 Triệu VNĐ",
        "min_exp": 7.0,
        "skills": ["B2B Sales / Telesales", "AI / LLM / RAG", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["PostgreSQL / SQL"],
        "jd": "Chịu trách nhiệm toàn bộ P&L mảng Thương mại Đa kênh (Shopee Mall, TikTok Shop, Lazada, D2C Website và chuỗi 150 cửa hàng vật lý); tối ưu chuyển đổi bằng AI Personalization và quản trị danh mục hàng hóa.",
        "questions": [
            {"competency": "Tăng trưởng GMV Đa kênh & P&L", "question": "Anh/Chị đã từng thúc đẩy tăng trưởng GMV kênh E-Commerce & Social Commerce (TikTok Shop/Shopee) trong khi vẫn giữ biên lợi nhuận ròng (EBITDA) dương như thế nào?"},
            {"competency": "Tích hợp O2O & Dữ liệu Khách hàng CDP", "question": "Cách Anh/Chị đồng bộ tồn kho, giá bán và chương trình khách hàng thân thiết (Loyalty) giữa 150 cửa hàng Offline và kênh Online?"},
            {"competency": "Tối ưu Chi phí Quảng cáo (ROAS/CAC)", "question": "Anh/Chị kiểm soát tỷ lệ chi phí Marketing/Doanh thu (CIR) và tăng giá trị vòng đời khách hàng (LTV) bằng những chỉ số nào?"},
        ],
    },
    {
        "id": "job_14",
        "sector": "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Tiếp thị Ngành hàng & Thương hiệu (Senior Brand & Trade Manager)",
        "department": "Khối Bán lẻ, E-Commerce & FMCG",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "45 - 72 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["AI / LLM / RAG"],
        "jd": "Hoạch định chiến lược thương hiệu, ra mắt sản phẩm mới (NPD) và thực thi chương trình Trade Marketing tại kênh GT/MT trên toàn quốc nhằm gia tăng thị phần (Market Share) ngành hàng FMCG.",
        "questions": [
            {"competency": "Ra mắt Sản phẩm Mới & Tăng Thị phần", "question": "Hãy chia sẻ một chiến dịch ra mắt sản phẩm FMCG thành công nhất mà Anh/Chị quản lý (thị phần Nielsen/Kantar tăng trưởng bao nhiêu %)?"},
            {"competency": "Thực thi Trade Marketing Kênh GT/MT", "question": "Cách Anh/Chị tối ưu ngân sách trưng bày POSM và khuyến mãi tại điểm bán để đẩy sản lượng Sell-out thực tế?"},
            {"competency": "Quản trị Ngân sách Marketing (A&P)", "question": "Anh/Chị phân bổ ngân sách giữa Branding dài hạn và kích cầu ngắn hạn như thế nào để đạt chỉ tiêu doanh thu quý?"},
        ],
    },
    {
        "id": "job_15",
        "sector": "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Vận hành Chuỗi Cửa hàng Bán lẻ Miền Nam (Retail Area Manager)",
        "department": "Khối Bán lẻ, E-Commerce & FMCG",
        "location": "TP. Hồ Chí Minh / Đồng bằng Sông Cửu Long",
        "salary_range": "40 - 65 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["B2B Sales / Telesales", "Manufacturing / QA-QC", "QA / Testing"],
        "nice_skills": ["English Ielts/Toeic"],
        "jd": "Quản lý vận hành 60 cửa hàng bán lẻ hiện đại; chịu trách nhiệm doanh thu trên cùng diện tích (SSSG - Same Store Sales Growth), kiểm soát thất thoát hàng hóa (Shrinkage < 0.4%) và chuẩn mực dịch vụ khách hàng.",
        "questions": [
            {"competency": "Tăng trưởng Doanh thu Cửa hàng (SSSG)", "question": "Anh/Chị đã áp dụng những giải pháp trưng bày (Visual Merchandising) và bán chéo nào để nâng doanh thu trung bình trên mỗi hóa đơn (AOV)?"},
            {"competency": "Kiểm soát Thất thoát & Vòng quay Tồn kho", "question": "Quy trình kiểm kê và chống thất thoát hàng hóa tại chuỗi 60 cửa hàng được Anh/Chị giám sát chặt chẽ ra sao?"},
            {"competency": "Tuyển dụng & Đào tạo Cửa hàng Trưởng", "question": "Cách Anh/Chị xây dựng đội ngũ Cửa hàng trưởng kế cận và duy trì điểm hài lòng khách hàng (CSAT/NPS) trên 95%?"},
        ],
    },

    # 6. Y TẾ, DƯỢC PHẨM & CHĂM SÓC SỨC KHỎE
    {
        "id": "job_16",
        "sector": "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Vận hành Hệ thống Bệnh viện Đa khoa Quốc tế (Hospital Operations Director)",
        "department": "Khối Y tế & Dược phẩm (Healthcare & Pharma)",
        "location": "TP. Hồ Chí Minh / Hà Nội",
        "salary_range": "80 - 135 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["Manufacturing / QA-QC", "QA / Testing", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["AI / LLM / RAG"],
        "jd": "Điều hành toàn bộ hoạt động phi lâm sàng và dịch vụ bệnh nhân tại bệnh viện 400 giường tiêu chuẩn JCI; tối ưu hóa công suất phòng mổ/giường bệnh, hệ thống bệnh án điện tử HIS/EMR và hiệu quả tài chính.",
        "questions": [
            {"competency": "Vận hành Bệnh viện Chuẩn Quốc tế JCI", "question": "Anh/Chị đã từng điều hành quy trình vận hành bệnh viện đạt chuẩn JCI/ISO 15189 và rút ngắn thời gian chờ khám ngoại trú xuống bao nhiêu phút?"},
            {"competency": "Quản trị Tài chính & Công suất Giường bệnh", "question": "Cách Anh/Chị tối ưu tỷ lệ lấp đầy giường nội trú, kiểm soát chi phí vật tư tiêu hao y tế và tăng biên lợi nhuận vận hành?"},
            {"competency": "Chuyển đổi Số Y tế (HIS/EMR/PACS)", "question": "Kinh nghiệm của Anh/Chị trong việc triển khai Bệnh án điện tử (EMR) và ứng dụng AI hỗ trợ chẩn đoán/chăm sóc khách hàng y tế?"},
        ],
    },
    {
        "id": "job_17",
        "sector": "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Kinh doanh Dược phẩm Kênh Bệnh viện Toàn quốc (National ETC Sales Manager)",
        "department": "Khối Y tế & Dược phẩm (Healthcare & Pharma)",
        "location": "Hà Nội / TP. Hồ Chí Minh",
        "salary_range": "50 - 82 Triệu VNĐ",
        "min_exp": 6.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "QA / Testing"],
        "nice_skills": ["Bridge SE / BA"],
        "jd": "Quản lý hoạt động đấu thầu thuốc kênh bệnh viện (ETC) và mạng lưới 45 Trình dược viên trên toàn quốc; đảm bảo tuân thủ quy định Luật Đấu thầu, Bộ Y tế và hoàn thành mục tiêu doanh số 450 tỷ VNĐ/năm.",
        "questions": [
            {"competency": "Quản trị Đấu thầu Thuốc Kênh ETC", "question": "Anh/Chị xây dựng chiến lược danh mục thuốc tham gia thầu tập trung và thầu bệnh viện theo các thông tư mới của Bộ Y tế như thế nào?"},
            {"competency": "Điều hành Đội ngũ Trình dược viên", "question": "Cách Anh/Chị sử dụng hệ thống CRM/SFE để giám sát hiệu suất viếng thăm và phát triển chuyên môn khoa học cho 45 Trình dược viên?"},
            {"competency": "Tuân thủ Đạo đức Kinh doanh Dược (Compliance)", "question": "Anh/Chị kiểm soát rủi ro tuân thủ (Compliance & Anti-Bribery) trong các hội thảo khoa học và chương trình tiếp thị y khoa ra sao?"},
        ],
    },
    {
        "id": "job_18",
        "sector": "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Đăng ký Thuốc & Đảm bảo Chất lượng EU-GMP (Regulatory Affairs & QA Manager)",
        "department": "Khối Y tế & Dược phẩm (Healthcare & Pharma)",
        "location": "TP. Hồ Chí Minh / Bình Dương",
        "salary_range": "45 - 70 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["QA / Testing", "Manufacturing / QA-QC", "English Ielts/Toeic"],
        "nice_skills": ["Bridge SE / BA"],
        "jd": "Chịu trách nhiệm biên soạn, thẩm định hồ sơ đăng ký thuốc chuẩn ACTD/ICH trình Cục Quản lý Dược và duy trì hệ thống đảm bảo chất lượng nhà máy theo tiêu chuẩn EU-GMP / WHO-GMP.",
        "questions": [
            {"competency": "Đăng ký Thuốc & Hồ sơ ACTD/ICH", "question": "Anh/Chị đã từng rút ngắn thời gian cấp Số đăng ký lưu hành (Visa thuốc) và xử lý các công văn bổ sung từ Cục Quản lý Dược như thế nào?"},
            {"competency": "Quản trị Hệ thống Chất lượng EU-GMP", "question": "Kinh nghiệm của Anh/Chị trong việc chuẩn bị hồ sơ thẩm định quy trình, độ ổn định và tiếp đoàn thanh tra GMP quốc tế?"},
            {"competency": "Cảnh giác Dược (Pharmacovigilance)", "question": "Quy trình giám sát phản ứng có hại của thuốc (ADR) và thu hồi lô sản phẩm khẩn cấp được Anh/Chị thiết lập ra sao?"},
        ],
    },

    # 7. LOGISTICS, CHUỖI CUNG ỨNG & XUẤT NHẬP KHẨU
    {
        "id": "job_19",
        "sector": "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Chuỗi Cung ứng Toàn quốc (Head of End-to-End Supply Chain)",
        "department": "Khối Logistics & Chuỗi Cung ứng",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "75 - 130 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["Manufacturing / QA-QC", "PostgreSQL / SQL", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["AI / LLM / RAG"],
        "jd": "Điều hành chiến lược S&OP, dự báo nhu cầu bằng AI, mạng lưới 8 Trung tâm Phân phối (Fulfillment Centers), vận tải đa phương thức và xuất nhập khẩu; tối ưu tỷ lệ chi phí Logistics trên doanh thu giảm 18%.",
        "questions": [
            {"competency": "Hoạch định S&OP & Tối ưu Tồn kho", "question": "Anh/Chị đã từng điều hành quy trình S&OP giúp nâng tỷ lệ đáp ứng đơn hàng (OTIF) lên trên 98% đồng thời giảm số ngày tồn kho (DOH) như thế nào?"},
            {"competency": "Thiết kế Mạng lưới Trung tâm Phân phối", "question": "Cách Anh/Chị ứng dụng hệ thống WMS/TMS tự động hóa để tối ưu năng suất lấy hàng và chi phí giao hàng chặng cuối (Last-mile)?"},
            {"competency": "Quản trị Rủi ro Đứt gãy Chuỗi Cung ứng", "question": "Khi giá cước vận tải biển tăng đột biến hoặc thiếu hụt container xuất khẩu, Anh/Chị kích hoạt phương án dự phòng nào?"},
        ],
    },
    {
        "id": "job_20",
        "sector": "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Khai thác Kho vận & Vận tải Quốc tế (Logistics & Fleet Operations Manager)",
        "department": "Khối Logistics & Chuỗi Cung ứng",
        "location": "Hải Phòng / Bình Dương",
        "salary_range": "42 - 66 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Manufacturing / QA-QC", "QA / Testing", "English Ielts/Toeic"],
        "nice_skills": ["Chinese HSK"],
        "jd": "Quản lý vận hành hệ thống kho ngoại quan 50.000 m2 và đội xe đầu kéo container 120 chiếc; tối ưu lộ trình vận tải, định mức nhiên liệu, thông quan hải quan điện tử VNACCS/VCIS.",
        "questions": [
            {"competency": "Vận hành Kho Ngoại quan & WMS", "question": "Anh/Chị quản lý độ chính xác tồn kho (Inventory Accuracy >= 99.9%) và tối ưu diện tích lưu trữ trên mỗi pallet tại kho lớn như thế nào?"},
            {"competency": "Quản trị Đội xe & Tối ưu Nhiên liệu", "question": "Cách Anh/Chị giám sát GPS/IoT đội xe 120 đầu kéo để tăng hệ số quay vòng chuyến và giảm chi phí nhiên liệu/bảo dưỡng?"},
            {"competency": "Thông quan Hải quan & Hàng Xuất Nhập khẩu", "question": "Kinh nghiệm xử lý các lô hàng luồng đỏ, kiểm tra chuyên ngành và hoàn thuế xuất nhập khẩu nhanh chóng, đúng luật?"},
        ],
    },
    {
        "id": "job_21",
        "sector": "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Mua hàng Chiến lược & Phát triển Nhà cung cấp (Strategic Procurement Manager)",
        "department": "Khối Logistics & Chuỗi Cung ứng",
        "location": "Hà Nội / Bắc Ninh",
        "salary_range": "45 - 70 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Chinese HSK", "Japanese N2/N3"],
        "nice_skills": ["Korean TOPIK"],
        "jd": "Phụ trách ngân sách thu mua nguyên vật liệu và thiết bị trị giá 1.500 tỷ VNĐ/năm từ thị trường Việt Nam, Trung Quốc, Nhật Bản, Hàn Quốc; đàm phán Cost Saving 8-12%/năm và nội địa hóa chuỗi cung ứng.",
        "questions": [
            {"competency": "Chiến lược Đàm phán & Tiết giảm Chi phí", "question": "Anh/Chị áp dụng mô hình Should-Cost và TCO (Total Cost of Ownership) để đàm phán giảm giá mua nguyên vật liệu đạt bao nhiêu tỷ đồng/năm?"},
            {"competency": "Đa dạng hóa & Nội địa hóa Nguồn cung", "question": "Cách Anh/Chị tìm kiếm, đánh giá và phát triển các nhà cung cấp nội địa Việt Nam đạt chuẩn thay thế nguồn hàng nhập khẩu?"},
            {"competency": "Minh bạch Đấu thầu & Quản trị Hợp đồng", "question": "Anh/Chị xây dựng quy trình e-Procurement và kiểm soát xung đột lợi ích trong đấu thầu mua sắm như thế nào?"},
        ],
    },

    # 8. NĂNG LƯỢNG TÁI TẠO & PHÁT TRIỂN BỀN VỮNG ESG
    {
        "id": "job_22",
        "sector": "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Phát triển Dự án Điện Gió, Điện Mặt trời & DPPA (Renewable Energy Director)",
        "department": "Khối Năng lượng Tái tạo & ESG",
        "location": "TP. Hồ Chí Minh / Ninh Thuận",
        "salary_range": "85 - 145 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["Manufacturing / QA-QC", "English Ielts/Toeic", "Bridge SE / BA", "B2B Sales / Telesales"],
        "nice_skills": ["Chinese HSK"],
        "jd": "Chỉ đạo phát triển danh mục dự án Điện gió, Điện mặt trời áp mái khu công nghiệp và cơ chế Mua bán điện trực tiếp (DPPA) quy mô 300 MW theo Quy hoạch Điện VIII.",
        "questions": [
            {"competency": "Phát triển Dự án Năng lượng & Cơ chế DPPA", "question": "Anh/Chị đã từng dẫn dắt việc đàm phán hợp đồng mua bán điện trực tiếp (DPPA) với các nhà máy FDI lớn và đấu nối lưới điện quốc gia như thế nào?"},
            {"competency": "Quản trị EPC & Tài chính Dự án Năng lượng", "question": "Cách Anh/Chị tối ưu suất đầu tư (CAPEX/MWp) và làm việc với các định chế tài chính xanh (ADB, IFC) để thu xếp vốn dự án?"},
            {"competency": "Tuân thủ Quy hoạch Điện VIII", "question": "Kinh nghiệm hoàn thiện hồ sơ pháp lý năng lượng, thỏa thuận đấu nối EVN và giấy phép hoạt động điện lực đúng tiến độ COD?"},
        ],
    },
    {
        "id": "job_23",
        "sector": "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Kỹ thuật Vận hành Nhà máy Điện & Hệ thống BESS (O&M Engineering Manager)",
        "department": "Khối Năng lượng Tái tạo & ESG",
        "location": "Bình Thuận / Gia Lai",
        "salary_range": "48 - 75 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["Manufacturing / QA-QC", "QA / Testing", "English Ielts/Toeic"],
        "nice_skills": ["Python"],
        "jd": "Quản lý vận hành và bảo dưỡng (O&M) cụm nhà máy điện mặt trời & điện gió 150 MW kèm hệ thống lưu trữ năng lượng pin (BESS); đảm bảo hệ số khả dụng (Availability Factor) >= 99.2%.",
        "questions": [
            {"competency": "Vận hành SCADA & Tối ưu Sản lượng Phát", "question": "Anh/Chị sử dụng dữ liệu SCADA và phân tích nhiệt ảnh (Thermography) để nâng cao tỷ số hiệu suất PR (Performance Ratio) của nhà máy điện như thế nào?"},
            {"competency": "An toàn Điện Cao thế & Trạm 110kV/220kV", "question": "Quy trình an toàn LOTO và bảo trì định kỳ trạm biến áp 110kV/220kV được Anh/Chị kiểm soát ra sao để tránh sự cố lưới?"},
            {"competency": "Tích hợp Hệ thống Lưu trữ BESS", "question": "Kinh nghiệm của Anh/Chị trong việc vận hành hệ thống lưu trữ năng lượng BESS nhằm giảm cắt giảm công suất (Curtailment)?"},
        ],
    },
    {
        "id": "job_24",
        "sector": "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Quản trị Phát triển Bền vững & Kiểm kê Khí nhà kính (ESG & Carbon Manager)",
        "department": "Khối Năng lượng Tái tạo & ESG",
        "location": "TP. Hồ Chí Minh / Hà Nội",
        "salary_range": "45 - 72 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["QA / Testing", "Manufacturing / QA-QC", "English Ielts/Toeic", "Bridge SE / BA"],
        "nice_skills": ["PostgreSQL / SQL"],
        "jd": "Xây dựng chiến lược Net-Zero, thực hiện kiểm kê khí nhà kính phạm vi Scope 1, 2, 3 theo ISO 14064, lập Báo cáo Phát triển Bền vững chuẩn GRI/ISSB và đối ứng cơ chế CBAM châu Âu.",
        "questions": [
            {"competency": "Kiểm kê Khí nhà kính ISO 14064 & CBAM", "question": "Anh/Chị đã từng triển khai kiểm kê phát thải Scope 1, 2, 3 và xây dựng lộ trình giảm phát thải đáp ứng tiêu chuẩn xuất khẩu CBAM châu Âu như thế nào?"},
            {"competency": "Báo cáo ESG Chuẩn Quốc tế GRI & Tín chỉ Carbon", "question": "Kinh nghiệm của Anh/Chị trong việc đăng ký chứng chỉ năng lượng tái tạo (I-REC), giao dịch tín chỉ Carbon và huy động Tín dụng Xanh?"},
            {"competency": "Tích hợp ESG vào Chuỗi Cung ứng", "question": "Cách Anh/Chị thiết lập bộ tiêu chí đánh giá ESG cho các nhà máy và nhà cung cấp trong toàn tập đoàn?"},
        ],
    },

    # 9. DU LỊCH, KHÁCH SẠN & NGHỈ DƯỠNG 5 SAO
    {
        "id": "job_25",
        "sector": "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Tổng Quản lý Khu Nghỉ dưỡng 5 Sao Quốc tế (General Manager - Luxury Resort)",
        "department": "Khối Du lịch, Khách sạn & Nghỉ dưỡng",
        "location": "Phú Quốc / Đà Nẵng / Nha Trang",
        "salary_range": "85 - 150 Triệu VNĐ",
        "min_exp": 8.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Korean TOPIK", "QA / Testing"],
        "nice_skills": ["Chinese HSK", "Japanese N2/N3"],
        "jd": "Điều hành toàn diện quần thể Resort & Villa 5 sao quy mô 350 phòng và trung tâm hội nghị MICE; chịu trách nhiệm chỉ số GOP (Gross Operating Profit), RevPAR, điểm đánh giá khách hàng quốc tế và quản trị 450 nhân sự.",
        "questions": [
            {"competency": "Điều hành P&L & Tối ưu Chỉ số GOP / RevPAR", "question": "Anh/Chị đã từng nâng tỷ lệ lấp đầy (Occupancy Rate), giá phòng bình quân (ADR) và biên lợi nhuận GOP tại Resort 5 sao lên mức nào?"},
            {"competency": "Quản trị Chất lượng Dịch vụ Xa xỉ (Luxury Standards)", "question": "Cách Anh/Chị duy trì điểm đánh giá trên Booking/TripAdvisor >= 9.4 và thiết kế trải nghiệm cá nhân hóa cho khách VIP quốc tế?"},
            {"competency": "Lãnh đạo Đa văn hóa & Giữ chân Nhân sự", "question": "Anh/Chị xây dựng văn hóa dịch vụ hiếu khách và đào tạo đội ngũ 450 nhân viên tại các điểm đến nghỉ dưỡng như thế nào?"},
        ],
    },
    {
        "id": "job_26",
        "sector": "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Kinh doanh & Quản trị Doanh thu Hệ thống Khách sạn (Director of Sales & Revenue)",
        "department": "Khối Du lịch, Khách sạn & Nghỉ dưỡng",
        "location": "TP. Hồ Chí Minh / Đà Nẵng",
        "salary_range": "58 - 95 Triệu VNĐ",
        "min_exp": 6.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "Korean TOPIK", "Chinese HSK"],
        "nice_skills": ["Japanese N2/N3"],
        "jd": "Hoạch định chiến lược giá linh hoạt (Dynamic Pricing), quản trị kênh phân phối OTA, TA/TO quốc tế (Hàn Quốc, Nhật Bản, Trung Quốc, Âu Mỹ, Ấn Độ) và mảng khách đoàn MICE doanh nghiệp.",
        "questions": [
            {"competency": "Quản trị Doanh thu (Revenue Management)", "question": "Anh/Chị áp dụng thuật toán Dynamic Pricing và phân bổ quỹ phòng giữa kênh OTA, lữ hành quốc tế (Series Booking) và đặt phòng trực tiếp ra sao?"},
            {"competency": "Mở rộng Thị trường Khách Quốc tế & MICE", "question": "Anh/Chị đã ký kết hợp đồng chiến lược với các hãng lữ hành lớn tại Hàn Quốc, Nhật Bản, châu Âu mang về doanh thu bao nhiêu tỷ đồng/năm?"},
            {"competency": "Tối ưu Chi phí Hoa hồng Kênh Phân phối", "question": "Giải pháp của Anh/Chị để tăng tỷ trọng đặt phòng trực tiếp qua Website (Direct Booking) nhằm giảm chi phí hoa hồng OTA?"},
        ],
    },
    {
        "id": "job_27",
        "sector": "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng khối Ẩm thực & Dịch vụ Lưu trú Cao cấp (F&B and Rooms Division Manager)",
        "department": "Khối Du lịch, Khách sạn & Nghỉ dưỡng",
        "location": "Đà Nẵng / Hội An",
        "salary_range": "42 - 65 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["QA / Testing", "Manufacturing / QA-QC", "English Ielts/Toeic"],
        "nice_skills": ["B2B Sales / Telesales"],
        "jd": "Quản lý vận hành 4 nhà hàng chuyên đề, Sky Bar, dịch vụ tiệc hội nghị (Banquet) và khối Tiền sảnh - Buồng phòng; kiểm soát Food Cost dưới 28% và đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm HACCP.",
        "questions": [
            {"competency": "Tối ưu Doanh thu F&B & Kiểm soát Food Cost", "question": "Anh/Chị thiết kế thực đơn (Menu Engineering) và kiểm soát định lượng nguyên liệu như thế nào để giữ Food & Beverage Cost ở mức tối ưu?"},
            {"competency": "Tiêu chuẩn HACCP & Vận hành Đại tiệc MICE", "question": "Kinh nghiệm của Anh/Chị khi điều phối các sự kiện Gala Dinner từ 500 - 1.000 khách đảm bảo tốc độ phục vụ và an toàn thực phẩm tuyệt đối?"},
            {"competency": "Phối hợp Liên bộ phận Lưu trú & Ẩm thực", "question": "Cách Anh/Chị xử lý tức thời các tình huống khiếu nại của khách hàng để biến trải nghiệm chưa hài lòng thành sự gắn kết thương hiệu?"},
        ],
    },

    # 10. GIÁO DỤC, ĐÀO TẠO QUỐC TẾ & EDTECH
    {
        "id": "job_28",
        "sector": "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Điều hành Hệ thống Trường Liên cấp Song ngữ Quốc tế (School Operations Director)",
        "department": "Khối Giáo dục & EdTech",
        "location": "Hà Nội / TP. Hồ Chí Minh",
        "salary_range": "70 - 120 Triệu VNĐ",
        "min_exp": 7.0,
        "skills": ["B2B Sales / Telesales", "English Ielts/Toeic", "QA / Testing", "Bridge SE / BA"],
        "nice_skills": ["AI / LLM / RAG"],
        "jd": "Điều hành toàn bộ hoạt động vận hành, tuyển sinh, tài chính, dịch vụ học sinh và kiểm định quốc tế CIS/IB cho cụm 3 cơ sở trường liên cấp quy mô 4.500 học sinh và 380 giáo viên trong và ngoài nước.",
        "questions": [
            {"competency": "Điều hành Vận hành Trường học & Kiểm định CIS/IB", "question": "Anh/Chị đã từng dẫn dắt hệ thống trường đạt chứng nhận kiểm định quốc tế CIS/Cognia và tối ưu hiệu quả vận hành cơ sở vật chất như thế nào?"},
            {"competency": "Chiến lược Tuyển sinh & Giữ chân Học sinh", "question": "Cách Anh/Chị nâng tỷ lệ tái ghi danh hàng năm (Student Retention Rate) đạt trên 94% và hoàn thành chỉ tiêu tuyển sinh đầu cấp?"},
            {"competency": "Quản trị Đội ngũ Giáo viên Quốc tế & Nội địa", "question": "Anh/Chị xây dựng môi trường làm việc và khung đánh giá chất lượng giảng dạy cho 380 giáo viên đa quốc tịch ra sao?"},
        ],
    },
    {
        "id": "job_29",
        "sector": "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)",
        "level": "Quản lý Cấp trung (Middle Manager)",
        "title": "Trưởng phòng Phát triển Chương trình Học thuật & Khảo thí (Academic & Curriculum Manager)",
        "department": "Khối Giáo dục & EdTech",
        "location": "TP. Hồ Chí Minh",
        "salary_range": "42 - 68 Triệu VNĐ",
        "min_exp": 5.0,
        "skills": ["English Ielts/Toeic", "QA / Testing", "AI / LLM / RAG"],
        "nice_skills": ["Japanese N2/N3", "Korean TOPIK"],
        "jd": "Chủ trì thiết kế khung chương trình đào tạo chuẩn Cambridge / IELTS / STEAM tích hợp trợ lý học tập AI; quản lý chất lượng khảo thí, đào tạo giáo viên và đo lường đầu ra học thuật của học viên.",
        "questions": [
            {"competency": "Thiết kế Chương trình Chuẩn Quốc tế & AI", "question": "Anh/Chị tích hợp phương pháp giảng dạy cá nhân hóa bằng AI (Adaptive Learning) vào khung chương trình Cambridge/IELTS như thế nào để tăng điểm đầu ra?"},
            {"competency": "Kiểm định Chất lượng Giảng dạy & Khảo thí", "question": "Quy trình dự giờ, đánh giá năng lực sư phạm và chuẩn hóa ngân hàng đề thi được Anh/Chị triển khai ra sao?"},
            {"competency": "Nâng cao Tỷ lệ Hoàn thành Khóa học", "question": "Những chỉ số học thuật nào được Anh/Chị theo dõi hàng tuần để hỗ trợ kịp thời các học viên có nguy cơ chậm tiến độ?"},
        ],
    },
    {
        "id": "job_30",
        "sector": "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)",
        "level": "Quản lý Cao cấp (Senior Executive)",
        "title": "Giám đốc Sản phẩm & Tăng trưởng Nền tảng EdTech AI (Head of EdTech Product & Growth)",
        "department": "Khối Giáo dục & EdTech",
        "location": "Hà Nội / TP. Hồ Chí Minh",
        "salary_range": "65 - 110 Triệu VNĐ",
        "min_exp": 6.0,
        "skills": ["AI / LLM / RAG", "React / Next.js", "B2B Sales / Telesales", "English Ielts/Toeic"],
        "nice_skills": ["Python", "PostgreSQL / SQL"],
        "jd": "Dẫn dắt chiến lược sản phẩm và tăng trưởng người dùng cho nền tảng học ngoại ngữ & kỹ năng số bằng AI (500.000 người dùng trả phí tại Việt Nam & Đông Nam Á); tối ưu tỷ lệ giữ chân D30, LTV/CAC và doanh thu gói thuê bao (ARR).",
        "questions": [
            {"competency": "Chiến lược Sản phẩm AI EdTech & Gamification", "question": "Anh/Chị đã từng thiết kế tính năng AI Gia sư giọng nói và cơ chế Gamification giúp tăng tỷ lệ người dùng hoạt động hàng ngày (DAU/MAU) lên bao nhiêu %?"},
            {"competency": "Tăng trưởng Thuê bao Trả phí (PLG & B2B2C)", "question": "Cách Anh/Chị tối ưu phễu chuyển đổi từ học thử miễn phí sang gói trả phí năm (Annual Subscription) và giảm tỷ lệ rời bỏ (Churn Rate)?"},
            {"competency": "Mở rộng Thị trường B2B Doanh nghiệp & Trường học", "question": "Kinh nghiệm của Anh/Chị trong việc đóng gói giải pháp EdTech bán cho khối Doanh nghiệp (Corporate L&D) và Hệ thống Trường phổ thông?"},
        ],
    },
]

FIRST_NAMES_MALE = ["Minh", "Tuấn", "Hoàng", "Đức", "Hùng", "Kiên", "Bách", "Khánh", "Long", "Nam", "Phong", "Quân", "Sơn", "Thắng", "Việt"]
FIRST_NAMES_FEMALE = ["Hà", "Lan", "Hương", "Trang", "Linh", "Mai", "Ngọc", "Phương", "Thảo", "Uyên", "Vy", "Yến", "Châu", "Dung", "Hiền"]
LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"]
MIDDLE_MALE = ["Văn", "Minh", "Quốc", "Đức", "Gia", "Hữu", "Tuấn", "Anh", "Trọng", "Đình"]
MIDDLE_FEMALE = ["Thị", "Thu", "Phương", "Ngọc", "Thanh", "Khánh", "Minh", "Bảo", "Nhật", "Quỳnh"]
SOURCES = ["LinkedIn Executive Search", "VietnamWorks Senior", "TopCV Executive", "Headhunter Referral", "Internal Talent Pool"]
UNIVERSITIES = [
    "Đại học Bách Khoa Hà Nội (HUST) & Thạc sĩ Quản trị Kinh doanh (MBA)",
    "Đại học Kinh tế Quốc dân (NEU) & Thạc sĩ Tài chính Quốc tế (MSc)",
    "Đại học Quốc gia TP.HCM (VNU-HCM) & Chương trình Quản trị Lãnh đạo Cao cấp",
    "Đại học Ngoại thương (FTU) & Thạc sĩ Quản lý Chuỗi Cung ứng Quốc tế",
    "Đại học RMIT Việt Nam & Chứng chỉ Quản trị Dự án Quốc tế PMP",
]


def build_candidate_profiles_for_job(job_idx: int, job: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Sinh 5 hồ sơ ứng viên phân hóa rõ rệt (Hạng 1 -> Hạng 5) cho mỗi vị trí tuyển dụng.
    Hạng 1 là ứng viên xuất sắc nhất (STRONG_HIRE), hoàn thành phỏng vấn AI với điểm cao nhất.
    """
    profiles = []
    must_skills = job["skills"]
    nice_skills = job.get("nice_skills", [])
    min_exp = float(job["min_exp"])

    # Cấu hình 5 cấp độ ứng viên trong mỗi tin tuyển dụng
    tier_configs = [
        {
            "rank": 1,
            "tier_label": "TOP 1 - ỨNG VIÊN PHÙ HỢP NHẤT (ĐỀ XUẤT TUYỂN DỤNG NGAY)",
            "stage": "offer",
            "interview_status": "completed",
            "exp_offset": 4.0,
            "skill_ratio": 1.0,
            "must_score": round(95.0 + (job_idx % 4) * 1.1, 1),
            "sem_score": round(93.5 + (job_idx % 5) * 1.0, 1),
            "exp_score": 98.0,
            "int_scores": [95.0, 93.0, 94.0],
            "recommendation": "STRONG_HIRE",
            "kpi_highlight": "Vượt 138% kế hoạch KPI năm, cắt giảm 27% chi phí vận hành và dẫn dắt đội ngũ đạt giải thưởng Xuất sắc Toàn tập đoàn.",
        },
        {
            "rank": 2,
            "tier_label": "TOP 2 - ỨNG VIÊN TIỀM NĂNG CAO (PHƯƠNG ÁN DỰ PHÒNG SỐ 1)",
            "stage": "interview",
            "interview_status": "completed",
            "exp_offset": 2.0,
            "skill_ratio": 0.85,
            "must_score": round(86.0 + (job_idx % 4) * 1.2, 1),
            "sem_score": round(84.5 + (job_idx % 4) * 1.1, 1),
            "exp_score": 90.0,
            "int_scores": [86.0, 84.0, 85.0],
            "recommendation": "HIRE",
            "kpi_highlight": "Hoàn thành 112% chỉ tiêu doanh thu/hiệu suất bộ phận, xây dựng quy trình chuẩn hóa ISO và đào tạo đội ngũ kế cận vững vàng.",
        },
        {
            "rank": 3,
            "tier_label": "TOP 3 - ỨNG VIÊN ĐẠT YÊU CẦU CƠ BẢN (CẦN BỔ SUNG KỸ NĂNG NÂNG CAO)",
            "stage": "interview",
            "interview_status": "completed",
            "exp_offset": 0.5,
            "skill_ratio": 0.70,
            "must_score": round(77.0 + (job_idx % 4) * 1.0, 1),
            "sem_score": round(75.5 + (job_idx % 3) * 1.2, 1),
            "exp_score": 82.0,
            "int_scores": [76.0, 74.0, 75.0],
            "recommendation": "CONSIDER",
            "kpi_highlight": "Đạt 100% KPI vận hành định kỳ, có kinh nghiệm chuyên môn tốt nhưng quy mô đội ngũ từng quản lý nhỏ hơn 30% so với yêu cầu.",
        },
        {
            "rank": 4,
            "tier_label": "TOP 4 - ỨNG VIÊN ĐANG SÀNG LỌC (THIẾU KINH NGHIỆM QUẢN TRỊ QUY MÔ LỚN)",
            "stage": "screening",
            "interview_status": "pending",
            "exp_offset": -1.0,
            "skill_ratio": 0.50,
            "must_score": round(68.0 + (job_idx % 4) * 1.0, 1),
            "sem_score": round(66.5 + (job_idx % 3) * 1.0, 1),
            "exp_score": 70.0,
            "int_scores": [68.0, None, None],
            "recommendation": "HOLD",
            "kpi_highlight": "Nền tảng kỹ thuật/nghiệp vụ khá nhưng mới ở cấp Trưởng nhóm (Team Lead), chưa trực tiếp quản lý ngân sách P&L độc lập.",
        },
        {
            "rank": 5,
            "tier_label": "TOP 5 - CHƯA PHÙ HỢP VỚI VỊ TRÍ QUẢN LÝ HIỆN TẠI",
            "stage": "rejected",
            "interview_status": "pending",
            "exp_offset": -2.5,
            "skill_ratio": 0.25,
            "must_score": round(52.0 + (job_idx % 5) * 1.2, 1),
            "sem_score": round(54.0 + (job_idx % 4) * 1.0, 1),
            "exp_score": 55.0,
            "int_scores": [None, None, None],
            "recommendation": "NO_HIRE",
            "kpi_highlight": "Kinh nghiệm thực tế chủ yếu ở vai trò chuyên viên thực thi, còn thiếu các kỹ năng cốt lõi và ngoại ngữ theo yêu cầu của JD.",
        },
    ]

    for c_idx, tc in enumerate(tier_configs):
        global_num = job_idx * 5 + c_idx + 1
        is_female = (global_num % 2 == 1)
        last_n = LAST_NAMES[(global_num * 3 + job_idx) % len(LAST_NAMES)]
        if is_female:
            mid_n = MIDDLE_FEMALE[(global_num + job_idx) % len(MIDDLE_FEMALE)]
            first_n = FIRST_NAMES_FEMALE[(global_num * 2 + c_idx) % len(FIRST_NAMES_FEMALE)]
            gender = "Nữ"
        else:
            mid_n = MIDDLE_MALE[(global_num + job_idx) % len(MIDDLE_MALE)]
            first_n = FIRST_NAMES_MALE[(global_num * 2 + c_idx) % len(FIRST_NAMES_MALE)]
            gender = "Nam"

        full_name = f"{last_n} {mid_n} {first_n}"
        years_exp = max(2.0, round(min_exp + tc["exp_offset"], 1))
        birth_year = int(2026 - 23 - years_exp)

        matched_count = max(1, int(round(len(must_skills) * tc["skill_ratio"])))
        matched_skills = must_skills[:matched_count]
        if tc["rank"] == 1 and nice_skills:
            matched_skills = list(dict.fromkeys(must_skills + nice_skills))
        missing_skills = [s for s in must_skills if s not in matched_skills]

        total_score = round(
            tc["must_score"] * 0.40 + tc["sem_score"] * 0.35 + tc["exp_score"] * 0.25,
            1,
        )

        slug_name = remove_accents(full_name).upper().replace(" ", "_")
        pdf_file_name = f"CV_{job['id'].upper()}_RANK{tc['rank']}_{slug_name}.pdf"
        email_slug = remove_accents(f"{first_n}.{last_n}{global_num}").lower().replace(" ", "")
        email = f"{email_slug}@executive-vn.com"
        phone = f"09{global_num:02d}{(job_idx + 11):02d}{(c_idx + 25):02d}8"[:10]
        univ = UNIVERSITIES[(global_num + c_idx) % len(UNIVERSITIES)]
        source = SOURCES[(global_num + job_idx) % len(SOURCES)]

        raw_cv_lines = [
            f"HO SO UNG TUYEN QUAN LY CAP TRUNG & CAO CAP - {full_name.upper()}",
            f"==========================================================================",
            f"Vi tri ung tuyen: {job['title']} ({job['id']})",
            f"Linh vuc: {job['sector']} | Cap bac: {job['level']}",
            f"Ho va Ten: {full_name} | Nam sinh: {birth_year} | Gioi tinh: {gender}",
            f"Email: {email} | Dien thoai / Zalo: {phone} | Khu vuc: {job['location']}",
            f"Tong so nam kinh nghiem quan ly & chuyen mon: {years_exp} nam",
            f"--------------------------------------------------------------------------",
            f"1. TOM TAT NANG LUC LANH DAO & QUAN TRI (EXECUTIVE SUMMARY)",
            f"- Chuyen gia quan ly voi {years_exp} nam kinh nghiem thuc chien trong linh vuc {job['sector']}.",
            f"- Thanh tich noi bat: {tc['kpi_highlight']}",
            f"- Ky nang cot loi: {', '.join(matched_skills)}.",
            f"--------------------------------------------------------------------------",
            f"2. KINH NGHIEM CONG TAC & THANH TICH DINH LUONG (WORK EXPERIENCE)",
            f"[2021 - 2026] {job['title']} tai Tap doan Hang dau Viet Nam & FDI",
            f"- Truc tiep quan ly doi ngu tu 35 - 180 nhan su, chiu trach nhiem ngan sach P&L va chi so SLA/KPI.",
            f"- Chu tri cac du an chuyen doi so, toi uu quy trinh van hanh giup tang nang suat 32%.",
            f"- Xay dung he thong bao cao quan tri minh bach, phoi hop chat che voi Ban Tong Giam doc.",
            f"[2017 - 2021] Quan ly Cap trung / Truong bo phan Chuyen mon",
            f"- Thiet lap quy trinh chuan hoa ISO, dao tao doi ngu ke can va mo rong thi truong muc tieu.",
            f"--------------------------------------------------------------------------",
            f"3. HOC VAN & CHUNG CHI QUOC TE (EDUCATION & CERTIFICATIONS)",
            f"- {univ}",
            f"- Chung chi Quan tri & Ngoai ngu: {', '.join(matched_skills)}",
            f"--------------------------------------------------------------------------",
            f"4. XAC NHAN BAO MAT DU LIEU CA NHAN (NGHI DINH 13/2023/ND-CP)",
            f"- Ung vien dong y cung cap ho so PDF phuc vu sang loc va phong van AI tren HireMind Enterprise.",
        ]

        raw_cv_text = (
            f"HỒ SƠ ỨNG VIÊN QUẢN LÝ: {full_name}\n"
            f"Vị trí ứng tuyển: {job['title']} — {job['sector']} ({job['level']})\n"
            f"Email: {email} | Điện thoại: {phone} | Khu vực: {job['location']}\n"
            f"Tổng số năm kinh nghiệm: {years_exp} năm | Học vấn: {univ}\n"
            f"Kỹ năng chuyên môn & quản trị: {', '.join(matched_skills)}\n"
            f"Thành tích định lượng nổi bật: {tc['kpi_highlight']}\n"
            f"Quá trình công tác:\n"
            f"• 2021 - 2026: Đảm nhiệm vị trí quản lý tương đương {job['title']}, điều hành đội ngũ đa chức năng, kiểm soát ngân sách P&L và tối ưu hóa quy trình vận hành tăng 32% hiệu suất.\n"
            f"• 2017 - 2021: Trưởng bộ phận phụ trách triển khai các dự án trọng điểm, xây dựng hệ thống KPI/OKR và đào tạo nhân sự cốt cán."
        )

        # Tạo giải thích AI đa ngôn ngữ (8 ngôn ngữ chuẩn 100%: vi, en, ja, ko, zh, th, lo, km)
        en_job_title = job["title"].split("(")[-1].rstrip(")") if "(" in job["title"] else job["title"]
        rec_map_ja = {"STRONG_HIRE": "最優先採用推奨", "HIRE": "採用推奨", "CONSIDER": "要追加面接", "HOLD": "保留", "NO_HIRE": "見送り"}
        rec_map_ko = {"STRONG_HIRE": "최우선 채용 추천", "HIRE": "채용 추천", "CONSIDER": "심층 검토", "HOLD": "보류", "NO_HIRE": "미추천"}
        rec_map_zh = {"STRONG_HIRE": "强烈推荐录用", "HIRE": "推荐录用", "CONSIDER": "建议复试", "HOLD": "暂缓录用", "NO_HIRE": "不予录用"}
        rec_map_th = {"STRONG_HIRE": "แนะนำให้รับเข้าทำงานทันที", "HIRE": "แนะนำให้รับเข้าทำงาน", "CONSIDER": "ควรสัมภาษณ์เพิ่มเติม", "HOLD": "รอพิจารณา", "NO_HIRE": "ไม่ผ่านเกณฑ์"}
        rec_map_lo = {"STRONG_HIRE": "ແນະນຳໃຫ້ຮັບເຂົ້າເຮັດວຽກທັນທີ", "HIRE": "ແນະນຳໃຫ້ຮັບເຂົ້າເຮັດວຽກ", "CONSIDER": "ຄວນສຳພາດເພີ່ມເຕີມ", "HOLD": "ລໍຖ້າພິຈາລະນາ", "NO_HIRE": "ບໍ່ຜ່ານເງື່ອນໄຂ"}
        rec_map_km = {"STRONG_HIRE": "ផ្តល់អនុសាសន៍ឱ្យជ្រើសរើសភ្លាមៗ", "HIRE": "ផ្តល់អនុសាសន៍ឱ្យជ្រើសរើស", "CONSIDER": "គួរសម្ភាសន៍បន្ថែម", "HOLD": "រង់ចាំការពិចារណា", "NO_HIRE": "មិនជាប់លក្ខខណ្ឌ"}

        missing_vi = ", ".join(missing_skills) if missing_skills else "Đáp ứng trọn vẹn 100% yêu cầu"
        missing_en = ", ".join(missing_skills) if missing_skills else "100% Full Match"
        missing_ja = "、".join(missing_skills) if missing_skills else "必須スキル100%合致"
        missing_ko = ", ".join(missing_skills) if missing_skills else "필수 역량 100% 충족"
        missing_zh = "、".join(missing_skills) if missing_skills else "100% 完全匹配核心要求"
        missing_th = ", ".join(missing_skills) if missing_skills else "ตรงตามเกณฑ์ทักษะหลักครบ 100%"
        missing_lo = ", ".join(missing_skills) if missing_skills else "ຕອບສະໜອງເງື່ອນໄຂທັກສະຫຼັກຄົບ 100%"
        missing_km = ", ".join(missing_skills) if missing_skills else "បំពេញតាមលក្ខខណ្ឌជំនាញស្នូល 100%"

        explanations_i18n = {
            "vi": (
                f"[{tc['tier_label']}] Ứng viên {full_name} đạt {total_score}/100 điểm cho vị trí {job['title']}. "
                f"Kinh nghiệm {years_exp} năm (yêu cầu {min_exp}+ năm). Kỹ năng đạt: {', '.join(matched_skills)}. "
                f"Kỹ năng cần bổ sung: {missing_vi}. Thành tích: {tc['kpi_highlight']}"
            ),
            "en": (
                f"[RANK #{tc['rank']} CANDIDATE — {tc['recommendation']}] {full_name} scored {total_score}/100 for {en_job_title}. "
                f"Experience: {years_exp} yrs (requires {min_exp}+ yrs). Matched skills: {', '.join(matched_skills)}. "
                f"Skill gaps: {missing_en}."
            ),
            "ja": (
                f"[順位 #{tc['rank']}・推奨度: {rec_map_ja.get(tc['recommendation'], tc['recommendation'])}] 候補者は総合スコア {total_score}/100 を獲得しました。"
                f"実務・管理職経験 {years_exp}年（要件 {min_exp}年以上）。合致スキル: {'、'.join(matched_skills)}。不足スキル: {missing_ja}。"
            ),
            "ko": (
                f"[순위 #{tc['rank']} · 추천 등급: {rec_map_ko.get(tc['recommendation'], tc['recommendation'])}] 지원자는 종합 점수 {total_score}/100점을 기록했습니다. "
                f"관리직 및 실무 경력 {years_exp}년(요구 {min_exp}년 이상). 보유 역량: {', '.join(matched_skills)}. 보완 역량: {missing_ko}."
            ),
            "zh": (
                f"[排名第 #{tc['rank']} · 录用建议：{rec_map_zh.get(tc['recommendation'], tc['recommendation'])}] 候选人获得综合评分 {total_score}/100。"
                f"管理与专业经验 {years_exp} 年（要求 {min_exp}+ 年）。匹配技能：{'、'.join(matched_skills)}。待补充：{missing_zh}。"
            ),
            "th": (
                f"[อันดับที่ #{tc['rank']} • ข้อเสนอแนะ: {rec_map_th.get(tc['recommendation'], tc['recommendation'])}] ผู้สมัครได้คะแนนรวม {total_score}/100 คะแนน "
                f"ประสบการณ์บริหารและวิชาชีพ {years_exp} ปี (เกณฑ์ขั้นต่ำ {min_exp}+ ปี) ทักษะที่ตรงเกณฑ์: {', '.join(matched_skills)} ทักษะที่ต้องเสริม: {missing_th}"
            ),
            "lo": (
                f"[ອັນດັບທີ #{tc['rank']} • ຂໍ້ສະເໜີແນະ: {rec_map_lo.get(tc['recommendation'], tc['recommendation'])}] ຜູ້ສະໝັກໄດ້ຄະແນນລວມ {total_score}/100 ຄະແນນ. "
                f"ປະສົບການບໍລິຫານ ແລະ ວິຊາຊີບ {years_exp} ປີ (ເງື່ອນໄຂຂັ້ນຕ່ຳ {min_exp}+ ປີ). ທັກສະທີ່ຕົງເງື່ອນໄຂ: {', '.join(matched_skills)}. ທັກສະທີ່ຕ້ອງເສີມ: {missing_lo}."
            ),
            "km": (
                f"[ចំណាត់ថ្នាក់ទី #{tc['rank']} • អនុសាសន៍៖ {rec_map_km.get(tc['recommendation'], tc['recommendation'])}] បេក្ខជនទទួលបានពិន្ទុសរុប {total_score}/100 ពិន្ទុ។ "
                f"បទពិសោធន៍គ្រប់គ្រង និងជំនាញវិជ្ជាជីវៈ {years_exp} ឆ្នាំ (លក្ខខណ្ឌអប្បបរមា {min_exp}+ ឆ្នាំ)។ ជំនាញដែលត្រូវគ្នា៖ {', '.join(matched_skills)}។ ជំនាញត្រូវបំពេញបន្ថែម៖ {missing_km}។"
            ),
        }

        profiles.append(
            {
                "global_num": global_num,
                "rank": tc["rank"],
                "tier_label": tc["tier_label"],
                "full_name": full_name,
                "gender": gender,
                "birth_year": birth_year,
                "email": email,
                "phone": phone,
                "source": source,
                "years_exp": years_exp,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "must_score": tc["must_score"],
                "sem_score": tc["sem_score"],
                "exp_score": tc["exp_score"],
                "total_score": total_score,
                "stage": tc["stage"],
                "interview_status": tc["interview_status"],
                "int_scores": tc["int_scores"],
                "recommendation": tc["recommendation"],
                "kpi_highlight": tc["kpi_highlight"],
                "pdf_file_name": pdf_file_name,
                "pdf_lines": raw_cv_lines,
                "raw_cv_text": raw_cv_text,
                "explanations_i18n": explanations_i18n,
            }
        )
    return profiles


def seed_all_30_jobs_and_150_cvs() -> None:
    os.makedirs(STATIC_CV_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except PermissionError:
            pass

    # Khởi tạo cấu trúc bảng cơ sở dữ liệu
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Xóa dữ liệu mẫu cũ để nạp trọn bộ 30 Jobs & 150 CVs chuẩn xác
    for tbl in [
        "jobs",
        "candidates",
        "applications",
        "resumes",
        "screening_results",
        "interviews",
        "interview_turns",
        "evaluations",
        "consents",
        "audit_logs",
    ]:
        cur.execute(f"DELETE FROM {tbl}")

    ts = now_iso()
    total_pdfs_written = 0

    for j_idx, job in enumerate(TOP_30_JOBS):
        job_id = job["id"]
        rubric_cfg = [
            {"criterion": q["competency"], "weight": 0.35 if idx == 0 else (0.35 if idx == 1 else 0.30)}
            for idx, q in enumerate(job["questions"])
        ]
        cur.execute(
            """
            INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                DEFAULT_ORG_ID,
                f"[{job['level'].split(' (')[0]}] {job['title']}",
                job["sector"],
                job["location"],
                "Full-time (Quản lý)",
                job["salary_range"],
                "vi",
                json.dumps(["vi", "en", "ja", "ko", "zh", "th", "lo", "km"]),
                "open",
                job["jd"],
                json.dumps(job["skills"], ensure_ascii=False),
                json.dumps(job.get("nice_skills", []), ensure_ascii=False),
                job["min_exp"],
                json.dumps(rubric_cfg, ensure_ascii=False),
                json.dumps({"must_have": 0.40, "semantic": 0.35, "experience": 0.25}),
                json.dumps(job["questions"], ensure_ascii=False),
                0,
                ts,
            ),
        )

        profiles = build_candidate_profiles_for_job(j_idx, job)
        for p in profiles:
            num = p["global_num"]
            cand_id = f"cand_{num:03d}"
            app_id = f"app_{num:03d}"
            res_id = f"res_{num:03d}"
            scr_id = f"scr_{num:03d}"
            int_id = f"int_{num:03d}"
            eval_id = f"eval_{num:03d}"
            token = f"tok_{job_id}_r{p['rank']}"
            masked_code = f"MGR #{job_id.upper()}-R{p['rank']}"

            # 1. Ghi file PDF vật lý vào backend/static/cvs/
            pdf_path = os.path.join(STATIC_CV_DIR, p["pdf_file_name"])
            pdf_bytes = generate_valid_pdf_bytes(p["pdf_lines"])
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)
            total_pdfs_written += 1

            # 2. Lưu Candidate
            cur.execute(
                "INSERT INTO candidates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    cand_id,
                    DEFAULT_ORG_ID,
                    p["full_name"],
                    masked_code,
                    p["email"],
                    p["phone"],
                    p["phone"],
                    p["gender"],
                    p["birth_year"],
                    job["location"],
                    p["source"],
                    "vi",
                    compute_content_hash(p["raw_cv_text"]),
                    ts,
                ),
            )

            # 3. Lưu Resume đính kèm đường dẫn PDF
            parsed_json = {
                "email": p["email"],
                "phone": p["phone"],
                "years_experience": p["years_exp"],
                "matched_skills": p["matched_skills"],
                "pdf_url": f"/static/cvs/{p['pdf_file_name']}",
                "rank_in_job": p["rank"],
                "tier_label": p["tier_label"],
            }
            cur.execute(
                "INSERT INTO resumes VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    res_id,
                    DEFAULT_ORG_ID,
                    cand_id,
                    p["pdf_file_name"],
                    p["raw_cv_text"],
                    json.dumps(parsed_json, ensure_ascii=False),
                    json.dumps([0.12, 0.25, 0.34, 0.41, 0.19, 0.28, 0.33, 0.15]),
                    ts,
                ),
            )

            # 4. Lưu Application
            cur.execute(
                "INSERT INTO applications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    app_id,
                    DEFAULT_ORG_ID,
                    job_id,
                    cand_id,
                    p["stage"],
                    p["total_score"],
                    None,
                    None,
                    None,
                    None,
                    0,
                    ts,
                    ts,
                ),
            )

            # 5. Lưu Screening Result
            cur.execute(
                "INSERT INTO screening_results VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    scr_id,
                    DEFAULT_ORG_ID,
                    app_id,
                    p["total_score"],
                    p["must_score"],
                    p["sem_score"],
                    p["exp_score"],
                    json.dumps(p["matched_skills"], ensure_ascii=False),
                    json.dumps(p["missing_skills"], ensure_ascii=False),
                    json.dumps(p["explanations_i18n"], ensure_ascii=False),
                    json.dumps([p["tier_label"], p["kpi_highlight"]], ensure_ascii=False),
                    json.dumps([], ensure_ascii=False),
                    "gemini-2.5-flash + bge-m3-exec-v2",
                    "prompt-screening-exec-v3.0",
                    0.008,
                    ts,
                ),
            )

            # 6. Lưu Interview Session & Turns
            cur.execute(
                "INSERT INTO interviews VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    int_id,
                    DEFAULT_ORG_ID,
                    app_id,
                    "voice_structured_star",
                    "vi",
                    p["interview_status"],
                    token,
                    1,
                    0,
                    0,
                    ts,
                    ts if p["interview_status"] == "completed" else None,
                    ts,
                ),
            )

            cur.execute(
                "INSERT INTO consents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    f"con_{num:03d}",
                    DEFAULT_ORG_ID,
                    cand_id,
                    1,
                    1,
                    1,
                    "113.161.72.10",
                    "2027-10-17T00:00:00Z",
                    ts,
                ),
            )

            turn_scores_valid = []
            for q_idx, q_item in enumerate(job["questions"]):
                t_score = p["int_scores"][q_idx] if q_idx < len(p["int_scores"]) else None
                if t_score is not None:
                    turn_scores_valid.append(t_score)
                    if p["rank"] == 1:
                        ans = (
                            f"Trong {p['years_exp']} năm giữ vai trò quản lý tại {job['sector']}, tôi đã trực tiếp thiết lập hệ thống KPI/OKR cho bộ phận, "
                            f"ứng dụng phân tích dữ liệu và chuẩn hóa quy trình vận hành. Kết quả: {p['kpi_highlight']}"
                        )
                        fb = (
                            f"Câu trả lời xuất sắc theo chuẩn STAR ({t_score}/100): Ứng viên nêu rõ bối cảnh quản trị, giải pháp chiến lược "
                            f"và dẫn chứng số liệu KPI định lượng vượt trội."
                        )
                        ev = f"\"{p['kpi_highlight']}\""
                    elif p["rank"] == 2:
                        ans = (
                            f"Với {p['years_exp']} năm kinh nghiệm, tôi đã chủ trì chuẩn hóa quy trình làm việc liên phòng ban, kiểm soát chặt chẽ chi phí "
                            f"và đào tạo đội ngũ kế cận. Kết quả: {p['kpi_highlight']}"
                        )
                        fb = (
                            f"Câu trả lời tốt ({t_score}/100): Trình bày rõ kinh nghiệm quản lý thực tế và kết quả hoàn thành vượt chỉ tiêu."
                        )
                        ev = f"\"{p['kpi_highlight']}\""
                    else:
                        ans = (
                            f"Tôi đã có {p['years_exp']} năm phối hợp cùng đội ngũ triển khai các kế hoạch định kỳ của phòng ban "
                            f"và đảm bảo chất lượng công việc theo tiêu chuẩn công ty."
                        )
                        fb = (
                            f"Câu trả lời đạt mức cơ bản ({t_score}/100): Có kinh nghiệm triển khai nhưng cần bổ sung thêm dẫn chứng quản trị P&L ở quy mô lớn hơn."
                        )
                        ev = "\"Đảm bảo chất lượng công việc theo tiêu chuẩn công ty.\""
                else:
                    ans = None
                    fb = None
                    ev = None

                cur.execute(
                    "INSERT INTO interview_turns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        f"turn_{num:03d}_{q_idx + 1}",
                        DEFAULT_ORG_ID,
                        int_id,
                        q_idx + 1,
                        q_item["competency"],
                        q_item["question"],
                        0,
                        ans,
                        85 if ans else 0,
                        t_score,
                        fb,
                        ev,
                        1,
                        ts,
                    ),
                )

            # 7. Lưu Final Evaluation cho các ứng viên đã phỏng vấn để đối sánh chọn Top 1
            if turn_scores_valid:
                avg_int = round(sum(turn_scores_valid) / len(turn_scores_valid), 1)
                combined_final = round(p["total_score"] * 0.45 + avg_int * 0.55, 1)
                summary_i18n = {
                    "vi": (
                        f"[{p['tier_label']}] Điểm tổng hợp Sàng lọc CV ({p['total_score']}) & Phỏng vấn AI ({avg_int}) đạt {combined_final}/100. "
                        f"Khuyến nghị hội đồng: {p['recommendation']}."
                    ),
                    "en": (
                        f"[Rank #{p['rank']}] Combined CV ({p['total_score']}) & AI Interview ({avg_int}) score: {combined_final}/100. "
                        f"Recommendation: {p['recommendation']}."
                    ),
                    "ja": f"[順位 #{p['rank']}] 書類選考({p['total_score']})＋AI面接({avg_int}) 総合評価: {combined_final}/100 ({p['recommendation']})。",
                    "ko": f"[순위 #{p['rank']}] 서류({p['total_score']}) + AI 면접({avg_int}) 종합 점수: {combined_final}/100 ({p['recommendation']}).",
                    "zh": f"[排名 #{p['rank']}] 简历初筛({p['total_score']}) + AI 面试({avg_int}) 综合得分：{combined_final}/100 ({p['recommendation']})。",
                    "th": f"[อันดับ #{p['rank']}] คะแนนรวมคัดกรองเรซูเม่ ({p['total_score']}) + สัมภาษณ์ AI ({avg_int}) = {combined_final}/100 ({p['recommendation']})",
                    "lo": f"[ອັນດັບ #{p['rank']}] ຄະແນນລວມຄັດກອງຊີວະປະຫວັດ ({p['total_score']}) + ສຳພາດ AI ({avg_int}) = {combined_final}/100 ({p['recommendation']})",
                    "km": f"[ចំណាត់ថ្នាក់ #{p['rank']}] ពិន្ទុសរុបប្រវត្តិរូប ({p['total_score']}) + សម្ភាសន៍ AI ({avg_int}) = {combined_final}/100 ({p['recommendation']})",
                }
                cur.execute(
                    "INSERT INTO evaluations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        eval_id,
                        DEFAULT_ORG_ID,
                        app_id,
                        int_id,
                        json.dumps(
                            {
                                "cv_score": p["total_score"],
                                "interview_score": avg_int,
                                "combined_score": combined_final,
                                "rank_in_job": p["rank"],
                            }
                        ),
                        avg_int,
                        p["recommendation"],
                        json.dumps(summary_i18n, ensure_ascii=False),
                        json.dumps(p["matched_skills"], ensure_ascii=False),
                        json.dumps(p["missing_skills"], ensure_ascii=False),
                        json.dumps([p["kpi_highlight"]], ensure_ascii=False),
                        json.dumps(
                            ["Thẩm định mức lương kỳ vọng & ngày nhận việc (Onboarding Date)"],
                            ensure_ascii=False,
                        ),
                        None,
                        None,
                        None,
                        ts,
                    ),
                )

    # Ghi nhật ký kiểm toán (Audit Log)
    cur.execute(
        "INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "log_seed_30x5",
            DEFAULT_ORG_ID,
            "HireMind AI Batch Engine",
            "system",
            "SEED_30_JOBS_150_PDF_CVS",
            "database",
            "30_jobs_150_cvs",
            json.dumps(
                {
                    "jobs_created": 30,
                    "pdf_cvs_generated": total_pdfs_written,
                    "top_1_selected_per_job": 30,
                },
                ensure_ascii=False,
            ),
            ts,
        ),
    )

    conn.commit()
    conn.close()
    print(f"SUCCESS: Seeded 30 Jobs and {total_pdfs_written} PDF CVs into {DB_PATH}")


if __name__ == "__main__":
    seed_all_30_jobs_and_150_cvs()
