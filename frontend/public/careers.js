const API_BASE =
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
  window.location.port !== "8010"
    ? `http://${window.location.hostname}:8010`
    : "";

const portalState = {
  lang: localStorage.getItem("hiremind_lang") || "vi",
  dark: localStorage.getItem("hiremind_portal_theme") === "dark",
  activeSection: "jobs", // jobs | categories | employers | my_apps
  viewMode: "split", // split (Master-Detail Executive Explorer) | grid (Bento 3-Column)
  selectedJobId: "job_01",
  searchQuery: "",
  selectedCategory: "all",
  selectedEmployer: "all",
  selectedLevel: "all", // all | senior | middle | saved
  selectedLocation: "all", // all | hanoi | hcmc | danang
  sortBy: "ai_match", // ai_match | salary | exp
  savedJobs: JSON.parse(localStorage.getItem("hiremind_saved_jobs") || '["job_01","job_04"]'),
  autoTranslateEnabled: true,
  dynamicCache: JSON.parse(localStorage.getItem("hiremind_portal_i18n_cache") || "{}"),
  marketplace: {
    total_open_jobs: 0,
    total_employers: 0,
    total_categories: 0,
    employers: [],
    categories: [],
    jobs: [],
  },
  demoAccounts: { employers: [], candidates: [] },
  currentUser: JSON.parse(localStorage.getItem("hiremind_portal_user") || "null"),
  myApplications: [],
  trackQuery: "",
};

/* ============================================================================
   1. FULL 8-LANGUAGE STATIC UI & MODAL DICTIONARY (100% COVERAGE)
   ============================================================================ */
const PORTAL_I18N = {
  vi: {
    pageTitle: "HireMind Global Careers — Cổng Tuyển Dụng Quản Lý & Chuyên Gia Quốc Tế",
    badgePortal: "CỔNG TUYỂN DỤNG QUỐC TẾ",
    subPortal: "Sàn Việc làm Quản lý & Chuyên gia • Tích hợp Sàng lọc CV & Phỏng vấn AI 24/7",
    navJobs: "Việc làm Quản lý",
    navCategories: "10 Danh mục Ngành",
    navEmployers: "Doanh nghiệp Thành viên",
    navMyApps: "Hồ sơ Đã Ứng tuyển",
    btnAiTranslator: "🤖 AI Dịch Tự Động (100%)",
    btnCandAuth: "👤 Tài khoản Ứng viên",
    btnEmpAuth: "🏢 Dành cho Doanh nghiệp (B2B)",
    btnOpenEmpWorkspace: "🚀 Quản trị Dữ liệu Riêng Công ty",
    btnLogout: "Đăng xuất",
    toastLoggedOut: "Đã đăng xuất tài khoản.",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "Kết nối Nhân tài Quản lý Cấp Trung & Cao Cấp với Tập đoàn Đa Quốc Gia",
    heroSub: "Doanh nghiệp đăng ký thành viên được cấp phát không gian quản trị tuyển dụng riêng biệt (Multi-Tenant). Ứng viên tạo tài khoản tìm việc, chọn danh mục ngành nghề để ứng tuyển 1-Click và phỏng vấn AI trực tuyến 24/7.",
    searchPlaceholder: "Tìm kiếm chức danh (VD: Giám đốc, Trưởng phòng, CTO, CFO), kỹ năng, địa điểm...",
    allCategories: "Tất cả 10 Danh mục Ngành nghề",
    allEmployers: "Tất cả Doanh nghiệp Thành viên",
    statJobs: "Vị trí Quản lý Đang mở",
    statCategories: "Lĩnh vực Ngành Mũi nhọn",
    statEmployers: "Tập đoàn & Doanh nghiệp",
    statAi: "Chấm điểm & Phỏng vấn AI",
    secCategoriesTitle: "📂 Chọn Danh mục Lĩnh vực Công việc Tuyển dụng",
    secCategoriesSub: "Nhấp vào bất kỳ danh mục ngành nghề nào để lọc danh sách vị trí quản lý đang tuyển dụng của các doanh nghiệp.",
    btnClearCategory: "✖ Bỏ lọc ngành nghề",
    btnClearEmployer: "✖ Xem tất cả doanh nghiệp",
    secEmployersTitle: "🏢 Các Tập đoàn & Doanh nghiệp Thành viên Đang Tuyển dụng",
    secEmployersSub: "Mỗi doanh nghiệp sở hữu hệ thống dữ liệu quản trị độc lập (cô lập theo Mã tổ chức org_id). Doanh nghiệp mới có thể đăng ký ngay để được cấp phát tài khoản riêng.",
    btnRegNewEmployer: "➕ Đăng ký Tài khoản Doanh nghiệp Mới (Cấp phát Dữ liệu Riêng)",
    btnRegNewCandidate: "👤 Đăng ký Tài khoản Ứng viên Tìm việc",
    btnFilterByEmployer: "Xem việc làm của công ty này",
    btnOpenCompanyAts: "🔑 Vào Cổng Quản trị Riêng",
    secJobsTitle: "🔥 Danh sách Vị trí Quản lý & Chuyên gia Đang Mở Tuyển",
    btnApplyJob: "🚀 Ứng tuyển Ngay (AI Chấm điểm)",
    lblOpenJobsCount: "vị trí đang mở",
    lblApplicantsCount: "hồ sơ đã nộp",
    lblMinExp: "Kinh nghiệm:",
    lblYears: "năm",
    myAppsTitle: "📋 Quản lý Hồ sơ Ứng tuyển & Lịch Phỏng vấn AI Của Tôi",
    myAppsSub: "Theo dõi tiến độ ứng tuyển tại các doanh nghiệp theo thời gian thực và tham gia phỏng vấn AI 24/7.",
    trackPlaceholder: "Nhập Email, Số điện thoại hoặc Họ tên để tra cứu toàn bộ hồ sơ đã ứng tuyển...",
    btnSearchTrack: "🔍 Tra cứu Hồ sơ",
    btnEnterAiInterview: "🎙️ Vào Phòng Phỏng vấn AI Ngay",
    btnViewPdfCv: "📄 Xem CV PDF",
    emptyTrackMsg: "Không tìm thấy hồ sơ ứng tuyển nào khớp với từ khóa",
    lblAppId: "Mã HS:",
    lblStage: "Giai đoạn:",
    lblAiScore: "Điểm AI:",
    lblCandidate: "Ứng viên:",
    footerCompliance: "Tuân thủ Nghị định 13/2023/NĐ-CP & GDPR • Đã dịch tự động 100%",
    footerAtsLink: "🏢 Cổng Quản trị Doanh nghiệp (Enterprise ATS) →",
    btnClose: "Đóng",
    // Candidate Auth Modal
    candModalBadge: "TÀI KHOẢN ỨNG VIÊN TÌM VIỆC",
    candModalTitle: "👤 Tài khoản Ứng viên Tìm việc & Hồ sơ Số hóa (1-Click Apply)",
    candDemoTitle: "⚡ Đăng nhập Nhanh Tài khoản Ứng viên Mẫu (1-Click):",
    candRegHeading: "Hoặc Đăng ký Tài khoản Ứng viên Tìm việc Mới:",
    lblCandFullName: "Họ và tên Ứng viên *",
    lblCandEmail: "Email Đăng nhập & Nhận thông báo *",
    lblCandPhone: "Số điện thoại (Zalo ZNS)",
    lblCandExpYears: "Số năm kinh nghiệm Quản lý",
    lblCandSector: "Danh mục Lĩnh vực Ngành nghề Quan tâm",
    lblCandSkills: "Kỹ năng Cốt lõi (Phân cách bằng dấu phẩy)",
    lblCandBio: "Hồ sơ Năng lực / CV Mặc định (Dùng để Ứng tuyển 1-Click)",
    btnCandSubmitReg: "✔ Tạo Tài khoản Ứng viên & Kích hoạt Hồ sơ 1-Click Apply",
    // Employer Auth Modal
    empModalBadge: "DOANH NGHIỆP THÀNH VIÊN B2B MULTI-TENANT",
    empModalTitle: "🏢 Đăng ký / Đăng nhập Tài khoản Tổ chức Doanh nghiệp",
    empDemoTitle: "⚡ Chuyển Nhanh vào Tài khoản Quản trị Doanh nghiệp Mẫu (Cô lập dữ liệu theo org_id):",
    lblOrgId: "Mã tổ chức:",
    empRegHeading: "➕ Đăng ký Doanh nghiệp Thành viên Mới (Tự động cấp phát Mã Tổ chức org_id & Không gian Dữ liệu Riêng):",
    lblEmpCompanyName: "Tên Doanh nghiệp / Tập đoàn *",
    lblEmpCountry: "Quốc gia / Khu vực",
    lblEmpAdminName: "Họ tên Quản trị viên Nhân sự (HR Admin) *",
    lblEmpEmail: "Email Quản trị Doanh nghiệp *",
    lblEmpIndustry: "Lĩnh vực Hoạt động Chính",
    lblEmpSubdomain: "Tên miền phụ riêng (Subdomain)",
    empBenefitBox: "✨ <b>Quyền lợi cấp phát tự động:</b> Ngay sau khi bấm đăng ký, hệ thống sẽ tạo mã định danh tổ chức riêng (<code>TENANT-...</code>), cấp 500,000 AI Credits qua <code>motapis.com/v1</code>, khởi tạo sẵn 2 tin tuyển dụng mẫu của doanh nghiệp trên Sàn Public và đưa bạn vào Cổng Quản trị Dữ liệu Riêng.",
    btnEmpSubmitReg: "🚀 Đăng ký Doanh nghiệp & Mở Cổng Quản trị Dữ liệu Riêng Ngay",
    // Apply Modal & AI Screening Result
    applyAutoFillBanner: "✔ Đã tự động điền thông tin từ Tài khoản Ứng viên. Bạn có thể bấm nộp ngay với 1-Click!",
    lblPrefInterviewLang: "Ngôn ngữ Phỏng vấn AI Ưa thích",
    lblCurrentLangOpt: "Ngôn ngữ hiện tại",
    lblAttachCvFile: "Đính kèm File CV (PDF / DOCX / TXT - Tùy chọn)",
    lblCvSummaryText: "Nội dung Hồ sơ Năng lực / Tóm tắt CV *",
    applyPrivacyBox: "🔒 <b>Bảo mật Nghị định 13/2023/NĐ-CP & GDPR:</b> Hồ sơ của bạn chỉ được gửi riêng tới bộ phận Nhân sự của doanh nghiệp tuyển dụng và được ẩn danh PII trước khi AI chấm điểm.",
    btnSubmitApply: "🚀 Gửi Hồ Sơ Ứng Tuyển & Nhận Điểm Đánh Giá AI Tức Thì",
    resBadge: "HOÀN TẤT CHẤM ĐIỂM AI (MOTAPIS.COM/V1)",
    resTitle: "Nộp Hồ Sơ Ứng Tuyển Thành Công!",
    resScoreLabel: "Điểm Phù Hợp AI (AI Screening Score)",
    resPrivateVaultNote: "✔ Hồ sơ của bạn đã được chuyển vào kho dữ liệu riêng của Doanh nghiệp tuyển dụng!",
    btnTrackMySubmitted: "📋 Xem Tiến độ Hồ sơ Đã Nộp",
    // AI Auto-Translator Modal
    transModalBadge: "CÔNG CỤ DỊCH TỰ ĐỘNG ĐA NGÔN NGỮ AI (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 Trung tâm Dịch Tự Động 8 Ngôn Ngữ Thời Gian Thực",
    transModalSub: "Tự động dịch 100% giao diện, 30 chức danh quản lý, 10 danh mục ngành, 6 tập đoàn thành viên và mọi nội dung JD/CV phát sinh mới khi chuyển đổi ngôn ngữ.",
    lblTransCoverage: "Độ phủ Dịch thuật Trang Public Hiện tại:",
    lblAutoTransToggle: "Tự động dịch mọi nội dung mới khi đổi ngôn ngữ:",
    lblCustomTransInput: "Nhập văn bản Tuyển dụng / JD / CV bất kỳ để AI dịch tức thì sang ngôn ngữ đang chọn:",
    btnRunCustomTrans: "⚡ Dịch Ngay Bằng AI (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 Đồng bộ & Dịch lại 100% Trang Hiện Tại",
  },
  en: {
    pageTitle: "HireMind Global Careers — Executive & Management Public Talent Marketplace",
    badgePortal: "GLOBAL CAREER MARKETPLACE",
    subPortal: "Executive & Management Job Portal • Instant AI Screening & 24/7 AI Interview",
    navJobs: "Executive Jobs",
    navCategories: "10 Industry Categories",
    navEmployers: "Member Enterprises",
    navMyApps: "My Applications",
    btnAiTranslator: "🤖 AI Auto-Translate (100%)",
    btnCandAuth: "👤 Candidate Account",
    btnEmpAuth: "🏢 For Employers (B2B)",
    btnOpenEmpWorkspace: "🚀 Open Private Company ATS",
    btnLogout: "Sign Out",
    toastLoggedOut: "Signed out successfully.",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "Connecting Middle & Senior Management Talent with Global Enterprises",
    heroSub: "Enterprises register to receive an isolated multi-tenant recruitment workspace. Candidates create a job-seeker account, browse 10 industry categories, apply with 1-Click, and take 24/7 AI Interviews.",
    searchPlaceholder: "Search management titles (CTO, Director, Head, Manager), skills, or locations...",
    allCategories: "All 10 Industry Categories",
    allEmployers: "All Member Enterprises",
    statJobs: "Open Management Jobs",
    statCategories: "Core Industry Sectors",
    statEmployers: "Verified Enterprises",
    statAi: "24/7 AI Screening & Interview",
    secCategoriesTitle: "📂 Browse Jobs by 10 Core Industry Categories",
    secCategoriesSub: "Select an industry category to filter open management positions across all member enterprises.",
    btnClearCategory: "✖ Clear Category Filter",
    btnClearEmployer: "✖ Show All Enterprises",
    secEmployersTitle: "🏢 Verified Member Enterprises & Multi-Tenant Organizations",
    secEmployersSub: "Each enterprise operates an isolated recruitment workspace (org_id). Register your company to provision a dedicated workspace immediately.",
    btnRegNewEmployer: "➕ Register New Enterprise Account (Provision Dedicated Workspace)",
    btnRegNewCandidate: "👤 Create Candidate Job-Seeker Account",
    btnFilterByEmployer: "View Company Jobs",
    btnOpenCompanyAts: "🔑 Open Company ATS",
    secJobsTitle: "🔥 Open Executive & Middle Management Positions",
    btnApplyJob: "🚀 Apply Now (Instant AI Score)",
    lblOpenJobsCount: "open jobs",
    lblApplicantsCount: "applicants",
    lblMinExp: "Min Experience:",
    lblYears: "years",
    myAppsTitle: "📋 My Job Applications & 24/7 AI Interview Portal",
    myAppsSub: "Track real-time application stages across enterprises and enter your 24/7 AI Interview room.",
    trackPlaceholder: "Enter your Email, Phone, or Name to look up all submitted applications...",
    btnSearchTrack: "🔍 Track Applications",
    btnEnterAiInterview: "🎙️ Enter AI Interview Room",
    btnViewPdfCv: "📄 View PDF CV",
    emptyTrackMsg: "No job applications found matching query",
    lblAppId: "App ID:",
    lblStage: "Stage:",
    lblAiScore: "AI Score:",
    lblCandidate: "Candidate:",
    footerCompliance: "Compliant with Decree 13/2023/ND-CP & GDPR • 100% AI Localized",
    footerAtsLink: "🏢 Enterprise Multi-Tenant ATS Portal →",
    btnClose: "Close",
    // Candidate Auth Modal
    candModalBadge: "CANDIDATE PORTAL ACCOUNT",
    candModalTitle: "👤 Job-Seeker Account & Digital CV Vault (1-Click Apply)",
    candDemoTitle: "⚡ 1-Click Quick Login with Demo Candidate Account:",
    candRegHeading: "Or Register a New Candidate Job-Seeker Account:",
    lblCandFullName: "Candidate Full Name *",
    lblCandEmail: "Login & Notification Email *",
    lblCandPhone: "Phone Number (WhatsApp / Zalo)",
    lblCandExpYears: "Years of Management Experience",
    lblCandSector: "Preferred Industry Category",
    lblCandSkills: "Core Competencies (Comma-separated)",
    lblCandBio: "Default Executive Bio / CV Summary (For 1-Click Apply)",
    btnCandSubmitReg: "✔ Create Candidate Account & Activate 1-Click Apply",
    // Employer Auth Modal
    empModalBadge: "B2B MULTI-TENANT EMPLOYER",
    empModalTitle: "🏢 Register / Sign In to Enterprise Organization Account",
    empDemoTitle: "⚡ Instant Switch to Demo Enterprise Workspace (Isolated by org_id):",
    lblOrgId: "Org ID:",
    empRegHeading: "➕ Register New Member Enterprise (Auto-Provision Dedicated org_id & Private Workspace):",
    lblEmpCompanyName: "Enterprise / Corporation Name *",
    lblEmpCountry: "Country / Region",
    lblEmpAdminName: "HR Administrator Full Name *",
    lblEmpEmail: "Corporate Admin Email *",
    lblEmpIndustry: "Primary Industry Sector",
    lblEmpSubdomain: "Dedicated Subdomain",
    empBenefitBox: "✨ <b>Instant Auto-Provisioning:</b> Upon registration, the system automatically assigns a private organization ID (<code>TENANT-...</code>), grants 500,000 AI Credits via <code>motapis.com/v1</code>, seeds 2 executive requisitions on the Public Marketplace, and opens your isolated ATS workspace.",
    btnEmpSubmitReg: "🚀 Register Enterprise & Launch Private ATS Workspace",
    // Apply Modal & AI Screening Result
    applyAutoFillBanner: "✔ Auto-filled from your Candidate Digital CV Vault. Ready for 1-Click submission!",
    lblPrefInterviewLang: "Preferred AI Interview Language",
    lblCurrentLangOpt: "Current UI Language",
    lblAttachCvFile: "Attach CV File (PDF / DOCX / TXT - Optional)",
    lblCvSummaryText: "Executive Summary / CV Profile Content *",
    applyPrivacyBox: "🔒 <b>Decree 13 & GDPR Data Privacy:</b> Your application is routed exclusively to the hiring enterprise's isolated workspace and PII-masked prior to AI evaluation.",
    btnSubmitApply: "🚀 Submit Application & Get Instant AI Screening Score",
    resBadge: "AI SCREENING COMPLETED (MOTAPIS.COM/V1)",
    resTitle: "Application Submitted Successfully!",
    resScoreLabel: "Overall AI Fit Score (Explainable AI)",
    resPrivateVaultNote: "✔ Your dossier has been securely delivered to the hiring enterprise's private ATS!",
    btnTrackMySubmitted: "📋 Track My Submitted Applications",
    // AI Auto-Translator Modal
    transModalBadge: "REAL-TIME AI MULTILINGUAL TRANSLATION ENGINE (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 8-Language Real-Time AI Auto-Translation Studio",
    transModalSub: "Automatically translates 100% of UI labels, 30 management requisitions, 10 industry sectors, 6 member enterprises, and any newly created JD/CV content upon language selection.",
    lblTransCoverage: "Current Public Portal Localization Coverage:",
    lblAutoTransToggle: "Automatically translate newly added content when switching languages:",
    lblCustomTransInput: "Enter any custom Recruitment / JD / CV text for instant AI translation:",
    btnRunCustomTrans: "⚡ Translate Now via AI (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 Re-Sync & Translate 100% of Current Page",
  },
  ja: {
    pageTitle: "HireMind Global Careers — 管理職・専門職向けグローバル公開採用ポータル",
    badgePortal: "グローバル採用マーケットプレイス",
    subPortal: "管理職・専門職向け公開求人ポータル • AI即時書類選考＆24時間AI面接",
    navJobs: "管理職求人一覧",
    navCategories: "10大産業カテゴリー",
    navEmployers: "参画企業一覧",
    navMyApps: "応募履歴・選考状況",
    btnAiTranslator: "🤖 AI自動翻訳 (100%)",
    btnCandAuth: "👤 求職者アカウント",
    btnEmpAuth: "🏢 採用企業様 (B2B)",
    btnOpenEmpWorkspace: "🚀 自社専用ATS管理画面へ",
    btnLogout: "ログアウト",
    toastLoggedOut: "ログアウトしました。",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "中間管理職・エグゼクティブ人材とグローバル企業を結ぶAI採用プラットフォーム",
    heroSub: "採用企業は会員登録により独立した専用データ管理環境（マルチテナント）を即時発行。求職者はアカウント登録後、10大産業カテゴリーから1クリック応募・AI面接が可能です。",
    searchPlaceholder: "職種名（部長、ディレクター、工場長）、スキル、勤務地で検索...",
    allCategories: "全10大産業カテゴリー",
    allEmployers: "すべての参画企業",
    statJobs: "公開中の管理職求人",
    statCategories: "主要産業カテゴリー",
    statEmployers: "参画グローバル企業",
    statAi: "AI即時選考＆面接",
    secCategoriesTitle: "📂 10大産業カテゴリーから求人を探す",
    secCategoriesSub: "ご希望の業界カテゴリーを選択して、各企業が募集中の管理職求人を絞り込めます。",
    btnClearCategory: "✖ カテゴリー絞り込みを解除",
    btnClearEmployer: "✖ すべての企業を表示",
    secEmployersTitle: "🏢 参画企業・マルチテナント契約組織一覧",
    secEmployersSub: "各企業には完全に分離された専用管理環境（org_id）が割り当てられます。新規企業登録も即時可能です。",
    btnRegNewEmployer: "➕ 新規採用企業アカウント登録（専用環境を即時発行）",
    btnRegNewCandidate: "👤 求職者会員登録（1クリック応募）",
    btnFilterByEmployer: "この企業の求人を見る",
    btnOpenCompanyAts: "🔑 専用管理画面を開く",
    secJobsTitle: "🔥 募集中の管理職・エグゼクティブ求人",
    btnApplyJob: "🚀 今すぐ応募（AI即時採点）",
    lblOpenJobsCount: "件の公開求人",
    lblApplicantsCount: "名の応募者",
    lblMinExp: "必要経験:",
    lblYears: "年以上",
    myAppsTitle: "📋 応募済み求人・AI面接ステータス管理",
    myAppsSub: "各企業への応募進捗をリアルタイムで確認し、AI面接ルームへ入室できます。",
    trackPlaceholder: "メールアドレス、電話番号、または氏名を入力して応募履歴を照会...",
    btnSearchTrack: "🔍 応募状況を照会",
    btnEnterAiInterview: "🎙️ AI面接ルームへ入室",
    btnViewPdfCv: "📄 PDF履歴書を表示",
    emptyTrackMsg: "該当する応募履歴が見つかりませんでした：",
    lblAppId: "応募ID:",
    lblStage: "選考段階:",
    lblAiScore: "AIスコア:",
    lblCandidate: "候補者:",
    footerCompliance: "政令13/2023/ND-CPおよびGDPR準拠 • AI自動翻訳100%対応",
    footerAtsLink: "🏢 採用企業向けマルチテナントATS管理ポータル →",
    btnClose: "閉じる",
    candModalBadge: "求職者ポータルアカウント",
    candModalTitle: "👤 求職者アカウント＆デジタル職務経歴書（1クリック応募）",
    candDemoTitle: "⚡ デモ求職者アカウントでクイックログイン（1クリック）：",
    candRegHeading: "または新規求職者アカウントを作成：",
    lblCandFullName: "氏名（フルネーム） *",
    lblCandEmail: "ログイン・通知用メールアドレス *",
    lblCandPhone: "電話番号",
    lblCandExpYears: "管理職経験年数",
    lblCandSector: "希望する業界カテゴリー",
    lblCandSkills: "コアスキル（カンマ区切り）",
    lblCandBio: "標準職務経歴サマリー（1クリック応募用）",
    btnCandSubmitReg: "✔ 求職者アカウントを作成して1クリック応募を有効化",
    empModalBadge: "B2Bマルチテナント採用企業",
    empModalTitle: "🏢 採用企業アカウント登録・ログイン",
    empDemoTitle: "⚡ デモ企業管理ワークスペースへ即時切り替え（org_id別データ分離）：",
    lblOrgId: "組織ID:",
    empRegHeading: "➕ 新規参画企業の登録（専用org_idおよび独立データ環境を自動発行）：",
    lblEmpCompanyName: "企業・グループ名 *",
    lblEmpCountry: "国・地域",
    lblEmpAdminName: "人事管理者氏名 (HR Admin) *",
    lblEmpEmail: "企業管理者メールアドレス *",
    lblEmpIndustry: "主要事業セクター",
    lblEmpSubdomain: "専用サブドメイン",
    empBenefitBox: "✨ <b>自動プロビジョニング特典：</b>登録完了と同時に専用テナントID（<code>TENANT-...</code>）と500,000 AIクレジット（<code>motapis.com/v1</code>）を即時付与し、自社専用ATS管理画面へ移動します。",
    btnEmpSubmitReg: "🚀 企業登録を完了して専用ATS管理画面を開く",
    applyAutoFillBanner: "✔ 求職者アカウントの職務経歴データを自動入力しました。1クリックで即時応募可能です！",
    lblPrefInterviewLang: "希望するAI面接言語",
    lblCurrentLangOpt: "現在の表示言語",
    lblAttachCvFile: "履歴書・職務経歴書ファイル添付（PDF / DOCX / TXT - 任意）",
    lblCvSummaryText: "職務経歴サマリー・自己PR *",
    applyPrivacyBox: "🔒 <b>個人情報保護（政令13号＆GDPR準拠）：</b>応募データは募集企業の専用環境のみに送信され、AI採点前にPII匿名化処理が行われます。",
    btnSubmitApply: "🚀 応募書類を提出してAI選考スコアを即時取得",
    resBadge: "AI書類選考完了 (MOTAPIS.COM/V1)",
    resTitle: "求人への応募が完了しました！",
    resScoreLabel: "AI総合適合スコア (AI Screening Score)",
    resPrivateVaultNote: "✔ あなたの応募書類は採用企業の専用データ環境に安全に送信されました！",
    btnTrackMySubmitted: "📋 応募進捗・選考状況を確認",
    transModalBadge: "AIリアルタイム多言語自動翻訳エンジン (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 8言語リアルタイムAI自動翻訳スタジオ",
    transModalSub: "言語選択時にUI、全30件の管理職求人、10大産業カテゴリー、参画6社、および新規追加された求人・履歴書テキストを100%自動翻訳します。",
    lblTransCoverage: "公開ポータル翻訳カバー率：",
    lblAutoTransToggle: "言語切り替え時に新規コンテンツを自動翻訳する：",
    lblCustomTransInput: "任意の求人票(JD)・職務経歴テキストを入力してAI即時翻訳：",
    btnRunCustomTrans: "⚡ AIで今すぐ翻訳 (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 ページ全体の100%翻訳を再同期",
  },
  ko: {
    pageTitle: "HireMind Global Careers — 중견·임원급 글로벌 공개 채용 마켓플레이스",
    badgePortal: "글로벌 채용 마켓플레이스",
    subPortal: "중견·임원급 전문 채용 포털 • AI 실시간 서류 심사 및 24/7 AI 면접",
    navJobs: "관리직 채용공고",
    navCategories: "10대 산업 직무군",
    navEmployers: "참여 기업 파트너",
    navMyApps: "나의 지원 현황",
    btnAiTranslator: "🤖 AI 자동 번역 (100%)",
    btnCandAuth: "👤 구직자 계정",
    btnEmpAuth: "🏢 기업 회원 (B2B)",
    btnOpenEmpWorkspace: "🚀 우리 회사 전용 ATS 열기",
    btnLogout: "로그아웃",
    toastLoggedOut: "로그아웃되었습니다.",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "핵심 관리직·임원 인재와 글로벌 선도 기업을 연결하는 AI 채용 플랫폼",
    heroSub: "기업 회원은 가입 즉시 독립된 전용 채용 관리 데이터 공간(멀티테넌트)을 발급받으며, 구직자는 10대 산업 직무군을 선택해 원클릭 지원 및 AI 면접을 진행할 수 있습니다.",
    searchPlaceholder: "직무명(본부장, 팀장, 공장장), 핵심 역량, 근무지 검색...",
    allCategories: "전체 10대 산업 카테고리",
    allEmployers: "전체 참여 기업",
    statJobs: "진행 중인 관리직 공고",
    statCategories: "핵심 산업 분야",
    statEmployers: "참여 글로벌 기업",
    statAi: "24/7 AI 심사 및 면접",
    secCategoriesTitle: "📂 10대 핵심 산업 카테고리별 채용공고 탐색",
    secCategoriesSub: "희망하는 산업 분야를 클릭하여 기업들이 모집 중인 관리직 포지션을 확인하세요.",
    btnClearCategory: "✖ 산업 카테고리 필터 해제",
    btnClearEmployer: "✖ 전체 기업 보기",
    secEmployersTitle: "🏢 참여 글로벌 기업 및 멀티테넌트 조직",
    secEmployersSub: "각 기업은 완전히 격리된 전용 데이터 공간(org_id)을 보유합니다. 신규 기업 가입 시 전용 공간이 즉시 생성됩니다.",
    btnRegNewEmployer: "➕ 신규 기업 회원 가입 (전용 채용 관리 공간 즉시 발급)",
    btnRegNewCandidate: "👤 구직자 회원가입 (원클릭 지원)",
    btnFilterByEmployer: "이 기업의 공고 보기",
    btnOpenCompanyAts: "🔑 전용 관리 시스템 열기",
    secJobsTitle: "🔥 모집 중인 중견·임원급 핵심 포지션",
    btnApplyJob: "🚀 즉시 지원하기 (AI 실시간 채점)",
    lblOpenJobsCount: "개 채용 중",
    lblApplicantsCount: "명 지원",
    lblMinExp: "최소 경력:",
    lblYears: "년 이상",
    myAppsTitle: "📋 나의 지원 내역 및 AI 면접실 입장",
    myAppsSub: "지원한 기업들의 실시간 전형 단계를 확인하고 24/7 AI 면접실로 바로 입장하세요.",
    trackPlaceholder: "이메일, 전화번호 또는 성명을 입력하여 지원 내역 조회...",
    btnSearchTrack: "🔍 지원 현황 조회",
    btnEnterAiInterview: "🎙️ AI 면접실 입장하기",
    btnViewPdfCv: "📄 PDF 이력서 보기",
    emptyTrackMsg: "일치하는 지원 내역이 없습니다:",
    lblAppId: "지원번호:",
    lblStage: "전형단계:",
    lblAiScore: "AI 점수:",
    lblCandidate: "지원자:",
    footerCompliance: "개인정보보호 법령(Decree 13 & GDPR) 준수 • 100% AI 다국어 번역 지원",
    footerAtsLink: "🏢 기업 전용 멀티테넌트 ATS 관리 포털 →",
    btnClose: "닫기",
    candModalBadge: "구직자 전용 계정",
    candModalTitle: "👤 구직자 계정 및 디지털 이력서 보관함 (원클릭 지원)",
    candDemoTitle: "⚡ 데모 구직자 계정으로 원클릭 빠른 로그인:",
    candRegHeading: "또는 신규 구직자 계정 등록:",
    lblCandFullName: "지원자 성명 *",
    lblCandEmail: "로그인 및 알림 이메일 *",
    lblCandPhone: "전화번호",
    lblCandExpYears: "관리직 경력 연수",
    lblCandSector: "희망 산업 카테고리",
    lblCandSkills: "핵심 역량 및 기술 (쉼표로 구분)",
    lblCandBio: "기본 경력 요약서 / 이력서 (원클릭 지원용)",
    btnCandSubmitReg: "✔ 구직자 계정 생성 및 원클릭 지원 활성화",
    empModalBadge: "B2B 멀티테넌트 기업 회원",
    empModalTitle: "🏢 기업 조직 계정 가입 및 로그인",
    empDemoTitle: "⚡ 데모 기업 전용 워크스페이스로 즉시 전환 (org_id 데이터 격리):",
    lblOrgId: "조직 코드:",
    empRegHeading: "➕ 신규 참여 기업 등록 (전용 org_id 및 독립 데이터 공간 자동 발급):",
    lblEmpCompanyName: "기업 / 그룹명 *",
    lblEmpCountry: "국가 / 지역",
    lblEmpAdminName: "인사 관리자 성명 (HR Admin) *",
    lblEmpEmail: "기업 관리자 이메일 *",
    lblEmpIndustry: "주력 산업 분야",
    lblEmpSubdomain: "전용 서브도메인",
    empBenefitBox: "✨ <b>자동 발급 혜택:</b> 가입 즉시 전용 조직 코드(<code>TENANT-...</code>)와 500,000 AI 크레딧(<code>motapis.com/v1</code>)이 부여되며, 공개 채용공고 2건이 자동 생성되어 전용 ATS 관리 화면으로 이동합니다.",
    btnEmpSubmitReg: "🚀 기업 회원 가입 및 전용 ATS 관리 공간 열기",
    applyAutoFillBanner: "✔ 구직자 계정의 디지털 이력서 정보가 자동 입력되었습니다. 원클릭으로 즉시 지원하세요!",
    lblPrefInterviewLang: "희망 AI 면접 언어",
    lblCurrentLangOpt: "현재 화면 언어",
    lblAttachCvFile: "이력서 파일 첨부 (PDF / DOCX / TXT - 선택사항)",
    lblCvSummaryText: "핵심 경력 기술서 / 이력서 요약 *",
    applyPrivacyBox: "🔒 <b>개인정보 보호(시행령 13호 & GDPR):</b> 귀하의 지원서는 해당 채용 기업의 격리된 데이터 공간으로만 전송되며 AI 채점 전 개인식별정보(PII)가 비식별화됩니다.",
    btnSubmitApply: "🚀 지원서 제출 및 실시간 AI 서류 심사 점수 확인",
    resBadge: "AI 서류 심사 완료 (MOTAPIS.COM/V1)",
    resTitle: "입사 지원이 성공적으로 완료되었습니다!",
    resScoreLabel: "AI 종합 적합도 점수 (AI Screening Score)",
    resPrivateVaultNote: "✔ 귀하의 이력서가 채용 기업의 전용 ATS 공간으로 안전하게 전달되었습니다!",
    btnTrackMySubmitted: "📋 나의 지원 현황 보기",
    transModalBadge: "AI 실시간 다국어 자동 번역 엔진 (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 8개 국어 실시간 AI 자동 번역 스튜디오",
    transModalSub: "언어 변경 시 전체 UI, 30개 관리직 채용공고, 10대 산업 직무군, 6개 참여 기업 및 신규 추가된 채용 데이터를 100% 자동 번역합니다.",
    lblTransCoverage: "공개 채용 포털 번역 완료율:",
    lblAutoTransToggle: "언어 변경 시 신규 콘텐츠 자동 번역 활성화:",
    lblCustomTransInput: "번역할 채용공고(JD) 또는 이력서 텍스트 입력:",
    btnRunCustomTrans: "⚡ AI 즉시 번역 실행 (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 현재 페이지 100% 번역 동기화",
  },
  zh: {
    pageTitle: "HireMind Global Careers — 国际中高层管理与专家公开招聘门户",
    badgePortal: "国际公开招聘门户",
    subPortal: "中高层管理与专家招聘平台 • AI 实时初筛与 24/7 智能面试",
    navJobs: "管理岗位招聘",
    navCategories: "十大行业分类",
    navEmployers: "入驻招聘企业",
    navMyApps: "我的投递记录",
    btnAiTranslator: "🤖 AI 自动翻译 (100%)",
    btnCandAuth: "👤 求职者账号",
    btnEmpAuth: "🏢 企业雇主入驻 (B2B)",
    btnOpenEmpWorkspace: "🚀 进入企业专属招聘后台",
    btnLogout: "退出登录",
    toastLoggedOut: "已安全退出账号。",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "连接中高层管理精英与跨国领军企业的 AI 智能招聘平台",
    heroSub: "企业注册即可获得独立隔离的专属招聘管理空间（Multi-Tenant）；求职者注册账号即可按十大行业分类一键投递简历并参加 24/7 AI 面试。",
    searchPlaceholder: "搜索管理职位名称（总监、经理、厂长）、核心技能或地点...",
    allCategories: "全部十大行业分类",
    allEmployers: "全部入驻企业",
    statJobs: "在招管理职位",
    statCategories: "核心行业领域",
    statEmployers: "入驻跨国企业",
    statAi: "24/7 AI 初筛与面试",
    secCategoriesTitle: "📂 按十大核心行业分类浏览职位",
    secCategoriesSub: "点击任意行业分类，快速筛选各入驻企业发布的中高层管理岗位。",
    btnClearCategory: "✖ 清除行业筛选",
    btnClearEmployer: "✖ 查看全部企业",
    secEmployersTitle: "🏢 入驻跨国企业与独立租户组织",
    secEmployersSub: "每家企业拥有完全隔离的独立数据空间（org_id）。新企业注册后即刻分配专属管理账号。",
    btnRegNewEmployer: "➕ 注册新企业账号（即刻分配独立数据空间）",
    btnRegNewCandidate: "👤 注册求职者账号（一键投递简历）",
    btnFilterByEmployer: "查看该企业职位",
    btnOpenCompanyAts: "🔑 进入专属后台",
    secJobsTitle: "🔥 正在热招的中高层管理职位",
    btnApplyJob: "🚀 立即投递 (AI 实时评分)",
    lblOpenJobsCount: "个在招职位",
    lblApplicantsCount: "位候选人",
    lblMinExp: "最低经验:",
    lblYears: "年",
    myAppsTitle: "📋 我的投递记录与 AI 面试中心",
    myAppsSub: "实时追踪在各家企业的投递进度，并直接进入 24/7 AI 面试间。",
    trackPlaceholder: "输入邮箱、手机号或姓名查询所有投递记录...",
    btnSearchTrack: "🔍 查询投递记录",
    btnEnterAiInterview: "🎙️ 进入 AI 面试间",
    btnViewPdfCv: "📄 查看 PDF 简历",
    emptyTrackMsg: "未找到匹配的投递记录：",
    lblAppId: "申请编号:",
    lblStage: "当前阶段:",
    lblAiScore: "AI 评分:",
    lblCandidate: "候选人:",
    footerCompliance: "严格遵循第 13/2023/ND-CP 号法令与 GDPR • 100% AI 多语言自动翻译",
    footerAtsLink: "🏢 企业多租户招聘管理后台 (Enterprise ATS) →",
    btnClose: "关闭",
    candModalBadge: "求职者门户账号",
    candModalTitle: "👤 求职者账号与数字简历库（一键闪电投递）",
    candDemoTitle: "⚡ 一键快速登录演示求职者账号：",
    candRegHeading: "或注册全新求职者账号：",
    lblCandFullName: "候选人姓名 *",
    lblCandEmail: "登录与通知邮箱 *",
    lblCandPhone: "联系电话",
    lblCandExpYears: "管理工作年限",
    lblCandSector: "意向行业分类",
    lblCandSkills: "核心专业技能（用逗号分隔）",
    lblCandBio: "默认高管履历摘要（用于一键投递）",
    btnCandSubmitReg: "✔ 创建求职者账号并开启一键投递",
    empModalBadge: "B2B 多租户企业会员",
    empModalTitle: "🏢 注册 / 登录企业组织专属账号",
    empDemoTitle: "⚡ 一键切换至演示企业管理空间（按 org_id 数据隔离）：",
    lblOrgId: "组织代码:",
    empRegHeading: "➕ 注册新入驻企业（自动分配专属 org_id 与独立数据空间）：",
    lblEmpCompanyName: "企业 / 集团名称 *",
    lblEmpCountry: "国家 / 地区",
    lblEmpAdminName: "人事管理员姓名 (HR Admin) *",
    lblEmpEmail: "企业管理员邮箱 *",
    lblEmpIndustry: "主营行业领域",
    lblEmpSubdomain: "专属二级域名 (Subdomain)",
    empBenefitBox: "✨ <b>自动开通权益：</b>点击注册后，系统立即分配独立租户编号（<code>TENANT-...</code>），赠送 500,000 AI 算力额度（<code>motapis.com/v1</code>），自动发布 2 个管理岗位并进入您的企业专属 ATS 后台。",
    btnEmpSubmitReg: "🚀 立即注册企业并打开专属 ATS 管理后台",
    applyAutoFillBanner: "✔ 已从您的求职者数字简历库自动填充信息，可一键立即投递！",
    lblPrefInterviewLang: "首选 AI 面试语言",
    lblCurrentLangOpt: "当前界面语言",
    lblAttachCvFile: "上传简历附件（PDF / DOCX / TXT - 可选）",
    lblCvSummaryText: "核心履历与管理成就摘要 *",
    applyPrivacyBox: "🔒 <b>隐私安全合规（第13号法令 & GDPR）：</b>您的简历仅加密发送至招聘企业的独立数据空间，并在 AI 评分前自动完成 PII 隐私脱敏。",
    btnSubmitApply: "🚀 提交简历并立即获取 AI 初筛评分",
    resBadge: "AI 智能初筛已完成 (MOTAPIS.COM/V1)",
    resTitle: "简历投递成功！",
    resScoreLabel: "AI 综合匹配度评分 (AI Screening Score)",
    resPrivateVaultNote: "✔ 您的申请档案已安全送达招聘企业的独立 ATS 数据空间！",
    btnTrackMySubmitted: "📋 查看已投递简历进度",
    transModalBadge: "AI 实时多语言自动翻译引擎 (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 8 国语言实时 AI 自动翻译工作台",
    transModalSub: "切换语言时自动翻译 100% 界面文案、30 个中高层管理岗位、10 大行业分类、6 大跨国企业及任何新增职位/简历内容。",
    lblTransCoverage: "当前公开招聘门户翻译覆盖率：",
    lblAutoTransToggle: "切换语言时自动翻译所有新增内容：",
    lblCustomTransInput: "输入任意职位描述 (JD) 或简历文本进行 AI 即时翻译：",
    btnRunCustomTrans: "⚡ 立即使用 AI 翻译 (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 重新同步并翻译当前页面 100% 内容",
  },
  th: {
    pageTitle: "HireMind Global Careers — พอร์ทัลหางานผู้บริหารและผู้เชี่ยวชาญระดับสากล",
    badgePortal: "พอร์ทัลหางานระดับสากล",
    subPortal: "ศูนย์รวมงานบริหารและผู้เชี่ยวชาญ • คัดกรองเรซูเม่และสัมภาษณ์ AI 24/7",
    navJobs: "ตำแหน่งงานบริหาร",
    navCategories: "10 หมวดหมู่อุตสาหกรรม",
    navEmployers: "องค์กรสมาชิก",
    navMyApps: "ใบสมัครของฉัน",
    btnAiTranslator: "🤖 AI แปลภาษาอัตโนมัติ (100%)",
    btnCandAuth: "👤 บัญชีผู้หางาน",
    btnEmpAuth: "🏢 สำหรับองค์กร (B2B)",
    btnOpenEmpWorkspace: "🚀 เข้าสู่ระบบจัดการเฉพาะองค์กร",
    btnLogout: "ออกจากระบบ",
    toastLoggedOut: "ออกจากระบบเรียบร้อยแล้ว",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "เชื่อมโยงผู้บริหารระดับกลางและระดับสูงเข้ากับองค์กรชั้นนำระดับโลก",
    heroSub: "องค์กรสามารถลงทะเบียนเพื่อรับพื้นที่จัดการข้อมูลสรรหาบุคลากรแยกอิสระ (Multi-Tenant) และผู้สมัครสามารถสร้างบัญชีเลือกหมวดหมู่งานเพื่อสมัครในคลิกเดียว",
    searchPlaceholder: "ค้นหาตำแหน่งผู้บริหาร ทักษะ หรือสถานที่ทำงาน...",
    allCategories: "ทั้งหมด 10 หมวดหมู่อุตสาหกรรม",
    allEmployers: "องค์กรสมาชิกทั้งหมด",
    statJobs: "ตำแหน่งบริหารที่เปิดรับ",
    statCategories: "กลุ่มอุตสาหกรรมหลัก",
    statEmployers: "องค์กรชั้นนำ",
    statAi: "คัดกรองและสัมภาษณ์ AI",
    secCategoriesTitle: "📂 เลือกหมวดหมู่อุตสาหกรรมที่ต้องการสมัครงาน",
    secCategoriesSub: "คลิกเลือกหมวดหมู่อุตสาหกรรมเพื่อกรองตำแหน่งงานบริหารที่องค์กรสมาชิกเปิดรับ",
    btnClearCategory: "✖ ล้างตัวกรองหมวดหมู่อุตสาหกรรม",
    btnClearEmployer: "✖ แสดงองค์กรสมาชิกทั้งหมด",
    secEmployersTitle: "🏢 องค์กรสมาชิกที่เปิดรับสมัครบุคลากร",
    secEmployersSub: "แต่ละองค์กรมีพื้นที่ข้อมูลแยกอิสระ (org_id) องค์กรใหม่สามารถลงทะเบียนเพื่อรับสิทธิ์จัดการได้ทันที",
    btnRegNewEmployer: "➕ ลงทะเบียนบัญชีองค์กรใหม่ (รับพื้นที่ข้อมูลแยกเฉพาะ)",
    btnRegNewCandidate: "👤 ลงทะเบียนบัญชีผู้หางาน",
    btnFilterByEmployer: "ดูงานขององค์กรนี้",
    btnOpenCompanyAts: "🔑 เข้าสู่ระบบองค์กร",
    secJobsTitle: "🔥 ตำแหน่งงานผู้บริหารที่กำลังเปิดรับสมัคร",
    btnApplyJob: "🚀 สมัครงานทันที (AI ประเมินผล)",
    lblOpenJobsCount: "ตำแหน่งที่เปิดรับ",
    lblApplicantsCount: "ผู้สมัคร",
    lblMinExp: "ประสบการณ์ขั้นต่ำ:",
    lblYears: "ปี",
    myAppsTitle: "📋 ประวัติการสมัครงานและห้องสัมภาษณ์ AI ของฉัน",
    myAppsSub: "ติดตามสถานะใบสมัครแบบเรียลไทม์และเข้าสู่ห้องสัมภาษณ์ AI ได้ทันที",
    trackPlaceholder: "กรอกอีเมล เบอร์โทรศัพท์ หรือชื่อเพื่อค้นหาใบสมัคร...",
    btnSearchTrack: "🔍 ค้นหาใบสมัคร",
    btnEnterAiInterview: "🎙️ เข้าสู่ห้องสัมภาษณ์ AI",
    btnViewPdfCv: "📄 ดูไฟล์ CV PDF",
    emptyTrackMsg: "ไม่พบข้อมูลใบสมัครที่ตรงกับคำค้นหา",
    lblAppId: "รหัสใบสมัคร:",
    lblStage: "สถานะ:",
    lblAiScore: "คะแนน AI:",
    lblCandidate: "ผู้สมัคร:",
    footerCompliance: "ปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล PDPA / GDPR • แปลภาษาอัตโนมัติ 100%",
    footerAtsLink: "🏢 ระบบจัดการสรรหาบุคลากรสำหรับองค์กร (Enterprise ATS) →",
    btnClose: "ปิดหน้าต่าง",
    candModalBadge: "บัญชีผู้สมัครงาน",
    candModalTitle: "👤 บัญชีผู้หางานและคลังเรซูเม่ดิจิทัล (สมัครงานใน 1 คลิก)",
    candDemoTitle: "⚡ เข้าสู่ระบบด่วนด้วยบัญชีผู้สมัครตัวอย่าง (1 คลิก):",
    candRegHeading: "หรือลงทะเบียนบัญชีผู้หางานใหม่:",
    lblCandFullName: "ชื่อ-นามสกุลผู้สมัคร *",
    lblCandEmail: "อีเมลสำหรับเข้าสู่ระบบและรับการแจ้งเตือน *",
    lblCandPhone: "เบอร์โทรศัพท์ติดต่อ",
    lblCandExpYears: "ประสบการณ์ระดับบริหาร (ปี)",
    lblCandSector: "หมวดหมู่อุตสาหกรรมที่สนใจ",
    lblCandSkills: "ทักษะหลัก (คั่นด้วยเครื่องหมายจุลภาค)",
    lblCandBio: "สรุปประวัติและผลงานบริหารเริ่มต้น (สำหรับสมัครใน 1 คลิก)",
    btnCandSubmitReg: "✔ สร้างบัญชีผู้หางานและเปิดใช้งานการสมัครใน 1 คลิก",
    empModalBadge: "บัญชีองค์กรสมาชิก B2B MULTI-TENANT",
    empModalTitle: "🏢 ลงทะเบียน / เข้าสู่ระบบบัญชีองค์กรธุรกิจ",
    empDemoTitle: "⚡ สลับเข้าสู่พื้นที่จัดการขององค์กรตัวอย่างทันที (แยกข้อมูลตาม org_id):",
    lblOrgId: "รหัสองค์กร:",
    empRegHeading: "➕ ลงทะเบียนองค์กรสมาชิกใหม่ (รับรหัส org_id และพื้นที่ข้อมูลแยกอิสระทันที):",
    lblEmpCompanyName: "ชื่อบริษัท / กลุ่มธุรกิจ *",
    lblEmpCountry: "ประเทศ / ภูมิภาค",
    lblEmpAdminName: "ชื่อผู้ดูแลระบบฝ่ายทรัพยากรบุคคล (HR Admin) *",
    lblEmpEmail: "อีเมลผู้ดูแลระบบขององค์กร *",
    lblEmpIndustry: "กลุ่มอุตสาหกรรมหลัก",
    lblEmpSubdomain: "ซับโดเมนเฉพาะขององค์กร (Subdomain)",
    empBenefitBox: "✨ <b>สิทธิประโยชน์ที่ได้รับทันที:</b> ระบบจะสร้างรหัสองค์กรเฉพาะ (<code>TENANT-...</code>) พร้อมโควตา 500,000 AI Credits ผ่าน <code>motapis.com/v1</code> และเปิดพื้นที่จัดการ ATS ส่วนตัวให้ทันที",
    btnEmpSubmitReg: "🚀 ลงทะเบียนองค์กรและเข้าสู่ระบบจัดการ ATS ทันที",
    applyAutoFillBanner: "✔ ดึงข้อมูลจากบัญชีผู้หางานของคุณโดยอัตโนมัติแล้ว สามารถกดส่งใบสมัครได้ในคลิกเดียว!",
    lblPrefInterviewLang: "ภาษาที่ต้องการใช้สัมภาษณ์กับ AI",
    lblCurrentLangOpt: "ภาษาปัจจุบันของหน้าเว็บ",
    lblAttachCvFile: "แนบไฟล์เรซูเม่ CV (PDF / DOCX / TXT - ไม่บังคับ)",
    lblCvSummaryText: "สรุปประวัติการทำงานและผลงานระดับบริหาร *",
    applyPrivacyBox: "🔒 <b>การคุ้มครองข้อมูลส่วนบุคคล:</b> ข้อมูลใบสมัครของคุณจะถูกส่งไปยังพื้นที่ข้อมูลเฉพาะขององค์กรที่เปิดรับเท่านั้น และถูกปกปิดข้อมูลระบุตัวตน (PII) ก่อนประมวลผลด้วย AI",
    btnSubmitApply: "🚀 ส่งใบสมัครงานและรับคะแนนประเมิน AI ทันที",
    resBadge: "ประเมินผลด้วย AI เสร็จสมบูรณ์ (MOTAPIS.COM/V1)",
    resTitle: "ส่งใบสมัครงานสำเร็จเรียบร้อยแล้ว!",
    resScoreLabel: "คะแนนความเหมาะสมจาก AI (AI Screening Score)",
    resPrivateVaultNote: "✔ ใบสมัครของคุณถูกส่งไปยังระบบจัดการข้อมูลเฉพาะขององค์กรเรียบร้อยแล้ว!",
    btnTrackMySubmitted: "📋 ดูสถานะใบสมัครของฉัน",
    transModalBadge: "เครื่องมือแปลภาษาอัตโนมัติด้วย AI แบบเรียลไทม์ (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 ศูนย์ควบคุมการแปลภาษาอัตโนมัติ 8 ภาษาด้วย AI",
    transModalSub: "แปลส่วนติดต่อผู้ใช้ ตำแหน่งงานบริหารทั้ง 30 ตำแหน่ง 10 หมวดอุตสาหกรรม และองค์กรสมาชิกครบ 100% ทันทีที่เปลี่ยนภาษา",
    lblTransCoverage: "ความครอบคลุมของการแปลภาษาหน้าพอร์ทัลสาธารณะ:",
    lblAutoTransToggle: "แปลเนื้อหาใหม่โดยอัตโนมัติเมื่อเปลี่ยนภาษา:",
    lblCustomTransInput: "วางข้อความประกาศรับสมัครงาน (JD) หรือเรซูเม่เพื่อให้ AI แปลทันที:",
    btnRunCustomTrans: "⚡ แปลภาษาทันทีด้วย AI (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 ซิงค์และแปลหน้าปัจจุบันใหม่ 100%",
  },
  lo: {
    pageTitle: "HireMind Global Careers — ປະຕູຮັບສະໝັກວຽກລະດັບບໍລິຫານ ແລະ ຜູ້ຊ່ຽວຊານສາກົນ",
    badgePortal: "ປະຕູຮັບສະໝັກວຽກສາກົນ",
    subPortal: "ສູນລວມວຽກບໍລິຫານ ແລະ ຜູ້ຊ່ຽວຊານ • ຄັດກອງ CV ແລະ ສຳພາດ AI 24/7",
    navJobs: "ວຽກລະດັບບໍລິຫານ",
    navCategories: "10 ໝວດອຸດສາຫະກຳ",
    navEmployers: "ອົງກອນສະມາຊິກ",
    navMyApps: "ໃບສະໝັກຂອງຂ້ອຍ",
    btnAiTranslator: "🤖 AI ແປພາສາອັດຕະໂນມັດ (100%)",
    btnCandAuth: "👤 ບັນຊີຜູ້ຊອກວຽກ",
    btnEmpAuth: "🏢 ສຳລັບອົງກອນ (B2B)",
    btnOpenEmpWorkspace: "🚀 ເຂົ້າສູ່ລະບົບຄຸ້ມຄອງສະເພາະອົງກອນ",
    btnLogout: "ອອກຈາກລະບົບ",
    toastLoggedOut: "ອອກຈາກລະບົບສຳເລັດແລ້ວ.",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "ເຊື່ອມຕໍ່ບຸກຄະລາກອນລະດັບບໍລິຫານກັບບໍລິສັດຊັ້ນນຳລະດັບສາກົນ",
    heroSub: "ບໍລິສັດສາມາດລົງທະບຽນເພື່ອຮັບພື້ນທີ່ຈັດການຂໍ້ມູນແຍກສະເພາະ (Multi-Tenant) ແລະ ຜູ້ສະໝັກສາມາດສ້າງບັນຊີເລືອກໝວດວຽກເພື່ອສະໝັກໄດ້ທັນທີ.",
    searchPlaceholder: "ຄົ້ນຫາຕຳແໜ່ງບໍລິຫານ, ທັກສະ ຫຼື ສະຖານທີ່...",
    allCategories: "ທັງໝົດ 10 ໝວດອຸດສາຫະກຳ",
    allEmployers: "ອົງກອນສະມາຊິກທັງໝົດ",
    statJobs: "ຕຳແໜ່ງບໍລິຫານທີ່ເປີດຮັບ",
    statCategories: "ຂະແໜງອຸດສາຫະກຳຫຼັກ",
    statEmployers: "ອົງກອນຊັ້ນນຳ",
    statAi: "ຄັດກອງ ແລະ ສຳພາດ AI",
    secCategoriesTitle: "📂 ເລືອກໝວດອຸດສາຫະກຳທີ່ຕ້ອງການສະໝັກວຽກ",
    secCategoriesSub: "ກົດເລືອກໝວດອຸດສາຫະກຳເພື່ອກັ່ນຕອງຕຳແໜ່ງວຽກທີ່ບໍລິສັດເປີດຮັບ.",
    btnClearCategory: "✖ ລ້າງຕົວກອງໝວດອຸດສາຫະກຳ",
    btnClearEmployer: "✖ ສະແດງອົງກອນທັງໝົດ",
    secEmployersTitle: "🏢 ອົງກອນສະມາຊິກທີ່ກຳລັງເປີດຮັບສະໝັກ",
    secEmployersSub: "ແຕ່ລະບໍລິສັດມີພື້ນທີ່ຂໍ້ມູນແຍກສະເພາະ (org_id). ບໍລິສັດໃໝ່ສາມາດລົງທະບຽນໄດ້ທັນທີ.",
    btnRegNewEmployer: "➕ ລົງທະບຽນບັນຊີບໍລິສັດໃໝ່ (ຮັບພື້ນທີ່ຂໍ້ມູນສະເພາະ)",
    btnRegNewCandidate: "👤 ລົງທະບຽນບັນຊີຜູ້ຊອກວຽກ",
    btnFilterByEmployer: "ເບິ່ງວຽກຂອງບໍລິສັດນີ້",
    btnOpenCompanyAts: "🔑 ເຂົ້າລະບົບບໍລິສັດ",
    secJobsTitle: "🔥 ຕຳແໜ່ງວຽກບໍລິຫານທີ່ກຳລັງເປີດຮັບ",
    btnApplyJob: "🚀 ສະໝັກວຽກທັນທີ (AI ປະເມີນຜົນ)",
    lblOpenJobsCount: "ຕຳແໜ່ງເປີດຮັບ",
    lblApplicantsCount: "ຜູ້ສະໝັກ",
    lblMinExp: "ປະສົບການຂັ້ນຕ່ຳ:",
    lblYears: "ປີ",
    myAppsTitle: "📋 ປະຫວັດການສະໝັກວຽກ ແລະ ຫ້ອງສຳພາດ AI ຂອງຂ້ອຍ",
    myAppsSub: "ຕິດຕາມສະຖານະໃບສະໝັກ ແລະ ເຂົ້າຫ້ອງສຳພາດ AI 24/7.",
    trackPlaceholder: "ປ້ອນອີເມວ, ເບີໂທ ຫຼື ຊື່ຜູ້ສະໝັກເພື່ອຄົ້ນຫາ...",
    btnSearchTrack: "🔍 ຄົ້ນຫາໃບສະໝັກ",
    btnEnterAiInterview: "🎙️ ເຂົ້າຫ້ອງສຳພາດ AI",
    btnViewPdfCv: "📄 ເບິ່ງ CV PDF",
    emptyTrackMsg: "ບໍ່ພົບຂໍ້ມູນໃບສະໝັກທີ່ກົງກັບຄຳຄົ້ນຫາ",
    lblAppId: "ລະຫັດ HS:",
    lblStage: "ຂັ້ນຕອນ:",
    lblAiScore: "ຄະແນນ AI:",
    lblCandidate: "ຜູ້ສະໝັກ:",
    footerCompliance: "ປະຕິບັດຕາມດຳລັດຄຸ້ມຄອງຂໍ້ມູນສ່ວນບຸກຄົນ & GDPR • ແປພາສາອັດຕະໂນມັດ 100%",
    footerAtsLink: "🏢 ລະບົບຄຸ້ມຄອງການຮັບສະໝັກສຳລັບອົງກອນ (Enterprise ATS) →",
    btnClose: "ປິດ",
    candModalBadge: "ບັນຊີຜູ້ຊອກວຽກ",
    candModalTitle: "👤 ບັນຊີຜູ້ຊອກວຽກ ແລະ ຊີວະປະຫວັດດິຈິຕອນ (ສະໝັກໃນ 1 ຄລິກ)",
    candDemoTitle: "⚡ ເຂົ້າສູ່ລະບົບດ່ວນດ້ວຍບັນຊີຕົວຢ່າງ (1-Click):",
    candRegHeading: "ຫຼື ລົງທະບຽນບັນຊີຜູ້ຊອກວຽກໃໝ່:",
    lblCandFullName: "ຊື່ ແລະ ນາມສະກຸນຜູ້ສະໝັກ *",
    lblCandEmail: "ອີເມວເຂົ້າລະບົບ ແລະ ຮັບແຈ້ງເຕືອນ *",
    lblCandPhone: "ເບີໂທລະສັບ",
    lblCandExpYears: "ປີປະສົບການລະດັບບໍລິຫານ",
    lblCandSector: "ໝວດອຸດສາຫະກຳທີ່ສົນໃຈ",
    lblCandSkills: "ທັກສະຫຼັກ (ຂັ້ນດ້ວຍຈຸດ)",
    lblCandBio: "ຂໍ້ມູນຊີວະປະຫວັດຫຍໍ້ເລີ່ມຕົ້ນ (ສຳລັບສະໝັກ 1-Click)",
    btnCandSubmitReg: "✔ ສ້າງບັນຊີຜູ້ຊອກວຽກ ແລະ ເປີດໃຊ້ 1-Click Apply",
    empModalBadge: "ອົງກອນສະມາຊິກ B2B MULTI-TENANT",
    empModalTitle: "🏢 ລົງທະບຽນ / ເຂົ້າສູ່ລະບົບບັນຊີອົງກອນທຸລະກິດ",
    empDemoTitle: "⚡ ປ່ຽນເຂົ້າສູ່ພື້ນທີ່ຈັດການຂອງບໍລິສັດຕົວຢ່າງທັນທີ (ແຍກຂໍ້ມູນຕາມ org_id):",
    lblOrgId: "ລະຫັດອົງກອນ:",
    empRegHeading: "➕ ລົງທະບຽນບໍລິສັດສະມາຊິກໃໝ່ (ອອກລະຫັດ org_id ແລະ ພື້ນທີ່ຂໍ້ມູນສະເພາະອັດຕະໂນມັດ):",
    lblEmpCompanyName: "ຊື່ບໍລິສັດ / ກຸ່ມບໍລິສັດ *",
    lblEmpCountry: "ປະເທດ / ພາກພື້ນ",
    lblEmpAdminName: "ຊື່ຜູ້ບໍລິຫານຝ່າຍບຸກຄະລາກອນ (HR Admin) *",
    lblEmpEmail: "ອີເມວຜູ້ບໍລິຫານອົງກອນ *",
    lblEmpIndustry: "ຂະແໜງອຸດສາຫະກຳຫຼັກ",
    lblEmpSubdomain: "ໂດເມນຍ່ອຍສະເພາະ (Subdomain)",
    empBenefitBox: "✨ <b>ສິດທິປະໂຫຍດອັດຕະໂນມັດ:</b> ຫຼັງຈາກລົງທະບຽນ ລະບົບຈະສ້າງລະຫັດອົງກອນ (<code>TENANT-...</code>), ມອບ 500,000 AI Credits ຜ່ານ <code>motapis.com/v1</code> ແລະ ເປີດໜ້າຄຸ້ມຄອງ ATS ສະເພາະບໍລິສັດທັນທີ.",
    btnEmpSubmitReg: "🚀 ລົງທະບຽນບໍລິສັດ ແລະ ເປີດລະບົບຄຸ້ມຄອງ ATS ທັນທີ",
    applyAutoFillBanner: "✔ ຕື່ມຂໍ້ມູນອັດຕະໂນມັດຈາກບັນຊີຜູ້ຊອກວຽກແລ້ວ ສາມາດກົດສົ່ງໃບສະໝັກໄດ້ທັນທີ!",
    lblPrefInterviewLang: "ພາສາສຳພາດ AI ທີ່ຕ້ອງການ",
    lblCurrentLangOpt: "ພາສາປັດຈຸບັນ",
    lblAttachCvFile: "ແນບໄຟລ໌ CV (PDF / DOCX / TXT - ທາງເລືອກ)",
    lblCvSummaryText: "ເນື້ອໃນຊີວະປະຫວັດຫຍໍ້ ແລະ ຜົນງານບໍລິຫານ *",
    applyPrivacyBox: "🔒 <b>ຄວາມປອດໄພຂໍ້ມູນສ່ວນບຸກຄົນ:</b> ຊີວະປະຫວັດຂອງທ່ານຈະຖືກສົ່ງໄປຫາພື້ນທີ່ຂໍ້ມູນສະເພາະຂອງບໍລິສັດທີ່ຮັບສະໝັກເທົ່ານັ້ນ ແລະ ປິດບັງຂໍ້ມູນ PII ກ່ອນ AI ປະເມີນຜົນ.",
    btnSubmitApply: "🚀 ສົ່ງໃບສະໝັກ ແລະ ຮັບຄະແນນປະເມີນ AI ທັນທີ",
    resBadge: "ປະເມີນຜົນ AI ສຳເລັດແລ້ວ (MOTAPIS.COM/V1)",
    resTitle: "ສົ່ງໃບສະໝັກວຽກສຳເລັດແລ້ວ!",
    resScoreLabel: "ຄະແນນຄວາມເໝາະສົມຈາກ AI (AI Screening Score)",
    resPrivateVaultNote: "✔ ຂໍ້ມູນໃບສະໝັກຂອງທ່ານຖືກສົ່ງເຂົ້າລະບົບສະເພາະຂອງບໍລິສັດຮັບສະໝັກແລ້ວ!",
    btnTrackMySubmitted: "📋 ເບິ່ງຄວາມຄືບໜ້າໃບສະໝັກ",
    transModalBadge: "ເຄື່ອງມືແປພາສາອັດຕະໂນມັດດ້ວຍ AI (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 ສູນແປພາສາອັດຕະໂນມັດ 8 ພາສາ ແບບເວລາຈິງ",
    transModalSub: "ແປທຸກສ່ວນຂອງໜ້າເວັບ, 30 ຕຳແໜ່ງບໍລິຫານ, 10 ໝວດອຸດສາຫະກຳ ແລະ ບໍລິສັດສະມາຊິກຄົບ 100% ທັນທີທີ່ປ່ຽນພາສາ.",
    lblTransCoverage: "ອັດຕາການແປພາສາໜ້າ Public ປັດຈຸບັນ:",
    lblAutoTransToggle: "ແປເນື້ອໃນໃໝ່ອັດຕະໂນມັດເມື່ອປ່ຽນພາສາ:",
    lblCustomTransInput: "ປ້ອນຂໍ້ຄວາມ JD / CV ເພື່ອໃຫ້ AI ແປທັນທີ:",
    btnRunCustomTrans: "⚡ ແປທັນທີດ້ວຍ AI (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 ຊິ້ງຂໍ້ມູນ ແລະ ແປໜ້າປັດຈຸບັນ 100%",
  },
  km: {
    pageTitle: "HireMind Global Careers — ផតថលជ្រើសរើសបុគ្គលិកថ្នាក់គ្រប់គ្រង និងអ្នកជំនាញអន្តរជាតិ",
    badgePortal: "ផតថលជ្រើសរើសបុគ្គលិកអន្តរជាតិ",
    subPortal: "ផ្សារការងារថ្នាក់គ្រប់គ្រង និងអ្នកជំនាញ • ពិនិត្យ CV និងសម្ភាសន៍ AI 24/7",
    navJobs: "ការងារថ្នាក់គ្រប់គ្រង",
    navCategories: "หมวดឧស្សាហកម្មទាំង 10",
    navEmployers: "សហគ្រាសសមាជិក",
    navMyApps: "ពាក្យសុំការងាររបស់ខ្ញុំ",
    btnAiTranslator: "🤖 AI បកប្រែស្វ័យប្រវត្តិ (100%)",
    btnCandAuth: "👤 គណនីអ្នកស្វែងរកការងារ",
    btnEmpAuth: "🏢 សម្រាប់សហគ្រាស (B2B)",
    btnOpenEmpWorkspace: "🚀 ចូលប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសហគ្រាស",
    btnLogout: "ចាកចេញ",
    toastLoggedOut: "បានចាកចេញពីគណនីដោយជោគជ័យ។",
    heroTag: "GLOBAL AI EXECUTIVE TALENT MARKETPLACE",
    heroTitle: "ភ្ជាប់ធនធានមនុស្សថ្នាក់គ្រប់គ្រងកណ្តាល និងជាន់ខ្ពស់ជាមួយសហគ្រាសអន្តរជាតិ",
    heroSub: "សហគ្រាសអាចចុះឈ្មោះដើម្បីទទួលបានพื้นที่គ្រប់គ្រងទិន្នន័យដាច់ដោយឡែក (Multi-Tenant) ហើយបេក្ខជនអាចបង្កើតគណនីជ្រើសរើសหมวดការងារដើម្បីដាក់ពាក្យភ្លាមៗ។",
    searchPlaceholder: "ស្វែងរកមុខតំណែងគ្រប់គ្រង ជំនាញ ឬទីតាំង...",
    allCategories: "គ្រប់หมวดឧស្សាហកម្មទាំង 10",
    allEmployers: "គ្រប់សហគ្រាសសមាជិក",
    statJobs: "មុខតំណែងកំពុងបើកទទួល",
    statCategories: "វិស័យឧស្សាហកម្មស្នូល",
    statEmployers: "សហគ្រាសសមាជិក",
    statAi: "វាយតម្លៃ និងសម្ភាសន៍ AI",
    secCategoriesTitle: "📂 ជ្រើសរើសหมวดឧស្សាហកម្មដើម្បីស្វែងរកការងារ",
    secCategoriesSub: "ចុចលើหมวดឧស្សាហកម្មណាមួយដើម្បីត្រងមុខតំណែងគ្រប់គ្រងដែលសហគ្រាសកំពុងជ្រើសរើស។",
    btnClearCategory: "✖ លុបตัวกรองหมวดឧស្សាហកម្ម",
    btnClearEmployer: "✖ បង្ហាញសហគ្រាសទាំងអស់",
    secEmployersTitle: "🏢 សហគ្រាសសមាជិក និងអង្គភាពពហុជួល (Multi-Tenant)",
    secEmployersSub: "សហគ្រាសនីមួយៗមានទិន្នន័យគ្រប់គ្រងដាច់ដោយឡែក (org_id)។ សហគ្រាសថ្មីអាចចុះឈ្មោះបានភ្លាមៗ។",
    btnRegNewEmployer: "➕ ចុះឈ្មោះគណនីសហគ្រាសថ្មី (ទទួលបានទិន្នន័យដាច់ដោយឡែក)",
    btnRegNewCandidate: "👤 ចុះឈ្មោះគណនីអ្នកស្វែងរកការងារ",
    btnFilterByEmployer: "មើលការងាររបស់ក្រុមហ៊ុននេះ",
    btnOpenCompanyAts: "🔑 ចូលប្រព័ន្ធក្រុមហ៊ុន",
    secJobsTitle: "🔥 មុខតំណែងថ្នាក់គ្រប់គ្រងដែលកំពុងបើកជ្រើសរើស",
    btnApplyJob: "🚀 ដាក់ពាក្យឥឡូវនេះ (AI ដាក់ពិន្ទុ)",
    lblOpenJobsCount: "មុខតំណែងបើកទទួល",
    lblApplicantsCount: "បេក្ខជន",
    lblMinExp: "បទពិសោធន៍អប្បបរមា:",
    lblYears: "ឆ្នាំ",
    myAppsTitle: "📋 ពាក្យសុំការងារ និងបន្ទប់សម្ភាសន៍ AI របស់ខ្ញុំ",
    myAppsSub: "តាមដានស្ថានភាពពាក្យសុំការងារ និងចូលបន្ទប់សម្ភាសន៍ AI 24/7។",
    trackPlaceholder: "បញ្ចូលអ៊ីមែល លេខទូរស័ព្ទ ឬឈ្មោះដើម្បីស្វែងរក...",
    btnSearchTrack: "🔍 ស្វែងរកពាក្យសុំការងារ",
    btnEnterAiInterview: "🎙️ ចូលបន្ទប់សម្ភាសន៍ AI",
    btnViewPdfCv: "📄 មើល CV PDF",
    emptyTrackMsg: "រកមិនឃើញពាក្យសុំការងារដែលត្រូវនឹងពាក្យស្វែងរក",
    lblAppId: "លេខកូដពាក្យសុំ:",
    lblStage: "ដំណាក់កាល:",
    lblAiScore: "ពិន្ទុ AI:",
    lblCandidate: "បេក្ខជន:",
    footerCompliance: "អនុលោមตามច្បាប់ការពារទិន្នន័យបុគ្គល & GDPR • បកប្រែស្វ័យប្រវត្តិ 100%",
    footerAtsLink: "🏢 ប្រព័ន្ធគ្រប់គ្រងការជ្រើសរើសបុគ្គលិកសម្រាប់សហគ្រាស (Enterprise ATS) →",
    btnClose: "បិទ",
    candModalBadge: "គណនីអ្នកស្វែងរកការងារ",
    candModalTitle: "👤 គណនីអ្នកស្វែងរកការងារ និងប្រវត្តិរូបឌីជីថល (ដាក់ពាក្យ 1-Click)",
    candDemoTitle: "⚡ ចូលប្រើរហ័សដោយប្រើគណនីបេក្ខជនគំរូ (1-Click):",
    candRegHeading: "ឬចុះឈ្មោះគណនីអ្នកស្វែងរកការងារថ្មី:",
    lblCandFullName: "ឈ្មោះពេញរបស់បេក្ខជន *",
    lblCandEmail: "អ៊ីមែលចូលប្រើ និងទទួលการแจ้งเตือน *",
    lblCandPhone: "លេខទូរស័ព្ទ",
    lblCandExpYears: "ចំនួនឆ្នាំបទពិសោធន៍ថ្នាក់គ្រប់គ្រង",
    lblCandSector: "หมวดឧស្សាហកម្មដែលចាប់អារម្មណ៍",
    lblCandSkills: "ជំនាញស្នូល (បំបែកដោយសញ្ញាក្បៀស)",
    lblCandBio: "សង្ខេបប្រវត្តិរូបស្តង់ដារ (សម្រាប់ដាក់ពាក្យ 1-Click)",
    btnCandSubmitReg: "✔ បង្កើតគណនីបេក្ខជន និងបើកដំណើរការ 1-Click Apply",
    empModalBadge: "សហគ្រាសសមាជិក B2B MULTI-TENANT",
    empModalTitle: "🏢 ចុះឈ្មោះ / ចូលប្រើគណនីអង្គភាពសហគ្រាស",
    empDemoTitle: "⚡ ប្តូរទៅកាន់ប្រព័ន្ធគ្រប់គ្រងសហគ្រាសគំរូភ្លាមៗ (បំបែកទិន្នន័យតាម org_id):",
    lblOrgId: "លេខកូដអង្គភាព:",
    empRegHeading: "➕ ចុះឈ្មោះសហគ្រាសសមាជិកថ្មី (ផ្តល់ជូនលេខកូដ org_id និងទិន្នន័យដាច់ដោយឡែកស្វ័យប្រវត្តិ):",
    lblEmpCompanyName: "ឈ្មោះក្រុមហ៊ុន / សម្ព័ន្ធក្រុមហ៊ុន *",
    lblEmpCountry: "ប្រទេស / តំបន់",
    lblEmpAdminName: "ឈ្មោះអ្នកគ្រប់គ្រងធនធានមនុស្ស (HR Admin) *",
    lblEmpEmail: "អ៊ីមែលអ្នកគ្រប់គ្រងសហគ្រាស *",
    lblEmpIndustry: "វិស័យឧស្សាហកម្មหลัก",
    lblEmpSubdomain: "ដែនរងផ្ទាល់ខ្លួន (Subdomain)",
    empBenefitBox: "✨ <b>អត្ថប្រយោជន៍ផ្តល់ជូនស្វ័យប្រវត្តិ:</b> ភ្លាមៗបន្ទាប់ពីចុះឈ្មោះ ប្រព័ន្ធនឹងបង្កើតលេខកូដអង្គភាព (<code>TENANT-...</code>) ផ្តល់ជូន 500,000 AI Credits តាមរយៈ <code>motapis.com/v1</code> និងបើកប្រព័ន្ធ ATS ផ្ទាល់ខ្លួនរបស់ក្រុមហ៊ុនអ្នក។",
    btnEmpSubmitReg: "🚀 ចុះឈ្មោះសហគ្រាស និងបើកប្រព័ន្ធគ្រប់គ្រង ATS ឥឡូវនេះ",
    applyAutoFillBanner: "✔ បានបំពេញព័ត៌មានស្វ័យប្រវត្តិពីគណនីបេក្ខជនរបស់អ្នក អ្នកអាចចុចដាក់ពាក្យភ្លាមៗ!",
    lblPrefInterviewLang: "ភាសាសម្ភាសន៍ AI ដែលពេញចិត្ត",
    lblCurrentLangOpt: "ភាសាបច្ចុប្បន្ន",
    lblAttachCvFile: "ភ្ជាប់ឯកសារ CV (PDF / DOCX / TXT - ជម្រើស)",
    lblCvSummaryText: "ខ្លឹមសារសង្ខេបប្រវត្តិរូប និងសមិទ្ធផលការងារ *",
    applyPrivacyBox: "🔒 <b>សុវត្ថិភាពទិន្នន័យបុគ្គល (អនុក្រឹត្យលេខ 13 & GDPR):</b> ប្រវត្តិរូបរបស់អ្នកត្រូវបានផ្ញើទៅកាន់តែផ្នែកធនធានមនុស្សនៃសហគ្រាសជ្រើសរើសប៉ុណ្ណោះ និងត្រូវបានលាក់អត្តសញ្ញាណ PII មុនពេល AI ដាក់ពិន្ទុ។",
    btnSubmitApply: "🚀 ផ្ញើពាក្យសុំការងារ និងទទួលពិន្ទុវាយតម្លៃ AI ភ្លាមៗ",
    resBadge: "ការវាយតម្លៃដោយ AI បានបញ្ចប់ (MOTAPIS.COM/V1)",
    resTitle: "ដាក់ពាក្យសុំការងារបានជោគជ័យ!",
    resScoreLabel: "ពិន្ទុសមស្របសរុបពី AI (AI Screening Score)",
    resPrivateVaultNote: "✔ ឯកសាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់ប្រព័ន្ធទិន្នន័យផ្ទាល់ខ្លួនរបស់សហគ្រាសជ្រើសរើសរួចរាល់ហើយ!",
    btnTrackMySubmitted: "📋 មើលវឌ្ឍនភាពពាក្យសុំការងារ",
    transModalBadge: "ម៉ាស៊ីនបកប្រែពហុភាសាស្វ័យប្រវត្តិដោយ AI (MOTAPIS.COM/V1)",
    transModalTitle: "🤖 មជ្ឈមណ្ឌលបកប្រែស្វ័យប្រវត្តិ 8 ភាសាដោយ AI",
    transModalSub: "បកប្រែ 100% នៃផ្ទាំងកម្មវិធី មុខតំណែងគ្រប់គ្រងទាំង 30 វិស័យឧស្សាហកម្មទាំង 10 និងសហគ្រាសសមាជិកភ្លាមៗเมื่อប្តូរភាសា។",
    lblTransCoverage: "អត្រាគ្របដណ្តប់នៃការបកប្រែទំព័រសាធារណៈបច្ចុប្បន្ន:",
    lblAutoTransToggle: "បកប្រែមាតិកាថ្មីដោយស្វ័យប្រវត្តិនៅពេលប្តូរភាសា:",
    lblCustomTransInput: "បញ្ចូលអត្ថបទประกาศជ្រើសរើសបុគ្គលិក (JD) ឬ CV ដើម្បីឱ្យ AI បកប្រែភ្លាមៗ:",
    btnRunCustomTrans: "⚡ បកប្រែឥឡូវនេះដោយ AI (motapis.com/v1)",
    btnSyncAllPageTrans: "🔄 ធ្វើសមកាលកម្ម និងបកប្រែទំព័របច្ចុប្បន្ន 100%",
  },
};

/* ============================================================================
   2. 10 INDUSTRY SECTORS, 6 MEMBER ENTERPRISES, 30 MANAGEMENT JOBS & LOCATIONS
   ============================================================================ */
const SECTOR_ICONS = {
  "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)": "💻",
  "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)": "🏦",
  "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)": "🏭",
  "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)": "🏗️",
  "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)": "🛒",
  "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)": "🏥",
  "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)": "🚢",
  "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)": "⚡",
  "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)": "🏨",
  "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)": "🎓",
};

const SECTOR_TRANSLATIONS = {
  "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)": {
    vi: "Công nghệ Thông tin & Trí tuệ Nhân tạo (IT / AI)",
    en: "Information Technology & Artificial Intelligence (IT / AI)",
    ja: "IT・人工知能・デジタル技術部門",
    ko: "정보기술(IT) 및 인공지능(AI) 부문",
    zh: "信息技术与人工智能 (IT / AI)",
    th: "เทคโนโลยีสารสนเทศและปัญญาประดิษฐ์ (IT / AI)",
    lo: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ ແລະ ປັນຍາປະດິດ (IT / AI)",
    km: "បច្ចេកវិទ្យាព័ត៌មាន និងបញ្ញាសិប្បនិម្មិត (IT / AI)",
  },
  "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)": {
    vi: "Tài chính - Ngân hàng - Bảo hiểm (Banking & Finance)",
    en: "Banking, Financial Services & Insurance (BFSI)",
    ja: "金融・銀行・投資部門 (Banking & Finance)",
    ko: "금융·은행·보험 부문 (Banking & Finance)",
    zh: "金融、银行与投资 (Banking & Finance)",
    th: "การเงิน การธนาคาร และการลงทุน (Banking & Finance)",
    lo: "ການເງິນ, ທະນາຄານ ແລະ ການລົງທຶນ (Banking & Finance)",
    km: "ហិរញ្ញវត្ថុ ធនាគារ និងធានារ៉ាប់រង (Banking & Finance)",
  },
  "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)": {
    vi: "Sản xuất Công nghiệp & FDI Điện tử (Manufacturing & FDI)",
    en: "Industrial Manufacturing & FDI Electronics",
    ja: "工業製造・FDI電子部品工場部門",
    ko: "산업제조 및 FDI 전자·반도체 부문",
    zh: "工业制造与外资电子 (Manufacturing & FDI)",
    th: "การผลิตอุตสาหกรรมและโรงงานอิเล็กทรอนิกส์ FDI",
    lo: "ການຜະລິດອຸດສາຫະກຳ ແລະ ໂຮງງານເອເລັກໂຕຣນິກ FDI",
    km: "ផលិតកម្មឧស្សាហកម្ម និងអេឡិចត្រូនិក FDI",
  },
  "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)": {
    vi: "Bất động sản & Xây dựng Hạ tầng (Real Estate & Construction)",
    en: "Real Estate & Infrastructure Construction",
    ja: "不動産開発・インフラ建設部門",
    ko: "부동산 개발 및 인프라 건설 부문",
    zh: "房地产与基础设施建设",
    th: "อสังหาริมทรัพย์และก่อสร้างโครงสร้างพื้นฐาน",
    lo: "ອະສັງຫາລິມະຊັບ ແລະ ກໍ່ສ້າງໂຄງລ່າງພື້ນຖານ",
    km: "អចលនទ្រព្យ និងសំណង់ហេដ្ឋារចនាសម្ព័ន្ធ",
  },
  "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)": {
    vi: "Bán lẻ, Thương mại Điện tử & FMCG (Retail & FMCG)",
    en: "Omnichannel Retail, E-Commerce & FMCG",
    ja: "小売・Eコマース・日用消費財 (Retail & FMCG)",
    ko: "유통·이커머스·소비재 (Retail & FMCG)",
    zh: "零售、电子商务与快消品 (Retail & FMCG)",
    th: "ค้าปลีก อีคอมเมิร์ซ และสินค้าอุปโภคบริโภค (FMCG)",
    lo: "ຂາຍຍ່ອຍ, ອີຄອມເມີຊ ແລະ ສິນຄ້າອຸປະໂພກບໍລິໂພກ",
    km: "លក់រាយ ពាណិជ្ជកម្មអេឡិចត្រូនិក និងទំនិញប្រើប្រាស់ប្រចាំថ្ងៃ",
  },
  "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)": {
    vi: "Y tế, Dược phẩm & Chăm sóc Sức khỏe (Healthcare & Pharma)",
    en: "Healthcare, Hospital Operations & Pharmaceuticals",
    ja: "医療・製薬・ヘルスケア部門",
    ko: "의료·제약·헬스케어 부문",
    zh: "医疗健康与医药事业部",
    th: "การแพทย์ เภสัชกรรม และธุรกิจสุขภาพ",
    lo: "ການແພດ, ການຢາ ແລະ ການດູແລສຸຂະພາບ",
    km: "សុខាភិបាល ឱសថ និងការថែទាំសុខភាព",
  },
  "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)": {
    vi: "Logistics, Chuỗi Cung ứng & Xuất Nhập khẩu (Logistics & Supply Chain)",
    en: "Logistics, Supply Chain & Global Trade",
    ja: "物流・サプライチェーン・貿易部門",
    ko: "물류·공급망 관리(SCM)·수출입 부문",
    zh: "物流、供应链与进出口贸易",
    th: "โลจิสติกส์ ซัพพลายเชน และการค้าระหว่างประเทศ",
    lo: "ໂລຈິສຕິກ, ຕ່ອງໂສ້ການສະໜອງ ແລະ ການຄ້າສາກົນ",
    km: "ភស្តុភារកម្ម ខ្សែសង្វាក់ផ្គត់ផ្គង់ និងពាណិជ្ជកម្មអន្តរជាតិ",
  },
  "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)": {
    vi: "Năng lượng Tái tạo & Môi trường ESG (Renewable Energy & ESG)",
    en: "Renewable Energy, Clean Tech & ESG Sustainability",
    ja: "再生可能エネルギー・ESGサステナビリティ部門",
    ko: "신재생에너지 및 ESG 지속가능경영 부문",
    zh: "可再生能源与 ESG 可持续发展",
    th: "พลังงานหมุนเวียนและความยั่งยืน ESG",
    lo: "ພະລັງງານໝູນວຽນ ແລະ ການພັດທະນາຢືນຍົງ ESG",
    km: "ថាមពលកកើតឡើងវិញ និងចីរភាពបរិស្ថាន ESG",
  },
  "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)": {
    vi: "Du lịch, Khách sạn & Nghỉ dưỡng 5 Sao (Hospitality & Luxury Resorts)",
    en: "5-Star Hospitality, Tourism & Luxury Resorts",
    ja: "観光・5つ星ホテル＆ラグジュアリーリゾート部門",
    ko: "관광·5성급 호텔 및 럭셔리 리조트 부문",
    zh: "旅游、五星级酒店与奢华度假村",
    th: "การท่องเที่ยว โรงแรม และรีสอร์ตระดับ 5 ดาว",
    lo: "ການທ່ອງທ່ຽວ, ໂຮງແຮມ ແລະ ຣີສອດລະດັບ 5 ດາວ",
    km: "ទេសចរណ៍ សណ្ឋាគារ និងរមណីយដ្ឋានលំដាប់ផ្កាយ 5",
  },
  "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)": {
    vi: "Giáo dục Quốc tế & Công nghệ Giáo dục (Education & EdTech)",
    en: "International Education & AI EdTech",
    ja: "国際教育・AIエドテック部門",
    ko: "국제교육 및 AI 에듀테크 부문",
    zh: "国际教育与 AI 教育科技 (EdTech)",
    th: "การศึกษานานาชาติและเทคโนโลยีการศึกษา (EdTech)",
    lo: "ການສຶກສາສາກົນ ແລະ ເຕັກໂນໂລຊີການສຶກສາ (EdTech)",
    km: "ការអប់រំអន្តរជាតិ និងបច្ចេកវិទ្យាអប់រំ (EdTech)",
  },
};

const EMPLOYER_NAME_TRANSLATIONS = {
  "TENANT-VN-01": {
    vi: "Tập đoàn Công nghệ & Bán lẻ TechVina Holdings",
    en: "TechVina Technology & Omnichannel Retail Holdings",
    ja: "TechVinaテクノロジー＆リテール・ホールディングス",
    ko: "테크비나(TechVina) 테크놀로지 & 리테일 홀딩스",
    zh: "TechVina 科技与全渠道零售控股集团",
    th: "กลุ่มบริษัท เทควินา เทคโนโลยี แอนด์ รีเทล โฮลดิ้งส์",
    lo: "ກຸ່ມບໍລິສັດ ເທັກວິນາ ເຕັກໂນໂລຊີ ແລະ ຂາຍຍ່ອຍ ໂຮນດິ້ງ",
    km: "សម្ព័ន្ធក្រុមហ៊ុន TechVina Technology & Retail Holdings",
  },
  "TENANT-JP-02": {
    vi: "Tập đoàn Sản xuất Điện tử FDI Nippon Precision Việt Nam",
    en: "Nippon Precision Electronics Manufacturing FDI Corp",
    ja: "日本プレシジョン電子製造FDIベトナム株式会社",
    ko: "닛폰 프리시전 전자제조 FDI 베트남 법인",
    zh: "日本精密电子制造外资集团 (Nippon Precision FDI)",
    th: "บริษัท นิปปอน พรีซิชั่น อิเล็กทรอนิกส์ แมนูแฟคเจอริ่ง (FDI)",
    lo: "ບໍລິສັດ ນິບປອນ ພຣີຊິຊັນ ຜະລິດເອເລັກໂຕຣນິກ FDI",
    km: "សាជីវកម្មផលិតគ្រឿងអេឡិចត្រូនិក Nippon Precision FDI",
  },
  "TENANT-KR-03": {
    vi: "Tập đoàn Bán dẫn & Công nghệ K-Semicon Vina",
    en: "K-Semicon Vina Semiconductor & R&D Group",
    ja: "K-Semicon Vina 半導体・先端技術グループ",
    ko: "K-세미콘 비나 반도체 & 미래기술 그룹 (K-Semicon Vina)",
    zh: "韩资 K-Semicon Vina 半导体与研发集团",
    th: "กลุ่มบริษัท เค-เซมิคอน วินา เซมิคอนดักเตอร์ แอนด์ เทคโนโลยี",
    lo: "ກຸ່ມບໍລິສັດ K-Semicon Vina ອຸດສາຫະກຳເຄິ່ງຕົວນຳ ແລະ ເຕັກໂນໂລຊີ",
    km: "សម្ព័ន្ធឧស្សាហកម្មเซមីកុងឌុចទ័រ និងបច្ចេកវិទ្យា K-Semicon Vina",
  },
  "TENANT-TH-04": {
    vi: "Tập đoàn Năng lượng & Bán lẻ Siam Mekong Group",
    en: "Siam Mekong Renewable Energy & Retail Group",
    ja: "サイアム・メコン再生可能エネルギー＆リテールグループ",
    ko: "시암 메콩 신재생에너지 & 리테일 그룹 (Siam Mekong Group)",
    zh: "暹罗湄公河新能源与零售集团 (Siam Mekong Group)",
    th: "กลุ่มบริษัท สยาม แม่โขง พลังงานและค้าปลีก จำกัด (มหาชน)",
    lo: "ກຸ່ມບໍລິສັດ ສະຫຍາມ ແມ່ຂອງ ພະລັງງານ ແລະ ການຄ້າ",
    km: "សម្ព័ន្ធក្រុមហ៊ុនថាមពល និងលក់រាយ Siam Mekong Group",
  },
  "TENANT-LA-05": {
    vi: "Tập đoàn Hạ tầng, Logistics & Viễn thông Vientiane Star",
    en: "Vientiane Star Infrastructure, Logistics & Telecom Group",
    ja: "ビエンチャン・スター・インフラ＆物流通信グループ",
    ko: "비엔티안 스타 인프라·물류·통신 그룹 (Vientiane Star)",
    zh: "万象之星基建、物流与通信集团 (Vientiane Star)",
    th: "กลุ่มบริษัท เวียงจันทน์ สตาร์ อินฟราสตรัคเจอร์ แอนด์ เทเลคอม",
    lo: "ກຸ່ມບໍລິສັດ ວຽງຈັນ ສະຕາ ໂຄງລ່າງພື້ນຖານ, ໂລຈິສຕິກ ແລະ ໂທລະຄົມ",
    km: "សម្ព័ន្ធហេដ្ឋារចនាសម្ព័ន្ធ ភស្តុភារកម្ម និងទូរគមនាគមន៍ Vientiane Star",
  },
  "TENANT-KH-06": {
    vi: "Tập đoàn Ngân hàng Số & Nghỉ dưỡng Angkor Royal Group",
    en: "Angkor Royal Digital Banking & 5-Star Hospitality Group",
    ja: "アンコール・ロイヤル・デジタル銀行＆5つ星リゾートグループ",
    ko: "앙코르 로열 디지털 금융 & 5성급 리조트 그룹 (Angkor Royal)",
    zh: "吴哥皇家数字银行与五星级度假集团 (Angkor Royal Group)",
    th: "กลุ่มบริษัท อังกอร์ รอยัล ดิจิทัลแบงก์กิ้ง แอนด์ ฮอสพิทาลิตี้",
    lo: "ກຸ່ມບໍລິສັດ ອັງກໍ ຣໍຢัล ທະນາຄານດິຈິຕອນ ແລະ ໂຮງແຮມ 5 ດາວ",
    km: "សម្ព័ន្ធធនាគារឌីជីថល និងរមណីយដ្ឋានផ្កាយ 5 Angkor Royal Group",
  },
};

const COUNTRY_TRANSLATIONS = {
  "🇻🇳 Việt Nam": {
    vi: "🇻🇳 Việt Nam",
    en: "🇻🇳 Vietnam",
    ja: "🇻🇳 ベトナム",
    ko: "🇻🇳 베트남",
    zh: "🇻🇳 越南",
    th: "🇻🇳 เวียดนาม",
    lo: "🇻🇳 ຫວຽດນາມ",
    km: "🇻🇳 វៀតណាម",
  },
  "🇯🇵 Nhật Bản (FDI)": {
    vi: "🇯🇵 Nhật Bản (FDI)",
    en: "🇯🇵 Japan (FDI)",
    ja: "🇯🇵 日本 (FDI日系企業)",
    ko: "🇯🇵 일본 (FDI 외투기업)",
    zh: "🇯🇵 日本 (外资 FDI)",
    th: "🇯🇵 ญี่ปุ่น (FDI)",
    lo: "🇯🇵 ຍີ່ປຸ່ນ (FDI)",
    km: "🇯🇵 ជប៉ុន (FDI)",
  },
  "🇰🇷 Hàn Quốc (FDI)": {
    vi: "🇰🇷 Hàn Quốc (FDI)",
    en: "🇰🇷 South Korea (FDI)",
    ja: "🇰🇷 韓国 (FDI企業)",
    ko: "🇰🇷 대한민국 (FDI 외투기업)",
    zh: "🇰🇷 韩国 (外资 FDI)",
    th: "🇰🇷 เกาหลีใต้ (FDI)",
    lo: "🇰🇷 ເກົາຫຼີໃຕ້ (FDI)",
    km: "🇰🇷 កូរ៉េខាងត្បូង (FDI)",
  },
  "🇹🇭 Thái Lan (ASEAN)": {
    vi: "🇹🇭 Thái Lan (ASEAN)",
    en: "🇹🇭 Thailand (ASEAN)",
    ja: "🇹🇭 タイ (ASEAN)",
    ko: "🇹🇭 태국 (ASEAN)",
    zh: "🇹🇭 泰国 (东盟 ASEAN)",
    th: "🇹🇭 ประเทศไทย (ASEAN)",
    lo: "🇹🇭 ປະເທດໄທ (ASEAN)",
    km: "🇹🇭 ថៃ (ASEAN)",
  },
  "🇱🇦 Lào (ASEAN)": {
    vi: "🇱🇦 Lào (ASEAN)",
    en: "🇱🇦 Laos (ASEAN)",
    ja: "🇱🇦 ラオス (ASEAN)",
    ko: "🇱🇦 라오스 (ASEAN)",
    zh: "🇱🇦 老挝 (东盟 ASEAN)",
    th: "🇱🇦 สปป. ลาว (ASEAN)",
    lo: "🇱🇦 ສປປ ລາວ (ASEAN)",
    km: "🇱🇦 ឡាវ (ASEAN)",
  },
  "🇰🇭 Campuchia (ASEAN)": {
    vi: "🇰🇭 Campuchia (ASEAN)",
    en: "🇰🇭 Cambodia (ASEAN)",
    ja: "🇰🇭 カンボジア (ASEAN)",
    ko: "🇰🇭 캄보디아 (ASEAN)",
    zh: "🇰🇭 柬埔寨 (东盟 ASEAN)",
    th: "🇰🇭 กัมพูชา (ASEAN)",
    lo: "🇰🇭 ກຳປູເຈຍ (ASEAN)",
    km: "🇰🇭 កម្ពុជា (ASEAN)",
  },
};

const STAGE_TRANSLATIONS = {
  new: {
    vi: "Mới tiếp nhận",
    en: "New Application",
    ja: "新規応募",
    ko: "신규 접수",
    zh: "新投递",
    th: "รับใบสมัครใหม่",
    lo: "ຮັບໃບສະໝັກໃໝ່",
    km: "ពាក្យសុំថ្មី",
  },
  screening: {
    vi: "Đã sàng lọc AI",
    en: "AI Screened",
    ja: "AI書類選考済",
    ko: "AI 서류심사 완료",
    zh: "AI 初筛完成",
    th: "คัดกรองด้วย AI แล้ว",
    lo: "ຄັດກອງດ້ວຍ AI ແລ້ວ",
    km: "បានពិនិត្យដោយ AI",
  },
  interview: {
    vi: "Phỏng vấn AI / Chuyên môn",
    en: "AI / Executive Interview",
    ja: "AI・専門面接中",
    ko: "AI·심층 면접",
    zh: "AI / 业务面试",
    th: "สัมภาษณ์ AI / ผู้บริหาร",
    lo: "ສຳພາດ AI / ວິຊາສະເພາະ",
    km: "សម្ភាសន៍ AI / ជំនាញ",
  },
  offer: {
    vi: "Đề xuất Offer",
    en: "Offer Extended",
    ja: "内定オファー提示",
    ko: "처우 협의 (Offer)",
    zh: "已发录用通知 (Offer)",
    th: "ยื่นข้อเสนอจ้างงาน (Offer)",
    lo: "ສະເໜີຮັບເຂົ້າເຮັດວຽກ (Offer)",
    km: "ផ្តល់ជូនការងារ (Offer)",
  },
  hired: {
    vi: "Đã tuyển dụng",
    en: "Hired & Onboarded",
    ja: "採用決定・入社",
    ko: "최종 합격",
    zh: "已正式录用",
    th: "รับเข้าทำงานแล้ว",
    lo: "ຮັບເຂົ້າເຮັດວຽກແລ້ວ",
    km: "បានជ្រើសរើសเข้าធ្វើការ",
  },
  rejected: {
    vi: "Lưu Talent Pool",
    en: "Saved to Talent Pool",
    ja: "タレントプール保存",
    ko: "인재풀 보관",
    zh: "存入人才库",
    th: "เก็บในคลังผู้มีความสามารถ",
    lo: "ເກັບໄວ້ໃນຄັງບຸກຄະລາກອນ",
    km: "រក្សាទុកក្នុងคลังធនធានមនុស្ស",
  },
};

const PORTAL_30_JOB_TITLES = {
  job_01: {
    vi: "[Quản lý Cao cấp] Giám đốc Kỹ thuật & Trí tuệ Nhân tạo (VP of Engineering & AI)",
    en: "[Senior Executive] VP of Engineering & Artificial Intelligence",
    ja: "[上級管理職] 技術・人工知能担当副社長 (VP of Engineering & AI)",
    ko: "[임원급] 기술 및 인공지능 총괄 부사장 (VP of Engineering & AI)",
    zh: "[高层管理] 工程与人工智能副总裁 (VP of Engineering & AI)",
    th: "[ผู้บริหารระดับสูง] รองประธานฝ่ายวิศวกรรมและปัญญาประดิษฐ์ (VP of Engineering & AI)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຮອງປະທານຝ່າຍວິສະວະກຳ ແລະ ປັນຍາປະດິດ (VP of Engineering & AI)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] អនុប្រធានផ្នែកវិស្វកម្ម និងបញ្ញាសិប្បនិម្មិត (VP of Engineering & AI)",
  },
  job_02: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Phát triển Phần mềm & Nền tảng Số (Engineering Manager)",
    en: "[Middle Manager] Software & Digital Platform Engineering Manager",
    ja: "[中間管理職] ソフトウェア・デジタル基盤開発マネージャー (Engineering Manager)",
    ko: "[중간관리자] 소프트웨어 및 디지털 플랫폼 개발 팀장 (Engineering Manager)",
    zh: "[中层管理] 软件与数字平台研发经理 (Engineering Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายพัฒนาซอฟต์แวร์และแพลตฟอร์มดิจิทัล (Engineering Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກພັດທະນາຊອບແວ ແລະ ແພລດຟອມດິຈິຕອນ (Engineering Manager)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកអភិវឌ្ឍន៍កម្មវិធី និងថ្នាលឌីជីថល (Engineering Manager)",
  },
  job_03: {
    vi: "[Quản lý Cao cấp] Giám đốc Chuyển đổi Số & Quản trị Dữ liệu (Head of Digital Transformation & Data)",
    en: "[Senior Executive] Head of Digital Transformation & Enterprise Data",
    ja: "[上級管理職] DX推進・データガバナンス本部長 (Head of DX & Data)",
    ko: "[임원급] 디지털 전환(DX) 및 데이터 거버넌스 총괄 본부장",
    zh: "[高层管理] 数字化转型与企业数据治理总监 (Head of DX & Data)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายขับเคลื่อนดิจิทัลและธรรมาภิบาลข้อมูล (Head of DX & Data)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍຫັນປ່ຽນດິຈິຕອນ ແລະ ບໍລິຫານຂໍ້ມູນ (Head of DX & Data)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផ្នែកបរិវត្តកម្មឌីជីថល និងអភិបាលកិច្ចទិន្នន័យ (Head of DX & Data)",
  },
  job_04: {
    vi: "[Quản lý Cao cấp] Giám đốc Khối Quản trị Rủi ro Tín dụng & Basel III (Head of Credit Risk)",
    en: "[Senior Executive] Head of Credit Risk Management & Basel III",
    ja: "[上級管理職] 与信リスク管理・バーゼルIII統括本部長 (Head of Credit Risk)",
    ko: "[임원급] 신용리스크 관리 및 바젤III 총괄 본부장 (Head of Credit Risk)",
    zh: "[高层管理] 信贷风险管理与巴塞尔协议III总监 (Head of Credit Risk)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการสายงานบริหารความเสี่ยงด้านสินเชื่อและเกณฑ์ Basel III",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍບໍລິຫານຄວາມສ່່ຽງສິນເຊື່ອ ແລະ ມາດຕະຖານ Basel III",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកគ្រប់គ្រងហានិភ័យឥណទាន និងស្តង់ដារ Basel III",
  },
  job_05: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Khách hàng Doanh nghiệp Lớn & FDI (Corporate Banking Manager)",
    en: "[Middle Manager] Corporate & FDI Banking Relationship Manager",
    ja: "[中間管理職] 法人・FDI企業金融部長 (Corporate Banking Manager)",
    ko: "[중간관리자] 대기업 및 FDI 기업금융 부장 (Corporate Banking Manager)",
    zh: "[中层管理] 大型企业及外资(FDI)金融业务经理 (Corporate Banking Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายลูกค้าธุรกิจขนาดใหญ่และนักลงทุนต่างชาติ (Corporate Banking Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກລູກຄ້າອົງກອນຂະໜາດໃຫຍ່ ແລະ ການລົງທຶນຕ່າງປະເທດ (FDI)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកអតិថិជនសាជីវកម្មធំៗ និងវិនិយោគបរទេស (Corporate Banking Manager)",
  },
  job_06: {
    vi: "[Quản lý Cao cấp] Giám đốc Đầu tư & Mua bán Sáp nhập (Investment & M&A Director)",
    en: "[Senior Executive] Corporate Investment & M&A Director",
    ja: "[上級管理職] 投資・M&A戦略統括ディレクター (Investment & M&A Director)",
    ko: "[임원급] 기업투자 및 인수합병(M&A) 총괄 본부장",
    zh: "[高层管理] 投资与并购重组总监 (Investment & M&A Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายการลงทุนและการควบรวมกิจการ (Investment & M&A Director)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍການລົງທຶນ ແລະ ການຄວບລວມກິດຈະການ (M&A)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផ្នែកវិនិយោគ និងការរួមបញ្ចូលគ្នា (Investment & M&A Director)",
  },
  job_07: {
    vi: "[Quản lý Cao cấp] Giám đốc Nhà máy Sản xuất Điện tử FDI (Plant Director / General Manager)",
    en: "[Senior Executive] Electronics Manufacturing Plant Director (General Manager)",
    ja: "[上級管理職] 電子部品製造FDI工場長 (Plant Director / General Manager)",
    ko: "[임원급] 전자제조 FDI 공장장 / 법인장 (Plant Director)",
    zh: "[高层管理] 外资电子制造工厂总经理 (Plant Director / General Manager)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการโรงงานผลิตอิเล็กทรอนิกส์ (Plant Director / General Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການໂຮງງານຜະລິດເອເລັກໂຕຣນິກ FDI (Plant Director)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយករោងចក្រផលិតគ្រឿងអេឡិចត្រូនិក FDI (Plant Director)",
  },
  job_08: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Quản lý Chất lượng Toàn diện (QA/QC & ISO Senior Manager)",
    en: "[Middle Manager] Total Quality Management Senior Manager (QA/QC & ISO)",
    ja: "[中間管理職] 総合品質管理シニアマネージャー (QA/QC・IATF16949・ISO)",
    ko: "[중간관리자] 전사 품질관리 수석 부장 (QA/QC & ISO Senior Manager)",
    zh: "[中层管理] 全面质量管理高级经理 (QA/QC & ISO Senior Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการอาวุโสฝ่ายบริหารคุณภาพโรงงาน (QA/QC & ISO Senior Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກບໍລິຫານຄຸນນະພາບຮອບດ້ານ (QA/QC & ISO Senior Manager)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានជាន់ខ្ពស់ផ្នែកគ្រប់គ្រងគុណភាពរោងចក្រ (QA/QC & ISO)",
  },
  job_09: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Kỹ thuật Tự động hóa & Cải tiến Lean (Automation & Lean Manager)",
    en: "[Middle Manager] Industrial Automation & Lean Six Sigma Manager",
    ja: "[中間管理職] 生産技術・自動化＆リーン改善マネージャー (Automation & Lean)",
    ko: "[중간관리자] 공정 자동화 및 린 식스시그마 혁신 팀장 (Automation & Lean)",
    zh: "[中层管理] 工业自动化与精益改善经理 (Automation & Lean Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายวิศวกรรมระบบอัตโนมัติและการผลิตแบบลีน (Automation & Lean)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກວິສະວະກຳອັດຕະໂນມັດ ແລະ ການປັບປຸງ Lean",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកវិស្វកម្មស្វ័យប្រវត្តិកម្ម និងការកែលម្អ Lean",
  },
  job_10: {
    vi: "[Quản lý Cao cấp] Giám đốc Quản lý Dự án Khu Đô thị & Công nghiệp (Project Director)",
    en: "[Senior Executive] Township & Industrial Park Project Director",
    ja: "[上級管理職] 都市開発・工業団地プロジェクト統括ディレクター (Project Director)",
    ko: "[임원급] 신도시 및 산업단지 개발 프로젝트 총괄 본부장 (Project Director)",
    zh: "[高层管理] 城市综合体与工业园区项目总监 (Project Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการบริหารโครงการพัฒนาเมืองและนิคมอุตสาหกรรม (Project Director)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການບໍລິຫານໂຄງການເຂດຕົວເມືອງ ແລະ ນິຄົມອຸດສາຫະກຳ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកគ្រប់គ្រងគម្រោងអភិវឌ្ឍន៍ទីក្រុង និងតំបន់ឧស្សាហកម្ម",
  },
  job_11: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Phát triển Dự án & Pháp lý Đầu tư (Project Development Manager)",
    en: "[Middle Manager] Real Estate Project Development & Legal Affairs Manager",
    ja: "[中間管理職] 不動産開発・投資法務マネージャー (Project Development Manager)",
    ko: "[중간관리자] 부동산 프로젝트 개발 및 인허가 법무 팀장",
    zh: "[中层管理] 房地产项目开发与投资法务经理 (Project Development Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายพัฒนาโครงการและกฎหมายการลงทุนอสังหาริมทรัพย์",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກພັດທະນາໂຄງການ ແລະ ກົດໝາຍການລົງທຶນ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកអភិវឌ្ឍន៍គម្រោង និងនីតិកម្មវិនិយោគ",
  },
  job_12: {
    vi: "[Quản lý Cao cấp] Giám đốc Kinh doanh & Phát triển Hệ thống Phân phối BĐS (Sales Director)",
    en: "[Senior Executive] Real Estate Sales & Agency Network Director",
    ja: "[上級管理職] 不動産営業・販売代理店網統括ディレクター (Sales Director)",
    ko: "[임원급] 부동산 분양영업 및 대행사 네트워크 총괄 본부장 (Sales Director)",
    zh: "[高层管理] 房地产营销与渠道网络总监 (Sales Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายขายและพัฒนาเครือข่ายตัวแทนอสังหาริมทรัพย์",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍຂາຍ ແລະ ພັດທະນາລະບົບຈຳໜ່າຍອະສັງຫາລິມະຊັບ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផ្នែកលក់ និងអភិវឌ្ឍន៍បណ្តាញចែកចាយអចលនទ្រព្យ",
  },
  job_13: {
    vi: "[Quản lý Cao cấp] Giám đốc Thương mại Đa kênh & E-Commerce (Omnichannel Commercial Director)",
    en: "[Senior Executive] Omnichannel Retail & E-Commerce Commercial Director",
    ja: "[上級管理職] オムニチャネル・ECコマーシャル統括ディレクター",
    ko: "[임원급] 옴니채널 리테일 및 이커머스 총괄 상무 (Commercial Director)",
    zh: "[高层管理] 全渠道零售与电子商务总监 (Omnichannel Commercial Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการสายงานพาณิชย์อิเล็กทรอนิกส์และค้าปลีกแบบออมนิแชแนล",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍການຄ້າຫຼາຍຊ່ອງທາງ ແລະ ອີຄອມເມີຊ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកពាណិជ្ជកម្មពហុបណ្តាញ និងពាណិជ្ជកម្មអេឡិចត្រូនិក",
  },
  job_14: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Tiếp thị Ngành hàng & Thương hiệu (Senior Brand & Trade Manager)",
    en: "[Middle Manager] Senior Brand & Trade Marketing Manager (FMCG)",
    ja: "[中間管理職] ブランド＆トレードマーケティング・シニアマネージャー (FMCG)",
    ko: "[중간관리자] 브랜드 및 트레이드 마케팅 수석 부장 (Senior Brand Manager)",
    zh: "[中层管理] 高级品牌与通路行销经理 (Senior Brand & Trade Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการอาวุโสฝ่ายบริหารแบรนด์และการตลาดช่องทางจำหน่าย (FMCG)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກການຕະຫຼາດແບຣນ ແລະ ຊ່ອງທາງຈຳໜ່າຍ (FMCG)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានជាន់ខ្ពស់ផ្នែកទីផ្សារម៉ាកយីហោ និងពាណិជ្ជកម្ម",
  },
  job_15: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Vận hành Chuỗi Cửa hàng Bán lẻ Miền Nam (Retail Area Manager)",
    en: "[Middle Manager] Regional Retail Chain Operations Manager",
    ja: "[中間管理職] リテール店舗網エリア運営マネージャー (Retail Area Manager)",
    ko: "[중간관리자] 리테일 체인 스토어 지역 운영 부장 (Retail Area Manager)",
    zh: "[中层管理] 连锁零售门店区域运营经理 (Retail Area Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายปฏิบัติการเครือข่ายร้านค้าปลีกระดับภูมิภาค (Retail Area Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກບໍລິຫານລະບົບຮ້ານຄ້າຂາຍຍ່ອຍປະຈຳພາກພື້ນ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកប្រតិបត្តិការបណ្តាញហាងលក់រាយប្រចាំតំបន់",
  },
  job_16: {
    vi: "[Quản lý Cao cấp] Giám đốc Vận hành Hệ thống Bệnh viện Đa khoa Quốc tế (Hospital Operations Director)",
    en: "[Senior Executive] International General Hospital Operations Director",
    ja: "[上級管理職] 国際総合病院オペレーション統括ディレクター",
    ko: "[임원급] 국제 종합병원 운영 총괄 본부장 (Hospital Operations Director)",
    zh: "[高层管理] 国际综合医院运营总监 (Hospital Operations Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายปฏิบัติการโรงพยาบาลนานาชาติ (Hospital Operations Director)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍບໍລິຫານໂຮງໝໍສາກົນ (Hospital Operations Director)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកប្រតិបត្តិការមន្ទីរពេទ្យពហុព្យាបាលអន្តរជាតិ",
  },
  job_17: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Kinh doanh Dược phẩm Kênh Bệnh viện Toàn quốc (National ETC Sales Manager)",
    en: "[Middle Manager] National Hospital Channel Pharmaceutical Sales Manager (ETC)",
    ja: "[中間管理職] 全国病院チャネル医薬品営業部長 (National ETC Sales Manager)",
    ko: "[중간관리자] 전국 병원 채널(ETC) 전문의약품 영업 부장",
    zh: "[中层管理] 全国医院渠道医药销售经理 (National ETC Sales Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายขายเวชภัณฑ์ช่องทางโรงพยาบาลระดับประเทศ (National ETC Sales)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກຂາຍຢາຊ່ອງທາງໂຮງໝໍທົ່ວປະເທດ (National ETC Sales)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកលក់ឱសថតាមបណ្តាញមន្ទីរពេទ្យទូទាំងប្រទេស",
  },
  job_18: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Đăng ký Thuốc & Đảm bảo Chất lượng EU-GMP (Regulatory Affairs & QA Manager)",
    en: "[Middle Manager] Pharmaceutical Regulatory Affairs & EU-GMP QA Manager",
    ja: "[中間管理職] 薬事申請（RA）・EU-GMP品質保証マネージャー",
    ko: "[중간관리자] 의약품 인허가(RA) 및 EU-GMP 품질보증 팀장",
    zh: "[中层管理] 药品注册与欧盟 GMP 质量保证经理 (RA & QA Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายขึ้นทะเบียนตำรับยาและประกันคุณภาพมาตรฐาน EU-GMP",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກຂຶ້ນທະບຽນຢາ ແລະ ປະກັນຄຸນນະພາບ EU-GMP",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកចុះបញ្ជីឱសថ និងធានាគុណភាពស្តង់ដារ EU-GMP",
  },
  job_19: {
    vi: "[Quản lý Cao cấp] Giám đốc Chuỗi Cung ứng Toàn quốc (Head of End-to-End Supply Chain)",
    en: "[Senior Executive] Head of End-to-End Supply Chain & Fulfillment",
    ja: "[上級管理職] 全国サプライチェーン統括本部長 (Head of Supply Chain)",
    ko: "[임원급] 전국 공급망 관리(SCM) 및 물류 총괄 본부장",
    zh: "[高层管理] 全国端到端供应链总监 (Head of End-to-End Supply Chain)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการสายงานบริหารซัพพลายเชนครบวงจรระดับประเทศ",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍບໍລິຫານຕ່ອງໂສ້ການສະໜອງທົ່ວປະເທດ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកគ្រប់គ្រងខ្សែសង្វាក់ផ្គត់ផ្គង់ទូទាំងប្រទេស",
  },
  job_20: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Khai thác Kho vận & Vận tải Quốc tế (Logistics & Fleet Operations Manager)",
    en: "[Middle Manager] Bonded Warehouse & International Fleet Operations Manager",
    ja: "[中間管理職] 保税倉庫・国際物流フリート運営マネージャー",
    ko: "[중간관리자] 보세창고 및 국제운송 플리트 운영 팀장",
    zh: "[中层管理] 保税仓储与国际货运车队运营经理",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายปฏิบัติการคลังสินค้าทัณฑ์บนและขนส่งระหว่างประเทศ",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກບໍລິຫານສາງສິນຄ້າ ແລະ ການຂົນສົ່ງສາກົນ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកប្រតិបត្តិការឃ្លាំងទំនិញ និងដឹកជញ្ជូនអន្តរជាតិ",
  },
  job_21: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Mua hàng Chiến lược & Phát triển Nhà cung cấp (Strategic Procurement Manager)",
    en: "[Middle Manager] Strategic Procurement & Supplier Development Manager",
    ja: "[中間管理職] 戦略購買・サプライヤー開発マネージャー (Strategic Procurement)",
    ko: "[중간관리자] 전략구매 및 협력사 개발 부장 (Strategic Procurement Manager)",
    zh: "[中层管理] 战略采购与供应商开发经理 (Strategic Procurement Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายจัดซื้อเชิงกลยุทธ์และพัฒนาผู้ส่งมอบ",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກຈັດຊື້ຍຸດທະສາດ ແລະ ພັດທະນາຜູ້ສະໜອງ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកលទ្ធកម្មយុទ្ធសាស្ត្រ និងអភិវឌ្ឍន៍អ្នកផ្គត់ផ្គង់",
  },
  job_22: {
    vi: "[Quản lý Cao cấp] Giám đốc Phát triển Dự án Điện Gió, Điện Mặt trời & DPPA (Renewable Energy Director)",
    en: "[Senior Executive] Wind, Solar & DPPA Renewable Energy Director",
    ja: "[上級管理職] 風力・太陽光発電およびDPPA事業開発ディレクター",
    ko: "[임원급] 풍력·태양광 및 직접전력구매계약(DPPA) 신재생에너지 사업본부장",
    zh: "[高层管理] 风电、光伏与直接购电协议(DPPA)新能源总监",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายพัฒนาโครงการพลังงานลม พลังงานแสงอาทิตย์ และสัญญาซื้อขายไฟฟ้าโดยตรง (DPPA)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍພັດທະນາໂຄງການພະລັງງານລົມ, ແສງຕາເວັນ ແລະ DPPA",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកអភិវឌ្ឍន៍គម្រោងថាមពលខ្យល់ ថាមពលពន្លឺព្រះអាទិត្យ និង DPPA",
  },
  job_23: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Kỹ thuật Vận hành Nhà máy Điện & Hệ thống BESS (O&M Engineering Manager)",
    en: "[Middle Manager] Power Plant O&M & Battery Energy Storage (BESS) Manager",
    ja: "[中間管理職] 発電所O&M・蓄電池システム(BESS)技術マネージャー",
    ko: "[중간관리자] 발전소 운영보수(O&M) 및 에너지저장장치(BESS) 기술 팀장",
    zh: "[中层管理] 电站运维(O&M)与储能系统(BESS)工程经理",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายวิศวกรรมเดินเครื่องโรงไฟฟ้าและระบบกักเก็บพลังงานแบตเตอรี่ (BESS)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກວິສະວະກຳເດີນເຄື່ອງໂຮງໄຟຟ້າ ແລະ ລະບົບກັກເກັບພະລັງງານ (BESS)",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកវិស្វកម្មប្រតិបត្តិការរោងចក្រអគ្គិសនី និងប្រព័ន្ធស្តុកថាមពល (BESS)",
  },
  job_24: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Quản trị Phát triển Bền vững & Kiểm kê Khí nhà kính (ESG & Carbon Manager)",
    en: "[Middle Manager] ESG Sustainability & Greenhouse Gas Inventory Manager",
    ja: "[中間管理職] ESGサステナビリティ・温室効果ガス算定マネージャー",
    ko: "[중간관리자] ESG 지속가능경영 및 온실가스 인벤토리 팀장",
    zh: "[中层管理] ESG 可持续发展与温室气体盘查经理",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายพัฒนาความยั่งยืน ESG และบัญชีก๊าซเรือนกระจก",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກບໍລິຫານການພັດທະນາຢືນຍົງ ESG ແລະ ການກວດນັບອາຍພິດເຮືອນແກ້ວ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកគ្រប់គ្រងការអភិវឌ្ឍប្រកបដោយចីរភាព ESG និងសារពើភ័ណ្ឌឧស្ម័នផ្ទះកញ្ចក់",
  },
  job_25: {
    vi: "[Quản lý Cao cấp] Tổng Quản lý Khu Nghỉ dưỡng 5 Sao Quốc tế (General Manager - Luxury Resort)",
    en: "[Senior Executive] General Manager — 5-Star International Luxury Resort",
    ja: "[上級管理職] 5つ星国際ラグジュアリーリゾート総支配人 (General Manager)",
    ko: "[임원급] 5성급 인터내셔널 럭셔리 리조트 총지배인 (General Manager)",
    zh: "[高层管理] 国际五星级奢华度假村总经理 (General Manager)",
    th: "[ผู้บริหารระดับสูง] ผู้จัดการทั่วไป รีสอร์ตหรูระดับ 5 ดาวนานาชาติ (General Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ຈັດການທົ່ວໄປ ຣີສອດລະດັບ 5 ດາວສາກົນ (General Manager)",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] អ្នកគ្រប់គ្រងទូទៅ រមណីយដ្ឋានប្រណីតលំដាប់ផ្កាយ 5 អន្តរជាតិ (General Manager)",
  },
  job_26: {
    vi: "[Quản lý Cao cấp] Giám đốc Kinh doanh & Quản trị Doanh thu Hệ thống Khách sạn (Director of Sales & Revenue)",
    en: "[Senior Executive] Hospitality Director of Sales & Revenue Management",
    ja: "[上級管理職] ホテルグループ営業・レベニューマネジメント統括ディレクター",
    ko: "[임원급] 호텔 그룹 세일즈 및 수익관리(RM) 총괄 디렉터",
    zh: "[高层管理] 酒店集团销售与收益管理总监 (Director of Sales & Revenue)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายขายและบริหารรายได้เครือโรงแรม (Director of Sales & Revenue)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍຂາຍ ແລະ ບໍລິຫານລາຍຮັບລະບົບໂຮງແຮມ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផ្នែកលក់ និងគ្រប់គ្រងចំណូលប្រព័ន្ធសណ្ឋាគារ",
  },
  job_27: {
    vi: "[Quản lý Cấp trung] Trưởng khối Ẩm thực & Dịch vụ Lưu trú Cao cấp (F&B and Rooms Division Manager)",
    en: "[Middle Manager] Luxury F&B and Rooms Division Manager",
    ja: "[中間管理職] 料飲部門(F&B)・宿泊部門統括マネージャー",
    ko: "[중간관리자] 식음료(F&B) 및 객실부문 운영 부장",
    zh: "[中层管理] 高端餐饮部与房务部运营经理 (F&B & Rooms Division Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายอาหารและเครื่องดื่มและฝ่ายห้องพักระดับลักชัวรี (F&B & Rooms Manager)",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກອາຫານ-ເຄື່ອງດື່ມ ແລະ ບໍລິການຫ້ອງພັກລະດັບສູງ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកអាហារ-ភេសជ្ជៈ និងសេវាកម្មបន្ទប់ស្នាក់នៅជាន់ខ្ពស់",
  },
  job_28: {
    vi: "[Quản lý Cao cấp] Giám đốc Điều hành Hệ thống Trường Liên cấp Song ngữ Quốc tế (School Operations Director)",
    en: "[Senior Executive] International Bilingual K-12 School Operations Director",
    ja: "[上級管理職] 国際バイリンガル一貫校オペレーション統括ディレクター",
    ko: "[임원급] 국제 이중언어 초·중·고 통합학교 운영 총괄 디렉터",
    zh: "[高层管理] 国际双语一贯制学校运营总监 (School Operations Director)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายปฏิบัติการเครือโรงเรียนนานาชาติสองภาษา (School Operations Director)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການບໍລິຫານລະບົບໂຮງຮຽນສອງພາສາສາກົນ",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកប្រតិបត្តិការប្រព័ន្ធសាលាអន្តរជាតិទ្វេភាសា",
  },
  job_29: {
    vi: "[Quản lý Cấp trung] Trưởng phòng Phát triển Chương trình Học thuật & Khảo thí (Academic & Curriculum Manager)",
    en: "[Middle Manager] Academic Curriculum & Assessment Development Manager",
    ja: "[中間管理職] アカデミックカリキュラム開発・試験評価マネージャー",
    ko: "[중간관리자] 국제 교육과정 개발 및 평가 총괄 팀장 (Academic Manager)",
    zh: "[中层管理] 学术课程研发与考评经理 (Academic & Curriculum Manager)",
    th: "[ผู้จัดการระดับกลาง] ผู้จัดการฝ่ายพัฒนาหลักสูตรวิชาการและระบบประเมินผลการศึกษา",
    lo: "[ຜູ້ບໍລິຫານລະດັບກາງ] ຫົວໜ້າພະແນກພັດທະນາຫຼັກສູດວິຊາການ ແລະ ການສອບເສັງ",
    km: "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល] ប្រធានផ្នែកអភិវឌ្ឍន៍កម្មវិធីសិក្សា និងការវាយតម្លៃការប្រឡង",
  },
  job_30: {
    vi: "[Quản lý Cao cấp] Giám đốc Sản phẩm & Tăng trưởng Nền tảng EdTech AI (Head of EdTech Product & Growth)",
    en: "[Senior Executive] Head of AI EdTech Product & Regional Growth",
    ja: "[上級管理職] AIエドテック製品戦略・グロース統括本部長",
    ko: "[임원급] AI 에듀테크 프로덕트 및 그로스 총괄 본부장 (Head of EdTech Product)",
    zh: "[高层管理] AI 教育科技产品与增长总监 (Head of EdTech Product & Growth)",
    th: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายผลิตภัณฑ์และการเติบโตแพลตฟอร์มการศึกษา AI (Head of EdTech Product)",
    lo: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍຜະລິດຕະພັນ ແລະ ການເຕີບໂຕແພລດຟອມການສຶກສາ AI",
    km: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផលិតផល និងកំណើនថ្នាលបច្ចេកវិទ្យាអប់រំ AI (Head of EdTech Product)",
  },
};

/* ============================================================================
   3. AUTOMATIC TRANSLATION ENGINE FOR STATIC & NEWLY CREATED CONTENT
   ============================================================================ */
function pDict() {
  return PORTAL_I18N[portalState.lang] || PORTAL_I18N.vi;
}

function saveDynamicCache() {
  try {
    localStorage.setItem("hiremind_portal_i18n_cache", JSON.stringify(portalState.dynamicCache));
  } catch (e) {}
}

function getCachedTranslation(rawText) {
  if (!rawText || portalState.lang === "vi") return null;
  return portalState.dynamicCache[`${portalState.lang}::${rawText}`] || null;
}

function translateSector(rawSector) {
  if (!rawSector) return "";
  const m = SECTOR_TRANSLATIONS[rawSector];
  if (m && m[portalState.lang]) return m[portalState.lang];
  return getCachedTranslation(rawSector) || rawSector;
}

function translateCountry(rawCountry) {
  if (!rawCountry) return "";
  const m = COUNTRY_TRANSLATIONS[rawCountry];
  if (m && m[portalState.lang]) return m[portalState.lang];
  return getCachedTranslation(rawCountry) || rawCountry;
}

function translateStage(rawStage) {
  if (!rawStage) return "";
  const key = String(rawStage).toLowerCase();
  const m = STAGE_TRANSLATIONS[key];
  if (m && m[portalState.lang]) return m[portalState.lang];
  return rawStage;
}

function translateEmployerName(orgId, rawName) {
  if (!rawName) return "";
  const m = EMPLOYER_NAME_TRANSLATIONS[orgId];
  if (m && m[portalState.lang]) return m[portalState.lang];
  const cached = getCachedTranslation(rawName);
  if (cached) return cached;
  if (portalState.lang === "vi") return rawName;
  // Rule-based smart translation for newly registered companies
  let out = rawName;
  const termMap = {
    en: {
      "Tập đoàn": "Group",
      "Công ty Cổ phần": "JSC",
      "Công nghệ": "Technology",
      "Đầu tư": "Investment",
      "Sản xuất": "Manufacturing",
      "Thương mại": "Commercial",
      "Bán lẻ": "Retail",
      "Việt Nam": "Vietnam",
    },
    ja: {
      "Tập đoàn": "グループ",
      "Công ty Cổ phần": "株式会社",
      "Công nghệ": "テクノロジー",
      "Đầu tư": "投資",
      "Sản xuất": "製造",
      "Thương mại": "商事",
      "Bán lẻ": "リテール",
      "Việt Nam": "ベトナム",
    },
    ko: {
      "Tập đoàn": "그룹",
      "Công ty Cổ phần": "주식회사",
      "Công nghệ": "테크놀로지",
      "Đầu tư": "투자",
      "Sản xuất": "제조",
      "Thương mại": "상사",
      "Bán lẻ": "리테일",
      "Việt Nam": "베트남",
    },
    zh: {
      "Tập đoàn": "集团",
      "Công ty Cổ phần": "股份公司",
      "Công nghệ": "科技",
      "Đầu tư": "投资",
      "Sản xuất": "制造",
      "Thương mại": "商贸",
      "Bán lẻ": "零售",
      "Việt Nam": "越南",
    },
    th: {
      "Tập đoàn": "กลุ่มบริษัท",
      "Công ty Cổ phần": "บริษัทจำกัด (มหาชน)",
      "Công nghệ": "เทคโนโลยี",
      "Đầu tư": "การลงทุน",
      "Sản xuất": "การผลิต",
      "Thương mại": "พาณิชย์",
      "Bán lẻ": "ค้าปลีก",
      "Việt Nam": "เวียดนาม",
    },
    lo: {
      "Tập đoàn": "ກຸ່ມບໍລິສັດ",
      "Công ty Cổ phần": "ບໍລິສັດມະຫາຊົນ",
      "Công nghệ": "ເຕັກໂນໂລຊີ",
      "Đầu tư": "ການລົງທຶນ",
      "Sản xuất": "ການຜະລິດ",
      "Thương mại": "ການຄ້າ",
      "Bán lẻ": "ຂາຍຍ່ອຍ",
      "Việt Nam": "ຫວຽດນາມ",
    },
    km: {
      "Tập đoàn": "សម្ព័ន្ធក្រុមហ៊ុន",
      "Công ty Cổ phần": "ក្រុមហ៊ុនមហាជន",
      "Công nghệ": "បច្ចេកវិទ្យា",
      "Đầu tư": "វិនិយោគ",
      "Sản xuất": "ផលិតកម្ម",
      "Thương mại": "ពាណិជ្ជកម្ម",
      "Bán lẻ": "លក់រាយ",
      "Việt Nam": "វៀតណាម",
    },
  }[portalState.lang];
  if (termMap) {
    Object.keys(termMap).forEach((k) => {
      if (out.includes(k)) out = out.split(k).join(termMap[k]);
    });
  }
  return out;
}

function localizePortalLocation(loc) {
  if (!loc || portalState.lang === "vi") return loc;
  const cached = getCachedTranslation(loc);
  if (cached) return cached;
  const map = {
    en: {
      "TP. Hồ Chí Minh": "Ho Chi Minh City",
      "Hà Nội": "Hanoi",
      "Bắc Ninh": "Bac Ninh",
      "Hải Phòng": "Hai Phong",
      "Bình Dương": "Binh Duong",
      "Đồng Nai": "Dong Nai",
      "Bắc Giang": "Bac Giang",
      "Thái Nguyên": "Thai Nguyen",
      "Long An": "Long An",
      "Hưng Yên": "Hung Yen",
      "Đồng bằng Sông Cửu Long": "Mekong Delta",
      "Ninh Thuận": "Ninh Thuan",
      "Bình Thuận": "Binh Thuan",
      "Gia Lai": "Gia Lai",
      "Phú Quốc": "Phu Quoc",
      "Đà Nẵng": "Da Nang",
      "Nha Trang": "Nha Trang",
      "Hội An": "Hoi An",
    },
    ja: {
      "TP. Hồ Chí Minh": "ホーチミン市",
      "Hà Nội": "ハノイ市",
      "Bắc Ninh": "バクニン省",
      "Hải Phòng": "ハイフォン市",
      "Bình Dương": "ビンズオン省",
      "Đồng Nai": "ドンナイ省",
      "Bắc Giang": "バクザン省",
      "Thái Nguyên": "タイグエン省",
      "Long An": "ロンアン省",
      "Hưng Yên": "フンイエン省",
      "Đồng bằng Sông Cửu Long": "メコンデルタ地域",
      "Ninh Thuận": "ニントゥアン省",
      "Bình Thuận": "ビントゥアン省",
      "Gia Lai": "ザライ省",
      "Phú Quốc": "フーコック",
      "Đà Nẵng": "ダナン市",
      "Nha Trang": "ニャチャン",
      "Hội An": "ホイアン",
    },
    ko: {
      "TP. Hồ Chí Minh": "호치민시",
      "Hà Nội": "하노이시",
      "Bắc Ninh": "박닌성",
      "Hải Phòng": "하이퐁시",
      "Bình Dương": "빈즈엉성",
      "Đồng Nai": "동나이성",
      "Bắc Giang": "박장성",
      "Thái Nguyên": "타이응우옌성",
      "Long An": "롱안성",
      "Hưng Yên": "흥옌성",
      "Đồng bằng Sông Cửu Long": "메콩델타 권역",
      "Ninh Thuận": "닌투언성",
      "Bình Thuận": "빈투언성",
      "Gia Lai": "잘라이성",
      "Phú Quốc": "푸꾸옥",
      "Đà Nẵng": "다낭시",
      "Nha Trang": "나트랑",
      "Hội An": "호이안",
    },
    zh: {
      "TP. Hồ Chí Minh": "胡志明市",
      "Hà Nội": "河内市",
      "Bắc Ninh": "北宁省",
      "Hải Phòng": "海防市",
      "Bình Dương": "平阳省",
      "Đồng Nai": "同奈省",
      "Bắc Giang": "北江省",
      "Thái Nguyên": "太原省",
      "Long An": "隆安省",
      "Hưng Yên": "兴安省",
      "Đồng bằng Sông Cửu Long": "九龙江三角洲",
      "Ninh Thuận": "宁顺省",
      "Bình Thuận": "平顺省",
      "Gia Lai": "嘉莱省",
      "Phú Quốc": "富国岛",
      "Đà Nẵng": "岘港市",
      "Nha Trang": "芽庄",
      "Hội An": "会安",
    },
    th: {
      "TP. Hồ Chí Minh": "นครโฮจิมินห์",
      "Hà Nội": "กรุงฮานอย",
      "Bắc Ninh": "บั๊กนิญ",
      "Hải Phòng": "ไฮฟอง",
      "Bình Dương": "บิ่ญเซือง",
      "Đồng Nai": "ด่งนาย",
      "Bắc Giang": "บั๊กซาง",
      "Thái Nguyên": "ท้ายเหงียน",
      "Long An": "ลองอาน",
      "Hưng Yên": "ฮึงเอียน",
      "Đồng bằng Sông Cửu Long": "สามเหลี่ยมปากแม่น้ำโขง",
      "Ninh Thuận": "นิญถ่วน",
      "Bình Thuận": "บิ่ญถ่วน",
      "Gia Lai": "ซาลาย",
      "Phú Quốc": "ฟู้โกว๊ก",
      "Đà Nẵng": "ดานัง",
      "Nha Trang": "ญาจาง",
      "Hội An": "ฮอยอัน",
    },
    lo: {
      "TP. Hồ Chí Minh": "ນະຄອນໂຮ່ຈີມິນ",
      "Hà Nội": "ນະຄອນຫຼວງຮ່າໂນ້ຍ",
      "Bắc Ninh": "ແຂວງບັກນິງ",
      "Hải Phòng": "ນະຄອນໄຮ່ຟ່ອງ",
      "Bình Dương": "ແຂວງບິ່ງເຢືອງ",
      "Đồng Nai": "ແຂວງດົ່ງນາຍ",
      "Bắc Giang": "ແຂວງບັກຢາງ",
      "Thái Nguyên": "ແຂວງທາຍງວຽນ",
      "Long An": "ແຂວງລອງອານ",
      "Hưng Yên": "ແຂວງຮưngອຽນ",
      "Đồng bằng Sông Cửu Long": "ເຂດທົ່ງພຽງແມ່ນ້ຳຂອງ",
      "Ninh Thuận": "ແຂວງນິງທ້ວນ",
      "Bình Thuận": "ແຂວງບິ່ງທ້ວນ",
      "Gia Lai": "ແຂວງຢາລາຍ",
      "Phú Quốc": "ເກາະຟູ້ກວກ",
      "Đà Nẵng": "ນະຄອນດານັງ",
      "Nha Trang": "ຍາຈາງ",
      "Hội An": "ໂຮ້ຍອານ",
    },
    km: {
      "TP. Hồ Chí Minh": "ទីក្រុងហូជីមិញ",
      "Hà Nội": "រដ្ឋធានីហាណូយ",
      "Bắc Ninh": "ខេត្តបាក់និញ",
      "Hải Phòng": "ទីក្រុងហាយហ្វុង",
      "Bình Dương": "ខេត្តប៊ិញយឿង",
      "Đồng Nai": "ខេត្តដុងណៃ",
      "Bắc Giang": "ខេត្តបាក់យ៉ាង",
      "Thái Nguyên": "ខេត្តថាយង្វៀន",
      "Long An": "ខេត្តឡុងអាន",
      "Hưng Yên": "ខេត្តហឹងអៀន",
      "Đồng bằng Sông Cửu Long": "តំបន់ដីសណ្តទន្លេមេគង្គ",
      "Ninh Thuận": "ខេត្តនិញធួន",
      "Bình Thuận": "ខេត្តប៊ិញធួន",
      "Gia Lai": "ខេត្តយ៉ាឡាយ",
      "Phú Quốc": "កោះភូគុក",
      "Đà Nẵng": "ទីក្រុងដាណាំង",
      "Nha Trang": "ញ៉ាត្រាង",
      "Hội An": "ហូយអាន",
    },
  }[portalState.lang];
  if (!map) return loc;
  let out = loc;
  Object.keys(map).forEach((k) => {
    if (out.includes(k)) out = out.split(k).join(map[k]);
  });
  return out;
}

function localizePortalSalary(sal) {
  if (!sal || portalState.lang === "vi") return sal;
  const unitMap = {
    en: "Million VND / month",
    ja: "百万VND / 月",
    ko: "백만 VND / 월",
    zh: "百万越南盾 / 月",
    th: "ล้านดองเวียดนาม / เดือน",
    lo: "ລ້ານດົງຫວຽດນາມ / ເດືອນ",
    km: "លានដុងវៀតណាម / ខែ",
  };
  return sal.replace(/Triệu VNĐ/g, unitMap[portalState.lang] || "Million VND");
}

function translateJobTitle(jobId, rawTitle) {
  if (!rawTitle) return "";
  const m = PORTAL_30_JOB_TITLES[jobId];
  if (m && m[portalState.lang]) return m[portalState.lang];
  const cached = getCachedTranslation(rawTitle);
  if (cached) return cached;
  if (portalState.lang === "vi") return rawTitle;

  // Smart pattern translation for newly created jobs (e.g. from newly registered employers)
  let out = rawTitle;
  const roleReplacements = {
    en: {
      "[Quản lý Cao cấp]": "[Senior Executive]",
      "[Quản lý Cấp trung]": "[Middle Manager]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "VP of Business Development & Corporate Strategy",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "Talent Acquisition & HRBP Manager",
      "Giám đốc": "Director of",
      "Trưởng phòng": "Manager of",
    },
    ja: {
      "[Quản lý Cao cấp]": "[上級管理職]",
      "[Quản lý Cấp trung]": "[中間管理職]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "事業開発・経営戦略統括本部長",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "人材採用・タレントマネジメント部長",
      "Giám đốc": "ディレクター：",
      "Trưởng phòng": "マネージャー：",
    },
    ko: {
      "[Quản lý Cao cấp]": "[임원급]",
      "[Quản lý Cấp trung]": "[중간관리자]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "사업개발 및 경영전략 총괄 본부장",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "인재채용 및 인사관리(HRBP) 팀장",
      "Giám đốc": "총괄 본부장:",
      "Trưởng phòng": "부서 팀장:",
    },
    zh: {
      "[Quản lý Cao cấp]": "[高层管理]",
      "[Quản lý Cấp trung]": "[中层管理]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "业务拓展与企业战略总监",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "人才招聘与组织发展经理 (HRBP)",
      "Giám đốc": "总监：",
      "Trưởng phòng": "部门经理：",
    },
    th: {
      "[Quản lý Cao cấp]": "[ผู้บริหารระดับสูง]",
      "[Quản lý Cấp trung]": "[ผู้จัดการระดับกลาง]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "ผู้อำนวยการสายงานพัฒนาธุรกิจและกลยุทธ์องค์กร",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "ผู้จัดการฝ่ายสรรหาและบริหารทรัพยากรบุคคล (HRBP)",
      "Giám đốc": "ผู้อำนวยการ",
      "Trưởng phòng": "ผู้จัดการฝ่าย",
    },
    lo: {
      "[Quản lý Cao cấp]": "[ຜູ້ບໍລິຫານລະດັບສູງ]",
      "[Quản lý Cấp trung]": "[ຜູ້ບໍລິຫານລະດັບກາງ]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "ຜູ້ອຳນວຍການຝ່າຍພັດທະນາທຸລະກິດ ແລະ ຍຸດທະສາດ",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "ຫົວໜ້າພະແນກสรรຫາ ແລະ ບໍລິຫານບຸກຄະລາກອນ",
      "Giám đốc": "ຜູ້ອຳນວຍການ",
      "Trưởng phòng": "ຫົວໜ້າພະແນກ",
    },
    km: {
      "[Quản lý Cao cấp]": "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់]",
      "[Quản lý Cấp trung]": "[អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល]",
      "Giám đốc Khối Phát triển Kinh doanh & Chiến lược": "នាយកផ្នែកអភិវឌ្ឍន៍អាជីវកម្ម និងយុទ្ធសាស្ត្រ",
      "Trưởng phòng Tuyển dụng & Quản trị Nhân tài": "ប្រធានផ្នែកជ្រើសរើស និងគ្រប់គ្រងធនធានមនុស្ស",
      "Giám đốc": "នាយក",
      "Trưởng phòng": "ប្រធានផ្នែក",
    },
  }[portalState.lang];

  if (roleReplacements) {
    Object.keys(roleReplacements).forEach((k) => {
      if (out.includes(k)) out = out.split(k).join(roleReplacements[k]);
    });
  }
  return out;
}

function localizePortalJob(rawJob) {
  if (!rawJob) return rawJob;
  return {
    ...rawJob,
    localized_title: translateJobTitle(rawJob.id, rawJob.title),
    localized_company: translateEmployerName(rawJob.org_id, rawJob.company_name),
    localized_department: translateSector(rawJob.department),
    localized_location: localizePortalLocation(rawJob.location),
    localized_salary: localizePortalSalary(rawJob.salary_range),
    localized_country: translateCountry(rawJob.company_country),
  };
}

// Background AI Batch Auto-Translator for any custom/newly created strings
async function runAutoTranslateDynamicStrings(useLiveLlm = false) {
  if (!portalState.autoTranslateEnabled || portalState.lang === "vi") return;
  const mkt = portalState.marketplace || {};
  const candidatesToTranslate = [];

  (mkt.jobs || []).forEach((j) => {
    if (!PORTAL_30_JOB_TITLES[j.id] && !getCachedTranslation(j.title)) {
      candidatesToTranslate.push(j.title);
    }
  });
  (mkt.employers || []).forEach((e) => {
    if (!EMPLOYER_NAME_TRANSLATIONS[e.org_id] && !getCachedTranslation(e.company_name)) {
      candidatesToTranslate.push(e.company_name);
    }
  });

  if (candidatesToTranslate.length === 0) return;

  try {
    const res = await fetch(`${API_BASE}/api/ai/translate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_lang: portalState.lang,
        texts: candidatesToTranslate,
        use_live_llm: useLiveLlm,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const map = data.translations || {};
      let updated = false;
      Object.keys(map).forEach((orig) => {
        if (map[orig] && map[orig] !== orig) {
          portalState.dynamicCache[`${portalState.lang}::${orig}`] = map[orig];
          updated = true;
        }
      });
      if (updated) {
        saveDynamicCache();
        renderPortalHeader();
        renderPortalMain();
      }
    }
  } catch (err) {
    console.warn("Auto-translate batch skipped:", err);
  }
}

/* ============================================================================
   4. INTERNATIONAL EXECUTIVE UI DICTIONARY EXTENSIONS (8 LANGUAGES)
   ============================================================================ */
const EXT_EXEC_I18N = {
  vi: {
    lvlAll: "Tất cả cấp bậc",
    lvlSenior: "👑 Quản lý Cao cấp (C-Level / Director)",
    lvlMiddle: "🎯 Quản lý Cấp trung (Head / Manager)",
    lvlSaved: "⭐ Việc làm Đã lưu",
    locAll: "📍 Toàn quốc & Quốc tế",
    locHanoi: "Hà Nội",
    locHcmc: "TP. Hồ Chí Minh",
    locDanang: "Đà Nẵng",
    sortMatch: "Sắp xếp: Độ phù hợp AI cao nhất",
    sortSalary: "Sắp xếp: Mức đãi ngộ cao nhất",
    sortExp: "Sắp xếp: Thâm niên yêu cầu",
    viewSplit: "📐 Chế độ Split-View (Chuẩn Quốc tế)",
    viewGrid: "🗂️ Chế độ Lưới (Grid)",
    aiMatchBadge: "Độ Tương Thích AI",
    badgeSeniorExec: "👑 Quản lý Cao cấp",
    badgeMiddleMgr: "🎯 Quản lý Cấp trung",
    badgeVerifiedTenant: "✔ Đã xác thực Multi-Tenant",
    btnSaveJob: "Lưu tin",
    btnSavedJob: "Đã lưu",
    btnInspectJob: "Xem Hồ sơ Công việc 360°",
    dossierHeaderBadge: "HỒ SƠ VỊ TRÍ QUẢN TRỊ & PHÂN TÍCH ĐỘ PHÙ HỢP AI 360°",
    dossierAiTitle: "🧠 Ma trận Đánh giá Tương thích AI (motapis.com/v1)",
    pillar1: "Kinh nghiệm Lãnh đạo & Chuyên ngành",
    pillar2: "Năng lực Kỹ thuật & Chiến lược Cốt lõi",
    pillar3: "Quản trị P&L, KPI & Thực thi OKRs",
    pillar4: "Hội nhập Đa ngôn ngữ & Văn hóa Tập đoàn",
    mandateTitle: "📋 Sứ mệnh Vai trò & Trách nhiệm Trọng tâm (Executive Mandate)",
    mandate1: "Hoạch định chiến lược dài hạn, dẫn dắt đội ngũ hoàn thành xuất sắc các chỉ số tăng trưởng OKRs/KPIs của Khối.",
    mandate2: "Chủ trì chuyển đổi số, tối ưu hóa quy trình vận hành và ứng dụng AI/Data vào ra quyết định quản trị.",
    mandate3: "Quản trị ngân sách (P&L), kiểm soát rủi ro tuân thủ theo chuẩn quốc tế và phát triển đội ngũ kế cận.",
    mandate4: "Phối hợp liên phòng ban và làm việc trực tiếp với Ban Điều hành (C-Suite) cùng đối tác đa quốc gia.",
    compMatrixTitle: "🎯 Ma trận Năng lực Yêu cầu (Competency Matrix)",
    lblCoreSkills: "Kỹ năng Bắt buộc (Must-Have):",
    lblBonusSkills: "Năng lực Lợi thế (Strategic Edge):",
    pkgTitle: "💎 Gói Đãi ngộ & Phúc lợi Lãnh đạo (Executive Package)",
    pkg1: "Lương cứng cạnh tranh + Thưởng hiệu quả P&L/OKR (15-24 tháng lương/năm)",
    pkg2: "Quyền chọn cổ phiếu (ESOP/LTIP) & Bảo hiểm sức khỏe Quốc tế cho Gia đình",
    pkg3: "Ngân sách đào tạo Lãnh đạo Cấp cao & Chế độ làm việc Hybrid linh hoạt",
    pipelineTitle: "⚡ Quy trình Tuyển dụng Chuẩn Quốc tế (4 Giai đoạn Minh bạch)",
    step1: "① Sàng lọc CV bằng AI (3 giây)",
    step2: "② Phỏng vấn AI Đa ngôn ngữ 24/7",
    step3: "③ Phỏng vấn Hội đồng Lãnh đạo",
    step4: "④ Đề xuất Offer & Onboarding",
    secBenchmarkLabel: "Đãi ngộ tham chiếu:",
    secExploreBtn: "Khám phá Vị trí trong Ngành →",
    savedJobsHeading: "⭐ Danh sách Vị trí Quản lý Đã Lưu",
    savedJobsEmpty: "Chưa có vị trí nào được lưu. Hãy bấm biểu tượng ⭐ trên thẻ công việc để lưu lại so sánh.",
  },
  en: {
    lvlAll: "All Seniority Levels",
    lvlSenior: "👑 Senior Executive (VP / Director)",
    lvlMiddle: "🎯 Middle Management (Head / Manager)",
    lvlSaved: "⭐ Saved Roles",
    locAll: "📍 All Locations & Global",
    locHanoi: "Hanoi",
    locHcmc: "Ho Chi Minh City",
    locDanang: "Da Nang",
    sortMatch: "Sort: Best AI Match %",
    sortSalary: "Sort: Highest Compensation",
    sortExp: "Sort: Seniority Requirement",
    viewSplit: "📐 Split-View Explorer",
    viewGrid: "🗂️ Bento Grid View",
    aiMatchBadge: "AI Fit Score",
    badgeSeniorExec: "👑 Senior Executive",
    badgeMiddleMgr: "🎯 Middle Management",
    badgeVerifiedTenant: "✔ Verified Multi-Tenant",
    btnSaveJob: "Save",
    btnSavedJob: "Saved",
    btnInspectJob: "Inspect 360° Role Dossier",
    dossierHeaderBadge: "360° EXECUTIVE ROLE DOSSIER & EXPLAINABLE AI FIT ANALYSIS",
    dossierAiTitle: "🧠 4-Pillar Explainable AI Compatibility Matrix (motapis.com/v1)",
    pillar1: "Executive Leadership & Domain Depth",
    pillar2: "Core Technical & Strategic Architecture",
    pillar3: "P&L Ownership, KPI & OKR Governance",
    pillar4: "Cross-Cultural & Multilingual Readiness",
    mandateTitle: "📋 Executive Mandate & Key Deliverables",
    mandate1: "Architect long-term departmental strategy and lead cross-functional teams to exceed quarterly OKR/KPI targets.",
    mandate2: "Drive digital transformation, operational excellence, and data/AI-backed executive decision making.",
    mandate3: "Own departmental P&L budget, enforce global compliance standards, and mentor high-potential succession talent.",
    mandate4: "Partner directly with C-Suite executives, regional stakeholders, and international clients.",
    compMatrixTitle: "🎯 Executive Competency Matrix",
    lblCoreSkills: "Mandatory Core Competencies:",
    lblBonusSkills: "Strategic Leadership Edge:",
    pkgTitle: "💎 Executive Compensation & Benefits Package",
    pkg1: "Competitive Base + Executive Performance Bonus (15–24 months total package)",
    pkg2: "Executive Stock Options (ESOP/LTIP) & Global Family Health Coverage",
    pkg3: "Executive Coaching Stipend & Flexible Hybrid Work Arrangement",
    pipelineTitle: "⚡ Transparent 4-Stage Executive Hiring Workflow",
    step1: "① Instant AI CV Screening (3s)",
    step2: "② 24/7 Multilingual AI Interview",
    step3: "③ C-Suite Panel Assessment",
    step4: "④ Executive Offer & Onboarding",
    secBenchmarkLabel: "Executive Benchmark:",
    secExploreBtn: "Explore Sector Roles →",
    savedJobsHeading: "⭐ Bookmarked & Saved Executive Positions",
    savedJobsEmpty: "No saved positions yet. Click the ⭐ icon on any job card to bookmark roles for comparison.",
  },
  ja: {
    lvlAll: "全役職レベル",
    lvlSenior: "👑 上級管理職・役員 (VP / 本部長)",
    lvlMiddle: "🎯 中間管理職 (部長 / マネージャー)",
    lvlSaved: "⭐ 保存済みの求人",
    locAll: "📍 全勤務地・グローバル",
    locHanoi: "ハノイ",
    locHcmc: "ホーチミン市",
    locDanang: "ダナン",
    sortMatch: "並び替え: AIマッチ度順",
    sortSalary: "並び替え: 年収・待遇順",
    sortExp: "並び替え: 必要経験年数順",
    viewSplit: "📐 分割ビュー (国際標準)",
    viewGrid: "🗂️ グリッド表示",
    aiMatchBadge: "AI適合度",
    badgeSeniorExec: "👑 上級管理職",
    badgeMiddleMgr: "🎯 中間管理職",
    badgeVerifiedTenant: "✔ 認証済テナント企業",
    btnSaveJob: "保存",
    btnSavedJob: "保存済",
    btnInspectJob: "360°求人詳細を表示",
    dossierHeaderBadge: "360° エグゼクティブ求人詳細＆AI適合度分析レポート",
    dossierAiTitle: "🧠 AI 4大評価軸マッチング分析 (motapis.com/v1)",
    pillar1: "リーダーシップ＆業界専門性",
    pillar2: "中核技術・戦略遂行スキル",
    pillar3: "P&L（損益）・OKRマネジメント",
    pillar4: "多言語対応・グローバル組織適応力",
    mandateTitle: "📋 職務ミッション＆主要責務 (Executive Mandate)",
    mandate1: "中長期の部門戦略を策定し、組織を牽引してOKR・KPI目標の達成をリードする。",
    mandate2: "DX推進・業務プロセス最適化およびデータ・AIを活用した経営意思決定を推進する。",
    mandate3: "部門P&L（予算・損益）管理、国際コンプライアンス遵守、次世代リーダー育成を担う。",
    mandate4: "経営陣（Cクラス）およびグローバル拠点・海外パートナーと緊密に連携する。",
    compMatrixTitle: "🎯 必須コンピテンシー＆スキルマトリクス",
    lblCoreSkills: "必須スキル (Must-Have):",
    lblBonusSkills: "歓迎エグゼクティブスキル:",
    pkgTitle: "💎 エグゼクティブ処遇・福利厚生パッケージ",
    pkg1: "高水準の基本給＋業績連動賞与（年間15〜24ヶ月相当）",
    pkg2: "ストックオプション(ESOP)＆家族対応グローバル医療保険",
    pkg3: "エグゼクティブ研修支援＆ハイブリッド勤務制度",
    pipelineTitle: "⚡ 透明性の高い4段階スピード選考フロー",
    step1: "① AI即時書類選考 (3秒)",
    step2: "② 24時間多言語AI面接",
    step3: "③ 経営陣パネル面接",
    step4: "④ 内定オファー・入社",
    secBenchmarkLabel: "想定年収水準:",
    secExploreBtn: "この業界の求人を見る →",
    savedJobsHeading: "⭐ ブックマーク済みの管理職求人",
    savedJobsEmpty: "保存された求人はありません。求人カードの⭐アイコンをクリックして保存できます。",
  },
  ko: {
    lvlAll: "전체 직급",
    lvlSenior: "👑 임원·고위관리직 (VP / 본부장)",
    lvlMiddle: "🎯 중간관리직 (부장 / 팀장)",
    lvlSaved: "⭐ 저장한 공고",
    locAll: "📍 전체 근무지 및 글로벌",
    locHanoi: "하노이",
    locHcmc: "호치민시",
    locDanang: "다낭",
    sortMatch: "정렬: AI 적합도 높은 순",
    sortSalary: "정렬: 보상 수준 높은 순",
    sortExp: "정렬: 요구 경력순",
    viewSplit: "📐 분할 뷰 (글로벌 스탠다드)",
    viewGrid: "🗂️ 그리드 뷰",
    aiMatchBadge: "AI 적합도",
    badgeSeniorExec: "👑 고위관리직",
    badgeMiddleMgr: "🎯 중간관리직",
    badgeVerifiedTenant: "✔ 인증 멀티테넌트 기업",
    btnSaveJob: "저장",
    btnSavedJob: "저장됨",
    btnInspectJob: "360° 상세 직무기술서 보기",
    dossierHeaderBadge: "360° 핵심 직무 프로파일 및 설명 가능한 AI 적합도 분석",
    dossierAiTitle: "🧠 4대 영역 AI 역량 적합도 매트릭스 (motapis.com/v1)",
    pillar1: "리더십 및 산업 도메인 전문성",
    pillar2: "핵심 기술 및 전략 기획 역량",
    pillar3: "P&L 손익 책임 및 OKR/KPI 실행력",
    pillar4: "다국어 소통 및 글로벌 조직 적합성",
    mandateTitle: "📋 핵심 직무 미션 및 주요 책임 (Executive Mandate)",
    mandate1: "중장기 본부/부서 전략을 수립하고 조직을 리드하여 분기별 OKR 및 핵심 KPI 초과 달성.",
    mandate2: "디지털 전환(DX), 운영 프로세스 고도화 및 AI·데이터 기반 경영 의사결정 주도.",
    mandate3: "부서 손익(P&L) 예산 관리, 글로벌 컴플라이언스 준수 및 차세대 핵심 인재 육성.",
    mandate4: "최고경영진(C-Level) 및 다국적 이해관계자와 긴밀히 협업.",
    compMatrixTitle: "🎯 요구 역량 매트릭스 (Competency Matrix)",
    lblCoreSkills: "필수 핵심 역량 (Must-Have):",
    lblBonusSkills: "우대 전략 역량 (Strategic Edge):",
    pkgTitle: "💎 임원·관리자 보상 및 복리후생 패키지",
    pkg1: "최고 수준의 기본급 + 성과 인센티브 (연 15~24개월 수준)",
    pkg2: "스톡옵션(ESOP/LTIP) 및 가족 포함 글로벌 프리미엄 의료보험",
    pkg3: "리더십 교육 지원금 및 유연한 하이브리드 근무제",
    pipelineTitle: "⚡ 투명한 4단계 패스트트랙 채용 프로세스",
    step1: "① AI 즉시 서류심사 (3초)",
    step2: "② 24/7 다국어 AI 면접",
    step3: "③ 임원진 심층 면접",
    step4: "④ 처우 협의 및 최종 합류",
    secBenchmarkLabel: "보상 벤치마크:",
    secExploreBtn: "해당 산업 공고 보기 →",
    savedJobsHeading: "⭐ 저장한 관심 관리직 공고",
    savedJobsEmpty: "저장된 채용공고가 없습니다. 공고 카드의 ⭐ 아이콘을 눌러 저장하세요.",
  },
  zh: {
    lvlAll: "全部管理职级",
    lvlSenior: "👑 高层管理 (副总裁 / 总监)",
    lvlMiddle: "🎯 中层管理 (部门主管 / 经理)",
    lvlSaved: "⭐ 已收藏职位",
    locAll: "📍 全部办公地点与跨国",
    locHanoi: "河内",
    locHcmc: "胡志明市",
    locDanang: "岘港",
    sortMatch: "排序：AI 匹配度最高",
    sortSalary: "排序：薪资待遇最高",
    sortExp: "排序：工作年限要求",
    viewSplit: "📐 分栏探索视图 (国际标准)",
    viewGrid: "🗂️ 网格卡片视图",
    aiMatchBadge: "AI 匹配度",
    badgeSeniorExec: "👑 高层管理",
    badgeMiddleMgr: "🎯 中层管理",
    badgeVerifiedTenant: "✔ 已认证多租户企业",
    btnSaveJob: "收藏",
    btnSavedJob: "已收藏",
    btnInspectJob: "查看 360° 职位档案",
    dossierHeaderBadge: "360° 高管职位全景档案与 AI 匹配度深度解析",
    dossierAiTitle: "🧠 四维可解释 AI 胜任力评估矩阵 (motapis.com/v1)",
    pillar1: "高管领导力与行业纵深经验",
    pillar2: "核心技术架构与战略规划能力",
    pillar3: "P&L 损益管理与 OKR/KPI 落地",
    pillar4: "多语言沟通与跨国文化契合度",
    mandateTitle: "📋 核心岗位使命与关键职责 (Executive Mandate)",
    mandate1: "制定部门中长期战略规划，带领跨职能团队超额完成季度 OKR 与核心业务 KPI。",
    mandate2: "主导数字化转型、运营流程优化以及基于 AI 与数据驱动的管理决策。",
    mandate3: "全面负责部门 P&L 预算管理、国际合规风控以及高潜人才梯队建设。",
    mandate4: "直接与 C-Suite 核心高管及跨国合作伙伴协同推进战略项目。",
    compMatrixTitle: "🎯 核心胜任力矩阵 (Competency Matrix)",
    lblCoreSkills: "必备核心技能 (Must-Have):",
    lblBonusSkills: "高管加分项 (Strategic Edge):",
    pkgTitle: "💎 高管薪酬与福利方案 (Executive Package)",
    pkg1: "极具竞争力的基本薪资 + 绩效奖金（年薪 15–24 个月标准）",
    pkg2: "高管股权激励 (ESOP/LTIP) 及涵盖家属的高端国际医疗保险",
    pkg3: "高管领导力研修津贴及灵活混合办公制度 (Hybrid)",
    pipelineTitle: "⚡ 透明高效的 4 阶段高管招聘流程",
    step1: "① AI 简历秒级初筛 (3秒)",
    step2: "② 24/7 多语言 AI 面试",
    step3: "③ 高管委员会终面",
    step4: "④ 录用通知与入职",
    secBenchmarkLabel: "行业薪酬基准:",
    secExploreBtn: "探索该行业职位 →",
    savedJobsHeading: "⭐ 已收藏的管理职位列表",
    savedJobsEmpty: "暂无收藏职位。点击职位卡片上的 ⭐ 图标即可保存对比。",
  },
  th: {
    lvlAll: "ทุกระดับบริหาร",
    lvlSenior: "👑 ผู้บริหารระดับสูง (VP / ผู้อำนวยการ)",
    lvlMiddle: "🎯 ผู้จัดการระดับกลาง (Head / ผู้จัดการ)",
    lvlSaved: "⭐ งานที่บันทึกไว้",
    locAll: "📍 ทุกสถานที่ทำงาน",
    locHanoi: "ฮานอย",
    locHcmc: "โฮจิมินห์ซิตี้",
    locDanang: "ดานัง",
    sortMatch: "เรียงตาม: คะแนน AI Match สูงสุด",
    sortSalary: "เรียงตาม: ค่าตอบแทนสูงสุด",
    sortExp: "เรียงตาม: ประสบการณ์ที่ต้องการ",
    viewSplit: "📐 มุมมองแยกสองฝั่ง (มาตรฐานสากล)",
    viewGrid: "🗂️ มุมมองตารางการ์ด",
    aiMatchBadge: "ความเหมาะสม AI",
    badgeSeniorExec: "👑 ผู้บริหารระดับสูง",
    badgeMiddleMgr: "🎯 ผู้จัดการระดับกลาง",
    badgeVerifiedTenant: "✔ องค์กร Multi-Tenant ที่ยืนยันแล้ว",
    btnSaveJob: "บันทึก",
    btnSavedJob: "บันทึกแล้ว",
    btnInspectJob: "ดูรายละเอียดงาน 360°",
    dossierHeaderBadge: "ข้อมูลตำแหน่งงานผู้บริหาร 360° และการวิเคราะห์ความเหมาะสมด้วย AI",
    dossierAiTitle: "🧠 เมทริกซ์ประเมินความเหมาะสม 4 มิติด้วย AI (motapis.com/v1)",
    pillar1: "ภาวะผู้นำและความเชี่ยวชาญเฉพาะอุตสาหกรรม",
    pillar2: "ทักษะเทคนิคเชิงลึกและการวางแผนกลยุทธ์",
    pillar3: "การบริหารงบประมาณ P&L และการขับเคลื่อน OKR/KPI",
    pillar4: "ความพร้อมด้านภาษาและวัฒนธรรมองค์กรสากล",
    mandateTitle: "📋 พันธกิจหลักและหน้าที่ความรับผิดชอบ (Executive Mandate)",
    mandate1: "กำหนดกลยุทธ์ระยะยาวและนำทีมงานข้ามสายงานให้บรรลุเป้าหมาย OKRs/KPIs ขององค์กร",
    mandate2: "ขับเคลื่อนการเปลี่ยนผ่านสู่ดิจิทัล การเพิ่มประสิทธิภาพปฏิบัติการ และการใช้ AI/ข้อมูลตัดสินใจ",
    mandate3: "บริหารงบกำไรขาดทุน (P&L) กำกับดูแลความเสี่ยงตามมาตรฐานสากล และพัฒนาผู้นำรุ่นต่อไป",
    mandate4: "ทำงานร่วมกับผู้บริหารระดับสูง (C-Suite) และพันธมิตรระดับนานาชาติโดยตรง",
    compMatrixTitle: "🎯 เมทริกซ์สมรรถนะที่ต้องการ (Competency Matrix)",
    lblCoreSkills: "ทักษะหลักที่จำเป็น (Must-Have):",
    lblBonusSkills: "ทักษะเสริมเชิงกลยุทธ์:",
    pkgTitle: "💎 แพ็กเกจค่าตอบแทนและสวัสดิการผู้บริหาร",
    pkg1: "เงินเดือนฐานระดับแนวหน้า + โบนัสตามผลงาน P&L/OKR (รวม 15–24 เดือน/ปี)",
    pkg2: "สิทธิซื้อหุ้นผู้บริหาร (ESOP) และประกันสุขภาพระดับสากลสำหรับครอบครัว",
    pkg3: "งบพัฒนาภาวะผู้นำและรูปแบบการทำงาน Hybrid ยืดหยุ่น",
    pipelineTitle: "⚡ ขั้นตอนการสรรหาผู้บริหาร 4 ขั้นตอนที่โปร่งใส",
    step1: "① คัดกรองเรซูเม่ด้วย AI (3 วินาที)",
    step2: "② สัมภาษณ์ AI หลายภาษา 24/7",
    step3: "③ สัมภาษณ์กับคณะผู้บริหาร",
    step4: "④ ยื่นข้อเสนอ Offer และเริ่มงาน",
    secBenchmarkLabel: "ฐานเงินเดือนอ้างอิง:",
    secExploreBtn: "ดูตำแหน่งงานในหมวดนี้ →",
    savedJobsHeading: "⭐ ตำแหน่งงานผู้บริหารที่บันทึกไว้",
    savedJobsEmpty: "ยังไม่มีตำแหน่งงานที่บันทึกไว้ กดไอคอน ⭐ บนการ์ดงานเพื่อบันทึกเปรียบเทียบ",
  },
  lo: {
    lvlAll: "ທຸກລະດັບການບໍລິຫານ",
    lvlSenior: "👑 ຜູ້ບໍລິຫານລະດັບສູງ (VP / ຜູ້ອຳນວຍການ)",
    lvlMiddle: "🎯 ຜູ້ບໍລິຫານລະດັບກາງ (ຫົວໜ້າພະແນກ / ຜູ້ຈັດການ)",
    lvlSaved: "⭐ ວຽກທີ່ບັນທຶກໄວ້",
    locAll: "📍 ທຸກສະຖານທີ່ເຮັດວຽກ",
    locHanoi: "ຮ່າໂນ້ຍ",
    locHcmc: "ນະຄອນໂຮ່ຈີມິນ",
    locDanang: "ດານັງ",
    sortMatch: "ຈັດລຽງ: ຄະແນນ AI Match ສູງສຸດ",
    sortSalary: "ຈັດລຽງ: ເງິນເດືອນສູງສຸດ",
    sortExp: "ຈັດລຽງ: ປະສົບການທີ່ຕ້ອງການ",
    viewSplit: "📐 ມຸມມອງແບ່ງສອງຝັ່ງ (ມາດຕະຖານສາກົນ)",
    viewGrid: "🗂️ ມຸມມອງຕາຕະລາງ",
    aiMatchBadge: "ຄວາມເໝາະສົມ AI",
    badgeSeniorExec: "👑 ຜູ້ບໍລິຫານລະດັບສູງ",
    badgeMiddleMgr: "🎯 ຜູ້ບໍລິຫານລະດັບກາງ",
    badgeVerifiedTenant: "✔ ອົງກອນ Multi-Tenant ຢືນຢັນແລ້ວ",
    btnSaveJob: "ບັນທຶກ",
    btnSavedJob: "ບັນທຶກແລ້ວ",
    btnInspectJob: "ເບິ່ງລາຍລະອຽດ 360°",
    dossierHeaderBadge: "ຂໍ້ມູນຕຳແໜ່ງບໍລິຫານ 360° ແລະ ການວິເຄາະຄວາມເໝາະສົມດ້ວຍ AI",
    dossierAiTitle: "🧠 ຕາຕະລາງປະເມີນຄວາມເໝາະສົມ 4 ມິຕິດ້ວຍ AI (motapis.com/v1)",
    pillar1: "ພາວະຜູ້ນຳ ແລະ ຄວາມຊ່ຽວຊານສະເພາະຂະແໜງການ",
    pillar2: "ທັກສະເຕັກນິກ ແລະ ການວາງແຜນຍຸດທະສາດຫຼັກ",
    pillar3: "ການບໍລິຫານງົບປະມານ P&L ແລະ OKR/KPI",
    pillar4: "ຄວາມພ້ອມດ້ານຫຼາຍພາສາ ແລະ ວັດທະນະທຳສາກົນ",
    mandateTitle: "📋 ພາລະກິດຫຼັກ ແລະ ໜ້າທີ່ຮັບຜິດຊອບ (Executive Mandate)",
    mandate1: "ວາງແຜນຍຸດທະສາດໄລຍະຍາວ ແລະ ນຳພາທີມງານບັນລຸເປົ້າໝາຍ OKRs/KPIs ຂອງອົງກອນ.",
    mandate2: "ຂັບເຄື່ອນການຫັນປ່ຽນດິຈິຕອນ, ປັບປຸງຂະບວນການເຮັດວຽກ ແລະ ໃຊ້ AI/ຂໍ້ມູນໃນການຕັດສິນໃຈ.",
    mandate3: "ບໍລິຫານງົບປະມານ P&L, ຄວບຄຸມຄວາມສ່ຽງຕາມມາດຕະຖານສາກົນ ແລະ ພັດທະນາບຸກຄະລາກອນສືບທອດ.",
    mandate4: "ປະສານງານໂດຍກົງກັບຄະນະຜູ້ບໍລິຫານລະດັບສູງ (C-Suite) ແລະ ຄູ່ຮ່ວມງານສາກົນ.",
    compMatrixTitle: "🎯 ຕາຕະລາງຄວາມສາມາດທີ່ຕ້ອງການ (Competency Matrix)",
    lblCoreSkills: "ທັກສະຫຼັກທີ່ຈຳເປັນ (Must-Have):",
    lblBonusSkills: "ທັກສະຍຸດທະສາດເສີມ:",
    pkgTitle: "💎 ແພັກເກັດເງິນເດືອນ ແລະ ສະຫວັດດີການຜູ້ບໍລິຫານ",
    pkg1: "ເງິນເດືອນພື້ນຖານສູງ + ໂບນັດຕາມຜົນງານ P&L/OKR (15–24 ເດືອນ/ປີ)",
    pkg2: "ສິດທິຫຸ້ນສ່ວນຜູ້ບໍລິຫານ (ESOP) ແລະ ປະກັນສຸຂະພາບສາກົນສຳລັບຄອບຄົວ",
    pkg3: "ງົບປະມານຝຶກອົບຮົມຜູ້ນຳ ແລະ ຮູບແບບການເຮັດວຽກ Hybrid",
    pipelineTitle: "⚡ ຂັ້ນຕອນການຮັບສະໝັກມາດຕະຖານສາກົນ 4 ໄລຍະ",
    step1: "① ຄັດກອງ CV ດ້ວຍ AI (3 ວິນາທີ)",
    step2: "② ສຳພາດ AI ຫຼາຍພາສາ 24/7",
    step3: "③ ສຳພາດກັບຄະນະຜູ້ບໍລິຫານ",
    step4: "④ ສະເໜີ Offer ແລະ ເລີ່ມວຽກ",
    secBenchmarkLabel: "ເງິນເດືອນອ້າງອີງ:",
    secExploreBtn: "ເບິ່ງວຽກໃນຂະແໜງນີ້ →",
    savedJobsHeading: "⭐ ລາຍຊື່ຕຳແໜ່ງບໍລິຫານທີ່ບັນທຶກໄວ້",
    savedJobsEmpty: "ຍັງບໍ່ມີຕຳແໜ່ງທີ່ບັນທຶກໄວ້. ກົດປຸ່ມ ⭐ ເທິງບັດວຽກເພື່ອບັນທຶກ.",
  },
  km: {
    lvlAll: "គ្រប់កម្រិតគ្រប់គ្រង",
    lvlSenior: "👑 ថ្នាក់ដឹកនាំជាន់ខ្ពស់ (VP / នាយក)",
    lvlMiddle: "🎯 អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល (ប្រធានផ្នែក / Manager)",
    lvlSaved: "⭐ ការងារដែលបានរក្សាទុក",
    locAll: "📍 គ្រប់ទីតាំង និងអន្តរជាតិ",
    locHanoi: "ហាណូយ",
    locHcmc: "ទីក្រុងហូជីមិញ",
    locDanang: "ដាណាំង",
    sortMatch: "តម្រៀប៖ ពិន្ទុ AI ស៊ីគ្នាខ្ពស់បំផុត",
    sortSalary: "តម្រៀប៖ ប្រាក់បៀវត្សរ៍ខ្ពស់បំផុត",
    sortExp: "តម្រៀប៖ បទពិសោធន៍ទាមទារ",
    viewSplit: "📐 ទម្រង់បែងចែកពីរផ្ទាំង (ស្តង់ដារអន្តរជាតិ)",
    viewGrid: "🗂️ ទម្រង់ក្រឡាចត្រង្គ (Grid)",
    aiMatchBadge: "ភាពស៊ីគ្នា AI",
    badgeSeniorExec: "👑 ថ្នាក់ដឹកនាំជាន់ខ្ពស់",
    badgeMiddleMgr: "🎯 អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល",
    badgeVerifiedTenant: "✔ សហគ្រាស Multi-Tenant បានផ្ទៀងផ្ទាត់",
    btnSaveJob: "រក្សាទុក",
    btnSavedJob: "បានរក្សាទុក",
    btnInspectJob: "មើលព័ត៌មានលម្អិត 360°",
    dossierHeaderBadge: "សំណុំព័ត៌មានតួនាទីថ្នាក់ដឹកនាំ 360° និងการវិភាគភាពស៊ីគ្នាដោយ AI",
    dossierAiTitle: "🧠 ម៉ាទ្រីសវាយតម្លៃភាពស៊ីគ្នា 4 សសរស្តម្ភដោយ AI (motapis.com/v1)",
    pillar1: "ភាពជាអ្នកដឹកនាំ និងជំនាញឯកទេសតាមវិស័យ",
    pillar2: "សមត្ថភាពបច្ចេកទេស និងការរៀបចំយុទ្ធសាស្ត្រស្នូល",
    pillar3: "ការគ្រប់គ្រងថវិកា P&L និងการអនុវត្ត OKR/KPI",
    pillar4: "ភាពพร้อมเพรียงពហុភាសា និងវប្បធម៌សាជីវកម្មសកល",
    mandateTitle: "📋 បេសកកម្មតួនាទី និងការទទួលខុសត្រូវសំខាន់ៗ (Executive Mandate)",
    mandate1: "រៀបចំផែនការយុទ្ធសាស្ត្ររយៈពេលវែង និងដឹកនាំក្រុមงานឱ្យសម្រេចលើសគោលដៅ OKRs/KPIs។",
    mandate2: "ជំរុញបរិវត្តកម្មឌីជីថល ការធ្វើឱ្យប្រសើរឡើងនូវប្រតិបត្តិការ និងការសម្រេចចិត្តផ្អែកលើ AI/ទិន្នន័យ។",
    mandate3: "គ្រប់គ្រងថវិកា P&L ត្រួតពិនិត្យហានិភ័យអនុលោមតាមស្តង់ដារអន្តរជាតិ និងអភិវឌ្ឍអ្នកដឹកនាំបន្តវេន។",
    mandate4: "សហការផ្ទាល់ជាមួយគណៈគ្រប់គ្រងជាន់ខ្ពស់ (C-Suite) និងដៃគូពហុជាតិសាសន៍។",
    compMatrixTitle: "🎯 ម៉ាទ្រីសសមត្ថភាពទាមទារ (Competency Matrix)",
    lblCoreSkills: "ជំនាញស្នូលចាំបាច់ (Must-Have):",
    lblBonusSkills: "សមត្ថភាពយុទ្ធសាស្ត្របន្ថែម:",
    pkgTitle: "💎 កញ្ចប់ប្រាក់បៀវត្សរ៍ និងអត្ថប្រយោជន៍ថ្នាក់ដឹកនាំ",
    pkg1: "ប្រាក់ខែគោលប្រកួតប្រជែង + ប្រាក់រង្វាន់សមិទ្ធផល P&L/OKR (15–24 ខែ/ឆ្នាំ)",
    pkg2: "ជម្រើសភាគហ៊ុនថ្នាក់ដឹកនាំ (ESOP) និងធានារ៉ាប់រងសុខភាពអន្តរជាតិសម្រាប់គ្រួសារ",
    pkg3: "ថវិកាបណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំ និងរបៀបធ្វើការ Hybrid បត់បែន",
    pipelineTitle: "⚡ ដំណើរការជ្រើសរើសបុគ្គលិកស្តង់ដារអន្តរជាតិ 4 ដំណាក់កាល",
    step1: "① ពិនិត្យ CV ដោយ AI (3 វិនាទី)",
    step2: "② សម្ភាសន៍ AI ពហុភាសា 24/7",
    step3: "③ សម្ភាសន៍ជាមួយគណៈកម្មការថ្នាក់ដឹកនាំ",
    step4: "④ ផ្តល់ជូន Offer និងចូលបម្រើការងារ",
    secBenchmarkLabel: "កម្រិតប្រាក់បៀវត្សរ៍យោង:",
    secExploreBtn: "ស្វែងរកការងារក្នុងវិស័យនេះ →",
    savedJobsHeading: "⭐ បញ្ជីតួនាទីគ្រប់គ្រងដែលបានរក្សាទុក",
    savedJobsEmpty: "មិនទាន់មានការងារដែលបានរក្សាទុកនៅឡើយទេ។ ចុចរូប ⭐ លើកាតការងារដើម្បីរក្សាទុក។",
  },
};

function eDict() {
  return EXT_EXEC_I18N[portalState.lang] || EXT_EXEC_I18N.vi;
}

/* ============================================================================
   5. HELPER FUNCTIONS: SENIORITY, AI MATCH %, SALARY PARSER & SAVED JOBS
   ============================================================================ */
function isSeniorExecutiveJob(job) {
  const raw = (job.title || "") + " " + (job.localized_title || "");
  return (
    raw.includes("Cao cấp") ||
    raw.includes("Giám đốc") ||
    raw.includes("Senior Executive") ||
    raw.includes("VP") ||
    raw.includes("Head of") ||
    raw.includes("上級管理職") ||
    raw.includes("임원급") ||
    raw.includes("高层管理") ||
    (job.min_experience_years || 0) >= 8
  );
}

function parseMaxSalaryNumeric(salaryStr) {
  if (!salaryStr) return 80;
  const nums = (salaryStr.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  if (nums.length === 0) return 80;
  return Math.max(...nums);
}

function computeJobAiMatch(job) {
  const u = portalState.currentUser;
  let base = 86;
  const idNum = parseInt((job.id || "job_01").replace(/\D/g, ""), 10) || 1;
  base += (idNum * 7) % 11; // deterministic 86..96%
  if (u && u.role === "candidate") {
    if (u.preferred_sector && u.preferred_sector === job.department) base = Math.min(99, base + 4);
    const uSkills = (u.skills || []).map((s) => s.toLowerCase());
    const matchCount = (job.must_have_skills || []).filter((s) =>
      uSkills.some((us) => s.toLowerCase().includes(us) || us.includes(s.toLowerCase()))
    ).length;
    base = Math.min(99, base + matchCount * 2);
  }
  return Math.min(99, Math.max(82, base));
}

function getCompanyMonogram(name) {
  if (!name) return "HM";
  const clean = name
    .replace(/Tập đoàn|Công ty|Ngân hàng|Tổ hợp|Chuỗi/gi, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function toggleSavePortalJob(jobId, ev) {
  if (ev) ev.stopPropagation();
  const idx = portalState.savedJobs.indexOf(jobId);
  if (idx >= 0) {
    portalState.savedJobs.splice(idx, 1);
  } else {
    portalState.savedJobs.push(jobId);
  }
  localStorage.setItem("hiremind_saved_jobs", JSON.stringify(portalState.savedJobs));
  renderPortalHeader();
  renderPortalMain();
}

function selectPortalJob(jobId) {
  portalState.selectedJobId = jobId;
  if (portalState.viewMode !== "split") {
    portalState.viewMode = "split";
  }
  renderPortalMain();
}

function setPortalViewMode(mode) {
  portalState.viewMode = mode;
  renderPortalMain();
}

function togglePortalTheme() {
  portalState.dark = !portalState.dark;
  document.documentElement.classList.toggle("dark", portalState.dark);
  localStorage.setItem("hiremind_portal_theme", portalState.dark ? "dark" : "light");
}

function showPortalToast(msg) {
  const container = document.getElementById("portal-toast");
  if (!container) return;
  const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const el = document.createElement("div");
  el.className =
    "portal-toast-item pointer-events-auto w-full p-4 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm font-extrabold shadow-[0_25px_70px_-15px_rgba(0,0,0,0.75)] border-l-4 border-emerald-400 border border-slate-700/80 ring-1 ring-white/15 space-y-2 backdrop-blur-md transition-all duration-300";
  el.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider">✨ THÔNG BÁO HỆ THỐNG</span>
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-slate-400">${nowTime}</span>
        <button type="button" onclick="this.closest('.portal-toast-item')?.remove()" class="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-[11px] font-bold">✕</button>
      </div>
    </div>
    <div class="leading-snug">${msg}</div>
    <div class="w-full h-1 rounded-full bg-white/10 overflow-hidden">
      <div class="bg-emerald-400 h-full rounded-full" style="width:100%"></div>
    </div>
  `;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 250);
  }, 4000);
}

function openPortalModal(html, reRenderFn) {
  const modal = document.getElementById("portal-modal");
  const content = document.getElementById("portal-modal-content");
  if (!modal || !content) return;
  if (typeof reRenderFn === "function") {
    portalState.activeModalRenderer = reRenderFn;
  }
  content.innerHTML = html;
  modal.classList.remove("hidden");
  if (typeof applyPublicDomTranslationPass === "function") {
    applyPublicDomTranslationPass(content);
  }
}

function closePortalModal() {
  const modal = document.getElementById("portal-modal");
  if (modal) modal.classList.add("hidden");
  portalState.activeModalRenderer = null;
}

async function changePortalLang(lang) {
  portalState.lang = lang;
  localStorage.setItem("hiremind_lang", lang);
  document.documentElement.lang = lang;
  renderPortalHeader();
  renderPortalMain();
  if (typeof localizePublicFooterAndTopBar === "function") {
    localizePublicFooterAndTopBar();
  }
  if (typeof localizePublicStaticWidgets === "function") {
    localizePublicStaticWidgets();
  }
  if (typeof renderPublicAdWings === "function") {
    renderPublicAdWings(publicAdBannersState);
  }
  if (typeof renderPublicTrafficTelemetryWidgets === "function") {
    renderPublicTrafficTelemetryWidgets();
  }
  const modal = document.getElementById("portal-modal");
  if (modal && !modal.classList.contains("hidden") && typeof portalState.activeModalRenderer === "function") {
    portalState.activeModalRenderer();
  }
  await runAutoTranslateDynamicStrings(true);
  if (typeof renderPublicAdWings === "function") {
    renderPublicAdWings(publicAdBannersState);
  }
  showPortalToast(`🌐 ${pDict().btnAiTranslator} — [${lang.toUpperCase()}]`);
}

function switchPortalSection(sec) {
  portalState.activeSection = sec;
  renderPortalHeader();
  if (sec === "my_apps") {
    loadMyApplications();
  } else {
    renderPortalMain();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function scrollToPortalBlock(blockId) {
  if (portalState.activeSection !== "jobs") {
    portalState.activeSection = "jobs";
    renderPortalHeader();
    renderPortalMain();
  }
  setTimeout(() => {
    const el = document.getElementById(blockId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}

function toggleQuickFindPanel() {
  const panel = document.getElementById("quickfind-panel");
  if (panel) panel.classList.toggle("hidden");
}

function selectMacroRegion(regionName) {
  portalState.selectedMacroRegion = regionName || "all";
  portalState.selectedLocation = "all";
  if (portalState.activeSection !== "jobs") {
    portalState.activeSection = "jobs";
  }
  renderPortalHeader();
  renderPortalMain();
}

function applyQuickTrendingSearch(keyword) {
  portalState.searchQuery = keyword;
  portalState.selectedCategory = "all";
  portalState.selectedLocation = "all";
  portalState.selectedMacroRegion = "all";
  if (portalState.activeSection !== "jobs") {
    portalState.activeSection = "jobs";
  }
  renderPortalHeader();
  renderPortalMain();
  scrollToPortalBlock("section-job-explorer");
}

const PUBLIC_FULL_SECTIONS_I18N = {
  vi: {
    vipBtnShort: "VIP & Quảng cáo",
    vipBtnTitle: "Xem Cơ chế Ưu tiên Tài khoản VIP & Bảng giá Quảng cáo",
    megaCatTitle: "📂 Khám phá 10 Ngành Mũi Nhọn",
    megaCatViewAll: "Xem tất cả bảng lương ngành →",
    megaCatSenior: "👑 Quản lý Cấp cao (C-Level / Director)",
    megaCatMiddle: "🎯 Quản lý Cấp trung (Head / Manager)",
    megaCatReset: "↺ Xóa bộ lọc",
    megaLocTitle: "📍 Khu vực & Khu Công Nghiệp Trọng điểm",
    megaLocManage: "➕ Thêm / Quản lý Khu vực →",
    authLogin: "Đăng nhập",
    authEmployer: "Nhà tuyển dụng",
    authVipCandidate: "Ứng viên VIP",
    authMyApps: "Hồ sơ & Tiến độ Ứng tuyển",
    authUpdateCv: "Cập nhật Hồ sơ 1-Click CV",
    authSwitchSso: "Chuyển đổi Tài khoản / SSO →",
    authLogoutCandidate: "Đăng xuất tài khoản",
    authOpenAts: "Mở Quản trị ATS Doanh nghiệp →",
    authSwitchTenant: "Chuyển đổi Tenant Tổ chức",
    authB2bSso: "Cổng Đăng nhập B2B / SSO",
    authLogoutEmp: "Đăng xuất",
    heroAiBadge: "🔥 100% AI Matching & Phỏng vấn Đa ngôn ngữ 24/7",
    statLocations: "Khu vực / Tỉnh",
    btnPostJobHero: "Đăng tin tuyển dụng",
    btnSsoHero: "Cổng Đăng nhập / SSO",
    searchPlaceholder: "🔍 Chức danh, kỹ năng, từ khóa hoặc tên Tập đoàn...",
    allLocationsOpt: "📍 Toàn bộ 63 Tỉnh/Thành & KCN",
    btnFindJobs: "Tìm việc",
    salAll: "💰 Mức lương: Tất cả (₫0 - ₫150M+)",
    sal30: "💰 Từ 30 Triệu+ ($1,200+)",
    sal50: "💰 Từ 50 Triệu+ ($2,000+)",
    sal70: "💰 Từ 70 Triệu+ ($2,800+)",
    sal100: "💰 Trên 100 Triệu+ ($4,000+)",
    lvlAll: "👔 Cấp bậc: Tất cả vị trí",
    lvlSenior: "👑 Quản lý Cấp cao (C-Level / Director)",
    lvlMiddle: "🎯 Quản lý Cấp trung (Head / Manager)",
    lvlSaved: "⭐ Việc làm đã lưu",
    dateAny: "📅 Thời gian đăng: Bất kỳ",
    dateToday: "📅 Mới đăng hôm nay / 48h",
    date3d: "📅 Trong 3 ngày qua",
    date7d: "📅 Trong 7 ngày qua",
    sortVip: "👑 Ưu tiên Tài khoản VIP (Diamond → Standard)",
    trendingLabel: "🔥 Xu hướng tìm kiếm (Trending):",
    trAi: "🤖 AI & Cloud",
    trCfo: "🏦 Giám đốc Tài chính CFO",
    trFdi: "🏭 Sản xuất & Điện tử FDI",
    trEsg: "🌱 Năng lượng Xanh ESG",
    trLog: "🚢 Chuỗi cung ứng & Logistics",
    trHcmc: "📍 TP.HCM",
    trHanoi: "📍 Hà Nội",
    trBinhDuong: "📍 Bình Dương",
    trBacNinh: "📍 Bắc Ninh",
    liveBoardTitle: "LIVE JOB BOARD • BẢNG TIN VIỆC LÀM TRỰC TUYẾN",
    liveBoardSub: "Cập nhật thời gian thực từ 6 Tập đoàn & 12 Vùng kinh tế",
    colPosition: "Vị trí Tuyển dụng (Position)",
    colLocation: "Khu vực (Location)",
    colSalary: "Mức đãi ngộ (Salary)",
    colCompany: "Doanh nghiệp (Company)",
    colStatus: "Trạng thái",
    trust1Prefix: "Hơn",
    trust1Bold: "vị trí Quản lý",
    trust1Suffix: "tại 63 Tỉnh/Thành & ASEAN",
    trust2Bold: "Một hồ sơ CV duy nhất",
    trust2Suffix: "— Ứng tuyển mọi công việc chỉ với 1 chạm",
    trust3Bold: "AI Sàng lọc & Phỏng vấn",
    trust3Suffix: "thông báo kết quả tức thì 24/7",
    trust4Prefix: "Thiết kế chuẩn cho cả",
    trust4Bold: "Ứng viên Tài năng & Doanh nghiệp B2B",
    seekerBadge: "DÀNH CHO ỨNG VIÊN & CHUYÊN GIA",
    seekerTitle: "Tải lên CV của bạn và ứng tuyển chỉ với một cú nhấp chuột",
    seekerDesc: "AI tự động chấm điểm độ khớp 4 trụ cột và mời phỏng vấn trực tuyến ngay lập tức.",
    seekerBtnCv: "📄 Tạo hồ sơ CV",
    seekerBtnCalc: "🧮 Tính lương Gross-Net",
    empBadge: "DÀNH CHO NHÀ TUYỂN DỤNG B2B",
    empTitle: "Tìm kiếm tài năng và nhận hồ sơ từ các ứng viên tuyệt vời",
    empDesc: "Đăng tin tuyển dụng ngay hoặc khởi tạo không gian quản trị ATS riêng biệt (Multi-Tenant).",
    empBtnPost: "📢 Đăng tuyển ngay",
    empBtnAts: "🏢 Trang Nhà Tuyển Dụng",
    viewGridBtn: "📰 Lưới + Cột Danh mục (Chuẩn VietJobs)",
    vipPinnedSuffix: " • 📌 GHIM ĐẦU",
    daysAgoSuffix: "ngày trước",
    gridHeading: "🔥 Tuyển dụng mới nhất & Việc làm Quản lý",
    gridSwitchSplit: "Chuyển sang chế độ Split-View 360° →",
    gridRoleDescPrefix: "Chịu trách nhiệm hoạch định chiến lược, vận hành hệ thống KPI/OKR và dẫn dắt đội ngũ chuyên gia tại",
    gridViewDetails: "Chi tiết →",
    sidebarCatTitle: "📂 Nghề nghiệp theo danh mục",
    sidebarLocTitle: "📍 Khu vực phổ biến",
    sidebarAddLoc: "+ Thêm",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 Nhà Tuyển Dụng Nổi Bật Đang Tuyển Dụng",
    featEmpViewAllPrefix: "Xem tất cả",
    featEmpViewAllSuffix: "Tập đoàn & Workspace B2B →",
    tenantCodeLabel: "Mã Tenant:",
    featEmpDescPrefix: "Tập đoàn thành viên trên mạng lưới HireMind Global Cloud. Đang mở",
    featEmpDescBold: "vị trí quản lý & chuyên gia",
    featEmpDescSuffix: "với quy trình AI phỏng vấn tự động.",
    openJobsCountLabel: "Việc làm đang mở:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 Việc Làm Theo Khu Vực & Khu Công Nghiệp Trọng Điểm",
    regHubSub: "Chọn nhanh Thành phố, Tỉnh hoặc Khu Công nghiệp (VSIP, Khu CNC) hoặc thêm khu vực tuyển dụng mới.",
    rgAll: "🌐 Toàn quốc & ASEAN",
    rgNorth: "🏛️ Miền Bắc",
    rgCentral: "🌊 Miền Trung",
    rgSouth: "🏙️ Miền Nam & ĐBSCL",
    rgIntl: "✈️ Quốc tế & Remote",
    jobsCountUnit: "việc",
    expandProvLabel: "Mở rộng nhanh các Tỉnh/Thành công nghiệp khác:",
    expandProvBtnPrefix: "+ Việc làm",
    viewAllVnJobs: "Xem tất cả việc làm tại Việt Nam →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 Việc Làm Theo Nghề Nghiệp Chuyên Môn",
    catMatrixViewAll: "Xem chi tiết khung năng lực & lương 10 ngành →",
    catSalaryRange: "Lương: 45 - 140 Triệu VNĐ",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ Quy Trình 5 Bước Tìm Việc & Ứng Tuyển Thông Minh",
    howSub: "Từ lúc khởi tạo hồ sơ đến ngày đầu tiên nhận việc tại các tập đoàn hàng đầu",
    howBtnStart: "🚀 Bắt đầu Tạo Hồ Sơ Ngay",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "Tạo hồ sơ CV 1 lần", desc: "Tải lên CV PDF/DOCX hoặc tạo tài khoản ứng viên một lần duy nhất để dùng cho mọi vị trí." },
      { step: "Step 2", icon: "🔍", title: "Lọc việc làm thông minh", desc: "Lọc chính xác theo 10 ngành mũi nhọn, 63 Tỉnh/Thành, Khu công nghiệp và mức lương kỳ vọng." },
      { step: "Step 3", icon: "⚡", title: "Ứng tuyển 1 cú nhấp chuột", desc: "Hồ sơ được gửi thẳng vào kho dữ liệu bảo mật của Doanh nghiệp mà không cần nhập lại." },
      { step: "Step 4", icon: "🤖", title: "AI Chấm điểm & Phỏng vấn", desc: "AI đối chiếu 4 trụ cột năng lực và cấp mã mời phỏng vấn trực tuyến đa ngôn ngữ tức thì." },
      { step: "Step 5", icon: "🎉", title: "Nhận Offer & Onboarding", desc: "Theo dõi tiến độ 5 vòng minh bạch và nhận Thư mời nhận việc (Offer Letter) chính thức." },
    ],
    toolsTitle: "🧮 Công Cụ Tính Lương Gross ⇄ Net & Định Giá Năng Lực AI 2026",
    toolsSub: "Tính chính xác Bảo hiểm Xã hội (BHXH 8%, BHYT 1.5%, BHTN 1%), Giảm trừ gia cảnh và Thuế Thu nhập Cá nhân (TNCN) lũy tiến theo quy định mới nhất tại Việt Nam.",
    toolsBackBtn: "💼 Quay lại Tìm việc làm →",
    toolsParamTitle: "⚙️ Thông số Tính Lương Gross ⇄ Net",
    toolsMonthlyIncome: "Thu nhập hàng tháng (VNĐ) *",
    toolsDependents: "Số người phụ thuộc",
    toolsRegion: "Vùng lương tối thiểu",
    toolsReg1: "Vùng I (Hà Nội, TP.HCM, Hải Phòng, Bình Dương...)",
    toolsReg2: "Vùng II (Đà Nẵng, Cần Thơ, Bắc Ninh...)",
    toolsReg3: "Vùng III",
    toolsReg4: "Vùng IV",
    toolsBreakdownTitle: "📊 Bảng Diễn Giải Chi Tiết Lương",
    toolsStandardBadge: "Chuẩn Bảo hiểm & Thuế TNCN",
    toolsGrossLbl: "LƯƠNG GROSS",
    toolsInsTaxLbl: "BẢO HIỂM + THUẾ TNCN",
    toolsNetLbl: "LƯƠNG NET (THỰC NHẬN)",
    toolsRow1: "1. Lương Gross danh nghĩa",
    toolsRowBhxh: "• Bảo hiểm xã hội (BHXH 8%)",
    toolsRowBhyt: "• Bảo hiểm y tế (BHYT 1.5%)",
    toolsRowBhtn: "• Bảo hiểm thất nghiệp (BHTN 1%)",
    toolsRow2: "2. Thu nhập trước thuế",
    toolsRowPersonalDed: "• Giảm trừ gia cảnh bản thân",
    toolsRowDepDedPrefix: "• Giảm trừ người phụ thuộc",
    toolsRowDepUnit: "người",
    toolsRow3: "3. Thu nhập chịu thuế TNCN",
    toolsRow4: "4. Thuế Thu nhập Cá nhân (TNCN lũy tiến)",
    toolsRow5: "5. Lương NET thực lĩnh (Chuyển khoản)",
    qfTitle: "⚡ Quick Find • Điều hướng Nhanh",
    qfSub: "Nhảy nhanh tới các phân khu trên trang",
    qf1: "🔍 Tìm kiếm & Bộ lọc Nâng cao",
    qf2: "🟢 Bảng tin Việc làm Trực tuyến (Live)",
    qf3: "💼 Danh sách Việc làm & AI Dossier",
    qf4: "🏢 Nhà Tuyển Dụng Nổi Bật",
    qf5: "📍 Việc làm theo 63 Tỉnh/Thành & KCN",
    qf6: "📊 10 Ngành nghề Chuyên môn",
    qf7: "➕ Thêm / Quản lý Khu vực Tuyển dụng",
    qf8: "🧮 Công cụ Tính lương Gross ⇄ Net",
    qfBtn: "Quick Find",
    chatTitle: "Trợ lý CSKH AI 24/7 — HireMind",
    chatSub: "Hỗ trợ Ứng viên, Nhà tuyển dụng & Tư vấn VIP tức thì",
    chatChip1: "👑 Tư vấn Gói VIP & Treo Banner",
    chatChip2: "📄 Hướng dẫn Ứng tuyển 1-Click CV",
    chatChip3: "🧮 Cách tính lương Gross → Net",
    chatChip4: "📞 Kết nối Hotline CSKH",
    chatWelcome: "Xin chào! Tôi là <b>Chuyên viên CSKH AI 24/7</b> của <b>HireMind Global</b>. Tôi có thể hỗ trợ bạn:<br/>• Tra cứu việc làm Quản lý & Chuyên gia lương cao<br/>• Hướng dẫn <b>Đăng ký Tài khoản VIP & Treo Banner Quảng cáo 2 bên</b><br/>• Giải đáp quy trình phỏng vấn AI đa ngôn ngữ & tính lương Gross-Net.",
    chatPlaceholder: "Nhập câu hỏi cần hỗ trợ (VD: giá banner quảng cáo, ứng tuyển CV...)",
    chatSend: "Gửi",
    chatFloatBtn: "Chat CSKH 24/7",
  },
  en: {
    vipBtnShort: "VIP & Ads",
    vipBtnTitle: "View VIP Account Priority & Ad Banner Pricing",
    megaCatTitle: "📂 Explore 10 Core Industry Sectors",
    megaCatViewAll: "View all industry salary benchmarks →",
    megaCatSenior: "👑 Executive Leadership (C-Level / Director)",
    megaCatMiddle: "🎯 Middle Management (Head / Manager)",
    megaCatReset: "↺ Reset Filters",
    megaLocTitle: "📍 Key Economic Regions & Industrial Zones",
    megaLocManage: "➕ Add / Manage Locations →",
    authLogin: "Sign In",
    authEmployer: "For Employers",
    authVipCandidate: "VIP Candidate",
    authMyApps: "My Applications & Status",
    authUpdateCv: "Update 1-Click CV Profile",
    authSwitchSso: "Switch Account / SSO →",
    authLogoutCandidate: "Sign Out",
    authOpenAts: "Open Enterprise ATS Console →",
    authSwitchTenant: "Switch Organization Tenant",
    authB2bSso: "B2B / SSO Login Portal",
    authLogoutEmp: "Sign Out",
    heroAiBadge: "🔥 100% AI Matching & 24/7 Multilingual Interview",
    statLocations: "Regions / Hubs",
    btnPostJobHero: "Post a Job",
    btnSsoHero: "Sign In / SSO Portal",
    searchPlaceholder: "🔍 Job title, skills, keywords, or enterprise name...",
    allLocationsOpt: "📍 All 63 Provinces & Industrial Zones",
    btnFindJobs: "Find Jobs",
    salAll: "💰 Salary: All Ranges ($0 - $6,500+)",
    sal30: "💰 From 30M+ VND ($1,200+)",
    sal50: "💰 From 50M+ VND ($2,000+)",
    sal70: "💰 From 70M+ VND ($2,800+)",
    sal100: "💰 Over 100M+ VND ($4,000+)",
    lvlAll: "👔 Seniority: All Levels",
    lvlSenior: "👑 Executive / C-Level / Director",
    lvlMiddle: "🎯 Middle Management (Head / Manager)",
    lvlSaved: "⭐ Saved Jobs",
    dateAny: "📅 Date Posted: Any Time",
    dateToday: "📅 Posted Today / Last 48h",
    date3d: "📅 Last 3 Days",
    date7d: "📅 Last 7 Days",
    sortVip: "👑 VIP Account Priority (Diamond → Standard)",
    trendingLabel: "🔥 Trending Searches:",
    trAi: "🤖 AI & Cloud",
    trCfo: "🏦 Chief Financial Officer (CFO)",
    trFdi: "🏭 FDI Manufacturing & Electronics",
    trEsg: "🌱 Green Energy & ESG",
    trLog: "🚢 Supply Chain & Logistics",
    trHcmc: "📍 Ho Chi Minh City",
    trHanoi: "📍 Hanoi",
    trBinhDuong: "📍 Binh Duong VSIP",
    trBacNinh: "📍 Bac Ninh High-Tech",
    liveBoardTitle: "LIVE JOB BOARD • REAL-TIME EXECUTIVE OPENINGS",
    liveBoardSub: "Updated in real time across 6 Enterprise Tenants & 12 Economic Hubs",
    colPosition: "Position Title",
    colLocation: "Location",
    colSalary: "Compensation",
    colCompany: "Enterprise",
    colStatus: "Status",
    trust1Prefix: "Over",
    trust1Bold: "Executive & Manager Roles",
    trust1Suffix: "across 63 Provinces & ASEAN",
    trust2Bold: "Single Unified CV Profile",
    trust2Suffix: "— Apply to any opening with 1 click",
    trust3Bold: "AI Screening & Voice Interview",
    trust3Suffix: "with instant 24/7 evaluation",
    trust4Prefix: "Purpose-built for both",
    trust4Bold: "Top Talent & B2B Enterprises",
    seekerBadge: "FOR CANDIDATES & EXECUTIVES",
    seekerTitle: "Upload your CV once and apply with a single click",
    seekerDesc: "AI automatically scores 4 competency pillars and invites you to an online interview.",
    seekerBtnCv: "📄 Create CV Profile",
    seekerBtnCalc: "🧮 Gross-Net Calculator",
    empBadge: "FOR B2B EMPLOYERS",
    empTitle: "Source top executive talent and verified applications",
    empDesc: "Post jobs immediately or launch your dedicated Multi-Tenant ATS workspace.",
    empBtnPost: "📢 Post a Job Now",
    empBtnAts: "🏢 Employer ATS Portal",
    viewGridBtn: "📰 Grid + Category Sidebar",
    vipPinnedSuffix: " • 📌 PINNED TOP",
    daysAgoSuffix: "days ago",
    gridHeading: "🔥 Latest Executive & Management Openings",
    gridSwitchSplit: "Switch to 360° Split-View →",
    gridRoleDescPrefix: "Lead strategic planning, KPI/OKR execution, and specialist teams at",
    gridViewDetails: "View Details →",
    sidebarCatTitle: "📂 Jobs by Category",
    sidebarLocTitle: "📍 Popular Locations",
    sidebarAddLoc: "+ Add",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 Featured Employers Hiring Now",
    featEmpViewAllPrefix: "View all",
    featEmpViewAllSuffix: "Enterprises & B2B Workspaces →",
    tenantCodeLabel: "Tenant ID:",
    featEmpDescPrefix: "Verified member enterprise on HireMind Global Cloud. Currently hiring",
    featEmpDescBold: "executive & specialist roles",
    featEmpDescSuffix: "with automated AI interviewing.",
    openJobsCountLabel: "Open Positions:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 Browse Jobs by Region & Key Industrial Zones",
    regHubSub: "Quickly filter by City, Province, or Industrial Park (VSIP, High-Tech Park) or add a new hub.",
    rgAll: "🌐 All Vietnam & ASEAN",
    rgNorth: "🏛️ Northern Vietnam",
    rgCentral: "🌊 Central Vietnam",
    rgSouth: "🏙️ Southern Vietnam",
    rgIntl: "✈️ International & Remote",
    jobsCountUnit: "jobs",
    expandProvLabel: "Quickly add other industrial provinces:",
    expandProvBtnPrefix: "+ Jobs in",
    viewAllVnJobs: "View all jobs in Vietnam →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 Browse Jobs by Professional Sector",
    catMatrixViewAll: "View competency matrix & salary benchmarks for 10 sectors →",
    catSalaryRange: "Salary: $1,800 - $5,600 / mo",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ 5-Step Smart Job Search & AI Application Journey",
    howSub: "From creating your profile to your first day at leading enterprises",
    howBtnStart: "🚀 Create Your Profile Now",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "Create One Unified CV", desc: "Upload your PDF/DOCX resume or create a candidate profile once to apply everywhere." },
      { step: "Step 2", icon: "🔍", title: "Smart Role Filtering", desc: "Filter across 10 core industries, 63 provinces, industrial zones, and target compensation." },
      { step: "Step 3", icon: "⚡", title: "1-Click Instant Apply", desc: "Your dossier is securely delivered straight to the employer's ATS without re-entering data." },
      { step: "Step 4", icon: "🤖", title: "AI Scoring & Interview", desc: "AI evaluates 4 competency pillars and issues an instant multilingual online interview invite." },
      { step: "Step 5", icon: "🎉", title: "Receive Offer & Onboard", desc: "Track 5 transparent hiring stages and receive your official digital Offer Letter." },
    ],
    toolsTitle: "🧮 Gross ⇄ Net Salary Calculator & AI Talent Valuation 2026",
    toolsSub: "Accurately compute Social Insurance (SI 8%, HI 1.5%, UI 1%), Family Deductions, and progressive Personal Income Tax (PIT) under Vietnam regulations.",
    toolsBackBtn: "💼 Back to Job Explorer →",
    toolsParamTitle: "⚙️ Gross ⇄ Net Calculation Parameters",
    toolsMonthlyIncome: "Monthly Income (VND) *",
    toolsDependents: "Number of Dependents",
    toolsRegion: "Minimum Wage Region",
    toolsReg1: "Region I (Hanoi, HCMC, Hai Phong, Binh Duong...)",
    toolsReg2: "Region II (Da Nang, Can Tho, Bac Ninh...)",
    toolsReg3: "Region III",
    toolsReg4: "Region IV",
    toolsBreakdownTitle: "📊 Detailed Salary Breakdown",
    toolsStandardBadge: "Standard Insurance & PIT",
    toolsGrossLbl: "GROSS SALARY",
    toolsInsTaxLbl: "INSURANCE + PIT TAX",
    toolsNetLbl: "NET SALARY (TAKE-HOME)",
    toolsRow1: "1. Nominal Gross Salary",
    toolsRowBhxh: "• Social Insurance (SI 8%)",
    toolsRowBhyt: "• Health Insurance (HI 1.5%)",
    toolsRowBhtn: "• Unemployment Insurance (UI 1%)",
    toolsRow2: "2. Pre-Tax Income",
    toolsRowPersonalDed: "• Personal Tax Relief",
    toolsRowDepDedPrefix: "• Dependent Deduction",
    toolsRowDepUnit: "dependents",
    toolsRow3: "3. Taxable Income",
    toolsRow4: "4. Personal Income Tax (Progressive PIT)",
    toolsRow5: "5. Take-Home NET Salary (Bank Transfer)",
    qfTitle: "⚡ Quick Find • Fast Navigation",
    qfSub: "Jump directly to any portal section",
    qf1: "🔍 Advanced Search & Filters",
    qf2: "🟢 Live Online Job Board",
    qf3: "💼 Job Explorer & AI Dossier",
    qf4: "🏢 Featured Top Employers",
    qf5: "📍 Jobs by 63 Provinces & Industrial Zones",
    qf6: "📊 10 Core Industry Sectors",
    qf7: "➕ Add / Manage Recruitment Locations",
    qf8: "🧮 Gross ⇄ Net Salary Calculator",
    qfBtn: "Quick Find",
    chatTitle: "24/7 AI Customer Care — HireMind",
    chatSub: "Instant support for Candidates, Employers & VIP Ads",
    chatChip1: "👑 VIP Plans & Ad Banner Pricing",
    chatChip2: "📄 How to Apply with 1-Click CV",
    chatChip3: "🧮 Gross → Net Salary Guide",
    chatChip4: "📞 Connect to Support Hotline",
    chatWelcome: "Hello! I am the <b>24/7 AI Customer Care Specialist</b> at <b>HireMind Global</b>. I can help you with:<br/>• Finding high-paying Executive & Specialist jobs<br/>• <b>VIP Account Upgrades & Left/Right Skyscraper Ad Banners</b><br/>• Multilingual AI Interviews & Gross-Net Salary calculations.",
    chatPlaceholder: "Ask a question (e.g., VIP banner pricing, 1-click CV apply...)",
    chatSend: "Send",
    chatFloatBtn: "24/7 AI Support",
  },
  ja: {
    vipBtnShort: "VIP・広告",
    vipBtnTitle: "VIPアカウント優先仕組みとバナー広告料金を見る",
    megaCatTitle: "📂 10大コア産業セクター",
    megaCatViewAll: "全業種の給与ベンチマークを見る →",
    megaCatSenior: "👑 エグゼクティブ・役員 (C-Level / Director)",
    megaCatMiddle: "🎯 ミドルマネジメント (部長・課長)",
    megaCatReset: "↺ フィルター解除",
    megaLocTitle: "📍 主要経済圏・工業団地 (VSIP等)",
    megaLocManage: "➕ 勤務地を追加・管理 →",
    authLogin: "ログイン",
    authEmployer: "採用企業様",
    authVipCandidate: "VIP候補者",
    authMyApps: "応募履歴・選考ステータス",
    authUpdateCv: "ワンクリックCV更新",
    authSwitchSso: "アカウント切替 / SSO →",
    authLogoutCandidate: "ログアウト",
    authOpenAts: "企業ATS管理画面を開く →",
    authSwitchTenant: "組織テナント切替",
    authB2bSso: "B2B / SSOログイン",
    authLogoutEmp: "ログアウト",
    heroAiBadge: "🔥 100% AIマッチング＆24時間多言語AI面接",
    statLocations: "地域・工業団地",
    btnPostJobHero: "求人を掲載する",
    btnSsoHero: "ログイン / SSO",
    searchPlaceholder: "🔍 職種、スキル、キーワード、企業名で検索...",
    allLocationsOpt: "📍 全63省・都市＆工業団地",
    btnFindJobs: "求人検索",
    salAll: "💰 年収・月収：すべて",
    sal30: "💰 3,000万VND以上 ($1,200+)",
    sal50: "💰 5,000万VND以上 ($2,000+)",
    sal70: "💰 7,000万VND以上 ($2,800+)",
    sal100: "💰 1億VND以上 ($4,000+)",
    lvlAll: "👔 役職レベル：すべて",
    lvlSenior: "👑 経営幹部・ディレクター",
    lvlMiddle: "🎯 部門長・マネージャー",
    lvlSaved: "⭐ 保存済み求人",
    dateAny: "📅 掲載日：すべて",
    dateToday: "📅 本日・48時間以内",
    date3d: "📅 過去3日間",
    date7d: "📅 過去7日間",
    sortVip: "👑 VIP優先表示 (Diamond → Standard)",
    trendingLabel: "🔥 トレンド検索:",
    trAi: "🤖 AI・クラウド",
    trCfo: "🏦 最高財務責任者 (CFO)",
    trFdi: "🏭 FDI製造・半導体",
    trEsg: "🌱 グリーンエネルギー・ESG",
    trLog: "🚢 サプライチェーン・物流",
    trHcmc: "📍 ホーチミン市",
    trHanoi: "📍 ハノイ",
    trBinhDuong: "📍 ビンズオン省",
    trBacNinh: "📍 バクニン省",
    liveBoardTitle: "LIVE JOB BOARD • リアルタイム求人ボード",
    liveBoardSub: "6大企業グループ＆12経済圏からリアルタイム更新",
    colPosition: "募集職種",
    colLocation: "勤務地",
    colSalary: "提示給与",
    colCompany: "採用企業",
    colStatus: "状態",
    trust1Prefix: "ベトナム全土・ASEANで",
    trust1Bold: "管理職・専門職求人",
    trust1Suffix: "を多数掲載",
    trust2Bold: "1つの共通履歴書(CV)",
    trust2Suffix: "で全求人へワンクリック応募",
    trust3Bold: "AI書類選考＆音声面接",
    trust3Suffix: "で24時間即時フィードバック",
    trust4Prefix: "ハイクラス人材と",
    trust4Bold: "B2B採用企業の双方に最適化",
    seekerBadge: "求職者・プロフェッショナル向け",
    seekerTitle: "CVをアップロードし、ワンクリックでスピード応募",
    seekerDesc: "AIが4大評価軸で適合度を即時算出し、オンラインAI面接へ招待します。",
    seekerBtnCv: "📄 CVプロフィール作成",
    seekerBtnCalc: "🧮 Gross-Net給与計算",
    empBadge: "B2B採用企業向け",
    empTitle: "優秀なリーダー人材からの応募をダイレクトに獲得",
    empDesc: "今すぐ求人を掲載するか、専用マルチテナントATS環境を開設できます。",
    empBtnPost: "📢 求人を掲載",
    empBtnAts: "🏢 採用管理ATSへ",
    viewGridBtn: "📰 グリッド＋業種サイドバー",
    vipPinnedSuffix: " • 📌 トップ固定",
    daysAgoSuffix: "日前",
    gridHeading: "🔥 新着・管理職ハイクラス求人",
    gridSwitchSplit: "360°分割ビューに切替 →",
    gridRoleDescPrefix: "戦略立案、KPI/OKR推進、および専門チームのマネジメントを担当：",
    gridViewDetails: "詳細を見る →",
    sidebarCatTitle: "📂 業種別カテゴリー",
    sidebarLocTitle: "📍 人気エリア",
    sidebarAddLoc: "+ 追加",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 積極採用中の注目グローバル企業",
    featEmpViewAllPrefix: "全",
    featEmpViewAllSuffix: "社のB2Bワークスペースを見る →",
    tenantCodeLabel: "テナントID:",
    featEmpDescPrefix: "HireMind Global Cloud認定企業。現在、AI自動面接プロセスで",
    featEmpDescBold: "管理職・専門職ポジション",
    featEmpDescSuffix: "を募集中です。",
    openJobsCountLabel: "公開求人:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 地域・主要工業団地から求人を探す",
    regHubSub: "都市・省・工業団地（VSIP、ハイテクパーク）で絞り込むか、新しい地域を追加できます。",
    rgAll: "🌐 ベトナム全土＆ASEAN",
    rgNorth: "🏛️ 北部経済圏",
    rgCentral: "🌊 中部経済圏",
    rgSouth: "🏙️ 南部経済圏",
    rgIntl: "✈️ 国際・リモート",
    jobsCountUnit: "件",
    expandProvLabel: "その他の工業省をクイック追加:",
    expandProvBtnPrefix: "+ 求人:",
    viewAllVnJobs: "ベトナム全土の求人を見る →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 職種・専門分野から求人を探す",
    catMatrixViewAll: "10業種のスキル定義と給与水準を見る →",
    catSalaryRange: "給与目安: 4,500万〜1.4億VND",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ スマート転職・AI選考の5ステップ",
    howSub: "プロフィール作成から一流企業での入社初日までを完全サポート",
    howBtnStart: "🚀 今すぐプロフィール作成",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "共通CVを1回作成", desc: "PDF/DOCXの履歴書を一度登録すれば、すべての求人に応募可能です。" },
      { step: "Step 2", icon: "🔍", title: "高精度フィルター検索", desc: "10大業種、63省・工業団地、希望給与で最適ポジションを検索します。" },
      { step: "Step 3", icon: "⚡", title: "ワンクリック応募", desc: "再入力不要で企業のセキュアATSへ直接応募データが送信されます。" },
      { step: "Step 4", icon: "🤖", title: "AI採点＆オンライン面接", desc: "AIが4軸で評価し、8言語対応オンラインAI面接コードを発行します。" },
      { step: "Step 5", icon: "🎉", title: "内定通知＆入社手続き", desc: "5段階の選考進捗を透明に追跡し、公式オファーレターを受領します。" },
    ],
    toolsTitle: "🧮 Gross ⇄ Net 給与計算＆AI市場価値シミュレーター",
    toolsSub: "ベトナム最新の社会保険（BHXH 8%、BHYT 1.5%、BHTN 1%）、扶養控除、累進個人所得税（PIT）を正確に計算します。",
    toolsBackBtn: "💼 求人検索へ戻る →",
    toolsParamTitle: "⚙️ Gross ⇄ Net 計算条件",
    toolsMonthlyIncome: "月収金額 (VND) *",
    toolsDependents: "扶養家族人数",
    toolsRegion: "最低賃金地域区分",
    toolsReg1: "第1地域 (ハノイ、ホーチミン、ハイフォン、ビンズオン...)",
    toolsReg2: "第2地域 (ダナン、カントー、バクニン...)",
    toolsReg3: "第3地域",
    toolsReg4: "第4地域",
    toolsBreakdownTitle: "📊 給与・社会保険・税金 詳細内訳",
    toolsStandardBadge: "ベトナム法定基準",
    toolsGrossLbl: "額面給与 (GROSS)",
    toolsInsTaxLbl: "社会保険＋個人所得税",
    toolsNetLbl: "手取り給与 (NET)",
    toolsRow1: "1. 額面給与 (Gross)",
    toolsRowBhxh: "• 社会保険 (BHXH 8%)",
    toolsRowBhyt: "• 健康保険 (BHYT 1.5%)",
    toolsRowBhtn: "• 失業保険 (BHTN 1%)",
    toolsRow2: "2. 税引前所得",
    toolsRowPersonalDed: "• 本人基礎控除",
    toolsRowDepDedPrefix: "• 扶養控除",
    toolsRowDepUnit: "名",
    toolsRow3: "3. 課税対象所得",
    toolsRow4: "4. 個人所得税 (累進課税 PIT)",
    toolsRow5: "5. 手取り支給額 (NET 振込額)",
    qfTitle: "⚡ クイックナビゲーション",
    qfSub: "ページ内の各セクションへ移動",
    qf1: "🔍 検索＆詳細フィルター",
    qf2: "🟢 リアルタイム求人ボード",
    qf3: "💼 求人一覧＆AI分析カルテ",
    qf4: "🏢 注目採用企業一覧",
    qf5: "📍 63省・工業団地別求人",
    qf6: "📊 10大専門業種カテゴリー",
    qf7: "➕ 勤務地の追加・管理",
    qf8: "🧮 Gross ⇄ Net 給与計算ツール",
    qfBtn: "Quick Find",
    chatTitle: "24時間 AIカスタマーサポート",
    chatSub: "求職者・採用企業・VIP広告の即時案内",
    chatChip1: "👑 VIPプラン・左右バナー広告料金",
    chatChip2: "📄 ワンクリックCV応募方法",
    chatChip3: "🧮 Gross→Net 手取り給与計算",
    chatChip4: "📞 サポートホットライン連絡先",
    chatWelcome: "こんにちは！<b>HireMind Global 24時間AIサポート</b>です。以下のご案内が可能です：<br/>• ハイクラス管理職・専門職求人の検索<br/>• <b>VIPアカウント優先表示＆左右バナー広告の掲載</b><br/>• 多言語AI面接およびGross-Net給与計算。",
    chatPlaceholder: "質問を入力してください（例：バナー広告料金、CV応募方法...）",
    chatSend: "送信",
    chatFloatBtn: "24/7 AIサポート",
  },
  ko: {
    vipBtnShort: "VIP & 광고",
    vipBtnTitle: "VIP 계정 우선순위 및 배너 광고 안내 보기",
    megaCatTitle: "📂 10대 핵심 산업 직군 탐색",
    megaCatViewAll: "전 직군 연봉 벤치마크 보기 →",
    megaCatSenior: "👑 임원급 리더십 (C-Level / Director)",
    megaCatMiddle: "🎯 중간 관리자 (부서장 / 매니저)",
    megaCatReset: "↺ 필터 초기화",
    megaLocTitle: "📍 주요 경제권 및 산업단지 (VSIP 등)",
    megaLocManage: "➕ 지역 추가 / 관리 →",
    authLogin: "로그인",
    authEmployer: "기업회원",
    authVipCandidate: "VIP 인재",
    authMyApps: "지원 내역 및 진행 상태",
    authUpdateCv: "원클릭 이력서(CV) 업데이트",
    authSwitchSso: "계정 전환 / SSO →",
    authLogoutCandidate: "로그아웃",
    authOpenAts: "기업용 ATS 관리 콘솔 열기 →",
    authSwitchTenant: "조직 테넌트 전환",
    authB2bSso: "B2B / SSO 로그인 포털",
    authLogoutEmp: "로그아웃",
    heroAiBadge: "🔥 100% AI 매칭 & 24/7 다국어 AI 면접",
    statLocations: "지역 / 산단",
    btnPostJobHero: "채용공고 등록",
    btnSsoHero: "로그인 / SSO",
    searchPlaceholder: "🔍 직무명, 핵심역량, 키워드 또는 기업명 검색...",
    allLocationsOpt: "📍 베트남 63개 성/시 및 산업단지 전체",
    btnFindJobs: "채용 검색",
    salAll: "💰 급여 수준: 전체 (₫0 - ₫150M+)",
    sal30: "💰 3,000만 VND 이상 ($1,200+)",
    sal50: "💰 5,000만 VND 이상 ($2,000+)",
    sal70: "💰 7,000만 VND 이상 ($2,800+)",
    sal100: "💰 1억 VND 이상 ($4,000+)",
    lvlAll: "👔 직급: 전체 포지션",
    lvlSenior: "👑 임원 / 디렉터 (C-Level)",
    lvlMiddle: "🎯 부서장 / 매니저 (Middle)",
    lvlSaved: "⭐ 저장한 채용공고",
    dateAny: "📅 등록일: 전체 기간",
    dateToday: "📅 오늘 / 최근 48시간 이내",
    date3d: "📅 최근 3일 이내",
    date7d: "📅 최근 7일 이내",
    sortVip: "👑 VIP 계정 우선 정렬 (Diamond → Standard)",
    trendingLabel: "🔥 인기 검색어 (Trending):",
    trAi: "🤖 AI & 클라우드",
    trCfo: "🏦 최고재무책임자 (CFO)",
    trFdi: "🏭 FDI 제조 & 반도체",
    trEsg: "🌱 친환경 에너지 & ESG",
    trLog: "🚢 공급망 & 물류 (SCM)",
    trHcmc: "📍 호치민시",
    trHanoi: "📍 하노이",
    trBinhDuong: "📍 빈증 VSIP",
    trBacNinh: "📍 박닌 하이테크",
    liveBoardTitle: "LIVE JOB BOARD • 실시간 채용 현황 보드",
    liveBoardSub: "6대 글로벌 기업 및 12개 핵심 경제권 실시간 업데이트",
    colPosition: "채용 포지션",
    colLocation: "근무 지역",
    colSalary: "보상 수준",
    colCompany: "채용 기업",
    colStatus: "상태",
    trust1Prefix: "베트남 및 아세안 전역",
    trust1Bold: "핵심 관리직 포지션",
    trust1Suffix: "실시간 오픈",
    trust2Bold: "단 하나의 통합 이력서(CV)",
    trust2Suffix: "— 모든 포지션 원클릭 즉시 지원",
    trust3Bold: "AI 서류 심사 & 음성 면접",
    trust3Suffix: "24시간 실시간 평가 알림",
    trust4Prefix: "검증된 글로벌 인재와",
    trust4Bold: "B2B 기업 모두를 위한 표준 플랫폼",
    seekerBadge: "구직자 및 전문가용",
    seekerTitle: "이력서(CV)를 업로드하고 원클릭으로 즉시 지원하세요",
    seekerDesc: "AI가 4대 핵심 역량 적합도를 자동 채점하고 온라인 면접으로 즉시 안내합니다.",
    seekerBtnCv: "📄 이력서 프로필 등록",
    seekerBtnCalc: "🧮 Gross-Net 급여 계산기",
    empBadge: "B2B 채용 기업용",
    empTitle: "최고의 리더십 인재를 발굴하고 검증된 이력서를 받아보세요",
    empDesc: "채용공고를 즉시 등록하거나 기업 전용 멀티테넌트 ATS를 개설하세요.",
    empBtnPost: "📢 채용공고 등록",
    empBtnAts: "🏢 기업 전용 ATS 센터",
    viewGridBtn: "📰 그리드 + 직군 사이드바",
    vipPinnedSuffix: " • 📌 상단 고정",
    daysAgoSuffix: "일 전",
    gridHeading: "🔥 최신 등록 및 관리직 채용공고",
    gridSwitchSplit: "360° 분할 뷰로 전환 →",
    gridRoleDescPrefix: "전략 기획, KPI/OKR 운영 및 전문가 조직 리딩 담당:",
    gridViewDetails: "상세 보기 →",
    sidebarCatTitle: "📂 직군별 카테고리",
    sidebarLocTitle: "📍 인기 근무 지역",
    sidebarAddLoc: "+ 추가",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 현재 채용 중인 대표 글로벌 기업",
    featEmpViewAllPrefix: "전체",
    featEmpViewAllSuffix: "개 그룹사 및 B2B 워크스페이스 보기 →",
    tenantCodeLabel: "테넌트 코드:",
    featEmpDescPrefix: "HireMind 글로벌 클라우드 인증 기업입니다. 자동 AI 면접 프로세스로",
    featEmpDescBold: "관리직 및 전문가 포지션",
    featEmpDescSuffix: "을 채용 중입니다.",
    openJobsCountLabel: "진행 중인 공고:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 지역 및 핵심 산업단지별 채용공고",
    regHubSub: "도시, 성 또는 산업단지(VSIP, 하이테크 파크)를 선택하거나 신규 채용 지역을 추가하세요.",
    rgAll: "🌐 전국 및 아세안",
    rgNorth: "🏛️ 북부 경제권",
    rgCentral: "🌊 중부 경제권",
    rgSouth: "🏙️ 남부 경제권",
    rgIntl: "✈️ 해외 및 원격근무",
    jobsCountUnit: "건",
    expandProvLabel: "주요 산업 도시 빠른 추가:",
    expandProvBtnPrefix: "+ 채용:",
    viewAllVnJobs: "베트남 전체 채용공고 보기 →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 전문 직무별 채용공고 탐색",
    catMatrixViewAll: "10대 산업 역량 매트릭스 및 급여 테이블 보기 →",
    catSalaryRange: "급여: 4,500만 ~ 1.4억 VND",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ 스마트 채용 검색 및 AI 지원 5단계 프로세스",
    howSub: "프로필 생성부터 글로벌 기업 입사 첫날까지의 투명한 여정",
    howBtnStart: "🚀 지금 프로필 생성하기",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "통합 CV 1회 생성", desc: "PDF/DOCX 이력서를 한 번 등록하여 모든 채용 포지션에 활용합니다." },
      { step: "Step 2", icon: "🔍", title: "스마트 조건 필터링", desc: "10대 핵심 산업, 63개 성/시, 산업단지 및 희망 급여별로 정확히 검색합니다." },
      { step: "Step 3", icon: "⚡", title: "원클릭 즉시 지원", desc: "재입력 없이 기업의 보안 ATS 데이터베이스로 이력서가 즉시 전송됩니다." },
      { step: "Step 4", icon: "🤖", title: "AI 역량 채점 & 면접", desc: "AI가 4대 역량 적합도를 분석하고 다국어 온라인 면접 코드를 즉시 발급합니다." },
      { step: "Step 5", icon: "🎉", title: "오퍼 수령 & 온보딩", desc: "5단계 전형 진행률을 실시간 확인하고 공식 오퍼 레터를 수령합니다." },
    ],
    toolsTitle: "🧮 Gross ⇄ Net 급여 계산기 & AI 역량 가치 평가 2026",
    toolsSub: "베트남 최신 사회보험(BHXH 8%, BHYT 1.5%, BHTN 1%), 부양가족 공제 및 누진 개인소득세(PIT)를 정확히 계산합니다.",
    toolsBackBtn: "💼 채용 검색으로 돌아가기 →",
    toolsParamTitle: "⚙️ Gross ⇄ Net 급여 계산 설정",
    toolsMonthlyIncome: "월 급여액 (VND) *",
    toolsDependents: "부양가족 수",
    toolsRegion: "최저임금 지역 구분",
    toolsReg1: "1지역 (하노이, 호치민, 하이퐁, 빈증...)",
    toolsReg2: "2지역 (다낭, 껀터, 박닌...)",
    toolsReg3: "3지역",
    toolsReg4: "4지역",
    toolsBreakdownTitle: "📊 급여 및 세금 상세 내역표",
    toolsStandardBadge: "베트남 보험·소득세 기준",
    toolsGrossLbl: "세전 급여 (GROSS)",
    toolsInsTaxLbl: "보험료 + 개인소득세",
    toolsNetLbl: "실수령액 (NET)",
    toolsRow1: "1. 명목 세전 급여 (Gross)",
    toolsRowBhxh: "• 사회보험 (BHXH 8%)",
    toolsRowBhyt: "• 건강보험 (BHYT 1.5%)",
    toolsRowBhtn: "• 실업보험 (BHTN 1%)",
    toolsRow2: "2. 세전 소득",
    toolsRowPersonalDed: "• 본인 기본 공제",
    toolsRowDepDedPrefix: "• 부양가족 공제",
    toolsRowDepUnit: "명",
    toolsRow3: "3. 과세 표준 소득",
    toolsRow4: "4. 개인소득세 (누진세 PIT)",
    toolsRow5: "5. 최종 실수령액 (NET 계좌이체)",
    qfTitle: "⚡ 빠른 탐색 • Quick Find",
    qfSub: "원하는 섹션으로 즉시 이동",
    qf1: "🔍 상세 검색 및 필터",
    qf2: "🟢 실시간 채용 현황 보드",
    qf3: "💼 채용 리스트 & AI 분석 리포트",
    qf4: "🏢 대표 글로벌 채용 기업",
    qf5: "📍 63개 성/시 및 산업단지별 채용",
    qf6: "📊 10대 핵심 산업 직군",
    qf7: "➕ 채용 지역 추가 / 관리",
    qf8: "🧮 Gross ⇄ Net 급여 계산기",
    qfBtn: "Quick Find",
    chatTitle: "24/7 AI 고객지원 센터 — HireMind",
    chatSub: "구직자, 채용 기업 및 VIP 광고 실시간 상담",
    chatChip1: "👑 VIP 등급 및 배너 광고 안내",
    chatChip2: "📄 원클릭 CV 지원 방법",
    chatChip3: "🧮 Gross → Net 실수령액 계산",
    chatChip4: "📞 고객센터 핫라인 연결",
    chatWelcome: "안녕하세요! <b>HireMind Global 24/7 AI 고객지원 어시스턴트</b>입니다. 무엇을 도와드릴까요?<br/>• 고연봉 관리직 및 전문가 포지션 추천<br/>• <b>VIP 계정 업그레이드 및 좌/우 배너 광고 등록 안내</b><br/>• 다국어 AI 면접 및 Gross-Net 급여 계산.",
    chatPlaceholder: "문의사항을 입력하세요 (예: 배너 광고 비용, 이력서 등록...)",
    chatSend: "전송",
    chatFloatBtn: "24/7 AI 상담",
  },
  zh: {
    vipBtnShort: "VIP与广告",
    vipBtnTitle: "查看 VIP 账户优先机制与广告横幅价格",
    megaCatTitle: "📂 探索 10 大核心行业领域",
    megaCatViewAll: "查看所有行业薪资基准 →",
    megaCatSenior: "👑 高管领导层 (C-Level / 总监)",
    megaCatMiddle: "🎯 中层管理 (部门负责人 / 经理)",
    megaCatReset: "↺ 重置筛选",
    megaLocTitle: "📍 重点经济区与工业园区 (VSIP等)",
    megaLocManage: "➕ 添加 / 管理招聘地区 →",
    authLogin: "登录",
    authEmployer: "企业招聘",
    authVipCandidate: "VIP 候选人",
    authMyApps: "我的投递与审批进度",
    authUpdateCv: "更新一键投递简历 (CV)",
    authSwitchSso: "切换账户 / SSO →",
    authLogoutCandidate: "退出登录",
    authOpenAts: "打开企业 ATS 管理后台 →",
    authSwitchTenant: "切换企业租户空间",
    authB2bSso: "B2B / SSO 登录门户",
    authLogoutEmp: "退出",
    heroAiBadge: "🔥 100% AI 智能匹配与 24/7 多语种 AI 面试",
    statLocations: "省市 / 园区",
    btnPostJobHero: "发布招聘职位",
    btnSsoHero: "登录 / SSO 门户",
    searchPlaceholder: "🔍 搜索职位名称、技能、关键词或集团名称...",
    allLocationsOpt: "📍 全部 63 省市及重点工业园区",
    btnFindJobs: "搜索职位",
    salAll: "💰 薪资范围：全部 (₫0 - ₫150M+)",
    sal30: "💰 3,000万越盾以上 ($1,200+)",
    sal50: "💰 5,000万越盾以上 ($2,000+)",
    sal70: "💰 7,000万越盾以上 ($2,800+)",
    sal100: "💰 1亿越盾以上 ($4,000+)",
    lvlAll: "👔 职级：全部岗位",
    lvlSenior: "👑 高层管理 (C-Level / 总监)",
    lvlMiddle: "🎯 中层管理 (Head / 经理)",
    lvlSaved: "⭐ 已收藏职位",
    dateAny: "📅 发布时间：不限",
    dateToday: "📅 今日发布 / 48小时内",
    date3d: "📅 最近 3 天内",
    date7d: "📅 最近 7 天内",
    sortVip: "👑 VIP 账户优先排序 (Diamond → Standard)",
    trendingLabel: "🔥 热门搜索趋势 (Trending):",
    trAi: "🤖 AI 与云计算",
    trCfo: "🏦 首席财务官 CFO",
    trFdi: "🏭 FDI 制造与电子半导体",
    trEsg: "🌱 绿色能源与 ESG",
    trLog: "🚢 供应链与跨境物流",
    trHcmc: "📍 胡志明市",
    trHanoi: "📍 河内",
    trBinhDuong: "📍 平阳 VSIP",
    trBacNinh: "📍 北宁高新区",
    liveBoardTitle: "LIVE JOB BOARD • 实时在线职位看板",
    liveBoardSub: "来自 6 大跨国集团与 12 个重点经济区的实时更新",
    colPosition: "招聘职位 (Position)",
    colLocation: "工作地区 (Location)",
    colSalary: "薪资待遇 (Salary)",
    colCompany: "招聘企业 (Company)",
    colStatus: "状态",
    trust1Prefix: "超过",
    trust1Bold: "高管与专家职位",
    trust1Suffix: "覆盖越南 63 省市及东盟",
    trust2Bold: "一份通用数字简历",
    trust2Suffix: "— 一键极速投递所有心仪岗位",
    trust3Bold: "AI 智能筛选与语音面试",
    trust3Suffix: "24/7 全天候即时反馈结果",
    trust4Prefix: "专为",
    trust4Bold: "精英人才与 B2B 招聘企业打造",
    seekerBadge: "面向求职者与高管精英",
    seekerTitle: "上传您的简历，一键极速投递全球名企",
    seekerDesc: "AI 自动按 4 大维度评估匹配度，并立即邀请参加在线多语种面试。",
    seekerBtnCv: "📄 创建简历档案",
    seekerBtnCalc: "🧮 Gross-Net 薪资计算",
    empBadge: "面向 B2B 招聘企业",
    empTitle: "精准寻访顶尖高管人才，获取高匹配度简历",
    empDesc: "立即发布招聘职位，或开通专属多租户企业 ATS 管理系统。",
    empBtnPost: "📢 立即发布职位",
    empBtnAts: "🏢 企业 ATS 后台",
    viewGridBtn: "📰 网格 + 行业目录侧栏",
    vipPinnedSuffix: " • 📌 置顶推荐",
    daysAgoSuffix: "天前",
    gridHeading: "🔥 最新高管与核心技术职位",
    gridSwitchSplit: "切换至 360° 分屏视图 →",
    gridRoleDescPrefix: "负责战略规划、KPI/OKR 体系运营并带领专家团队：",
    gridViewDetails: "查看详情 →",
    sidebarCatTitle: "📂 按行业分类浏览",
    sidebarLocTitle: "📍 热门工作地区",
    sidebarAddLoc: "+ 添加",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 正在热招的知名跨国集团",
    featEmpViewAllPrefix: "查看全部",
    featEmpViewAllSuffix: "家集团与 B2B 工作空间 →",
    tenantCodeLabel: "租户编号:",
    featEmpDescPrefix: "HireMind 全球云认证成员企业。正在通过 AI 自动面试流程招聘",
    featEmpDescBold: "管理层与技术专家岗位",
    featEmpDescSuffix: "。",
    openJobsCountLabel: "在招职位:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 按地区与重点工业园区浏览职位",
    regHubSub: "快速选择城市、省份或工业园区（VSIP、高新区），或添加新招聘地区。",
    rgAll: "🌐 越南全国与东盟",
    rgNorth: "🏛️ 越南北部",
    rgCentral: "🌊 越南中部",
    rgSouth: "🏙️ 越南南部",
    rgIntl: "✈️ 国际与远程办公",
    jobsCountUnit: "个职位",
    expandProvLabel: "快速添加其他工业省市:",
    expandProvBtnPrefix: "+ 职位：",
    viewAllVnJobs: "查看越南全部职位 →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 按专业领域浏览高薪职位",
    catMatrixViewAll: "查看 10 大行业能力矩阵与薪酬基准 →",
    catSalaryRange: "薪资：4,500万 - 1.4亿 越盾",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ 智能求职与 AI 面试 5 步流程",
    howSub: "从创建档案到入职顶尖跨国集团的全流程透明体验",
    howBtnStart: "🚀 立即创建个人档案",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "一次创建通用简历", desc: "上传 PDF/DOCX 简历或注册账号，即可复用于所有高管职位。" },
      { step: "Step 2", icon: "🔍", title: "智能精准筛选职位", desc: "按 10 大行业、63 省市、工业园区及期望薪资精准匹配。" },
      { step: "Step 3", icon: "⚡", title: "一键极速投递", desc: "无需重复填写，简历直接加密发送至企业 ATS 人才库。" },
      { step: "Step 4", icon: "🤖", title: "AI 评分与多语种面试", desc: "AI 四维评分并即时发放 8 语种在线 AI 语音面试邀请码。" },
      { step: "Step 5", icon: "🎉", title: "录用 Offer 与入职", desc: "透明追踪 5 轮审批进度，在线接收正式录用通知书 (Offer)。" },
    ],
    toolsTitle: "🧮 Gross ⇄ Net 薪资计算器与 AI 人才估值 2026",
    toolsSub: "精准计算越南最新社会保险（社保 8%、医保 1.5%、失业险 1%）、家庭专项扣除及累进个人所得税 (PIT)。",
    toolsBackBtn: "💼 返回职位搜索 →",
    toolsParamTitle: "⚙️ Gross ⇄ Net 计算参数设置",
    toolsMonthlyIncome: "月收入金额 (VND) *",
    toolsDependents: "赡养家属人数",
    toolsRegion: "最低工资地区级别",
    toolsReg1: "一类地区 (河内、胡志明市、海防、平阳...)",
    toolsReg2: "二类地区 (岘港、芹苴、北宁...)",
    toolsReg3: "三类地区",
    toolsReg4: "四类地区",
    toolsBreakdownTitle: "📊 薪资与税费详细明细表",
    toolsStandardBadge: "越南社保与个税标准",
    toolsGrossLbl: "税前薪资 (GROSS)",
    toolsInsTaxLbl: "社保 + 个人所得税",
    toolsNetLbl: "税后实发 (NET)",
    toolsRow1: "1. 名义税前薪资 (Gross)",
    toolsRowBhxh: "• 社会保险 (BHXH 8%)",
    toolsRowBhyt: "• 医疗保险 (BHYT 1.5%)",
    toolsRowBhtn: "• 失业保险 (BHTN 1%)",
    toolsRow2: "2. 税前收入",
    toolsRowPersonalDed: "• 个人基本免税额",
    toolsRowDepDedPrefix: "• 赡养家属抵扣",
    toolsRowDepUnit: "人",
    toolsRow3: "3. 应纳税所得额",
    toolsRow4: "4. 个人所得税 (累进税率 PIT)",
    toolsRow5: "5. 税后实发工资 (NET 银行转账)",
    qfTitle: "⚡ 快速导航 • Quick Find",
    qfSub: "快速跳转至页面各个功能区",
    qf1: "🔍 搜索与高级筛选",
    qf2: "🟢 实时在线职位看板",
    qf3: "💼 职位列表与 AI 评估报告",
    qf4: "🏢 重点招聘企业",
    qf5: "📍 63 省市与工业园区职位",
    qf6: "📊 10 大核心行业分类",
    qf7: "➕ 添加 / 管理招聘地区",
    qf8: "🧮 Gross ⇄ Net 薪资计算器",
    qfBtn: "Quick Find",
    chatTitle: "24/7 AI 智能客服 — HireMind",
    chatSub: "为求职者、招聘企业及 VIP 广告提供即时支持",
    chatChip1: "👑 VIP 套餐与左右广告位报价",
    chatChip2: "📄 如何一键投递简历 (CV)",
    chatChip3: "🧮 Gross → Net 薪资计算说明",
    chatChip4: "📞 联系客服热线",
    chatWelcome: "您好！我是 <b>HireMind Global 24/7 AI 智能客服专员</b>。我可以为您提供以下帮助：<br/>• 查找高薪管理岗与技术专家职位<br/>• <b>升级 VIP 账户优先级及投放左右两侧摩天大楼广告横幅</b><br/>• 解答多语种 AI 面试与 Gross-Net 薪资计算。",
    chatPlaceholder: "请输入您的问题（如：广告横幅价格、一键投递简历...）",
    chatSend: "发送",
    chatFloatBtn: "24/7 在线客服",
  },
  th: {
    vipBtnShort: "VIP & โฆษณา",
    vipBtnTitle: "ดูกลไกสิทธิพิเศษบัญชี VIP และราคาป้ายโฆษณา",
    megaCatTitle: "📂 สำรวจ 10 อุตสาหกรรมหลัก",
    megaCatViewAll: "ดูฐานเงินเดือนทุกอุตสาหกรรม →",
    megaCatSenior: "👑 ผู้บริหารระดับสูง (C-Level / Director)",
    megaCatMiddle: "🎯 ผู้จัดการระดับกลาง (Head / Manager)",
    megaCatReset: "↺ ล้างตัวกรอง",
    megaLocTitle: "📍 พื้นที่เศรษฐกิจและนิคมอุตสาหกรรมสำคัญ",
    megaLocManage: "➕ เพิ่ม / จัดการพื้นที่ →",
    authLogin: "เข้าสู่ระบบ",
    authEmployer: "สำหรับบริษัท",
    authVipCandidate: "ผู้สมัคร VIP",
    authMyApps: "ใบสมัครและสถานะการคัดเลือก",
    authUpdateCv: "อัปเดตเรซูเม่ 1-Click CV",
    authSwitchSso: "สลับบัญชี / SSO →",
    authLogoutCandidate: "ออกจากระบบ",
    authOpenAts: "เปิดระบบบริหาร ATS องค์กร →",
    authSwitchTenant: "สลับองค์กร (Tenant)",
    authB2bSso: "พอร์ทัลเข้าสู่ระบบ B2B / SSO",
    authLogoutEmp: "ออกจากระบบ",
    heroAiBadge: "🔥 จับคู่งานด้วย AI 100% & สัมภาษณ์หลายภาษา 24/7",
    statLocations: "พื้นที่ / จังหวัด",
    btnPostJobHero: "ลงประกาศงาน",
    btnSsoHero: "เข้าสู่ระบบ / SSO",
    searchPlaceholder: "🔍 ตำแหน่งงาน, ทักษะ, คำค้นหา หรือชื่อบริษัท...",
    allLocationsOpt: "📍 ทั้งหมด 63 จังหวัด & นิคมอุตสาหกรรม",
    btnFindJobs: "หางาน",
    salAll: "💰 เงินเดือน: ทั้งหมด (₫0 - ₫150M+)",
    sal30: "💰 ตั้งแต่ 30 ล้านดอง+ ($1,200+)",
    sal50: "💰 ตั้งแต่ 50 ล้านดอง+ ($2,000+)",
    sal70: "💰 ตั้งแต่ 70 ล้านดอง+ ($2,800+)",
    sal100: "💰 มากกว่า 100 ล้านดอง+ ($4,000+)",
    lvlAll: "👔 ระดับตำแหน่ง: ทั้งหมด",
    lvlSenior: "👑 ผู้บริหารระดับสูง (C-Level / Director)",
    lvlMiddle: "🎯 ผู้จัดการระดับกลาง (Head / Manager)",
    lvlSaved: "⭐ งานที่บันทึกไว้",
    dateAny: "📅 วันที่ลงประกาศ: ทุกช่วงเวลา",
    dateToday: "📅 ลงประกาศวันนี้ / 48 ชม.",
    date3d: "📅 ในช่วง 3 วันที่ผ่านมา",
    date7d: "📅 ในช่วง 7 วันที่ผ่านมา",
    sortVip: "👑 จัดลำดับบัญชี VIP (Diamond → Standard)",
    trendingLabel: "🔥 คำค้นหายอดนิยม (Trending):",
    trAi: "🤖 AI & คลาวด์",
    trCfo: "🏦 ผู้อำนวยการฝ่ายการเงิน CFO",
    trFdi: "🏭 การผลิต FDI & อิเล็กทรอนิกส์",
    trEsg: "🌱 พลังงานสีเขียว ESG",
    trLog: "🚢 ซัพพลายเชน & โลจิสติกส์",
    trHcmc: "📍 โฮจิมินห์",
    trHanoi: "📍 ฮานอย",
    trBinhDuong: "📍 บิ่ญเซือง VSIP",
    trBacNinh: "📍 บั๊กนิญ",
    liveBoardTitle: "LIVE JOB BOARD • กระดานงานออนไลน์แบบเรียลไทม์",
    liveBoardSub: "อัปเดตสดจาก 6 กลุ่มบริษัทชั้นนำ & 12 เขตเศรษฐกิจ",
    colPosition: "ตำแหน่งงาน (Position)",
    colLocation: "พื้นที่ (Location)",
    colSalary: "เงินเดือน (Salary)",
    colCompany: "องค์กร (Company)",
    colStatus: "สถานะ",
    trust1Prefix: "มากกว่า",
    trust1Bold: "ตำแหน่งผู้บริหาร",
    trust1Suffix: "ใน 63 จังหวัด & อาเซียน",
    trust2Bold: "เรซูเม่เดียวใช้ได้ทุกงาน",
    trust2Suffix: "— สมัครงานได้ทันทีในคลิกเดียว",
    trust3Bold: "AI คัดกรองและสัมภาษณ์",
    trust3Suffix: "แจ้งผลทันทีตลอด 24/7",
    trust4Prefix: "ออกแบบมาตรฐานสำหรับ",
    trust4Bold: "ผู้สมัครคุณภาพ & องค์กร B2B",
    seekerBadge: "สำหรับผู้หางานและผู้เชี่ยวชาญ",
    seekerTitle: "อัปโหลด CV ของคุณและสมัครงานได้ในคลิกเดียว",
    seekerDesc: "AI ให้คะแนนความเหมาะสม 4 ด้านโดยอัตโนมัติและเชิญสัมภาษณ์ออนไลน์ทันที",
    seekerBtnCv: "📄 สร้างโปรไฟล์ CV",
    seekerBtnCalc: "🧮 คำนวณเงินเดือน Gross-Net",
    empBadge: "สำหรับองค์กรผู้ว่าจ้าง B2B",
    empTitle: "ค้นหาบุคลากรคุณภาพและรับเรซูเม่จากผู้สมัครที่ตรงสาย",
    empDesc: "ลงประกาศงานทันที หรือเปิดพื้นที่บริหารงานบุคคล ATS แยกเฉพาะองค์กร",
    empBtnPost: "📢 ลงประกาศงานทันที",
    empBtnAts: "🏢 ระบบสำหรับองค์กร",
    viewGridBtn: "📰 มุมมองตาราง + หมวดหมู่ด้านข้าง",
    vipPinnedSuffix: " • 📌 ปักหมุดบนสุด",
    daysAgoSuffix: "วันที่แล้ว",
    gridHeading: "🔥 งานมาใหม่ & ตำแหน่งผู้บริหาร",
    gridSwitchSplit: "สลับไปมุมมอง 360° Split-View →",
    gridRoleDescPrefix: "รับผิดชอบการวางแผนกลยุทธ์ บริหาร KPI/OKR และนำทีมผู้เชี่ยวชาญที่",
    gridViewDetails: "ดูรายละเอียด →",
    sidebarCatTitle: "📂 งานตามหมวดหมู่อาชีพ",
    sidebarLocTitle: "📍 พื้นที่ยอดนิยม",
    sidebarAddLoc: "+ เพิ่ม",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 องค์กรชั้นนำที่กำลังเปิดรับสมัครงาน",
    featEmpViewAllPrefix: "ดูทั้งหมด",
    featEmpViewAllSuffix: "กลุ่มบริษัท & B2B Workspace →",
    tenantCodeLabel: "รหัสองค์กร:",
    featEmpDescPrefix: "องค์กรสมาชิกบนเครือข่าย HireMind Global Cloud กำลังเปิดรับ",
    featEmpDescBold: "ตำแหน่งผู้บริหารและผู้เชี่ยวชาญ",
    featEmpDescSuffix: "พร้อมระบบสัมภาษณ์ AI อัตโนมัติ",
    openJobsCountLabel: "ตำแหน่งที่เปิดรับ:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 หางานตามภูมิภาคและนิคมอุตสาหกรรมสำคัญ",
    regHubSub: "เลือกเมือง จังหวัด หรือนิคมอุตสาหกรรม (VSIP, High-Tech Park) หรือเพิ่มพื้นที่ใหม่",
    rgAll: "🌐 ทั่วประเทศ & อาเซียน",
    rgNorth: "🏛️ ภาคเหนือ",
    rgCentral: "🌊 ภาคกลาง",
    rgSouth: "🏙️ ภาคใต้",
    rgIntl: "✈️ ต่างประเทศ & Remote",
    jobsCountUnit: "อัตรา",
    expandProvLabel: "เพิ่มจังหวัดอุตสาหกรรมอื่นๆ อย่างรวดเร็ว:",
    expandProvBtnPrefix: "+ งานที่",
    viewAllVnJobs: "ดูงานทั้งหมดในเวียดนาม →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 หางานตามสายอาชีพและอุตสาหกรรม",
    catMatrixViewAll: "ดูรายละเอียดกรอบทักษะและฐานเงินเดือน 10 อุตสาหกรรม →",
    catSalaryRange: "เงินเดือน: 45 - 140 ล้านดอง",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ 5 ขั้นตอนการหางานและสมัครงานอัจฉริยะด้วย AI",
    howSub: "ตั้งแต่สร้างโปรไฟล์จนถึงวันแรกของการเริ่มงานกับบริษัทชั้นนำ",
    howBtnStart: "🚀 เริ่มสร้างโปรไฟล์ทันที",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "สร้างเรซูเม่ CV ครั้งเดียว", desc: "อัปโหลดไฟล์ PDF/DOCX เพียงครั้งเดียวเพื่อใช้สมัครได้ทุกตำแหน่งงาน" },
      { step: "Step 2", icon: "🔍", title: "กรองงานอย่างชาญฉลาด", desc: "ค้นหาตาม 10 อุตสาหกรรมหลัก 63 จังหวัด นิคมฯ และเงินเดือนที่ต้องการ" },
      { step: "Step 3", icon: "⚡", title: "สมัครงานในคลิกเดียว", desc: "ส่งข้อมูลตรงเข้าสู่ระบบ ATS ที่ปลอดภัยของบริษัทโดยไม่ต้องกรอกซ้ำ" },
      { step: "Step 4", icon: "🤖", title: "AI ประเมินผล & สัมภาษณ์", desc: "AI วิเคราะห์ทักษะ 4 ด้านและออกรหัสสัมภาษณ์ออนไลน์หลายภาษาให้ทันที" },
      { step: "Step 5", icon: "🎉", title: "รับใบเสนอจ้าง (Offer)", desc: "ติดตามสถานะ 5 ขั้นตอนอย่างโปร่งใสและรับจดหมายเสนองานอย่างเป็นทางการ" },
    ],
    toolsTitle: "🧮 เครื่องมือคำนวณเงินเดือน Gross ⇄ Net & ประเมินศักยภาพ AI 2026",
    toolsSub: "คำนวณประกันสังคม (8%), ประกันสุขภาพ (1.5%), ประกันว่างงาน (1%), ค่าลดหย่อน และภาษีเงินได้บุคคลธรรมดา (PIT) อย่างแม่นยำ",
    toolsBackBtn: "💼 กลับไปหน้าค้นหางาน →",
    toolsParamTitle: "⚙️ พารามิเตอร์คำนวณเงินเดือน Gross ⇄ Net",
    toolsMonthlyIncome: "รายได้ต่อเดือน (VND) *",
    toolsDependents: "จำนวนผู้อยู่ในอุปการะ",
    toolsRegion: "เขตค่าแรงขั้นต่ำ",
    toolsReg1: "เขต 1 (ฮานอย, โฮจิมินห์, ไฮฟอง, บิ่ญเซือง...)",
    toolsReg2: "เขต 2 (ดานัง, เกิ่นเทอ, บั๊กนิญ...)",
    toolsReg3: "เขต 3",
    toolsReg4: "เขต 4",
    toolsBreakdownTitle: "📊 ตารางแจกแจงรายละเอียดเงินเดือน",
    toolsStandardBadge: "มาตรฐานประกันสังคม & ภาษี PIT",
    toolsGrossLbl: "เงินเดือนรวม (GROSS)",
    toolsInsTaxLbl: "ประกันสังคม + ภาษี",
    toolsNetLbl: "เงินเดือนสุทธิ (NET)",
    toolsRow1: "1. เงินเดือน Gross",
    toolsRowBhxh: "• ประกันสังคม (BHXH 8%)",
    toolsRowBhyt: "• ประกันสุขภาพ (BHYT 1.5%)",
    toolsRowBhtn: "• ประกันการว่างงาน (BHTN 1%)",
    toolsRow2: "2. รายได้ก่อนหักภาษี",
    toolsRowPersonalDed: "• ค่าลดหย่อนส่วนบุคคล",
    toolsRowDepDedPrefix: "• ค่าลดหย่อนผู้มีภาระพึ่งพิง",
    toolsRowDepUnit: "คน",
    toolsRow3: "3. รายได้สุทธิที่ต้องเสียภาษี",
    toolsRow4: "4. ภาษีเงินได้บุคคลธรรมดา (PIT ขั้นบันได)",
    toolsRow5: "5. เงินเดือนรับจริง (NET โอนเข้าบัญชี)",
    qfTitle: "⚡ Quick Find • นำทางด่วน",
    qfSub: "ข้ามไปยังส่วนต่างๆ ของหน้าเว็บทันที",
    qf1: "🔍 ค้นหาและตัวกรองขั้นสูง",
    qf2: "🟢 กระดานงานออนไลน์ (Live)",
    qf3: "💼 รายการงาน & วิเคราะห์ AI",
    qf4: "🏢 องค์กรชั้นนำที่กำลังเปิดรับ",
    qf5: "📍 งานตาม 63 จังหวัด & นิคมฯ",
    qf6: "📊 10 หมวดหมู่อุตสาหกรรม",
    qf7: "➕ เพิ่ม / จัดการพื้นที่รับสมัครงาน",
    qf8: "🧮 คำนวณเงินเดือน Gross ⇄ Net",
    qfBtn: "Quick Find",
    chatTitle: "ผู้ช่วย AI บริการลูกค้า 24/7 — HireMind",
    chatSub: "ช่วยเหลือผู้สมัคร บริษัท และผู้ลงโฆษณา VIP ทันที",
    chatChip1: "👑 แพ็กเกจ VIP & ราคาป้ายโฆษณา",
    chatChip2: "📄 วิธีสมัครงานด้วย 1-Click CV",
    chatChip3: "🧮 วิธีคำนวณเงินเดือน Gross → Net",
    chatChip4: "📞 ติดต่อสายด่วนบริการลูกค้า",
    chatWelcome: "สวัสดีครับ! ผมคือ <b>ผู้เชี่ยวชาญ AI บริการลูกค้า 24/7</b> ของ <b>HireMind Global</b> พร้อมช่วยเหลือคุณในเรื่อง:<br/>• ค้นหาตำแหน่งงานผู้บริหารและผู้เชี่ยวชาญรายได้สูง<br/>• <b>การอัปเกรดบัญชี VIP และการลงป้ายโฆษณาด้านซ้าย/ขวา</b><br/>• ขั้นตอนการสัมภาษณ์ AI หลายภาษาและการคำนวณเงินเดือน Gross-Net",
    chatPlaceholder: "พิมพ์คำถามของคุณ (เช่น ราคาป้ายโฆษณา, การส่งเรซูเม่...)",
    chatSend: "ส่ง",
    chatFloatBtn: "แชทบริการ 24/7",
  },
  lo: {
    vipBtnShort: "VIP & ໂຄສະນາ",
    vipBtnTitle: "ເບິ່ງກົນໄກບູລິມະສິດບັນຊີ VIP ແລະ ລາຄາປ້າຍໂຄສະນາ",
    megaCatTitle: "📂 ສຳຫຼວດ 10 ຂະແໜງອຸດສາຫະກຳຫຼັກ",
    megaCatViewAll: "ເບິ່ງຕາຕະລາງເງິນເດືອນທຸກຂະແໜງ →",
    megaCatSenior: "👑 ຜູ້ບໍລິຫານລະດັບສູງ (C-Level / Director)",
    megaCatMiddle: "🎯 ຜູ້ຈັດການລະດັບກາງ (Head / Manager)",
    megaCatReset: "↺ ລ້າງຕົວກອງ",
    megaLocTitle: "📍 ເຂດເສດຖະກິດ ແລະ ນິຄົມອຸດສາຫະກຳຈຸດສຸມ",
    megaLocManage: "➕ ເພີ່ມ / ຈັດການພື້ນທີ່ →",
    authLogin: "ເຂົ້າສູ່ລະບົບ",
    authEmployer: "ສຳລັບບໍລິສັດ",
    authVipCandidate: "ຜູ້ສະໝັກ VIP",
    authMyApps: "ຊີວະປະຫວັດ ແລະ ຄວາມຄືບໜ້າ",
    authUpdateCv: "ອັບເດດຊີວະປະຫວັດ 1-Click CV",
    authSwitchSso: "ປ່ຽນບັນຊີ / SSO →",
    authLogoutCandidate: "ອອກຈາກລະບົບ",
    authOpenAts: "ເປີດລະບົບຄຸ້ມຄອງ ATS ວິສາຫະກິດ →",
    authSwitchTenant: "ປ່ຽນ Tenant ອົງກອນ",
    authB2bSso: "ປະຕູເຂົ້າສູ່ລະບົບ B2B / SSO",
    authLogoutEmp: "ອອກຈາກລະບົບ",
    heroAiBadge: "🔥 100% AI Matching & ສຳພາດຫຼາຍພາສາ 24/7",
    statLocations: "ພື້ນທີ່ / ແຂວງ",
    btnPostJobHero: "ປະກາດຮັບສະໝັກງານ",
    btnSsoHero: "ເຂົ້າສູ່ລະບົບ / SSO",
    searchPlaceholder: "🔍 ຕຳແໜ່ງ, ທັກສະ, ຄຳຄົ້ນຫາ ຫຼື ຊື່ບໍລິສັດ...",
    allLocationsOpt: "📍 ທັງໝົດ 63 ແຂວງ ແລະ ນິຄົມອຸດສາຫະກຳ",
    btnFindJobs: "ຊອກວຽກ",
    salAll: "💰 ເງິນເດືອນ: ທັງໝົດ (₫0 - ₫150M+)",
    sal30: "💰 ແຕ່ 30 ລ້ານດົງ+ ($1,200+)",
    sal50: "💰 ແຕ່ 50 ລ້ານດົງ+ ($2,000+)",
    sal70: "💰 ແຕ່ 70 ລ້ານດົງ+ ($2,800+)",
    sal100: "💰 ຫຼາຍກວ່າ 100 ລ້ານດົງ+ ($4,000+)",
    lvlAll: "👔 ລະດັບຊັ້ນ: ທຸກຕຳແໜ່ງ",
    lvlSenior: "👑 ຜູ້ບໍລິຫານລະດັບສູງ (C-Level / Director)",
    lvlMiddle: "🎯 ຜູ້ຈັດການລະດັບກາງ (Head / Manager)",
    lvlSaved: "⭐ ວຽກທີ່ບັນທຶກໄວ້",
    dateAny: "📅 ວັນທີປະກາດ: ທຸກເວລາ",
    dateToday: "📅 ປະກາດມື້ນີ້ / 48 ຊົ່ວໂມງ",
    date3d: "📅 ໃນ 3 ວັນຜ່ານມາ",
    date7d: "📅 ໃນ 7 ວັນຜ່ານມາ",
    sortVip: "👑 ບູລິມະສິດບັນຊີ VIP (Diamond → Standard)",
    trendingLabel: "🔥 ທ່າອ່ຽງການຄົ້ນຫາ (Trending):",
    trAi: "🤖 AI & ຄລາວ",
    trCfo: "🏦 ຜູ້ອຳນວຍການຝ່າຍການເງິນ CFO",
    trFdi: "🏭 ການຜະລິດ FDI & ອີເລັກໂທຣນິກ",
    trEsg: "🌱 ພະລັງງານສີຂຽວ ESG",
    trLog: "🚢 ຕ່ອງໂສ້ການສະໜອງ & ໂລຈິສຕິກ",
    trHcmc: "📍 ໂຮ່ຈີມິນ",
    trHanoi: "📍 ຮ່າໂນ້ຍ",
    trBinhDuong: "📍 ບິ່ງເຢືອງ",
    trBacNinh: "📍 ບັກນິງ",
    liveBoardTitle: "LIVE JOB BOARD • ກະດານຂ່າວວຽກເຮັດງານທຳອອນລາຍ",
    liveBoardSub: "ອັບເດດເວລາຈິງຈາກ 6 ກຸ່ມບໍລິສັດ & 12 ເຂດເສດຖະກິດ",
    colPosition: "ຕຳແໜ່ງວຽກ (Position)",
    colLocation: "ພື້ນທີ່ (Location)",
    colSalary: "ເງິນເດືອນ (Salary)",
    colCompany: "ວິສາຫະກິດ (Company)",
    colStatus: "ສະຖານະ",
    trust1Prefix: "ຫຼາຍກວ່າ",
    trust1Bold: "ຕຳແໜ່ງຜູ້ບໍລິຫານ",
    trust1Suffix: "ຢູ່ 63 ແຂວງ ແລະ ອາຊຽນ",
    trust2Bold: "ຊີວະປະຫວັດ CV ດຽວ",
    trust2Suffix: "— ສະໝັກທຸກວຽກດ້ວຍການຄລິກດຽວ",
    trust3Bold: "AI ຄັດກອງ ແລະ ສຳພາດ",
    trust3Suffix: "ແຈ້ງຜົນທັນທີ 24/7",
    trust4Prefix: "ອອກແບບມາດຕະຖານສຳລັບທັງ",
    trust4Bold: "ຜູ້ສະໝັກຄຸນນະພາບ ແລະ ວິສາຫະກິດ B2B",
    seekerBadge: "ສຳລັບຜູ້ສະໝັກ ແລະ ຊ່ຽວຊານ",
    seekerTitle: "ອັບໂຫຼດ CV ຂອງທ່ານ ແລະ ສະໝັກວຽກດ້ວຍການຄລິກດຽວ",
    seekerDesc: "AI ໃຫ້ຄະແນນຄວາມເໝາະສົມ 4 ດ້ານໂດຍອັດຕະໂນມັດ ແລະ ເຊີນສຳພາດອອນລາຍທັນທີ.",
    seekerBtnCv: "📄 ສ້າງຊີວະປະຫວັດ CV",
    seekerBtnCalc: "🧮 ຄິດໄລ່ເງິນເດືອນ Gross-Net",
    empBadge: "ສຳລັບຜູ້ໃຊ້ແຮງງານ B2B",
    empTitle: "ຊອກຫາຜູ້ມີຄວາມສາມາດ ແລະ ຮັບຊີວະປະຫວັດຈາກຜູ້ສະໝັກທີ່ດີເລີດ",
    empDesc: "ປະກາດຮັບສະໝັກງານທັນທີ ຫຼື ເປີດພື້ນທີ່ຄຸ້ມຄອງ ATS ສະເພາະອົງກອນ.",
    empBtnPost: "📢 ປະກາດຮັບສະໝັກທັນທີ",
    empBtnAts: "🏢 ໜ້າບໍລິສັດ B2B",
    viewGridBtn: "📰 ຕາຕະລາງ + ຖັນໝວດໝູ່",
    vipPinnedSuffix: " • 📌 ປັກໝຸດຫົວໜ້າ",
    daysAgoSuffix: "ມື້ກ່ອນ",
    gridHeading: "🔥 ວຽກໃໝ່ລ່າສຸດ & ຕຳແໜ່ງຜູ້ບໍລິຫານ",
    gridSwitchSplit: "ປ່ຽນເປັນໂໝດ Split-View 360° →",
    gridRoleDescPrefix: "ຮັບຜິດຊອບການວາງແຜນຍຸດທະສາດ, ບໍລິຫານ KPI/OKR ແລະ ນຳພາທີມຊ່ຽວຊານທີ່",
    gridViewDetails: "ລາຍລະອຽດ →",
    sidebarCatTitle: "📂 ອາຊີບຕາມໝວດໝູ່",
    sidebarLocTitle: "📍 ພື້ນທີ່ຍອດນິຍົມ",
    sidebarAddLoc: "+ ເພີ່ມ",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 ບໍລິສັດຊັ້ນນຳທີ່ກຳລັງເປີດຮັບສະໝັກງານ",
    featEmpViewAllPrefix: "ເບິ່ງທັງໝົດ",
    featEmpViewAllSuffix: "ກຸ່ມບໍລິສັດ & Workspace B2B →",
    tenantCodeLabel: "ລະຫັດ Tenant:",
    featEmpDescPrefix: "ບໍລິສັດສະມາຊິກໃນເຄືອຂ່າຍ HireMind Global Cloud. ກຳລັງເປີດຮັບ",
    featEmpDescBold: "ຕຳແໜ່ງຜູ້ບໍລິຫານ ແລະ ຊ່ຽວຊານ",
    featEmpDescSuffix: "ດ້ວຍຂະບວນການສຳພາດ AI ອັດຕະໂນມັດ.",
    openJobsCountLabel: "ວຽກທີ່ກຳລັງເປີດ:",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 ວຽກເຮັດງານທຳຕາມພາກພື້ນ ແລະ ນິຄົມອຸດສາຫະກຳຈຸດສຸມ",
    regHubSub: "ເລືອກເມືອງ, ແຂວງ ຫຼື ນິຄົມອຸດສາຫະກຳ (VSIP, High-Tech) ຫຼື ເພີ່ມພື້ນທີ່ໃໝ່.",
    rgAll: "🌐 ທົ່ວປະເທດ & ອາຊຽນ",
    rgNorth: "🏛️ ພາກເໜືອ",
    rgCentral: "🌊 ພາກກາງ",
    rgSouth: "🏙️ ພາກໃຕ້",
    rgIntl: "✈️ ສາກົນ & Remote",
    jobsCountUnit: "ວຽກ",
    expandProvLabel: "ເພີ່ມແຂວງອຸດສາຫະກຳອື່ນໆຢ່າງວ່ອງໄວ:",
    expandProvBtnPrefix: "+ ວຽກຢູ່",
    viewAllVnJobs: "ເບິ່ງວຽກທັງໝົດໃນຫວຽດນາມ →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 ວຽກເຮັດງານທຳຕາມຂະແໜງວິຊາຊີບ",
    catMatrixViewAll: "ເບິ່ງລາຍລະອຽດກອບຄວາມສາມາດ ແລະ ເງິນເດືອນ 10 ຂະແໜງ →",
    catSalaryRange: "ເງິນເດືອນ: 45 - 140 ລ້ານດົງ",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ ຂັ້ນຕອນ 5 ບາດກ້າວຊອກວຽກ ແລະ ສະໝັກວຽກອັດສະລິຍະ",
    howSub: "ຕັ້ງແຕ່ສ້າງຊີວະປະຫວັດຈົນເຖິງມື້ທຳອິດຂອງການເຮັດວຽກຢູ່ບໍລິສັດຊັ້ນນຳ",
    howBtnStart: "🚀 ເລີ່ມສ້າງຊີວະປະຫວັດທັນທີ",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "ສ້າງຊີວະປະຫວັດ CV 1 ຄັ້ງ", desc: "ອັບໂຫຼດໄຟລ໌ PDF/DOCX ພຽງຄັ້ງດຽວເພື່ອໃຊ້ສະໝັກທຸກຕຳແໜ່ງ." },
      { step: "Step 2", icon: "🔍", title: "ກອງວຽກຢ່າງສະຫຼາດ", desc: "ກອງຕາມ 10 ຂະແໜງຫຼັກ, 63 ແຂວງ, ນິຄົມອຸດສາຫະກຳ ແລະ ເງິນເດືອນ." },
      { step: "Step 3", icon: "⚡", title: "ສະໝັກວຽກດ້ວຍ 1 ຄລິກ", desc: "ສົ່ງຂໍ້ມູນກົງເຂົ້າສູ່ລະບົບ ATS ທີ່ປອດໄພຂອງບໍລິສັດໂດຍບໍ່ຕ້ອງປ້ອນໃໝ່." },
      { step: "Step 4", icon: "🤖", title: "AI ໃຫ້ຄະແນນ & ສຳພາດ", desc: "AI ປະເມີນ 4 ດ້ານ ແລະ ອອກລະຫັດສຳພາດອອນລາຍຫຼາຍພາສາທັນທີ." },
      { step: "Step 5", icon: "🎉", title: "ຮັບ Offer & ເລີ່ມວຽກ", desc: "ຕິດຕາມຄວາມຄືບໜ້າ 5 ຮອບຢ່າງໂປ່ງໃສ ແລະ ຮັບຈົດໝາຍເຊີນເຮັດວຽກ." },
    ],
    toolsTitle: "🧮 ເຄື່ອງມືຄິດໄລ່ເງິນເດືອນ Gross ⇄ Net & ປະເມີນຄ່າ AI 2026",
    toolsSub: "ຄິດໄລ່ປະກັນສັງຄົມ (8%), ປະກັນສຸຂະພາບ (1.5%), ປະກັນຫວ່າງງານ (1%), ຄ່າຫຼຸດຜ່ອນຄອບຄົວ ແລະ ອາກອນລາຍໄດ້ບຸກຄົນ (PIT) ຢ່າງຖືກຕ້ອງ.",
    toolsBackBtn: "💼 ກັບຄືນໜ້າຊອກວຽກ →",
    toolsParamTitle: "⚙️ พารามิเตอร์ຄິດໄລ່ເງິນເດືອນ Gross ⇄ Net",
    toolsMonthlyIncome: "ລາຍຮັບຕໍ່ເດືອນ (VND) *",
    toolsDependents: "ຈຳນວນຜູ້ເพິ່ງພາ",
    toolsRegion: "ເຂດເງິນເດືອນຂັ້ນຕ່ຳ",
    toolsReg1: "ເຂດ I (ຮ່າໂນ້ຍ, ໂຮ່ຈີມິນ, ໄຮ່ຟອງ, ບິ່ງເຢືອງ...)",
    toolsReg2: "ເຂດ II (ດານັງ, ເກິ່ນເທີ, ບັກນິງ...)",
    toolsReg3: "ເຂດ III",
    toolsReg4: "ເຂດ IV",
    toolsBreakdownTitle: "📊 ຕາຕະລາງລາຍລະອຽດເງິນເດືອນ",
    toolsStandardBadge: "ມາດຕະຖານປະກັນສັງຄົມ & ອາກອນ PIT",
    toolsGrossLbl: "ເງິນເດືອນລວມ (GROSS)",
    toolsInsTaxLbl: "ປະກັນສັງຄົມ + ອາກອນ",
    toolsNetLbl: "ເງິນເດືອນຕົວຈິງ (NET)",
    toolsRow1: "1. ເງິນເດືອນ Gross",
    toolsRowBhxh: "• ປະກັນສັງຄົມ (BHXH 8%)",
    toolsRowBhyt: "• ປະກັນສຸຂະພາບ (BHYT 1.5%)",
    toolsRowBhtn: "• ປະກັນຫວ່າງງານ (BHTN 1%)",
    toolsRow2: "2. ລາຍຮັບກ່ອນຫັກອາກອນ",
    toolsRowPersonalDed: "• ຄ່າຫຼຸດຜ່ອນສ່ວນບຸກຄົນ",
    toolsRowDepDedPrefix: "• ຄ່າຫຼຸດຜ່ອນຜູ້ເພິ່ງພາ",
    toolsRowDepUnit: "ຄົນ",
    toolsRow3: "3. ລາຍຮັບທີ່ຕ້ອງເສຍອາກອນ",
    toolsRow4: "4. ອາກອນລາຍໄດ້ສ່ວນບຸກຄົນ (PIT)",
    toolsRow5: "5. ເງິນເດືອນ NET ຕົວຈິງ (ໂອນເຂົ້າບັນຊີ)",
    qfTitle: "⚡ Quick Find • ນຳທາງດ່ວນ",
    qfSub: "ໂດດໄປຫາພາກສ່ວນຕ່າງໆຂອງໜ້າເວັບ",
    qf1: "🔍 ຄົ້ນຫາ ແລະ ຕົວກອງຂັ້ນສູງ",
    qf2: "🟢 ກະດານວຽກອອນລາຍ (Live)",
    qf3: "💼 ລາຍການວຽກ & ບົດລາຍງານ AI",
    qf4: "🏢 ບໍລິສັດຊັ້ນນຳທີ່ກຳລັງຮັບສະໝັກ",
    qf5: "📍 ວຽກຕາມ 63 ແຂວງ & ນິຄົມອຸດສາຫະກຳ",
    qf6: "📊 10 ຂະແໜງວິຊາຊີບ",
    qf7: "➕ ເພີ່ມ / ຈັດການພື້ນທີ່ຮັບສະໝັກ",
    qf8: "🧮 ເຄື່ອງມືຄິດໄລ່ເງິນເດືອນ Gross ⇄ Net",
    qfBtn: "Quick Find",
    chatTitle: "ຜູ້ຊ່ວຍ AI ບໍລິການລູກຄ້າ 24/7 — HireMind",
    chatSub: "ຊ່ວຍເຫຼືອຜູ້ສະໝັກ, ບໍລິສັດ ແລະ ໂຄສະນາ VIP ທັນທີ",
    chatChip1: "👑 ແພັກເກັດ VIP & ລາຄາປ້າຍໂຄສະນາ",
    chatChip2: "📄 ວິທີສະໝັກວຽກດ້ວຍ 1-Click CV",
    chatChip3: "🧮 ວິທີຄິດໄລ່ເງິນເດືອນ Gross → Net",
    chatChip4: "📞 ຕິດຕໍ່ສາຍດ່ວນບໍລິການລູກຄ້າ",
    chatWelcome: "ສະບາຍດີ! ຂ້ອຍແມ່ນ <b>ຊ່ຽວຊານ AI ບໍລິການລູກຄ້າ 24/7</b> ຂອງ <b>HireMind Global</b>. ຂ້ອຍສາມາດຊ່ວຍທ່ານກ່ຽວກັບ:<br/>• ຄົ້ນຫາວຽກຜູ້ບໍລິຫານ ແລະ ຊ່ຽວຊານເງິນເດືອນສູງ<br/>• <b>ການອັບເກຣດບັນຊີ VIP ແລະ ການລົງປ້າຍໂຄສະນາຊ້າຍ/ຂວາ</b><br/>• ການສຳພາດ AI ຫຼາຍພາສາ ແລະ ການຄິດໄລ່ເງິນເດືອນ Gross-Net.",
    chatPlaceholder: "ພິມຄຳຖາມທີ່ຕ້ອງການຊ່ວຍເຫຼືອ (ຕົວຢ່າງ: ລາຄາປ້າຍໂຄສະນາ, ສົ່ງ CV...)",
    chatSend: "ສົ່ງ",
    chatFloatBtn: "ແຊັດບໍລິການ 24/7",
  },
  km: {
    vipBtnShort: "VIP & ពាណិជ្ជកម្ម",
    vipBtnTitle: "មើលយន្តការអាទិភាពគណនី VIP និងតម្លៃផ្ទាំងពាណិជ្ជកម្ម",
    megaCatTitle: "📂 ស្វែងយល់ពីវិស័យឧស្សាហកម្មស្នូលទាំង 10",
    megaCatViewAll: "មើលតារាងប្រាក់ខែគ្រប់វិស័យ →",
    megaCatSenior: "👑 ថ្នាក់ដឹកនាំជាន់ខ្ពស់ (C-Level / Director)",
    megaCatMiddle: "🎯 អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល (Head / Manager)",
    megaCatReset: "↺ កំណត់តម្រងឡើងវិញ",
    megaLocTitle: "📍 តំបន់សេដ្ឋកិច្ច និងតំបន់ឧស្សាហកម្មសំខាន់ៗ",
    megaLocManage: "➕ បន្ថែម / គ្រប់គ្រងតំបន់ →",
    authLogin: "ចូលគណនី",
    authEmployer: "សម្រាប់ក្រុមហ៊ុន",
    authVipCandidate: "បេក្ខជន VIP",
    authMyApps: "ប្រវត្តិរូប និងវឌ្ឍនភាពដាក់ពាក្យ",
    authUpdateCv: "ធ្វើបច្ចុប្បន្នភាព 1-Click CV",
    authSwitchSso: "ប្តូរគណនី / SSO →",
    authLogoutCandidate: "ចាកចេញ",
    authOpenAts: "បើកប្រព័ន្ធគ្រប់គ្រង ATS សហគ្រាស →",
    authSwitchTenant: "ប្តូរ Tenant ស្ថាប័ន",
    authB2bSso: "ផតថលចូលគណនី B2B / SSO",
    authLogoutEmp: "ចាកចេញ",
    heroAiBadge: "🔥 100% AI Matching & សម្ភាសន៍ពហុភាសា 24/7",
    statLocations: "តំបន់ / ខេត្ត",
    btnPostJobHero: "ប្រកាសជ្រើសរើសបុគ្គលិក",
    btnSsoHero: "ចូលគណនី / SSO",
    searchPlaceholder: "🔍 មុខតំណែង ជំនាញ ពាក្យគន្លឹះ ឬឈ្មោះក្រុមហ៊ុន...",
    allLocationsOpt: "📍 ទូទាំង 63 ខេត្ត/ក្រុង និងតំបន់ឧស្សាហកម្ម",
    btnFindJobs: "ស្វែងរកការងារ",
    salAll: "💰 ប្រាក់ខែ៖ ទាំងអស់ (₫0 - ₫150M+)",
    sal30: "💰 ចាប់ពី 30 លានដុង+ ($1,200+)",
    sal50: "💰 ចាប់ពី 50 លានដុង+ ($2,000+)",
    sal70: "💰 ចាប់ពី 70 លានដុង+ ($2,800+)",
    sal100: "💰 លើសពី 100 លានដុង+ ($4,000+)",
    lvlAll: "👔 លំដាប់ថ្នាក់៖ គ្រប់មុខតំណែង",
    lvlSenior: "👑 ថ្នាក់ដឹកនាំជាន់ខ្ពស់ (C-Level / Director)",
    lvlMiddle: "🎯 អ្នកគ្រប់គ្រងថ្នាក់កណ្តាល (Head / Manager)",
    lvlSaved: "⭐ ការងារដែលបានរក្សាទុក",
    dateAny: "📅 ថ្ងៃប្រកាស៖ គ្រប់ពេល",
    dateToday: "📅 ប្រកាសថ្ងៃនេះ / 48 ម៉ោង",
    date3d: "📅 ក្នុងរយៈពេល 3 ថ្ងៃមុន",
    date7d: "📅 ក្នុងរយៈពេល 7 ថ្ងៃមុន",
    sortVip: "👑 អាទិភាពគណនី VIP (Diamond → Standard)",
    trendingLabel: "🔥 និន្នាការស្វែងរក (Trending):",
    trAi: "🤖 AI & Cloud",
    trCfo: "🏦 នាយកហិរញ្ញវត្ថុ CFO",
    trFdi: "🏭 ផលិតកម្ម FDI & អេឡិចត្រូនិក",
    trEsg: "🌱 ថាមពលបៃតង ESG",
    trLog: "🚢 ខ្សែសង្វាក់ផ្គត់ផ្គង់ & ឡូជីស្ទីក",
    trHcmc: "📍 ទីក្រុងហូជីមិញ",
    trHanoi: "📍 ទីក្រុងហាណូយ",
    trBinhDuong: "📍 ប៊ិញយឿង",
    trBacNinh: "📍 បាក់និញ",
    liveBoardTitle: "LIVE JOB BOARD • តារាងការងារអនឡាញផ្ទាល់",
    liveBoardSub: "ធ្វើបច្ចុប្បន្នភាពផ្ទាល់ពីសម្ព័ន្ធក្រុមហ៊ុនទាំង 6 និងតំបន់សេដ្ឋកិច្ច 12",
    colPosition: "មុខតំណែង (Position)",
    colLocation: "តំបន់ (Location)",
    colSalary: "ប្រាក់ខែ (Salary)",
    colCompany: "សហគ្រាស (Company)",
    colStatus: "ស្ថានភាព",
    trust1Prefix: "ជាង",
    trust1Bold: "មុខតំណែងគ្រប់គ្រង",
    trust1Suffix: "នៅ 63 ខេត្ត/ក្រុង និងអាស៊ាន",
    trust2Bold: "ប្រវត្តិរូប CV តែមួយគត់",
    trust2Suffix: "— ដាក់ពាក្យគ្រប់ការងារដោយចុចតែម្តង",
    trust3Bold: "AI คัดกรอง និងសម្ភាសន៍",
    trust3Suffix: "ជូនដំណឹងលទ្ធផលភ្លាមៗ 24/7",
    trust4Prefix: "រចនាឡើងសម្រាប់ទាំង",
    trust4Bold: "បេក្ខជនឆ្នើម និងសហគ្រាស B2B",
    seekerBadge: "សម្រាប់បេក្ខជន និងអ្នកជំនាញ",
    seekerTitle: "បង្ហោះ CV របស់អ្នក ហើយដាក់ពាក្យដោយចុចតែម្តង",
    seekerDesc: "AI ដាក់ពិន្ទុភាពស៊ីគ្នាទាំង 4 សសរស្តម្ភដោយស្វ័យប្រវត្តិ និងអញ្ជើញសម្ភាសន៍ភ្លាមៗ។",
    seekerBtnCv: "📄 បង្កើតប្រវត្តិរូប CV",
    seekerBtnCalc: "🧮 គណនាប្រាក់ខែ Gross-Net",
    empBadge: "សម្រាប់និយោជក B2B",
    empTitle: "ស្វែងរកអ្នកមានទេពកោសល្យ និងទទួល CV ពីបេក្ខជនឆ្នើម",
    empDesc: "ប្រកាសជ្រើសរើសបុគ្គលិកភ្លាមៗ ឬបង្កើតប្រព័ន្ធគ្រប់គ្រង ATS ដាច់ដោយឡែក។",
    empBtnPost: "📢 ប្រកាសការងារឥឡូវនេះ",
    empBtnAts: "🏢 ទំព័រនិយោជក B2B",
    viewGridBtn: "📰 ក្រឡាចត្រង្គ + របារចំហៀង",
    vipPinnedSuffix: " • 📌 ខ្ទាស់លើគេ",
    daysAgoSuffix: "ថ្ងៃមុន",
    gridHeading: "🔥 ការងារថ្មីៗ និងមុខតំណែងគ្រប់គ្រង",
    gridSwitchSplit: "ប្តូរទៅទិដ្ឋភាព Split-View 360° →",
    gridRoleDescPrefix: "ទទួលผิดត្រូវការរៀបចំផែនការយុទ្ធសាស្ត្រ ប្រតិបត្តិការ KPI/OKR និងដឹកនាំក្រុមអ្នកជំនាញនៅ",
    gridViewDetails: "ព័ត៌មានលម្អិត →",
    sidebarCatTitle: "📂 ការងារតាមหมวดหมู่",
    sidebarLocTitle: "📍 តំបន់ពេញនិយម",
    sidebarAddLoc: "+ បន្ថែម",
    featEmpBadge: "TOP VERIFIED ENTERPRISES",
    featEmpTitle: "🏢 សហគ្រាសលេចធ្លោដែលកំពុងជ្រើសរើសបុគ្គលិក",
    featEmpViewAllPrefix: "មើលទាំងអស់",
    featEmpViewAllSuffix: "សម្ព័ន្ធក្រុមហ៊ុន & Workspace B2B →",
    tenantCodeLabel: "លេខកូដ Tenant:",
    featEmpDescPrefix: "សហគ្រាសសមាជិកនៅលើបណ្តាញ HireMind Global Cloud កំពុងបើកជ្រើសរើស",
    featEmpDescBold: "មុខតំណែងគ្រប់គ្រង និងអ្នកជំនាញ",
    featEmpDescSuffix: "ជាមួយដំណើរការសម្ភាសន៍ AI ស្វ័យប្រវត្តិ។",
    openJobsCountLabel: "ការងារកំពុងបើក៖",
    regHubBadge: "VIETNAM 63 PROVINCES & ASEAN HUBS",
    regHubTitle: "📍 ការងារតាមតំបន់ និងតំបន់ឧស្សាហកម្មសំខាន់ៗ",
    regHubSub: "ជ្រើសរើសទីក្រុង ខេត្ត ឬតំបន់ឧស្សាហកម្ម (VSIP, High-Tech) ឬបន្ថែមតំបន់ថ្មី។",
    rgAll: "🌐 ទូទាំងប្រទេស & អាស៊ាន",
    rgNorth: "🏛️ ភាគខាងជើង",
    rgCentral: "🌊 ភាគកណ្តាល",
    rgSouth: "🏙️ ភាគខាងត្បូង",
    rgIntl: "✈️ អន្តរជាតិ & Remote",
    jobsCountUnit: "ការងារ",
    expandProvLabel: "បន្ថែមខេត្តឧស្សាហកម្មផ្សេងទៀតอย่างរហ័ស៖",
    expandProvBtnPrefix: "+ ការងារនៅ",
    viewAllVnJobs: "មើលការងារទាំងអស់នៅវៀតណាម →",
    catMatrixBadge: "OCCUPATION & INDUSTRY DIRECTORY",
    catMatrixTitle: "📊 ការងារតាមវិស័យជំនាញវិជ្ជាជីវៈ",
    catMatrixViewAll: "មើលលម្អិតក្របខ័ណ្ឌសមត្ថភាព និងប្រាក់ខែទាំង 10 វិស័យ →",
    catSalaryRange: "ប្រាក់ខែ៖ 45 - 140 លានដុង",
    howBadge: "HOW HIREMIND GLOBAL WORKS",
    howTitle: "🗺️ ដំណើរការ 5 ជំហានស្វែងរកការងារ និងដាក់ពាក្យឆ្លាតវៃ",
    howSub: "ចាប់ពីการបង្កើតប្រវត្តិរូបរហូតដល់ថ្ងៃដំបូងនៃការចូលធ្វើការនៅក្រុមហ៊ុនឈានមុខ",
    howBtnStart: "🚀 ចាប់ផ្តើមបង្កើតប្រវត្តិរូបឥឡូវនេះ",
    howSteps: [
      { step: "Step 1", icon: "📄", title: "បង្កើតប្រវត្តិរូប CV តែម្តង", desc: "បង្ហោះឯកសារ PDF/DOCX តែម្តងគត់ដើម្បីប្រើសម្រាប់គ្រប់មុខតំណែង។" },
      { step: "Step 2", icon: "🔍", title: "ចម្រាញ់ការងារឆ្លាតវៃ", desc: "ចម្រាញ់តាមវិស័យស្នូលទាំង 10 ខេត្ត/ក្រុង 63 និងប្រាក់ខែរំពឹងទុក។" },
      { step: "Step 3", icon: "⚡", title: "ដាក់ពាក្យដោយចុចតែម្តង", desc: "ប្រវត្តិរូបត្រូវបានបញ្ជូនទៅកាន់ប្រព័ន្ធ ATS សុវត្ថិភាពរបស់ក្រុមហ៊ុនភ្លាមៗ។" },
      { step: "Step 4", icon: "🤖", title: "AI ដាក់ពិន្ទុ & សម្ភាសន៍", desc: "AI វាយតម្លៃសមត្ថភាពទាំង 4 និងផ្តល់លេខកូដសម្ភាសន៍អនឡាញពហុភាសាភ្លាមៗ។" },
      { step: "Step 5", icon: "🎉", title: "ទទួល Offer & ចូលធ្វើការ", desc: "តាមដានវឌ្ឍនភាពទាំង 5 វគ្គដោយតម្លាភាព និងទទួលលិខិតផ្តល់ការងារផ្លូវការ។" },
    ],
    toolsTitle: "🧮 ឧបករណ៍គណនាប្រាក់ខែ Gross ⇄ Net & វាយតម្លៃសមត្ថភាព AI 2026",
    toolsSub: "គណនាធានារ៉ាប់រងសង្គម (8%), សុខភាព (1.5%), ว่างការងារ (1%), ការកាត់បន្ថយគ្រួសារ និងពន្ធលើប្រាក់ចំណូលបុគ្គល (PIT) យ៉ាងត្រឹមត្រូវ។",
    toolsBackBtn: "💼 ត្រឡប់ទៅស្វែងរកការងារ →",
    toolsParamTitle: "⚙️ ប៉ារ៉ាម៉ែត្រគណនាប្រាក់ខែ Gross ⇄ Net",
    toolsMonthlyIncome: "ប្រាក់ចំណូលប្រចាំខែ (VND) *",
    toolsDependents: "ចំនួនអ្នកក្នុងបន្ទុក",
    toolsRegion: "តំបន់ប្រាក់ឈ្នួលអប្បបរមា",
    toolsReg1: "តំបន់ I (ហាណូយ ហូជីមិញ ហាយហ្វុង ប៊ិញយឿង...)",
    toolsReg2: "តំបន់ II (ដាណាំង កឹនថឺ បាក់និញ...)",
    toolsReg3: "តំបន់ III",
    toolsReg4: "តំបន់ IV",
    toolsBreakdownTitle: "📊 តារាងបកស្រាយលម្អិតប្រាក់ខែ",
    toolsStandardBadge: "ស្តង់ដារធានារ៉ាប់រង & ពន្ធ PIT",
    toolsGrossLbl: "ប្រាក់ខែរួម (GROSS)",
    toolsInsTaxLbl: "ធានារ៉ាប់រង + ពន្ធ PIT",
    toolsNetLbl: "ប្រាក់ខែសុទ្ធ (NET)",
    toolsRow1: "1. ប្រាក់ខែ Gross",
    toolsRowBhxh: "• ធានារ៉ាប់រងសង្គម (BHXH 8%)",
    toolsRowBhyt: "• ធានារ៉ាប់រងសុខភាព (BHYT 1.5%)",
    toolsRowBhtn: "• ធានារ៉ាប់រងว่างការងារ (BHTN 1%)",
    toolsRow2: "2. ប្រាក់ចំណូលមុនបង់ពន្ធ",
    toolsRowPersonalDed: "• ការកាត់បន្ថយផ្ទាល់ខ្លួន",
    toolsRowDepDedPrefix: "• ការកាត់បន្ថយអ្នកក្នុងបន្ទុក",
    toolsRowDepUnit: "នាក់",
    toolsRow3: "3. ប្រាក់ចំណូលជាប់ពន្ធ",
    toolsRow4: "4. ពន្ធលើប្រាក់ចំណូលបុគ្គល (PIT)",
    toolsRow5: "5. ប្រាក់ខែ NET ទទួលបានពិតប្រាកដ",
    qfTitle: "⚡ Quick Find • ការរុករករហ័ស",
    qfSub: "លោតទៅកាន់ផ្នែកនានានៃគេហទំព័រភ្លាមៗ",
    qf1: "🔍 ស្វែងរក និងតម្រងកម្រិតខ្ពស់",
    qf2: "🟢 តារាងការងារអនឡាញផ្ទាល់ (Live)",
    qf3: "💼 បញ្ជីការងារ & របាយការណ៍ AI",
    qf4: "🏢 សហគ្រាសលេចធ្លោ",
    qf5: "📍 ការងារតាម 63 ខេត្ត/ក្រុង & តំបន់ឧស្សាហកម្ម",
    qf6: "📊 វិស័យជំនាញទាំង 10",
    qf7: "➕ បន្ថែម / គ្រប់គ្រងតំបន់ជ្រើសរើស",
    qf8: "🧮 ឧបករណ៍គណនាប្រាក់ខែ Gross ⇄ Net",
    qfBtn: "Quick Find",
    chatTitle: "ជំនួយការ AI បម្រើអតិថិជន 24/7 — HireMind",
    chatSub: "គាំទ្របេក្ខជន និយោជក និងផ្ទាំងពាណិជ្ជកម្ម VIP ភ្លាមៗ",
    chatChip1: "👑 កញ្ចប់ VIP & តម្លៃផ្ទាំងពាណិជ្ជកម្ម",
    chatChip2: "📄 របៀបដាក់ពាក្យដោយ 1-Click CV",
    chatChip3: "🧮 របៀបគណនាប្រាក់ខែ Gross → Net",
    chatChip4: "📞 ភ្ជាប់ទៅកាន់លេខទូរស័ព្ទបន្ទាន់",
    chatWelcome: "សួស្តី! ខ្ញុំគឺជា <b>អ្នកជំនាញ AI បម្រើអតិថិជន 24/7</b> របស់ <b>HireMind Global</b>។ ខ្ញុំអាចជួយអ្នកអំពី៖<br/>• ស្វែងរកការងារគ្រប់គ្រង និងអ្នកជំនាញប្រាក់ខែខ្ពស់<br/>• <b>ការដំឡើងគណនី VIP និងការដាក់ផ្ទាំងពាណិជ្ជកម្មឆ្វេង/ស្តាំ</b><br/>• ការសម្ភាសន៍ AI ពហុភាសា និងការគណនាប្រាក់ខែ Gross-Net។",
    chatPlaceholder: "បញ្ចូលសំណួររបស់អ្នក (ឧ. តម្លៃផ្ទាំងពាណិជ្ជកម្ម ការដាក់ CV...)",
    chatSend: "ផ្ញើ",
    chatFloatBtn: "ជជែក 24/7",
  },
};

function pFull() {
  return PUBLIC_FULL_SECTIONS_I18N[portalState.lang || "vi"] || PUBLIC_FULL_SECTIONS_I18N.vi;
}

function localizePublicStaticWidgets() {
  const pf = pFull();
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  };
  setTxt("mega-cat-title", pf.megaCatTitle);
  setTxt("mega-cat-viewall", pf.megaCatViewAll);
  setTxt("mega-cat-senior", pf.megaCatSenior);
  setTxt("mega-cat-middle", pf.megaCatMiddle);
  setTxt("mega-cat-reset", pf.megaCatReset);
  setTxt("mega-loc-title", pf.megaLocTitle);
  setTxt("mega-loc-manage", pf.megaLocManage);
  setTxt("lbl-header-vip-priv", pf.vipBtnShort);
  const vipBtn = document.getElementById("btn-header-vip-priv");
  if (vipBtn) vipBtn.title = pf.vipBtnTitle;

  setTxt("qf-panel-title", pf.qfTitle);
  setTxt("qf-panel-sub", pf.qfSub);
  setTxt("qf-item-1", pf.qf1);
  setTxt("qf-item-2", pf.qf2);
  setTxt("qf-item-3", pf.qf3);
  setTxt("qf-item-4", pf.qf4);
  setTxt("qf-item-5", pf.qf5);
  setTxt("qf-item-6", pf.qf6);
  setTxt("qf-item-7", pf.qf7);
  setTxt("qf-item-8", pf.qf8);
  setTxt("qf-btn-label", pf.qfBtn);

  setTxt("chat-hdr-title", pf.chatTitle);
  setTxt("chat-hdr-sub", pf.chatSub);
  setTxt("chat-chip-1", pf.chatChip1);
  setTxt("chat-chip-2", pf.chatChip2);
  setTxt("chat-chip-3", pf.chatChip3);
  setTxt("chat-chip-4", pf.chatChip4);
  setTxt("chat-send-btn", pf.chatSend);
  setTxt("chat-float-btn-label", pf.chatFloatBtn);
  const chatInput = document.getElementById("support-chatbot-input");
  if (chatInput) chatInput.placeholder = pf.chatPlaceholder;
  const chatWelcome = document.getElementById("chat-welcome-card");
  if (chatWelcome) chatWelcome.innerHTML = pf.chatWelcome;
}

const PUBLIC_MODAL_PHRASE_MAP = {
  "Đóng cửa sổ": { en: "Close Window", ja: "ウィンドウを閉じる", ko: "창 닫기", zh: "关闭窗口", th: "ปิดหน้าต่าง", lo: "ປິດໜ້າຕ່າງ", km: "បិទបង្អួច" },
  "🔒 Đóng cửa sổ": { en: "🔒 Close Window", ja: "🔒 ウィンドウを閉じる", ko: "🔒 창 닫기", zh: "🔒 关闭窗口", th: "🔒 ปิดหน้าต่าง", lo: "🔒 ປິດໜ້າຕ່າງ", km: "🔒 បិទបង្អួច" },
  "Đóng": { en: "Close", ja: "閉じる", ko: "닫기", zh: "关闭", th: "ปิด", lo: "ປິດ", km: "បិទ" },
  "🌐 LƯỢT TRUY CẬP HÔM NAY": { en: "🌐 VISITS TODAY", ja: "🌐 本日のアクセス数", ko: "🌐 오늘 방문수", zh: "🌐 今日访问量", th: "🌐 ยอดเข้าชมวันนี้", lo: "🌐 ຍອດເຂົ້າຊົມມື້ນີ້", km: "🌐 ចំនួនចូលមើលថ្ងៃនេះ" },
  "🏢 ĐĂNG KÝ DOANH NGHIỆP B2B": { en: "🏢 B2B ENTERPRISE SIGNUPS", ja: "🏢 B2B企業会員登録", ko: "🏢 B2B 기업회원 가입", zh: "🏢 B2B 企业会员注册", th: "🏢 สมาชิกองค์กร B2B", lo: "🏢 ສະມາຊິກວິສາຫະກິດ B2B", km: "🏢 សមាជិកសហគ្រាស B2B" },
  "👨‍💼 CÁ NHÂN ỨNG TUYỂN HÔM NAY": { en: "👨‍💼 APPLICATIONS TODAY", ja: "👨‍💼 本日の応募数", ko: "👨‍💼 오늘 입사지원수", zh: "👨‍💼 今日简历投递", th: "👨‍💼 ผู้สมัครงานวันนี้", lo: "👨‍💼 ຜູ້ສະໝັກວຽກມື້ນີ້", km: "👨‍💼 បេក្ខជនដាក់ពាក្យថ្ងៃនេះ" },
  "🟢 ĐANG TRỰC TUYẾN & AI": { en: "🟢 ONLINE NOW & AI INTERVIEWS", ja: "🟢 現在オンライン＆AI面接", ko: "🟢 현재 온라인 & AI 면접", zh: "🟢 当前在线与 AI 面试", th: "🟢 ออนไลน์ขณะนี้ & สัมภาษณ์ AI", lo: "🟢 ກຳລັງອອນລາຍ & AI", km: "🟢 កំពុងអនឡាញ & AI" },
  "📅 Biểu đồ Thống kê Chi tiết 7 Ngày Gần Nhất": { en: "📅 7-Day Detailed Traffic & Conversion Breakdown", ja: "📅 直近7日間の詳細アクセス＆応募統計", ko: "📅 최근 7일 상세 트래픽 및 지원 통계", zh: "📅 最近 7 天访问量与投递详细统计", th: "📅 กราฟสถิติย้อนหลัง 7 วันโดยละเอียด", lo: "📅 ຕາຕະລາງສະຖິຕິລາຍລະອຽດ 7 ວັນຫຼັງສຸດ", km: "📅 ក្រាហ្វស្ថិតិលម្អិត 7 ថ្ងៃចុងក្រោយ" },
  "Theo dõi đồng thời 3 chỉ số cốt lõi: Lượt truy cập (Visits) • Doanh nghiệp đăng ký mới (B2B) • Lượt Cá nhân nộp CV ứng tuyển": {
    en: "Simultaneous tracking of 3 core KPIs: Daily Visits • New B2B Enterprise Signups • Candidate CV Submissions",
    ja: "主要3指標の同時追跡：アクセス数（Visits）・新規B2B企業登録・求職者CV応募数",
    ko: "3대 핵심 지표 동시 추적: 일일 방문수(Visits) • 신규 B2B 기업 가입 • 구직자 이력서 지원수",
    zh: "同步追踪 3 大核心指标：每日访问量 (Visits) • 新增 B2B 企业注册 • 个人简历投递量",
    th: "ติดตาม 3 ดัชนีหลักพร้อมกัน: ยอดเข้าชม (Visits) • องค์กรสมัครใหม่ (B2B) • จำนวนผู้ส่งเรซูเม่สมัครงาน",
    lo: "ຕິດຕາມ 3 ຕົວຊີ້ວັດຫຼັກພ້ອມກັນ: ຍອດເຂົ້າຊົມ • ວິສາຫະກິດລົງທະບຽນໃໝ່ (B2B) • ຜູ້ສະໝັກຍື່ນ CV",
    km: "តាមដានសូចនាករស្នូលទាំង 3 ព្រមគ្នា៖ ចំនួនចូលមើល • សហគ្រាសចុះឈ្មោះថ្មី (B2B) • ចំនួនបេក្ខជនដាក់ CV",
  },
  "Lưu lượng truy cập": { en: "Daily Traffic Volume", ja: "アクセス数", ko: "일일 트래픽", zh: "访问流量", th: "ปริมาณการเข้าชม", lo: "ປະລິມານການເຂົ້າຊົມ", km: "បរិមាណចូលមើល" },
  "+1 Lượt truy cập": { en: "+1 Visit", ja: "+1 アクセス", ko: "+1 방문", zh: "+1 访问量", th: "+1 ยอดเข้าชม", lo: "+1 ຍອດເຂົ້າຊົມ", km: "+1 ចូលមើល" },
  "+1 Doanh nghiệp Đăng ký": { en: "+1 Employer Signup", ja: "+1 企業登録", ko: "+1 기업 가입", zh: "+1 企业注册", th: "+1 องค์กรลงทะเบียน", lo: "+1 ບໍລິສັດລົງທະບຽນ", km: "+1 ក្រុមហ៊ុនចុះឈ្មោះ" },
  "+1 Cá nhân Ứng tuyển": { en: "+1 Candidate Application", ja: "+1 求職者応募", ko: "+1 입사지원", zh: "+1 个人投递", th: "+1 ผู้สมัครงาน", lo: "+1 ຜູ້ສະໝັກວຽກ", km: "+1 បេក្ខជនដាក់ពាក្យ" },
  "⚡ Kiểm thử Ghi nhận Sự kiện Thời gian thực (Live Event Tracking)": {
    en: "⚡ Live Event Telemetry Verification",
    ja: "⚡ リアルタイムイベント計測テスト (Live Event Tracking)",
    ko: "⚡ 실시간 이벤트 기록 테스트 (Live Event Tracking)",
    zh: "⚡ 实时事件统计测试 (Live Event Tracking)",
    th: "⚡ ทดสอบการบันทึกเหตุการณ์แบบเรียลไทม์ (Live Event Tracking)",
    lo: "⚡ ທົດສອບການບັນທຶກເຫດການເວລາຈິງ (Live Event Tracking)",
    km: "⚡ សាកល្បងការកត់ត្រាព្រឹត្តិការណ៍ផ្ទាល់ (Live Event Tracking)",
  },
  "Mỗi khi có người truy cập, Doanh nghiệp mở tài khoản hoặc Ứng viên nộp CV, hệ thống tự động cộng dồn tức thì:": {
    en: "Whenever a visitor arrives, an Enterprise opens an account, or a Candidate submits a CV, counters increment in real time:",
    ja: "訪問者のアクセス、企業アカウント開設、または求職者のCV提出があるたびにリアルタイムで自動加算されます：",
    ko: "방문자 접속, 기업 계정 개설 또는 구직자 이력서 제출 시 실시간으로 자동 집계됩니다:",
    zh: "每当有访客访问、企业开通账户或求职者投递简历，系统会自动实时累加：",
    th: "ทุกครั้งที่มีผู้เข้าชม องค์กรเปิดบัญชี หรือผู้สมัครส่งเรซูเม่ ระบบจะบวกสะสมทันทีแบบเรียลไทม์:",
    lo: "ທຸກຄັ້ງທີ່ມີຜູ້ເຂົ້າຊົມ, ບໍລິສັດເປີດບັນຊີ ຫຼື ຜູ້ສະໝັກຍື່ນ CV, ລະບົບຈະບວກສະສົມທັນທີ:",
    km: "រាល់ពេលមានអ្នកចូលមើល សហគ្រាសបើកគណនី ឬបេក្ខជនដាក់ CV ប្រព័ន្ធនឹងបូកបន្ថែមភ្លាមៗ៖",
  },
  "so với hôm qua": { en: "vs. yesterday", ja: "前日比", ko: "전일 대비", zh: "较昨日", th: "เทียบกับเมื่อวาน", lo: "ທຽບກັບມື້ວານ", km: "ធៀບនឹងម្សិលមិញ" },
  "Doanh nghiệp mới hôm nay": { en: "New Enterprises today", ja: "本日の新規登録企業", ko: "오늘 신규 가입 기업", zh: "今日新增企业", th: "องค์กรใหม่วันนี้", lo: "ວິສາຫະກິດໃໝ່ມື້ນີ້", km: "សហគ្រាសថ្មីថ្ងៃនេះ" },
  "Tổng tích lũy:": { en: "Cumulative Total:", ja: "累計応募総数:", ko: "누적 합계:", zh: "累计总数:", th: "ยอดสะสมรวม:", lo: "ຍອດສະສົມລວມ:", km: "សរុបបង្គរ៖" },
  "hồ sơ": { en: "profiles", ja: "件", ko: "건", zh: "份简历", th: "โปรไฟล์", lo: "ໂປຣໄຟລ໌", km: "ប្រវត្តិរូប" },
  "phiên phỏng vấn AI hôm nay": { en: "AI interviews today", ja: "本日のAI面接セッション", ko: "오늘 AI 면접 세션", zh: "今日 AI 面试场次", th: "รอบสัมภาษณ์ AI วันนี้", lo: "ຮອບສຳພາດ AI ມື້ນີ້", km: "វគ្គសម្ភាសន៍ AI ថ្ងៃនេះ" },
  "Tổng 30 ngày:": { en: "30-Day Total:", ja: "過去30日間合計:", ko: "최근 30일 합계:", zh: "30天总计:", th: "รวม 30 วัน:", lo: "ລວມ 30 ວັນ:", km: "សរុប 30 ថ្ងៃ៖" },
  "lượt truy cập": { en: "visits", ja: "アクセス", ko: "방문", zh: "次访问", th: "ครั้ง", lo: "ຄັ້ງ", km: "ដង" },
  "lượt": { en: "visits", ja: "回", ko: "회", zh: "次", th: "ครั้ง", lo: "ຄັ້ງ", km: "ដង" },
  "DN B2B": { en: "B2B Orgs", ja: "B2B企業", ko: "B2B 기업", zh: "B2B企业", th: "องค์กร B2B", lo: "ບໍລິສັດ B2B", km: "សហគ្រាស B2B" },
  "CV nộp": { en: "CVs Applied", ja: "CV応募", ko: "CV 지원", zh: "简历投递", th: "ส่ง CV", lo: "ສົ່ງ CV", km: "ដាក់ CV" },
  "Hôm nay": { en: "Today", ja: "本日", ko: "오늘", zh: "今天", th: "วันนี้", lo: "ມື້ນີ້", km: "ថ្ងៃនេះ" },
  "Hôm qua": { en: "Yesterday", ja: "昨日", ko: "어제", zh: "昨天", th: "เมื่อวาน", lo: "ມື້ວານ", km: "ម្សិលមិញ" },
  "Chủ nhật": { en: "Sunday", ja: "日曜日", ko: "일요일", zh: "周日", th: "วันอาทิตย์", lo: "ວັນອາທິດ", km: "ថ្ងៃអាទិត្យ" },
  "Thứ 2": { en: "Monday", ja: "月曜日", ko: "월요일", zh: "周一", th: "วันจันทร์", lo: "ວັນຈັນ", km: "ថ្ងៃចន្ទ" },
  "Thứ 3": { en: "Tuesday", ja: "火曜日", ko: "화요일", zh: "周二", th: "วันอังคาร", lo: "ວັນອັງຄານ", km: "ថ្ងៃអង្គារ" },
  "Thứ 4": { en: "Wednesday", ja: "水曜日", ko: "수요일", zh: "周三", th: "วันพุธ", lo: "ວັນພຸດ", km: "ថ្ងៃពុធ" },
  "Thứ 5": { en: "Thursday", ja: "木曜日", ko: "목요일", zh: "周四", th: "วันพฤหัสบดี", lo: "ວັນພະຫັດ", km: "ថ្ងៃព្រហស្បតិ៍" },
  "Thứ 6": { en: "Friday", ja: "金曜日", ko: "금요일", zh: "周五", th: "วันศุกร์", lo: "ວັນສຸກ", km: "ថ្ងៃសុក្រ" },
  "Thứ 7": { en: "Saturday", ja: "土曜日", ko: "토요일", zh: "周六", th: "วันเสาร์", lo: "ວັນເສົາ", km: "ថ្ងៃសៅរ៍" },
  "📊 Thống kê Lượt truy cập theo ngày, Thành viên Doanh nghiệp & Cá nhân Ứng tuyển": {
    en: "📊 Real-Time Daily Visits, B2B Enterprise Signups & Candidate Applications",
    ja: "📊 日別アクセス数・B2B企業登録・求職者応募リアルタイム統計",
    ko: "📊 일일 방문자 수, B2B 기업회원 가입 및 구직자 입사지원 통계",
    zh: "📊 每日访问量、B2B 企业会员注册与个人求职投递实时统计",
    th: "📊 สถิติผู้เข้าชมรายวัน สมาชิกองค์กร B2B และผู้สมัครงานแบบเรียลไทม์",
    lo: "📊 ສະຖິຕິການເຂົ້າຊົມລາຍວັນ, ສະມາຊິກວິສາຫະກິດ B2B ແລະ ຜູ້ສະໝັກວຽກ",
    km: "📊 ស្ថិតិចូលមើលប្រចាំថ្ងៃ សមាជិកសហគ្រាស B2B និងបេក្ខជនដាក់ពាក្យ",
  },
  "Cơ chế Ưu tiên Tài khoản VIP & Sự khác biệt Các Cấp độ Tài khoản": {
    en: "VIP Account Priority Engine & Tiered Membership Privileges",
    ja: "VIPアカウント優先表示エンジン＆会員ランク別特典の違い",
    ko: "VIP 계정 우선순위 메커니즘 및 등급별 혜택 비교",
    zh: "VIP 账户优先推荐机制与各等级会员权益对比",
    th: "กลไกการจัดลำดับความสำคัญบัญชี VIP และความแตกต่างของแต่ละระดับสมาชิก",
    lo: "ກົນໄກບູລິມະສິດບັນຊີ VIP ແລະ ຄວາມແຕກຕ່າງຂອງແຕ່ລະລະດັບບັນຊີ",
    km: "យន្តការអាទិភាពគណនី VIP និងភាពខុសគ្នានៃកម្រិតគណនីនីមួយៗ",
  },
  "1. Sự khác biệt 4 Cấp độ Tài khoản Nhà Tuyển Dụng (Employer B2B Tiers)": {
    en: "1. 4-Tier Enterprise Employer Membership Comparison (Employer B2B Tiers)",
    ja: "1. 採用企業向け4段階アカウントランク比較 (Employer B2B Tiers)",
    ko: "1. 기업 채용담당자 4단계 계정 등급 비교 (Employer B2B Tiers)",
    zh: "1. 企业雇主 4 大账户等级权益对比 (Employer B2B Tiers)",
    th: "1. ความแตกต่าง 4 ระดับบัญชีองค์กรผู้ประกอบการ (Employer B2B Tiers)",
    lo: "1. ຄວາມແຕກຕ່າງ 4 ລະດັບບັນຊີຜູ້ປະກອບການ B2B (Employer B2B Tiers)",
    km: "1. ភាពខុសគ្នានៃគណនីនិយោជក B2B ទាំង 4 កម្រិត (Employer B2B Tiers)",
  },
  "2. Sự khác biệt 3 Cấp độ Tài khoản Ứng viên (Candidate Talent Tiers)": {
    en: "2. 3-Tier Candidate Talent Membership Comparison (Candidate Talent Tiers)",
    ja: "2. 求職者向け3段階タレントランク比較 (Candidate Talent Tiers)",
    ko: "2. 구직자 3단계 인재 계정 등급 비교 (Candidate Talent Tiers)",
    zh: "2. 求职者 3 大人才等级权益对比 (Candidate Talent Tiers)",
    th: "2. ความแตกต่าง 3 ระดับบัญชีผู้สมัครงาน (Candidate Talent Tiers)",
    lo: "2. ຄວາມແຕກຕ່າງ 3 ລະດັບບັນຊີຜູ້ສະໝັກວຽກ (Candidate Talent Tiers)",
    km: "2. ភាពខុសគ្នានៃគណនីបេក្ខជនទាំង 3 កម្រិត (Candidate Talent Tiers)",
  },
  "Thuật toán Trọng số Ưu tiên (Priority Weighting)": {
    en: "AI Priority Weighting Algorithm",
    ja: "優先表示ウェイトアルゴリズム",
    ko: "우선 노출 가중치 알고리즘",
    zh: "优先权重排序算法",
    th: "อัลกอริทึมถ่วงน้ำหนักความสำคัญ",
    lo: "ອັລກໍຣິທຶມຖ່ວງນ້ຳໜັກບູລິມະສິດ",
    km: "ក្បួនដោះស្រាយទម្ងន់អាទិភាព",
  },
  "📢 Mở Trang Tạo Tin Quảng Cáo (Admin) →": {
    en: "📢 Open Ad Campaign Studio (Admin) →",
    ja: "📢 広告バナー作成管理画面を開く (Admin) →",
    ko: "📢 광고 캠페인 관리 스튜디오 열기 (Admin) →",
    zh: "📢 打开广告横幅管理后台 (Admin) →",
    th: "📢 เปิดหน้าสร้างแคมเปญโฆษณา (Admin) →",
    lo: "📢 ເປີດໜ້າສ້າງໂຄສະນາ (Admin) →",
    km: "📢 បើកទំព័រสร้างផ្ទាំងពាណិជ្ជកម្ម (Admin) →",
  },
  "Mở Trang Tạo Tin Quảng Cáo (Admin) →": {
    en: "Open Ad Campaign Studio (Admin) →",
    ja: "広告バナー作成管理画面を開く (Admin) →",
    ko: "광고 캠페인 관리 스튜디오 열기 (Admin) →",
    zh: "打开广告横幅管理后台 (Admin) →",
    th: "เปิดหน้าสร้างแคมเปญโฆษณา (Admin) →",
    lo: "ເປີດໜ້າສ້າງໂຄສະນາ (Admin) →",
    km: "បើកទំព័រสร้างផ្ទាំងពាណិជ្ជកម្ម (Admin) →",
  },
  "📢 Bạn muốn tạo hoặc thay đổi Banner Quảng cáo 2 bên Trái / Phải?": {
    en: "📢 Want to create or customize Left / Right Skyscraper Ad Banners?",
    ja: "📢 左右サイドのバナー広告を作成・変更したいですか？",
    ko: "📢 좌/우 사이드 배너 광고를 생성하거나 변경하시겠습니까?",
    zh: "📢 想要创建或更换左右两侧摩天大楼广告横幅？",
    th: "📢 ต้องการสร้างหรือเปลี่ยนป้ายโฆษณาด้านซ้าย / ขวาหรือไม่?",
    lo: "📢 ຕ້ອງການສ້າງ ຫຼື ປ່ຽນປ້າຍໂຄສະນາທາງຊ້າຍ / ຂວາບໍ?",
    km: "📢 ចង់បង្កើត ឬផ្លាស់ប្តូរផ្ទាំងពាណិជ្ជកម្មឆ្វេង / ស្តាំមែនទេ?",
  },
  "Ưu tiên x5.0": { en: "Priority x5.0", ja: "優先度 x5.0", ko: "우선순위 x5.0", zh: "权重 x5.0", th: "ลำดับสำคัญ x5.0", lo: "ບູລິມະສິດ x5.0", km: "អាទិភាព x5.0" },
  "Ưu tiên x3.0": { en: "Priority x3.0", ja: "優先度 x3.0", ko: "우선순위 x3.0", zh: "权重 x3.0", th: "ลำดับสำคัญ x3.0", lo: "ບູລິມະສິດ x3.0", km: "អាទិភាព x3.0" },
  "Ưu tiên x2.0": { en: "Priority x2.0", ja: "優先度 x2.0", ko: "우선순위 x2.0", zh: "权重 x2.0", th: "ลำดับสำคัญ x2.0", lo: "ບູລິມະສິດ x2.0", km: "អាទិភាព x2.0" },
  "Ưu tiên x1.8": { en: "Priority x1.8", ja: "優先度 x1.8", ko: "우선순위 x1.8", zh: "权重 x1.8", th: "ลำดับสำคัญ x1.8", lo: "ບູລິມະສິດ x1.8", km: "អាទិភាព x1.8" },
  "Mặc định x1.0": { en: "Default x1.0", ja: "標準 x1.0", ko: "기본 x1.0", zh: "默认 x1.0", th: "ค่าเริ่มต้น x1.0", lo: "ຄ່າເລີ່ມຕົ້ນ x1.0", km: "លំនាំដើម x1.0" },
  "/ tháng": { en: "/ month", ja: "/ 月", ko: "/ 월", zh: "/ 月", th: "/ เดือน", lo: "/ ເດືອນ", km: "/ ខែ" },
  "Miễn phí (0 ₫)": { en: "Free (0 ₫)", ja: "無料 (0 ₫)", ko: "무료 (0 ₫)", zh: "免费 (0 ₫)", th: "ฟรี (0 ₫)", lo: "ຟຣີ (0 ₫)", km: "ឥតគិតថ្លៃ (0 ₫)" },
  "Top 1% Hồ sơ": { en: "Top 1% Profiles", ja: "上位1%人材", ko: "상위 1% 인재", zh: "前 1% 精英简历", th: "ท็อป 1% โปรไฟล์", lo: "ທັອບ 1% ໂປຣໄຟລ໌", km: "កំពូល 1% ប្រវត្តិរូប" },
  "Chuyên gia Cấp cao & Quản lý (Executive VIP)": {
    en: "C-Level & Senior Executive Talent (Executive VIP)",
    ja: "経営幹部・シニアプロフェッショナル (Executive VIP)",
    ko: "임원 및 수석 전문가 (Executive VIP)",
    zh: "高管与资深专家人才 (Executive VIP)",
    th: "ผู้บริหารระดับสูงและผู้เชี่ยวชาญ (Executive VIP)",
    lo: "ຜູ້ບໍລິຫານລະດັບສູງ ແລະ ຊ່ຽວຊານ (Executive VIP)",
    km: "អ្នកบริหารជាន់ខ្ពស់ និងអ្នកជំនាញ (Executive VIP)",
  },
  "Ứng viên Đã Xác thực Năng lực & Kỹ năng": {
    en: "AI Skill-Verified Candidate",
    ja: "スキル・能力認証済み候補者",
    ko: "역량 및 스킬 인증 완료 후보자",
    zh: "已通过技能与能力认证的求职者",
    th: "ผู้สมัครที่ยืนยันทักษะและความสามารถแล้ว",
    lo: "ຜູ້ສະໝັກທີ່ຢືນຢັນທັກສະ ແລະ ຄວາມສາມາດແລ້ວ",
    km: "បេក្ខជនដែលបានផ្ទៀងផ្ទាត់សមត្ថភាព និងជំនាញ",
  },
  "Tài khoản Ứng viên Tiêu chuẩn": {
    en: "Standard Candidate Account",
    ja: "一般求職者アカウント",
    ko: "일반 구직자 계정",
    zh: "标准求职者账户",
    th: "บัญชีผู้สมัครงานมาตรฐาน",
    lo: "ບັນຊີຜູ້ສະໝັກວຽກມາດຕະຖານ",
    km: "គណនីបេក្ខជនស្តង់ដារ",
  },
  // Functional Footer Pages Modals
  "Về HireMind Global — Nền tảng Tuyển dụng & Quản trị Nhân tài AI Quốc tế": {
    en: "About HireMind Global — International AI Talent Acquisition & Enterprise ATS Platform",
    ja: "HireMind Globalについて — 国際AI採用・タレントマネジメントプラットフォーム",
    ko: "HireMind Global 소개 — 글로벌 AI 채용 및 인재 관리 플랫폼",
    zh: "关于 HireMind Global — 国际 AI 招聘与企业人才管理平台",
    th: "เกี่ยวกับ HireMind Global — แพลตฟอร์มสรรหาบุคลากรและบริหารจัดการผู้มีความสามารถด้วย AI ระดับสากล",
    lo: "ກ່ຽວກັບ HireMind Global — ແພລດຟອມສັນຫາບຸກຄະລາກອນ ແລະ ບໍລິຫານຊັບພະຍາກອນມະນຸດ AI ສາກົນ",
    km: "អំពី HireMind Global — វេទិកាជ្រើសរើសបុគ្គលិក និងគ្រប់គ្រងទេពកោសល្យ AI អន្តរជាតិ",
  },
  "Tỉnh thành & Khu công nghiệp": { en: "Provinces & Industrial Zones", ja: "省・都市および工業団地", ko: "성/시 및 산업단지", zh: "省市与工业园区", th: "จังหวัดและนิคมอุตสาหกรรม", lo: "ແຂວງ ແລະ ເຂດອຸດສາຫະກຳ", km: "ខេត្ត-ក្រុង និងតំបន់ឧស្សាហកម្ម" },
  "Sứ mệnh & Tầm nhìn Quốc tế": { en: "Global Mission & Vision", ja: "国際ミッション＆ビジョン", ko: "글로벌 미션 및 비전", zh: "国际使命与愿景", th: "พันธกิจและวิสัยทัศน์ระดับสากล", lo: "ພາລະກິດ ແລະ ວິໄສທັດສາກົນ", km: "បេសកកម្ម និងចក្ខុវិស័យអន្តរជាតិ" },
  "🔍 Khám phá Việc làm đang tuyển": { en: "🔍 Explore Open Executive Jobs", ja: "🔍 募集中の求人を探索", ko: "🔍 채용 중인 공고 탐색", zh: "🔍 探索在招职位", th: "🔍 สำรวจงานที่กำลังเปิดรับ", lo: "🔍 ສຳຫຼວດວຽກທີ່ກຳລັງເປີດຮັບ", km: "🔍 ស្វែងរកការងារដែលកំពុងជ្រើសរើស" },
  "HireMind inTECH — Trung tâm Công nghệ AI Tuyển dụng & Chuyển đổi số HR": {
    en: "HireMind inTECH — AI Recruitment Technology & HR Digital Transformation Lab",
    ja: "HireMind inTECH — AI採用テクノロジー＆HRデジタルトランスフォーメーションセンター",
    ko: "HireMind inTECH — AI 채용 기술 및 HR 디지털 전환 센터",
    zh: "HireMind inTECH — AI 招聘技术与人力资源数字化转型中心",
    th: "HireMind inTECH — ศูนย์เทคโนโลยี AI สรรหาบุคลากรและดิจิทัลทรานส์ฟอร์เมชัน HR",
    lo: "HireMind inTECH — ສູນເຕັກໂນໂລຊີ AI ການຈັດຫາງານ ແລະ ຫັນເປັນດິຈິຕອນ HR",
    km: "HireMind inTECH — មជ្ឈមណ្ឌលបច្ចេកវិទ្យា AI ជ្រើសរើសបុគ្គលិក និងបរិវត្តកម្មឌីជីថល HR",
  },
  "🌐 Mở Công cụ Dịch AI Tự động": { en: "🌐 Open Live AI Translation Studio", ja: "🌐 AI自動翻訳スタジオを開く", ko: "🌐 AI 자동 번역 스튜디오 열기", zh: "🌐 打开 AI 自动翻译工作室", th: "🌐 เปิดเครื่องมือแปลภาษา AI อัตโนมัติ", lo: "🌐 ເປີດເຄື່ອງມືແປພາສາ AI ອັດຕະໂນມັດ", km: "🌐 បើកឧបករណ៍បកប្រែ AI ស្វ័យប្រវត្តិ" },
  "Liên hệ Trung tâm Hỗ trợ Ứng viên & Doanh nghiệp": {
    en: "Contact Candidate & Enterprise B2B Support Center",
    ja: "求職者・法人企業サポートセンターへのお問い合わせ",
    ko: "구직자 및 기업 고객지원 센터 문의",
    zh: "联系求职者与企业客户支持中心",
    th: "ติดต่อศูนย์ช่วยเหลือผู้สมัครงานและองค์กรธุรกิจ",
    lo: "ຕິດຕໍ່ສູນຊ່ວຍເຫຼືອຜູ້ສະໝັກວຽກ ແລະ ວິສາຫະກິດ",
    km: "ទាក់ទងមជ្ឈមណ្ឌលគាំទ្របេក្ខជន និងសហគ្រាស",
  },
  "🤖 Mở Chat CSKH 24/7": { en: "🤖 Open 24/7 AI Concierge Chat", ja: "🤖 24時間AIサポートチャットを開く", ko: "🤖 24/7 AI 고객지원 채팅 열기", zh: "🤖 打开 24/7 AI 客服聊天", th: "🤖 เปิดแชทบริการลูกค้า 24/7", lo: "🤖 ເປີດແຊັດບໍລິການລູກຄ້າ 24/7", km: "🤖 បើកជជែកសេវាអតិថិជន 24/7" },
  "🤖 Trò chuyện ngay với CSKH 24/7": { en: "🤖 Chat Now with 24/7 Concierge", ja: "🤖 今すぐ24時間サポートとチャット", ko: "🤖 지금 24/7 고객지원과 채팅하기", zh: "🤖 立即与 24/7 客服对话", th: "🤖 แชทกับฝ่ายบริการลูกค้า 24/7 ทันที", lo: "🤖 ລົມກັບຝ່າຍບໍລິການລູກຄ້າ 24/7 ທັນທີ", km: "🤖 ជជែកជាមួយសេវាអតិថិជន 24/7 ឥឡូវនេះ" },
  "🤖 Mở Khung Chat CSKH 24/7 ngay": { en: "🤖 Open 24/7 Support Chat Now", ja: "🤖 今すぐ24時間チャットを開く", ko: "🤖 24/7 채팅창 바로 열기", zh: "🤖 立即打开 24/7 客服窗口", th: "🤖 เปิดหน้าต่างแชท 24/7 ทันที", lo: "🤖 ເປີດກ່ອງແຊັດ 24/7 ທັນທີ", km: "🤖 បើកប្រអប់ជជែក 24/7 ឥឡូវនេះ" },
  "Câu hỏi Thường gặp dành cho Ứng viên & Nhà tuyển dụng": {
    en: "Frequently Asked Questions (FAQ) for Candidates & Employers",
    ja: "求職者および採用企業向けよくある質問 (FAQ)",
    ko: "구직자 및 채용 기업을 위한 자주 묻는 질문 (FAQ)",
    zh: "求职者与招聘企业常见问题解答 (FAQ)",
    th: "คำถามที่พบบ่อย (FAQ) สำหรับผู้สมัครงานและผู้ประกอบการ",
    lo: "ຄຳຖາມທີ່ພົບເລື້ອຍໆ (FAQ) ສຳລັບຜູ້ສະໝັກວຽກ ແລະ ຜູ້ປະກອບການ",
    km: "សំណួរដែលសួរញឹកញាប់ (FAQ) សម្រាប់បេក្ខជន និងនិយោជក",
  },
  "🧮 Mở Công cụ Tính lương Gross-Net": { en: "🧮 Open Gross-to-Net Salary Calculator", ja: "🧮 給与計算ツール（Gross-Net）を開く", ko: "🧮 급여 실수령액(Gross-Net) 계산기 열기", zh: "🧮 打开税前税后薪资计算器", th: "🧮 เปิดเครื่องคำนวณเงินเดือน Gross-Net", lo: "🧮 ເປີດເຄື່ອງຄິດໄລ່ເງິນເດືອນ Gross-Net", km: "🧮 បើកឧបករណ៍គណនាប្រាក់ខែ Gross-Net" },
  "Thỏa thuận Sử dụng Dịch vụ Sàn Giao dịch Việc làm HireMind Global": {
    en: "HireMind Global Career Exchange Terms of Service Agreement",
    ja: "HireMind Global 求人プラットフォーム利用規約",
    ko: "HireMind Global 채용 플랫폼 서비스 이용약관",
    zh: "HireMind Global 招聘平台服务使用协议",
    th: "ข้อตกลงการใช้บริการแพลตฟอร์มจัดหางาน HireMind Global",
    lo: "ຂໍ້ຕົກລົງການໃຊ້ບໍລິການເວັບໄຊຈັດຫາງານ HireMind Global",
    km: "កិច្ចព្រមព្រៀងប្រើប្រាស់សេវាកម្មផ្សារការងារ HireMind Global",
  },
  "✔ Tôi đã hiểu và đồng ý": { en: "✔ I Understand & Agree", ja: "✔ 理解し同意します", ko: "✔ 이해했으며 동의합니다", zh: "✔ 我已阅读并同意", th: "✔ ฉันเข้าใจและยอมรับ", lo: "✔ ຂ້ອຍເຂົ້າໃຈ ແລະ ຍອມຮັບ", km: "✔ ខ្ញុំយល់ និងយល់ព្រម" },
  "✔ Đã hiểu": { en: "✔ Got It", ja: "✔ 了解しました", ko: "✔ 확인했습니다", zh: "✔ 我知道了", th: "✔ เข้าใจแล้ว", lo: "✔ ເຂົ້າໃຈແລ້ວ", km: "✔ យល់ហើយ" },
  "Chính sách Bảo mật Dữ liệu Cá nhân & Hồ sơ Ứng viên": {
    en: "Personal Data Privacy & Candidate Resume Protection Policy",
    ja: "個人情報保護および求職者履歴書プライバシーポリシー",
    ko: "개인정보 보호 및 후보자 이력서 보안 정책",
    zh: "个人数据隐私与求职者简历保护政策",
    th: "นโยบายความเป็นส่วนตัวของข้อมูลส่วนบุคคลและเรซูเม่ผู้สมัคร",
    lo: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວຂໍ້ມູນສ່ວນບຸກຄົນ ແລະ ຊີວະປະຫວັດຜູ້ສະໝັກ",
    km: "គោលការណ៍ឯកជនភាពទិន្នន័យផ្ទាល់ខ្លួន និងប្រវត្តិរូបបេក្ខជន",
  },
  "Quy chế Hoạt động Sàn Giao dịch Thương mại Điện tử & Dịch vụ Việc làm": {
    en: "E-Commerce Employment Exchange Operating Regulations & Charter",
    ja: "電子商取引求人プラットフォーム運営規定",
    ko: "전자상거래 채용 플랫폼 운영 규정",
    zh: "电子商务与就业服务交易平台运营规章",
    th: "ระเบียบการดำเนินงานแพลตฟอร์มจัดหางานและพาณิชย์อิเล็กทรอนิกส์",
    lo: "ລະບຽບການດຳເນີນງານເວັບໄຊການຄ້າອີເລັກໂທຣນິກ ແລະ ບໍລິການຈັດຫາງານ",
    km: "បទប្បញ្ញត្តិប្រតិបត្តិការផ្សារពាណិជ្ជកម្មអេឡិចត្រូនិក និងសេវាការងារ",
  },
  "🏛️ Xem Danh sách Doanh nghiệp Đã xác thực": { en: "🏛️ View Verified Enterprise Directory", ja: "🏛️ 認証済み企業一覧を見る", ko: "🏛️ 인증된 기업 목록 보기", zh: "🏛️ 查看认证企业名录", th: "🏛️ ดูรายชื่อองค์กรที่ผ่านการรับรอง", lo: "🏛️ ເບິ່ງລາຍຊື່ວິສາຫະກິດທີ່ຢືນຢັນແລ້ວ", km: "🏛️ មើលបញ្ជីសហគ្រាសដែលបានផ្ទៀងផ្ទាត់" },
  "Sơ đồ Cấu trúc Toàn diện Cổng Tuyển dụng & Quản trị HireMind": {
    en: "Comprehensive HireMind Career Portal & Enterprise ATS Sitemap",
    ja: "HireMind 採用ポータル＆管理システム サイトマップ",
    ko: "HireMind 채용 포털 및 관리 시스템 전체 사이트맵",
    zh: "HireMind 招聘门户与管理后台完整网站地图",
    th: "แผนผังเว็บไซต์ระบบสรรหาและบริหารงานบุคคล HireMind",
    lo: "ແຜນผັງເວັບໄຊລະບົບຈັດຫາງານ ແລະ ບໍລິຫານ HireMind",
    km: "ផែនទីគេហទំព័រពេញលេញនៃប្រព័ន្ធជ្រើសរើសបុគ្គលិក HireMind",
  },
  "🔍 Về Trang Tìm kiếm Việc làm": { en: "🔍 Go to Job Search", ja: "🔍 求人検索ページへ", ko: "🔍 채용 검색 페이지로 이동", zh: "🔍 返回职位搜索页", th: "🔍 ไปยังหน้าค้นหางาน", lo: "🔍 ໄປໜ້າຄົ້ນຫາວຽກ", km: "🔍 ទៅកាន់ទំព័រស្វែងរកការងារ" },
  "Kho Hồ sơ Ứng viên Chất lượng cao & Sàng lọc AI Tự động": {
    en: "Verified Executive Resume Vault & Automated AI Talent Screening",
    ja: "ハイクラス人材履歴書データベース＆AI自動スクリーニング",
    ko: "고급 인재 이력서 데이터베이스 및 AI 자동 스크리닝",
    zh: "高质量人才简历库与 AI 自动筛选系统",
    th: "คลังเรซูเม่ผู้เชี่ยวชาญคุณภาพสูงและระบบคัดกรอง AI อัตโนมัติ",
    lo: "ຄັງຊີວະປະຫວັດຜູ້ສະໝັກຄຸນນະພາບສູງ ແລະ ການຄັດກອງ AI ອັດຕະໂນມັດ",
    km: "ឃ្លាំងប្រវត្តិរូបបេក្ខជនគុណភាពខ្ពស់ និងការសម្រាំង AI ស្វ័យប្រវត្តិ",
  },
  "🏢 Mở Không gian Nhà tuyển dụng & Kho Hồ sơ": { en: "🏢 Open Employer Workspace & CV Vault", ja: "🏢 採用企業ワークスペース＆履歴書庫を開く", ko: "🏢 기업 채용 워크스페이스 및 이력서 보관함 열기", zh: "🏢 打开企业工作台与简历库", th: "🏢 เปิดพื้นที่ทำงานองค์กรและคลังเรซูเม่", lo: "🏢 ເປີດພື້ນທີ່ເຮັດວຽກຜູ້ປະກອບການ ແລະ ຄັງ CV", km: "🏢 បើកកន្លែងធ្វើការនិយោជក និងឃ្លាំង CV" },
  "Báo cáo Thị trường Lao động & Khung Lương Chuẩn Quốc tế 2026": {
    en: "2026 Labor Market Intelligence & International Salary Benchmarks",
    ja: "2026年 労働市場レポート＆国際給与ベンチマーク",
    ko: "2026 노동시장 리포트 및 글로벌 급여 벤치마크",
    zh: "2026 劳动力市场报告与国际薪资基准",
    th: "รายงานตลาดแรงงานและฐานเงินเดือนมาตรฐานสากลปี 2026",
    lo: "ລາຍງານຕະຫຼາດແຮງງານ ແລະ ໂຄງສ້າງເງິນເດືອນມາດຕະຖານສາກົນ 2026",
    km: "របាយការណ៍ទីផ្សារការងារ និងកម្រិតប្រាក់ខែស្តង់ដារអន្តរជាតិ 2026",
  },
  "📊 Xem Chi tiết tại Công cụ Lương & Cẩm nang": { en: "📊 View Full Salary Benchmarks & Career Guide", ja: "📊 給与計算＆キャリアガイドで詳細を見る", ko: "📊 급여 계산기 및 커리어 가이드에서 상세 보기", zh: "📊 在薪资工具与职场指南中查看详情", th: "📊 ดูรายละเอียดที่เครื่องมือเงินเดือนและคู่มืออาชีพ", lo: "📊 ເບິ່ງລາຍລະອຽດທີ່ເຄື່ອງມືເງິນເດືອນ ແລະ ຄູ່ມື", km: "📊 មើលលម្អិតនៅក្នុងឧបករណ៍ប្រាក់ខែ និងមគ្គុទ្ទេសក៍" },
  "Đăng ký Tư vấn Giải pháp Tuyển dụng & Cấp phát Tenant Doanh nghiệp": {
    en: "Enterprise Recruitment Consulting & Multi-Tenant SaaS Provisioning",
    ja: "法人向け採用ソリューション相談＆マルチテナント発行登録",
    ko: "기업 채용 솔루션 상담 및 멀티테넌트 프로비저닝 신청",
    zh: "企业招聘解决方案咨询与多租户 SaaS 开通注册",
    th: "ลงทะเบียนรับคำปรึกษาโซลูชันสรรหาบุคลากรและเปิดใช้งาน Tenant องค์กร",
    lo: "ລົງທະບຽນຮັບຄຳປຶກສາໂຊລູຊັນການຈັດຫາງານ ແລະ ເປີດໃຊ້ Tenant ວິສາຫະກິດ",
    km: "ចុះឈ្មោះប្រឹក្សាដំណោះស្រាយជ្រើសរើសបុគ្គលិក និងបើកដំណើរការ Tenant សហគ្រាស",
  },
  "🏢 Đăng ký Cấp phát Tenant Doanh nghiệp ngay": { en: "🏢 Provision Enterprise Tenant Now", ja: "🏢 今すぐ法人テナントを発行登録", ko: "🏢 지금 기업 테넌트 발급 신청", zh: "🏢 立即开通企业租户账户", th: "🏢 ลงทะเบียนเปิดใช้งาน Tenant องค์กรทันที", lo: "🏢 ລົງທະບຽນເປີດໃຊ້ Tenant ວິສາຫະກິດທັນທີ", km: "🏢 ចុះឈ្មោះបើកដំណើរការ Tenant សហគ្រាសឥឡូវនេះ" },
  "Trải nghiệm Ứng dụng Di động HireMind Global (PWA & Mobile App)": {
    en: "Experience HireMind Global Mobile App (PWA & iOS/Android)",
    ja: "HireMind Global モバイルアプリ体験 (PWA & iOS/Android)",
    ko: "HireMind Global 모바일 앱 체험 (PWA & iOS/Android)",
    zh: "体验 HireMind Global 移动应用 (PWA & iOS/Android)",
    th: "สัมผัสประสบการณ์แอปมือถือ HireMind Global (PWA & iOS/Android)",
    lo: "ສຳຜັດປະສົບການແອັບມືຖື HireMind Global (PWA & iOS/Android)",
    km: "ទទួលបទពិសោធន៍កម្មវិធីទូរស័ព្ទ HireMind Global (PWA & iOS/Android)",
  },
  "Kết nối Zalo Official Account — HireMind Global Việt Nam": {
    en: "Connect via Zalo Official Account — HireMind Global Vietnam",
    ja: "Zalo公式アカウント連携 — HireMind Global ベトナム",
    ko: "Zalo 공식 계정 연결 — HireMind Global 베트남",
    zh: "连接 Zalo 官方账号 — HireMind Global 越南",
    th: "เชื่อมต่อบัญชีทางการ Zalo OA — HireMind Global เวียดนาม",
    lo: "ເຊື່ອມຕໍ່ບັນຊີທາງການ Zalo OA — HireMind Global ຫວຽດນາມ",
    km: "ភ្ជាប់គណនីផ្លូវការ Zalo OA — HireMind Global វៀតណាម",
  },
};

const SORTED_PUBLIC_MODAL_KEYS = Object.keys(PUBLIC_MODAL_PHRASE_MAP).sort((a, b) => b.length - a.length);

function applyPublicDomTranslationPass(rootEl) {
  const lang = portalState.lang || "vi";
  if (lang === "vi" || !rootEl) return;
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue && n.nodeValue.trim().length > 1) {
      textNodes.push(n);
    }
  }
  for (const node of textNodes) {
    let text = node.nodeValue;
    const trimmed = text.trim();
    const exact = PUBLIC_MODAL_PHRASE_MAP[trimmed];
    if (exact && exact[lang]) {
      node.nodeValue = text.replace(trimmed, exact[lang]);
      continue;
    }
    let changed = false;
    for (const k of SORTED_PUBLIC_MODAL_KEYS) {
      if (text.includes(k)) {
        const rep = PUBLIC_MODAL_PHRASE_MAP[k][lang];
        if (rep) {
          text = text.split(k).join(rep);
          changed = true;
        }
      }
    }
    if (changed) {
      node.nodeValue = text;
    } else if (typeof translateDynamicText === "function") {
      const tr = translateDynamicText(trimmed);
      if (tr && tr !== trimmed) {
        node.nodeValue = text.replace(trimmed, tr);
      }
    }
  }
}

function renderPortalHeader() {
  const pd = pDict();
  const pf = pFull();
  document.title = pd.pageTitle;
  document.documentElement.lang = portalState.lang;
  document.documentElement.classList.toggle("dark", portalState.dark);

  const sel = document.getElementById("portal-lang-select");
  if (sel) sel.value = portalState.lang;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Concise executive header labels so the navbar never wraps or truncates awkwardly
  const shortHeaderMap = {
    vi: { badge: "AI CLOUD", sub: "Sàn Việc làm Quản lý & Tuyển dụng AI Quốc tế", jobs: "Việc làm", locs: "Khu vực", cats: "Ngành nghề", emps: "Công ty", tools: "Lương & CV", apps: "Hồ sơ", post: "Đăng tuyển" },
    en: { badge: "AI CLOUD", sub: "Executive Talent & Enterprise AI ATS", jobs: "Jobs", locs: "Locations", cats: "Sectors", emps: "Companies", tools: "Salary & CV", apps: "My Apps", post: "Post a Job" },
    ja: { badge: "AI CLOUD", sub: "エグゼクティブ採用・AI人材プラットフォーム", jobs: "求人", locs: "勤務地", cats: "業種", emps: "企業", tools: "給与・CV", apps: "応募管理", post: "求人掲載" },
    ko: { badge: "AI CLOUD", sub: "글로벌 임원 채용 & AI 인재 플랫폼", jobs: "채용공고", locs: "지역", cats: "직군", emps: "기업", tools: "연봉·CV", apps: "지원현황", post: "채용등록" },
    zh: { badge: "AI CLOUD", sub: "国际高管招聘与 AI 人才管理云", jobs: "职位", locs: "地区", cats: "行业", emps: "企业", tools: "薪资与简历", apps: "我的申请", post: "发布职位" },
    th: { badge: "AI CLOUD", sub: "แพลตฟอร์มจัดหางานผู้บริหารและ AI ATS", jobs: "งาน", locs: "พื้นที่", cats: "หมวดหมู่", emps: "บริษัท", tools: "เงินเดือน", apps: "ใบสมัคร", post: "ลงประกาศงาน" },
    lo: { badge: "AI CLOUD", sub: "ເວທີຮັບສະໝັກຜູ້ບໍລິຫານ ແລະ AI ATS", jobs: "ວຽກ", locs: "ພື້ນທີ່", cats: "ຂະແໜງການ", emps: "ບໍລິສັດ", tools: "ເງິນເດືອນ", apps: "ໃບສະໝັກ", post: "ປະກາດຮັບສະໝັກ" },
    km: { badge: "AI CLOUD", sub: "វេទិកាជ្រើសរើសបុគ្គលិកជាន់ខ្ពស់ និង AI ATS", jobs: "ការងារ", locs: "តំបន់", cats: "វិស័យ", emps: "ក្រុមហ៊ុន", tools: "ប្រាក់ខែ", apps: "ពាក្យសុំ", post: "ប្រកាសការងារ" },
  };
  const sh = shortHeaderMap[portalState.lang] || shortHeaderMap.vi;

  setTxt("ui-badge-portal", sh.badge);
  setTxt("ui-sub-portal", sh.sub);
  setTxt("lbl-nav-jobs", sh.jobs);
  setTxt("lbl-nav-locations", sh.locs);
  setTxt("lbl-nav-categories", sh.cats);
  setTxt("lbl-nav-employers", sh.emps);
  setTxt("lbl-nav-tools", sh.tools);
  setTxt("lbl-nav-myapps", sh.apps);
  setTxt("lbl-header-post-job", sh.post);
  setTxt("lbl-ai-translator", portalState.lang === "vi" ? "🤖 AI Dịch 100%" : "🤖 AI Translate");
  setTxt("footer-compliance-text", pd.footerCompliance);
  setTxt("footer-ats-link", portalState.lang === "vi" ? "🏢 Quản trị ATS →" : "🏢 Enterprise ATS →");
  setTxt("footer-ats-link-bottom", pd.footerAtsLink);
  setTxt("footer-emp-btn", pd.btnEmpAuth);

  localizePublicStaticWidgets();

  // Update live counters on nav tabs
  const mkt = portalState.marketplace || {};
  const locs = getActiveLocationsList();
  setTxt("badge-count-jobs", (mkt.jobs || []).length || 30);
  setTxt("badge-count-cats", (mkt.categories || []).length || 10);
  setTxt("badge-count-emps", (mkt.employers || []).length || 6);
  setTxt("badge-count-locs", locs.length || 12);
  setTxt("badge-count-saved", (portalState.savedJobs || []).length);

  // Highlight active navigation pill with refined minimalist styling
  ["jobs", "categories", "employers", "tools", "my_apps"].forEach((s) => {
    const btn = document.getElementById(`nav-portal-${s}`);
    if (!btn) return;
    if (s === portalState.activeSection) {
      btn.className =
        "px-3.5 py-2 rounded-xl text-[13px] font-semibold bg-blue-50/90 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.22)] transition flex items-center gap-2";
    } else {
      btn.className =
        "px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800 transition flex items-center gap-2";
    }
  });

  // Highlight active macro-region in top bar
  const macroMap = [
    { id: "macro-reg-all", val: "all", lbl: pf.rgAll.replace("🌐 ", "") },
    { id: "macro-reg-north", val: "Miền Bắc", lbl: pf.rgNorth.replace("🏛️ ", "") },
    { id: "macro-reg-central", val: "Miền Trung", lbl: pf.rgCentral.replace("🌊 ", "") },
    { id: "macro-reg-south", val: "Miền Nam", lbl: pf.rgSouth.replace("🏙️ ", "") },
    { id: "macro-reg-asean", val: "Quốc tế / ASEAN", lbl: pf.rgIntl.replace("✈️ ", "") },
  ];
  const curMacro = portalState.selectedMacroRegion || "all";
  macroMap.forEach((m) => {
    const el = document.getElementById(m.id);
    if (!el) return;
    el.textContent = m.lbl;
    if (curMacro === m.val) {
      el.className = "px-2 py-0.5 rounded-md bg-blue-600 text-white font-semibold transition";
    } else {
      el.className =
        "px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-blue-100 border border-white/15 font-medium transition";
    }
  });

  // Populate Header Mega-Menu: Categories
  const megaCatsEl = document.getElementById("header-mega-categories");
  if (megaCatsEl && mkt.categories) {
    megaCatsEl.innerHTML = mkt.categories
      .map(
        (c) => `
        <button onclick="updatePortalFilter('cat', '${c.name.replace(/'/g, "\\'")}'); switchPortalSection('jobs');"
          class="text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 transition border border-transparent hover:border-blue-100 dark:hover:border-slate-700">
          <span class="font-medium text-slate-700 dark:text-slate-200 truncate">${SECTOR_ICONS[c.name] || "💼"} ${translateSector(c.name)}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-blue-600 font-semibold shrink-0">${c.job_count}</span>
        </button>
      `
      )
      .join("");
  }

  // Populate Header Mega-Menu: Locations
  const megaLocsEl = document.getElementById("header-mega-locations");
  if (megaLocsEl) {
    const allJobs = mkt.jobs || [];
    megaLocsEl.innerHTML = locs
      .map((loc) => {
        const cnt = allJobs.filter((j) => doesJobMatchLocationCode(j, loc.code)).length;
        return `
          <button onclick="updatePortalFilter('loc', '${loc.code}'); switchPortalSection('jobs');"
            class="text-left p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-between gap-1.5 transition border border-slate-100 dark:border-slate-800">
            <span class="font-medium text-slate-700 dark:text-slate-200 truncate">📍 ${translateLocationPill(loc)}</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-semibold shrink-0">${cnt}</span>
          </button>
        `;
      })
      .join("");
  }

  const authBar = document.getElementById("auth-status-bar");
  if (!authBar) return;

  const u = portalState.currentUser;
  if (!u) {
    authBar.innerHTML = `
      <a href="/login.html"
        class="px-3.5 py-2 rounded-xl text-slate-700 hover:text-blue-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap">
        <svg class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        <span>${pf.authLogin}</span>
      </a>
      <button onclick="openEmployerAuthModal()"
        class="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold transition whitespace-nowrap">
        <span>${pf.authEmployer}</span>
      </button>
    `;
  } else if (u.role === "candidate") {
    const initials = (u.full_name || "UV")
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0].toUpperCase())
      .join("");
    authBar.innerHTML = `
      <div class="flex items-center gap-1.5">
        <div class="relative mega-nav-item">
          <button type="button" onclick="switchPortalSection('my_apps')"
            class="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 transition whitespace-nowrap">
            <div class="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
              ${initials}
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
            </div>
            <div class="text-left leading-none hidden sm:block">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${u.full_name}</div>
              <div class="text-[10px] font-medium text-teal-600 dark:text-teal-400 mt-0.5">${pf.authVipCandidate}</div>
            </div>
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <!-- Clean Luxury Profile Dropdown Menu -->
          <div class="mega-dropdown-panel absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 text-xs">
            <div class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="font-bold text-slate-900 dark:text-white truncate">${u.full_name}</div>
              <div class="text-[11px] text-slate-500 font-mono truncate mt-0.5">${u.email || "candidate@hiremind.vn"}</div>
            </div>
            <div class="py-1 space-y-0.5">
              <button onclick="switchPortalSection('my_apps')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between">
                <span>${pf.authMyApps}</span>
                <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[10px]">${(portalState.savedJobs || []).length}</span>
              </button>
              <button onclick="openCandidateAuthModal()" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                ${pf.authUpdateCv}
              </button>
              <a href="/login.html" class="block px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold">
                ${pf.authSwitchSso}
              </a>
            </div>
            <div class="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button onclick="logoutPortalUser()" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 font-semibold">
                ${pf.authLogoutCandidate}
              </button>
            </div>
          </div>
        </div>
        <button type="button" onclick="logoutPortalUser()" title="Đăng xuất tài khoản"
          class="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/70 text-red-600 dark:text-red-300 border border-red-200/80 dark:border-red-800 text-xs font-bold transition flex items-center gap-1 whitespace-nowrap">
          <span>🚪</span>
          <span class="hidden md:inline">${pDict().btnLogout || "Đăng xuất"}</span>
        </button>
      </div>
    `;
  } else {
    const locComp = translateEmployerName(u.org_id, u.company_name);
    authBar.innerHTML = `
      <div class="flex items-center gap-1.5">
        <div class="relative mega-nav-item">
          <a href="/index.html?org_id=${encodeURIComponent(u.org_id)}"
            class="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-indigo-50/80 hover:bg-indigo-100/80 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 transition whitespace-nowrap">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              B2B
            </div>
            <div class="text-left leading-none hidden sm:block">
              <div class="text-xs font-bold text-indigo-950 dark:text-indigo-200 max-w-[140px] truncate">${locComp}</div>
              <div class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">${u.org_id}</div>
            </div>
            <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>

          <div class="mega-dropdown-panel absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 text-xs">
            <div class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="font-bold text-slate-900 dark:text-white truncate">${locComp}</div>
              <div class="text-[11px] text-indigo-600 font-mono mt-0.5">Tenant: ${u.org_id}</div>
            </div>
            <div class="py-1 space-y-0.5">
              <a href="/index.html?org_id=${encodeURIComponent(u.org_id)}" class="block px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold">
                ${pf.authOpenAts}
              </a>
              <button onclick="openEmployerAuthModal()" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                ${pf.authSwitchTenant}
              </button>
              <a href="/login.html?role=employer" class="block px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 font-semibold">
                ${pf.authB2bSso}
              </a>
            </div>
            <div class="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button onclick="logoutPortalUser()" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold">
                ${pf.authLogoutEmp}
              </button>
            </div>
          </div>
        </div>
        <button type="button" onclick="logoutPortalUser()" title="Đăng xuất tài khoản"
          class="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/70 text-red-600 dark:text-red-300 border border-red-200/80 dark:border-red-800 text-xs font-bold transition flex items-center gap-1 whitespace-nowrap">
          <span>🚪</span>
          <span class="hidden md:inline">${pDict().btnLogout || "Đăng xuất"}</span>
        </button>
      </div>
    `;
  }
}

function logoutPortalUser() {
  portalState.currentUser = null;
  localStorage.removeItem("hiremind_portal_user");
  localStorage.removeItem("hiremind_active_role");
  localStorage.removeItem("hiremind_active_org_id");
  renderPortalHeader();
  renderPortalMain();
  showPortalToast(pDict().toastLoggedOut);
}

/* ============================================================================
   5B. RECRUITMENT LOCATIONS & ECONOMIC ZONES (12+ REGIONS + FULL CRUD)
   ============================================================================ */
const DEFAULT_LOCATIONS_LIST = [
  { id: "loc_hn", code: "hanoi", name: "Hà Nội", region_group: "Miền Bắc", industrial_zone: "Khu CNC Hòa Lạc & Nội thành Hà Nội", work_mode: "On-site / Hybrid" },
  { id: "loc_hcmc", code: "hcmc", name: "TP. Hồ Chí Minh", region_group: "Miền Nam", industrial_zone: "Khu CNC Thủ Đức & Trung tâm Quận 1", work_mode: "On-site / Hybrid" },
  { id: "loc_dn", code: "danang", name: "Đà Nẵng", region_group: "Miền Trung", industrial_zone: "Khu CNTT Tập trung & Hòa Khánh", work_mode: "On-site / Hybrid" },
  { id: "loc_hp", code: "haiphong", name: "Hải Phòng", region_group: "Miền Bắc", industrial_zone: "KKT Đình Vũ - Cát Hải & VSIP Hải Phòng", work_mode: "On-site" },
  { id: "loc_bn", code: "bacninh", name: "Bắc Ninh", region_group: "Miền Bắc", industrial_zone: "KCN Yên Phong, Quế Võ & VSIP Bắc Ninh", work_mode: "On-site" },
  { id: "loc_bd", code: "binhduong", name: "Bình Dương", region_group: "Miền Nam", industrial_zone: "KCN VSIP I, II, III & Mỹ Phước", work_mode: "On-site" },
  { id: "loc_dni", code: "dongnai", name: "Đồng Nai", region_group: "Miền Nam", industrial_zone: "KCN Amata, Long Thành & Nhơn Trạch", work_mode: "On-site" },
  { id: "loc_ct", code: "cantho", name: "Cần Thơ", region_group: "Miền Nam", industrial_zone: "Trung tâm Kinh tế ĐBSCL", work_mode: "On-site / Hybrid" },
  { id: "loc_qn", code: "quangninh", name: "Quảng Ninh", region_group: "Miền Bắc", industrial_zone: "KKT Quảng Yên & Hạ Long", work_mode: "On-site" },
  { id: "loc_brvt", code: "vungtau", name: "Bà Rịa - Vũng Tàu", region_group: "Miền Nam", industrial_zone: "Cảng Cái Mép - Thị Vải & KCN Phú Mỹ", work_mode: "On-site" },
  { id: "loc_asean", code: "asean", name: "Đông Nam Á (ASEAN)", region_group: "Quốc tế / ASEAN", industrial_zone: "Bangkok • Vientiane • Phnom Penh", work_mode: "Hybrid / Relocation" },
  { id: "loc_remote", code: "remote", name: "Remote / Làm việc Từ xa", region_group: "Quốc tế / ASEAN", industrial_zone: "Linh hoạt Toàn cầu", work_mode: "100% Remote / Hybrid" },
];

const LOC_CODE_TRANSLATIONS = {
  hanoi: { vi: "Hà Nội", en: "Hanoi", ja: "ハノイ", ko: "하노이", zh: "河内", th: "ฮานอย", lo: "ຮ່າໂນ້ຍ", km: "ហាណូយ" },
  hcmc: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City", ja: "ホーチミン市", ko: "호치민시", zh: "胡志明市", th: "โฮจิมินห์ซิตี้", lo: "ນະຄອນໂຮ່ຈີມິນ", km: "ទីក្រុងហូជីមិញ" },
  danang: { vi: "Đà Nẵng", en: "Da Nang", ja: "ダナン", ko: "다낭", zh: "岘港", th: "ดานัง", lo: "ດານັງ", km: "ដាណាំង" },
  haiphong: { vi: "Hải Phòng", en: "Hai Phong", ja: "ハイフォン", ko: "하이퐁", zh: "海防市", th: "ไฮฟอง", lo: "ໄຮຟອງ", km: "ហាយហ្វុង" },
  bacninh: { vi: "Bắc Ninh", en: "Bac Ninh", ja: "バクニン省", ko: "박닌성", zh: "北宁省", th: "บั๊กนิญ", lo: "ບັກນິງ", km: "បាក់និញ" },
  binhduong: { vi: "Bình Dương", en: "Binh Duong", ja: "ビンズオン省", ko: "빈즈엉성", zh: "平阳省", th: "บิ่ญเซือง", lo: "ບິ່ງເຢືອງ", km: "ប៊ិញយឿង" },
  dongnai: { vi: "Đồng Nai", en: "Dong Nai", ja: "ドンナイ省", ko: "동나이성", zh: "同奈省", th: "ด่งนาย", lo: "ດົ່ງນາຍ", km: "ដុងណៃ" },
  cantho: { vi: "Cần Thơ", en: "Can Tho", ja: "カントー市", ko: "껀터시", zh: "芹苴市", th: "เกิ่นเทอ", lo: "ເກິ່ນເທີ", km: "កឹនថឺ" },
  quangninh: { vi: "Quảng Ninh", en: "Quang Ninh", ja: "クアンニン省", ko: "꽝닌성", zh: "广宁省", th: "กว๋างนิญ", lo: "ກວາງນິງ", km: "ក្វាងនិញ" },
  vungtau: { vi: "Bà Rịa - Vũng Tàu", en: "Ba Ria - Vung Tau", ja: "バリア・ブンタウ", ko: "바리아붕따우", zh: "巴地头顿省", th: "บ่าเหรี่ยะ-หวุงเต่า", lo: "ບາເຣັຍ-ວຸງເຕົ່າ", km: "បារៀ-វុងតៅ" },
  asean: { vi: "Đông Nam Á (ASEAN)", en: "ASEAN Regional", ja: "ASEAN地域", ko: "ASEAN 동남아", zh: "东盟地区 (ASEAN)", th: "ภูมิภาคอาเซียน", lo: "ພາກພື້ນອາຊຽນ", km: "តំបន់អាស៊ាន" },
  remote: { vi: "Remote / Từ xa", en: "Remote / Hybrid", ja: "リモート・在宅", ko: "원격·재택근무", zh: "远程 / 混合办公", th: "ทำงานทางไกล (Remote)", lo: "ເຮັດວຽກທາງໄກ (Remote)", km: "ធ្វើការពីចម្ងាយ (Remote)" },
};

const LOC_MODAL_I18N = {
  vi: {
    btnAddLocation: "➕ Tạo / Quản lý Khu vực Tuyển dụng",
    modalBadge: "QUẢN TRỊ ĐỊA ĐIỂM & VÙNG KINH TẾ TUYỂN DỤNG",
    modalTitle: "📍 Quản lý & Tạo Khu vực Tuyển dụng Mới (63 Tỉnh/Thành & Quốc tế)",
    modalSub: "Bổ sung các Tỉnh/Thành phố, Khu Công nghiệp (VSIP, Khu CNC) hoặc Văn phòng Quốc tế để phân bổ và lọc tin tuyển dụng.",
    formHeading: "➕ Thêm Khu vực / Tỉnh Thành Tuyển dụng Mới:",
    presetLabel: "Chọn nhanh Tỉnh/Thành phố hoặc Khu Kinh tế phổ biến (1-Click):",
    lblLocName: "Tên Tỉnh / Thành phố / Khu vực Tuyển dụng *",
    placeholderLocName: "VD: Nghệ An, Khánh Hòa, Hưng Yên...",
    lblRegionGroup: "Vùng Kinh tế / Khu vực Địa lý",
    optNorth: "Miền Bắc (Northern Vietnam)",
    optCentral: "Miền Trung (Central Vietnam)",
    optSouth: "Miền Nam (Southern Vietnam)",
    optAsean: "Đông Nam Á / ASEAN & Quốc tế",
    lblIndZone: "Khu Công nghiệp / Cụm Văn phòng Trọng điểm",
    lblWorkMode: "Hình thức Làm việc",
    optModeHybrid: "On-site / Hybrid (Kết hợp)",
    optModeOnsite: "100% On-site (Tại Nhà máy / Văn phòng)",
    optModeRemote: "100% Remote / Linh hoạt",
    lblAssignJob: "Gắn ngay Khu vực này vào Vị trí Tuyển dụng đang mở (Tùy chọn):",
    optDefaultJobPrefix: "Gắn mặc định vào:",
    optNoAssign: "— Chỉ tạo khu vực (Chưa gắn vào tin cụ thể) —",
    btnSubmitCreateLoc: "✔ Tạo Khu vực Tuyển dụng & Đồng bộ Ngay",
    listHeading: "📋 Danh sách Khu vực Tuyển dụng Đang Hoạt động",
    btnFilterThisLoc: "🔍 Lọc việc làm",
    toastCreated: "📍 Đã tạo Khu vực Tuyển dụng mới thành công:",
    toastDeleted: "🗑️ Đã xóa Khu vực Tuyển dụng.",
  },
  en: {
    btnAddLocation: "➕ Create / Manage Locations",
    modalBadge: "RECRUITMENT REGIONS & ECONOMIC ZONES MANAGER",
    modalTitle: "📍 Create & Manage Recruitment Locations (63 Provinces & Global Hubs)",
    modalSub: "Add new provinces, industrial zones (VSIP, Hi-Tech Parks), or international hubs to categorize and filter executive jobs.",
    formHeading: "➕ Add New Recruitment Location / Province / Hub:",
    presetLabel: "1-Click Quick Fill from Popular Provinces & Hubs:",
    lblLocName: "Province / City / Recruitment Hub Name *",
    placeholderLocName: "e.g., Nghe An, Khanh Hoa, Hung Yen, Singapore...",
    lblRegionGroup: "Economic Region / Macro Zone",
    optNorth: "Northern Vietnam (Miền Bắc)",
    optCentral: "Central Vietnam (Miền Trung)",
    optSouth: "Southern Vietnam (Miền Nam)",
    optAsean: "ASEAN & International Hubs",
    lblIndZone: "Key Industrial Park / Corporate District",
    lblWorkMode: "Default Work Arrangement",
    optModeHybrid: "On-site / Hybrid",
    optModeOnsite: "100% On-site (Factory / Office)",
    optModeRemote: "100% Remote / Flexible",
    lblAssignJob: "Immediately Assign Location to an Open Position (Optional):",
    optDefaultJobPrefix: "Default assign to:",
    optNoAssign: "— Create location only —",
    btnSubmitCreateLoc: "✔ Create Recruitment Location & Sync Now",
    listHeading: "📋 Active Recruitment Locations & Economic Hubs",
    btnFilterThisLoc: "🔍 Filter Jobs",
    toastCreated: "📍 Created new recruitment location:",
    toastDeleted: "🗑️ Deleted recruitment location.",
  },
  ja: {
    btnAddLocation: "➕ 勤務地・工業団地を追加／管理",
    modalBadge: "採用エリア・経済特区管理センター",
    modalTitle: "📍 採用エリア・勤務地の作成と管理（全63省・都市＆海外拠点）",
    modalSub: "各省・都市、工業団地（VSIP、ハイテクパーク）や海外拠点オフィスを追加し、求人を地域別に分類・検索できます。",
    formHeading: "➕ 新しい採用エリア・省・都市を追加:",
    presetLabel: "主要省・都市・工業団地をワンクリック選択 (1-Click):",
    lblLocName: "省・都市・採用エリア名 *",
    placeholderLocName: "例: ゲアン、カインホア、フンイエン、シンガポール...",
    lblRegionGroup: "経済圏・地域グループ",
    optNorth: "北部ベトナム (Northern Vietnam)",
    optCentral: "中部ベトナム (Central Vietnam)",
    optSouth: "南部ベトナム (Southern Vietnam)",
    optAsean: "ASEAN・国際拠点",
    lblIndZone: "主要工業団地・オフィス街",
    lblWorkMode: "勤務形態",
    optModeHybrid: "出社 / ハイブリッド (On-site / Hybrid)",
    optModeOnsite: "100% 出社（工場・オフィス）",
    optModeRemote: "100% リモート・柔軟勤務",
    lblAssignJob: "公開中の求人にこの勤務地を紐付ける（任意）:",
    optDefaultJobPrefix: "デフォルト紐付け:",
    optNoAssign: "— エリアのみ作成（求人に紐付けない） —",
    btnSubmitCreateLoc: "✔ 採用エリアを作成して即時同期",
    listHeading: "📋 現在有効な採用エリア・工業団地一覧",
    btnFilterThisLoc: "🔍 求人を絞り込む",
    toastCreated: "📍 新しい採用エリアを作成しました:",
    toastDeleted: "🗑️ 採用エリアを削除しました。",
  },
  ko: {
    btnAddLocation: "➕ 채용 지역·산업단지 추가/관리",
    modalBadge: "채용 지역 및 경제특구 관리 센터",
    modalTitle: "📍 채용 지역 생성 및 관리 (베트남 63개 성·시 및 글로벌 거점)",
    modalSub: "주요 성·시, 산업단지(VSIP, 하이테크 파크) 또는 글로벌 오피스를 추가하여 채용공고를 분류하고 필터링합니다.",
    formHeading: "➕ 신규 채용 지역 / 성·시 추가:",
    presetLabel: "주요 성·시 및 산업단지 원클릭 빠른 선택 (1-Click):",
    lblLocName: "성 / 도시 / 채용 거점명 *",
    placeholderLocName: "예: 응에안, 카인호아, 흥옌, 싱가포르...",
    lblRegionGroup: "경제권 / 권역 분류",
    optNorth: "베트남 북부 (Northern Vietnam)",
    optCentral: "베트남 중부 (Central Vietnam)",
    optSouth: "베트남 남부 (Southern Vietnam)",
    optAsean: "ASEAN 동남아 및 해외 거점",
    lblIndZone: "핵심 산업단지 / 오피스 지구",
    lblWorkMode: "근무 형태",
    optModeHybrid: "대면 / 하이브리드 (On-site / Hybrid)",
    optModeOnsite: "100% 대면 출근 (공장 / 오피스)",
    optModeRemote: "100% 원격 / 유연 근무",
    lblAssignJob: "현재 진행 중인 채용공고에 즉시 연결 (선택사항):",
    optDefaultJobPrefix: "기본 연결 공고:",
    optNoAssign: "— 지역만 생성 (특정 공고 미연결) —",
    btnSubmitCreateLoc: "✔ 채용 지역 생성 및 즉시 동기화",
    listHeading: "📋 현재 활성화된 채용 지역 목록",
    btnFilterThisLoc: "🔍 채용 필터",
    toastCreated: "📍 신규 채용 지역이 생성되었습니다:",
    toastDeleted: "🗑️ 채용 지역이 삭제되었습니다.",
  },
  zh: {
    btnAddLocation: "➕ 创建 / 管理招聘地区",
    modalBadge: "招聘地区与经济特区管理中心",
    modalTitle: "📍 管理与创建新招聘地区（越南 63 省市及国际中心）",
    modalSub: "添加省市、工业园区（VSIP、高新园区）或国际办事处，用于分配和筛选高管招聘职位。",
    formHeading: "➕ 添加新招聘地区 / 省市:",
    presetLabel: "一键快速选择热门省市或工业区 (1-Click):",
    lblLocName: "省 / 市 / 招聘区域名称 *",
    placeholderLocName: "例如：义安、庆和、兴安、新加坡...",
    lblRegionGroup: "经济区 / 地理区域",
    optNorth: "越南北部 (Northern Vietnam)",
    optCentral: "越南中部 (Central Vietnam)",
    optSouth: "越南南部 (Southern Vietnam)",
    optAsean: "东盟 ASEAN 及国际地区",
    lblIndZone: "重点工业园区 / 办公集群",
    lblWorkMode: "办公模式",
    optModeHybrid: "现场 / 混合办公 (On-site / Hybrid)",
    optModeOnsite: "100% 现场办公（工厂 / 办公室）",
    optModeRemote: "100% 远程 / 灵活办公",
    lblAssignJob: "立即将该地区绑定至在招职位（可选）:",
    optDefaultJobPrefix: "默认绑定至:",
    optNoAssign: "— 仅创建地区（暂不绑定具体职位） —",
    btnSubmitCreateLoc: "✔ 创建招聘地区并立即同步",
    listHeading: "📋 当前活跃招聘地区列表",
    btnFilterThisLoc: "🔍 筛选职位",
    toastCreated: "📍 已成功创建新招聘地区:",
    toastDeleted: "🗑️ 已删除招聘地区。",
  },
  th: {
    btnAddLocation: "➕ สร้าง / จัดการพื้นที่รับสมัครงาน",
    modalBadge: "ศูนย์จัดการพื้นที่รับสมัครงานและเขตเศรษฐกิจ",
    modalTitle: "📍 จัดการและสร้างพื้นที่รับสมัครงานใหม่ (63 จังหวัด & ต่างประเทศ)",
    modalSub: "เพิ่มจังหวัด นิคมอุตสาหกรรม (VSIP, Hi-Tech Park) หรือสำนักงานต่างประเทศเพื่อคัดกรองตำแหน่งงาน",
    formHeading: "➕ เพิ่มพื้นที่ / จังหวัดรับสมัครงานใหม่:",
    presetLabel: "เลือกจังหวัดหรือเขตเศรษฐกิจยอดนิยมด่วน (1-Click):",
    lblLocName: "ชื่อจังหวัด / เมือง / พื้นที่รับสมัครงาน *",
    placeholderLocName: "เช่น เหงะอาน, คั้ญฮหว่า, ฮึงเอียน...",
    lblRegionGroup: "ภูมิภาคเศรษฐกิจ / เขตพื้นที่",
    optNorth: "ภาคเหนือเวียดนาม (Northern Vietnam)",
    optCentral: "ภาคกลางเวียดนาม (Central Vietnam)",
    optSouth: "ภาคใต้เวียดนาม (Southern Vietnam)",
    optAsean: "อาเซียน & ต่างประเทศ (ASEAN & Global)",
    lblIndZone: "นิคมอุตสาหกรรม / ย่านสำนักงานหลัก",
    lblWorkMode: "รูปแบบการทำงาน",
    optModeHybrid: "On-site / Hybrid (ผสมผสาน)",
    optModeOnsite: "100% On-site (ประจำโรงงาน / สำนักงาน)",
    optModeRemote: "100% Remote / ยืดหยุ่น",
    lblAssignJob: "ผูกพื้นที่นี้เข้ากับตำแหน่งงานที่เปิดรับทันที (ตัวเลือก):",
    optDefaultJobPrefix: "ผูกค่าเริ่มต้นกับ:",
    optNoAssign: "— สร้างเฉพาะพื้นที่เท่านั้น —",
    btnSubmitCreateLoc: "✔ สร้างพื้นที่รับสมัครงานและซิงค์ทันที",
    listHeading: "📋 รายชื่อพื้นที่รับสมัครงานที่เปิดใช้งานอยู่",
    btnFilterThisLoc: "🔍 กรองงาน",
    toastCreated: "📍 สร้างพื้นที่รับสมัครงานใหม่สำเร็จ:",
    toastDeleted: "🗑️ ลบพื้นที่รับสมัครงานแล้ว",
  },
  lo: {
    btnAddLocation: "➕ ສ້າງ / ຈັດການພື້ນທີ່ຮັບສະໝັກວຽກ",
    modalBadge: "ສູນບໍລິຫານພື້ນທີ່ຮັບສະໝັກວຽກ & ເຂດເສດຖະກິດ",
    modalTitle: "📍 ຈັດການ ແລະ ສ້າງພື້ນທີ່ຮັບສະໝັກວຽກໃໝ່ (63 ແຂວງ/ນະຄອນ & ສາກົນ)",
    modalSub: "ເພີ່ມແຂວງ/ນະຄອນ, ເຂດອຸດສາຫະກຳ (VSIP) ຫຼື ຫ້ອງການສາກົນເພື່ອຈັດสรร ແລະ ກັ່ນຕອງວຽກ.",
    formHeading: "➕ ເພີ່ມພື້ນທີ່ / ແຂວງຮັບສະໝັກວຽກໃໝ່:",
    presetLabel: "ເລືອກດ່ວນແຂວງ/ນະຄອນ ຫຼື ເຂດເສດຖະກິດຍອດນິຍົມ (1-Click):",
    lblLocName: "ຊື່ແຂວງ / ນະຄອນ / ພື້ນທີ່ຮັບສະໝັກວຽກ *",
    placeholderLocName: "ຕົວຢ່າງ: ເງະອານ, ແຄ໊ງຮວ່າ, ຮຶງອຽນ...",
    lblRegionGroup: "ພາກເສດຖະກິດ / ພູມສາດ",
    optNorth: "ພາກເໜືອຫວຽດນາມ (Northern Vietnam)",
    optCentral: "ພາກກາງຫວຽດນາມ (Central Vietnam)",
    optSouth: "ພາກໃຕ້ຫວຽດນາມ (Southern Vietnam)",
    optAsean: "ອາຊຽນ & ສາກົນ (ASEAN & Global)",
    lblIndZone: "ເຂດອຸດສາຫະກຳ / ກຸ່ມຫ້ອງການຈຸດສຸມ",
    lblWorkMode: "ຮູບແບບການເຮັດວຽກ",
    optModeHybrid: "On-site / Hybrid (ປະສົມປະສານ)",
    optModeOnsite: "100% On-site (ຢູ່ໂຮງງານ / ຫ້ອງການ)",
    optModeRemote: "100% Remote / ยືດหยຸ່ນ",
    lblAssignJob: "ຕິດພື້ນທີ່ນີ້ໃສ່ຕຳແໜ່ງວຽກທີ່ກຳລັງເປີດ (ທາງເລືອກ):",
    optDefaultJobPrefix: "ຕິດຄ່າເລີ່ມຕົ້ນໃສ່:",
    optNoAssign: "— ສ້າງສະເພາະພື້ນທີ່ເທົ່ານັ້ນ —",
    btnSubmitCreateLoc: "✔ ສ້າງພື້ນທີ່ຮັບສະໝັກວຽກ & ຊິ້ງທັນທີ",
    listHeading: "📋 ລາຍຊື່ພື້ນທີ່ຮັບສະໝັກວຽກທີ່ກຳລັງເປີດໃຊ້",
    btnFilterThisLoc: "🔍 ກັ່ນຕອງວຽກ",
    toastCreated: "📍 ສ້າງພື້ນທີ່ຮັບສະໝັກວຽກໃໝ່ສຳເລັດ:",
    toastDeleted: "🗑️ ລຶບພື້ນທີ່ຮັບສະໝັກວຽກແລ້ວ.",
  },
  km: {
    btnAddLocation: "➕ បង្កើត / គ្រប់គ្រងតំបន់ជ្រើសរើសបុគ្គលិក",
    modalBadge: "មជ្ឈមណ្ឌលគ្រប់គ្រងទីតាំង និងតំបន់សេដ្ឋកិច្ចជ្រើសរើសបុគ្គលិក",
    modalTitle: "📍 គ្រប់គ្រង និងបង្កើតតំបន់ជ្រើសរើសបុគ្គលិកថ្មី (63 ខេត្ត/ក្រុង & អន្តរជាតិ)",
    modalSub: "បន្ថែមខេត្ត/ក្រុង តំបន់ឧស្សាហកម្ម (VSIP) ឬការិយាល័យអន្តរជាតិ ដើម្បីបែងចែក និងចម្រាញ់ការងារ។",
    formHeading: "➕ បន្ថែមតំបន់ / ខេត្តក្រុងជ្រើសរើសបុគ្គលិកថ្មី:",
    presetLabel: "ជ្រើសរើសខេត្ត/ក្រុង ឬតំបន់សេដ្ឋកិច្ចពេញនិយមរហ័ស (1-Click):",
    lblLocName: "ឈ្មោះខេត្ត / ក្រុង / តំបន់ជ្រើសរើសបុគ្គលិក *",
    placeholderLocName: "ឧ. Nghe An, Khanh Hoa, Hung Yen...",
    lblRegionGroup: "តំបន់សេដ្ឋកិច្ច / ភូមិសាស្ត្រ",
    optNorth: "ភាគខាងជើងវៀតណាម (Northern Vietnam)",
    optCentral: "ភាគកណ្តាលវៀតណាម (Central Vietnam)",
    optSouth: "ភាគខាងត្បូងវៀតណាម (Southern Vietnam)",
    optAsean: "អាស៊ាន & អន្តរជាតិ (ASEAN & Global)",
    lblIndZone: "តំបន់ឧស្សាហកម្ម / មជ្ឈមណ្ឌលការិយាល័យសំខាន់",
    lblWorkMode: "ទម្រង់ការងារ",
    optModeHybrid: "On-site / Hybrid (រួមបញ្ចូលគ្នា)",
    optModeOnsite: "100% On-site (នៅរោងចក្រ / ការិយាល័យ)",
    optModeRemote: "100% Remote / បត់បែន",
    lblAssignJob: "ភ្ជាប់តំបន់នេះទៅនឹងតំណែងការងារកំពុងបើកភ្លាមៗ (ជម្រើស):",
    optDefaultJobPrefix: "ភ្ជាប់លំនាំដើមទៅ:",
    optNoAssign: "— បង្កើតតែតំបន់ប៉ុណ្ណោះ —",
    btnSubmitCreateLoc: "✔ បង្កើតតំបន់ជ្រើសរើសបុគ្គលិក & សមកាលកម្មភ្លាមៗ",
    listHeading: "📋 បញ្ជីតំបន់ជ្រើសរើសបុគ្គលិកដែលកំពុងដំណើរការ",
    btnFilterThisLoc: "🔍 ចម្រាញ់ការងារ",
    toastCreated: "📍 បានបង្កើតតំបន់ជ្រើសរើសបុគ្គលិកថ្មីដោយជោគជ័យ:",
    toastDeleted: "🗑️ បានលុបតំបន់ជ្រើសរើសបុគ្គលិក។",
  },
};

function locModalDict() {
  return LOC_MODAL_I18N[portalState.lang] || LOC_MODAL_I18N.en || LOC_MODAL_I18N.vi;
}

function getActiveLocationsList() {
  if (!portalState.locations || portalState.locations.length === 0) {
    portalState.locations = [...DEFAULT_LOCATIONS_LIST];
  }
  return portalState.locations;
}

function translateLocationPill(locObj) {
  if (!locObj) return "";
  const map = LOC_CODE_TRANSLATIONS[locObj.code];
  if (map && map[portalState.lang]) return map[portalState.lang];
  return localizePortalLocation(locObj.name);
}

function doesJobMatchLocationCode(job, locCode) {
  if (!locCode || locCode === "all") return true;
  const rawLoc = ((job.location || "") + " " + (job.localized_location || "")).toLowerCase();
  const locObj = getActiveLocationsList().find((l) => l.code === locCode);
  const nameLower = locObj ? locObj.name.toLowerCase() : locCode.toLowerCase();

  if (rawLoc.includes(locCode.toLowerCase()) || rawLoc.includes(nameLower)) return true;
  if (locCode === "hanoi" && rawLoc.includes("hà nội")) return true;
  if (locCode === "hcmc" && (rawLoc.includes("hồ chí minh") || rawLoc.includes("tp.hcm"))) return true;
  if (locCode === "danang" && rawLoc.includes("đà nẵng")) return true;
  if (locCode === "haiphong" && rawLoc.includes("hải phòng")) return true;
  if (locCode === "bacninh" && rawLoc.includes("bắc ninh")) return true;
  if (locCode === "binhduong" && rawLoc.includes("bình dương")) return true;
  if (locCode === "dongnai" && rawLoc.includes("đồng nai")) return true;
  if (locCode === "cantho" && (rawLoc.includes("cần thơ") || rawLoc.includes("đồng bằng sông cửu long"))) return true;
  if (locCode === "quangninh" && rawLoc.includes("quảng ninh")) return true;
  if (locCode === "vungtau" && (rawLoc.includes("vũng tàu") || rawLoc.includes("bà rịa"))) return true;
  if (locCode === "asean" && (rawLoc.includes("bangkok") || rawLoc.includes("vientiane") || rawLoc.includes("phnom penh") || rawLoc.includes("asean"))) return true;
  if (locCode === "remote" && (rawLoc.includes("remote") || rawLoc.includes("hybrid") || rawLoc.includes("từ xa"))) return true;
  return false;
}

function doesJobMatchMacroRegion(job, macroReg) {
  if (!macroReg || macroReg === "all") return true;
  const locsInMacro = getActiveLocationsList().filter((l) => l.region_group === macroReg);
  if (locsInMacro.some((l) => doesJobMatchLocationCode(job, l.code))) return true;
  const rawLoc = ((job.location || "") + " " + (job.localized_location || "")).toLowerCase();
  if (macroReg === "Miền Bắc" && /hà nội|hải phòng|bắc ninh|quảng ninh|hưng yên|bắc giang|thái nguyên|vĩnh phúc/i.test(rawLoc)) return true;
  if (macroReg === "Miền Trung" && /đà nẵng|hội an|nha trang|khánh hòa|nghệ an|thanh hóa|bình thuận|ninh thuận/i.test(rawLoc)) return true;
  if (macroReg === "Miền Nam" && /hồ chí minh|bình dương|đồng nai|cần thơ|vũng tàu|long an|phú quốc|cửu long/i.test(rawLoc)) return true;
  if (macroReg === "Quốc tế / ASEAN" && /bangkok|vientiane|phnom penh|remote|asean|singapore|tokyo|seoul/i.test(rawLoc)) return true;
  return false;
}

let liveClockTimer = null;
function startLiveBoardClock() {
  if (liveClockTimer) clearInterval(liveClockTimer);
  const updateClock = () => {
    const el = document.getElementById("jc-live-board-clock");
    if (el) {
      const now = new Date();
      el.textContent = now.toTimeString().split(" ")[0];
    }
  };
  updateClock();
  liveClockTimer = setInterval(updateClock, 1000);
}

async function loadMarketplaceData() {
  try {
    const [mktRes, demoRes, locRes] = await Promise.all([
      fetch(`${API_BASE}/api/public/marketplace`),
      fetch(`${API_BASE}/api/auth/demo-accounts`),
      fetch(`${API_BASE}/api/locations`).catch(() => null),
    ]);
    if (mktRes.ok) {
      portalState.marketplace = await mktRes.json();
    }
    if (demoRes.ok) {
      portalState.demoAccounts = await demoRes.json();
    }
    if (locRes && locRes.ok) {
      const locData = await locRes.json();
      if (locData.items && locData.items.length > 0) {
        portalState.locations = locData.items;
        try {
          localStorage.removeItem("hiremind_custom_locations");
        } catch (_e) {}
      }
    } else {
      getActiveLocationsList();
    }
    renderPortalHeader();
    renderPortalMain();
    startLiveBoardClock();
    runAutoTranslateDynamicStrings(false);
  } catch (err) {
    console.error("Failed to load marketplace:", err);
  }
}

/* ============================================================================
   6. UNIFIED PORTAL RENDERER (VIECLAM24H + VIETJOBS + GLOBAL STANDARD)
   ============================================================================ */
function renderPortalMain() {
  const container = document.getElementById("portal-main-content");
  if (!container) return;
  const pd = pDict();
  const ed = eDict();
  const lmd = locModalDict();
  const mkt = portalState.marketplace;
  const sec = portalState.activeSection;
  const locationsList = getActiveLocationsList();

  if (sec === "my_apps") {
    renderMyAppsSection(container);
    return;
  }
  if (sec === "categories") {
    renderCategoriesDedicatedView(container);
    return;
  }
  if (sec === "employers") {
    renderEmployersDedicatedView(container);
    return;
  }
  if (sec === "tools") {
    renderCareerToolsDedicatedView(container);
    return;
  }

  // Ensure new filter defaults exist
  if (portalState.minSalaryMillion === undefined) portalState.minSalaryMillion = 0;
  if (!portalState.selectedMacroRegion) portalState.selectedMacroRegion = "all";
  if (!portalState.workTypeFilter) portalState.workTypeFilter = "all";
  if (!portalState.dateListedFilter) portalState.dateListedFilter = "any";

  const q = (portalState.searchQuery || "").trim().toLowerCase();
  const allJobsEnriched = (mkt.jobs || []).map((raw, idx) => {
    const loc = localizePortalJob(raw);
    const vipInfo = typeof getEmployerVipTierInfo === "function"
      ? getEmployerVipTierInfo(raw.org_id, idx)
      : { tier_code: "diamond_vip", badge_label: "👑 DIAMOND VIP • X5.0", priority_score: 100, is_pinned: idx < 4 };
    return {
      ...loc,
      is_senior: isSeniorExecutiveJob(loc),
      ai_match: computeJobAiMatch(loc),
      max_salary_num: parseMaxSalaryNumeric(raw.salary_range),
      posted_days_ago: (idx % 7) + 1,
      vip_tier: vipInfo.tier_code,
      vip_badge: vipInfo.badge_label,
      vip_priority: vipInfo.priority_score,
      vip_pinned: vipInfo.is_pinned,
    };
  });

  let filteredJobs = allJobsEnriched.filter((j) => {
    const matchCat = portalState.selectedCategory === "all" || j.department === portalState.selectedCategory;
    const matchEmp = portalState.selectedEmployer === "all" || j.org_id === portalState.selectedEmployer;
    const matchLvl =
      portalState.selectedLevel === "all" ||
      (portalState.selectedLevel === "senior" && j.is_senior) ||
      (portalState.selectedLevel === "middle" && !j.is_senior) ||
      (portalState.selectedLevel === "saved" && portalState.savedJobs.includes(j.id));

    const matchLoc = doesJobMatchLocationCode(j, portalState.selectedLocation);
    const matchMacro = doesJobMatchMacroRegion(j, portalState.selectedMacroRegion);
    const matchSalary = !portalState.minSalaryMillion || j.max_salary_num >= Number(portalState.minSalaryMillion);
    const matchDate =
      portalState.dateListedFilter === "any" ||
      (portalState.dateListedFilter === "today" && j.posted_days_ago <= 2) ||
      (portalState.dateListedFilter === "3days" && j.posted_days_ago <= 3) ||
      (portalState.dateListedFilter === "7days" && j.posted_days_ago <= 7);

    const matchQ =
      !q ||
      j.localized_title.toLowerCase().includes(q) ||
      j.title.toLowerCase().includes(q) ||
      j.localized_company.toLowerCase().includes(q) ||
      j.localized_department.toLowerCase().includes(q) ||
      j.localized_location.toLowerCase().includes(q) ||
      (j.must_have_skills || []).some((s) => s.toLowerCase().includes(q));

    return matchCat && matchEmp && matchLvl && matchLoc && matchMacro && matchSalary && matchDate && matchQ;
  });

  if (portalState.sortBy === "salary") {
    filteredJobs.sort((a, b) => b.max_salary_num - a.max_salary_num);
  } else if (portalState.sortBy === "exp") {
    filteredJobs.sort((a, b) => (b.min_experience_years || 0) - (a.min_experience_years || 0));
  } else if (portalState.sortBy === "vip_priority") {
    filteredJobs.sort((a, b) => (b.vip_priority - a.vip_priority) || (b.ai_match - a.ai_match));
  } else {
    filteredJobs.sort((a, b) => ((b.vip_pinned ? 1 : 0) - (a.vip_pinned ? 1 : 0)) || (b.ai_match - a.ai_match));
  }

  const activeJob =
    filteredJobs.find((j) => j.id === portalState.selectedJobId) ||
    filteredJobs[0] ||
    null;
  if (activeJob) {
    portalState.selectedJobId = activeJob.id;
  }

  const pf = pFull();
  container.innerHTML = `
    <!-- ======================================================================
         BLOCK 1: COMMANDING EXECUTIVE HERO BANNER + ELEVATED MEGA SEARCH DOCK
         (VietnamWorks • LinkedIn Talent • ViecLam24h Global Standard)
         ====================================================================== -->
    <section id="section-hero-search" class="portal-hero-mesh rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-6 border border-blue-800/60 relative overflow-hidden">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-7 relative z-10">
        <div class="space-y-3.5 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/35">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>⚡ ${pd.heroTag}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15">
              ${pf.heroAiBadge}
            </span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-white leading-[1.32] tracking-tight">
            ${pd.heroTitle}
          </h1>
          <p class="text-sm sm:text-base text-blue-100/90 leading-[1.7] max-w-2xl">
            ${pd.heroSub}
          </p>
        </div>

        <!-- Executive Glassmorphic KPI Counters & Action Buttons -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <div onclick="scrollToPortalBlock('section-job-explorer')" class="cursor-pointer px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-lg text-center min-w-[108px] transition">
            <div class="text-2xl font-extrabold text-cyan-300 font-mono">${mkt.total_open_jobs || 30}</div>
            <div class="text-[11px] text-blue-100 font-semibold mt-0.5">${pd.statJobs}</div>
          </div>
          <div onclick="openLocationManagerModal()" class="cursor-pointer px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-lg text-center min-w-[108px] transition">
            <div class="text-2xl font-extrabold text-emerald-300 font-mono">${locationsList.length}</div>
            <div class="text-[11px] text-blue-100 font-semibold mt-0.5">${pf.statLocations}</div>
          </div>
          <div onclick="switchPortalSection('employers')" class="cursor-pointer px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-lg text-center min-w-[108px] transition">
            <div class="text-2xl font-extrabold text-amber-300 font-mono">${(mkt.employers || []).length || 6}</div>
            <div class="text-[11px] text-blue-100 font-semibold mt-0.5">${pd.statEmployers}</div>
          </div>
          <div class="flex flex-col gap-2">
            <button onclick="openQuickPostJobModal()"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5">
              <span>📢</span>
              <span>${pf.btnPostJobHero}</span>
            </button>
            <a href="/login.html"
              class="px-5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs transition flex items-center justify-center gap-1.5">
              <span>🔐</span>
              <span>${pf.btnSsoHero}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- ELEVATED WHITE MEGA SEARCH DOCK (High-Contrast Tactile Controls) -->
      <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/95 text-slate-900 dark:text-white border border-white/30 dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-3.5 relative z-10">
        <!-- Row 1: Primary Keyword + Sector + Location + Search CTA -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div class="md:col-span-4 relative">
            <input type="text" value="${portalState.searchQuery}" oninput="updatePortalFilter('q', this.value)"
              placeholder="${pf.searchPlaceholder}"
              class="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none border-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:bg-white transition" />
          </div>
          <div class="md:col-span-3">
            <select onchange="updatePortalFilter('cat', this.value)"
              class="w-full h-12 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none border-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 cursor-pointer">
              <option value="all">📂 ${pd.allCategories} (${mkt.total_open_jobs || 30})</option>
              ${(mkt.categories || [])
                .map(
                  (c) =>
                    `<option value="${c.name}" ${portalState.selectedCategory === c.name ? "selected" : ""}>
                      ${SECTOR_ICONS[c.name] || "📂"} ${translateSector(c.name)} (${c.job_count})
                    </option>`
                )
                .join("")}
            </select>
          </div>
          <div class="md:col-span-3">
            <select onchange="updatePortalFilter('loc', this.value)"
              class="w-full h-12 px-3.5 rounded-xl bg-blue-50/60 dark:bg-slate-800 text-blue-800 dark:text-blue-300 text-sm font-bold focus:outline-none border-2 border-blue-200 dark:border-slate-700 focus:border-blue-600 cursor-pointer">
              <option value="all">${pf.allLocationsOpt} (${locationsList.length})</option>
              ${locationsList
                .map((loc) => {
                  const cnt = allJobsEnriched.filter((j) => doesJobMatchLocationCode(j, loc.code)).length;
                  return `<option value="${loc.code}" ${portalState.selectedLocation === loc.code ? "selected" : ""}>
                    📍 ${translateLocationPill(loc)} (${cnt})
                  </option>`;
                })
                .join("")}
            </select>
          </div>
          <div class="md:col-span-2 flex">
            <button onclick="scrollToPortalBlock('section-job-explorer')"
              class="w-full h-12 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
              <span>🔍</span>
              <span>${pf.btnFindJobs} (${filteredJobs.length})</span>
            </button>
          </div>
        </div>

        <!-- Row 2: 5-Column Refine Filter Bar inside Search Dock -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          <div>
            <select onchange="updatePortalFilter('emp', this.value)"
              class="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:border-blue-500 cursor-pointer">
              <option value="all">🏢 ${pd.allEmployers} (${(mkt.employers || []).length})</option>
              ${(mkt.employers || [])
                .map((e) => {
                  const locComp = translateEmployerName(e.org_id, e.company_name);
                  return `<option value="${e.org_id}" ${portalState.selectedEmployer === e.org_id ? "selected" : ""}>
                      🏢 ${locComp} (${e.open_jobs_count})
                    </option>`;
                })
                .join("")}
            </select>
          </div>

          <div>
            <select onchange="updatePortalFilter('salary_min', this.value)"
              class="w-full h-10 px-3 rounded-xl bg-emerald-50/70 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-slate-700 focus:border-emerald-500 cursor-pointer">
              <option value="0" ${Number(portalState.minSalaryMillion) === 0 ? "selected" : ""}>${pf.salAll}</option>
              <option value="30" ${Number(portalState.minSalaryMillion) === 30 ? "selected" : ""}>${pf.sal30}</option>
              <option value="50" ${Number(portalState.minSalaryMillion) === 50 ? "selected" : ""}>${pf.sal50}</option>
              <option value="70" ${Number(portalState.minSalaryMillion) === 70 ? "selected" : ""}>${pf.sal70}</option>
              <option value="100" ${Number(portalState.minSalaryMillion) === 100 ? "selected" : ""}>${pf.sal100}</option>
            </select>
          </div>

          <div>
            <select onchange="updatePortalFilter('lvl', this.value)"
              class="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:border-blue-500 cursor-pointer">
              <option value="all" ${portalState.selectedLevel === "all" ? "selected" : ""}>${pf.lvlAll}</option>
              <option value="senior" ${portalState.selectedLevel === "senior" ? "selected" : ""}>${pf.lvlSenior}</option>
              <option value="middle" ${portalState.selectedLevel === "middle" ? "selected" : ""}>${pf.lvlMiddle}</option>
              <option value="saved" ${portalState.selectedLevel === "saved" ? "selected" : ""}>${pf.lvlSaved} (${portalState.savedJobs.length})</option>
            </select>
          </div>

          <div>
            <select onchange="updatePortalFilter('date', this.value)"
              class="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:border-blue-500 cursor-pointer">
              <option value="any" ${portalState.dateListedFilter === "any" ? "selected" : ""}>${pf.dateAny}</option>
              <option value="today" ${portalState.dateListedFilter === "today" ? "selected" : ""}>${pf.dateToday}</option>
              <option value="3days" ${portalState.dateListedFilter === "3days" ? "selected" : ""}>${pf.date3d}</option>
              <option value="7days" ${portalState.dateListedFilter === "7days" ? "selected" : ""}>${pf.date7d}</option>
            </select>
          </div>

          <div>
            <select onchange="updatePortalFilter('sort', this.value)"
              class="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:border-blue-500 cursor-pointer">
              <option value="ai_match" ${portalState.sortBy === "ai_match" ? "selected" : ""}>${ed.sortMatch}</option>
              <option value="vip_priority" ${portalState.sortBy === "vip_priority" ? "selected" : ""}>${pf.sortVip}</option>
              <option value="salary" ${portalState.sortBy === "salary" ? "selected" : ""}>${ed.sortSalary}</option>
              <option value="exp" ${portalState.sortBy === "exp" ? "selected" : ""}>${ed.sortExp}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Trending Searches & Location Manager Bar -->
      <div class="pt-1 flex flex-wrap items-center justify-between gap-2.5 text-xs relative z-10">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-cyan-300 font-bold mr-1">${pf.trendingLabel}</span>
          ${[
            { label: pf.trAi, q: "AI" },
            { label: pf.trCfo, q: "Tài chính" },
            { label: pf.trFdi, q: "Nhà máy" },
            { label: pf.trEsg, q: "Năng lượng" },
            { label: pf.trLog, q: "Chuỗi cung ứng" },
            { label: pf.trHcmc, loc: "hcmc" },
            { label: pf.trHanoi, loc: "hanoi" },
            { label: pf.trBinhDuong, loc: "binhduong" },
            { label: pf.trBacNinh, loc: "bacninh" },
          ]
            .map((tr) =>
              tr.loc
                ? `<button onclick="updatePortalFilter('loc', '${tr.loc}')" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-teal-500/30 text-white border border-white/20 hover:border-teal-300 text-xs font-semibold transition">${tr.label}</button>`
                : `<button onclick="applyQuickTrendingSearch('${tr.q}')" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-blue-500/30 text-white border border-white/20 hover:border-cyan-300 text-xs font-semibold transition">${tr.label}</button>`
            )
            .join("")}
        </div>

        <button onclick="openLocationManagerModal()"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/25 to-blue-500/25 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-200 border border-cyan-400/40 font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-sm">
          <span>${lmd.btnAddLocation}</span>
        </button>
      </div>
    </section>

    <!-- ======================================================================
         BLOCK 1.5: 4-BANNER VIP HERO SPOTLIGHT SECTION (NGAY DƯỚI HERO SLIDER)
         (Above-the-Fold High-CTR 4-Column Enterprise Billboard Showcase)
         ====================================================================== -->
    <section id="section-hero-spotlight-ads" class="space-y-3">
      ${typeof renderHeroSpotlightBannersSection === "function" ? renderHeroSpotlightBannersSection(publicAdBannersState) : ""}
    </section>

    <!-- ======================================================================
         BLOCK 2: LIVE JOB BOARD TICKER & 4-PILLAR TRUST STRIP
         (VietJobs jc-board + jc-trust-strip Standard)
         ====================================================================== -->
    <section id="section-live-board" class="space-y-4">
      <div class="portal-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800">
        <div class="px-5 py-3 bg-gradient-to-r from-slate-50 via-blue-50/60 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold uppercase tracking-wider text-slate-800 dark:text-white">${pf.liveBoardTitle}</span>
            <span class="hidden sm:inline text-slate-400">|</span>
            <span class="hidden sm:inline text-slate-500">${pf.liveBoardSub}</span>
          </div>
          <div class="flex items-center gap-3">
            <span id="jc-live-board-clock" class="font-mono font-bold text-blue-700 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-slate-700">08:30:00</span>
          </div>
        </div>

        <!-- Live Ticker Header Columns -->
        <div class="hidden md:grid md:grid-cols-12 gap-3 px-5 py-2 bg-slate-100/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60 dark:border-slate-800">
          <div class="col-span-4">${pf.colPosition}</div>
          <div class="col-span-2">${pf.colLocation}</div>
          <div class="col-span-2">${pf.colSalary}</div>
          <div class="col-span-3">${pf.colCompany}</div>
          <div class="col-span-1 text-right">${pf.colStatus}</div>
        </div>

        <!-- Live Ticker Rows (Top 6 Filtered Jobs) -->
        <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          ${filteredJobs
            .slice(0, 6)
            .map(
              (jb) => `
            <div onclick="selectPortalJob('${jb.id}'); scrollToPortalBlock('section-job-explorer');"
              class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 cursor-pointer items-center transition">
              <div class="md:col-span-4 font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                <span class="text-blue-600">▸</span>
                <span class="truncate">${jb.localized_title}</span>
              </div>
              <div class="md:col-span-2 text-slate-600 dark:text-slate-300 truncate">📍 ${jb.localized_location}</div>
              <div class="md:col-span-2 font-mono font-semibold text-emerald-700 dark:text-emerald-400 truncate">💰 ${jb.localized_salary}</div>
              <div class="md:col-span-3 text-indigo-700 dark:text-indigo-300 font-medium truncate">🏢 ${jb.localized_company}</div>
              <div class="md:col-span-1 flex md:justify-end">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                  ● Open
                </span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- 4-Pillar Trust Strip (VietJobs jc-trust-strip) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">🛡️</span>
          <span class="font-medium text-slate-700 dark:text-slate-200">${pf.trust1Prefix} <b>${mkt.total_open_jobs || 30}+ ${pf.trust1Bold}</b> ${pf.trust1Suffix}</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <span class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">⚡</span>
          <span class="font-medium text-slate-700 dark:text-slate-200"><b>${pf.trust2Bold}</b> ${pf.trust2Suffix}</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <span class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">🤖</span>
          <span class="font-medium text-slate-700 dark:text-slate-200"><b>${pf.trust3Bold}</b> ${pf.trust3Suffix}</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <span class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">🏢</span>
          <span class="font-medium text-slate-700 dark:text-slate-200">${pf.trust4Prefix} <b>${pf.trust4Bold}</b></span>
        </div>
      </div>

      <!-- Real-Time Daily Traffic, Enterprise Member Registrations & Individual Job Applications Telemetry Strip -->
      <div id="public-live-traffic-bar"></div>
    </section>

    <!-- ======================================================================
         BLOCK 3: JOB SEEKER / EMPLOYER DUAL VALUE SPLIT CARDS
         (VietJobs Seeker vs Employer Split CTA Standard)
         ====================================================================== -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="portal-card p-6 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/40 dark:from-slate-900 dark:to-slate-900 border border-teal-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">${pf.seekerBadge}</span>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">${pf.seekerTitle}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400">${pf.seekerDesc}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button onclick="openCandidateAuthModal()" class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition">
            ${pf.seekerBtnCv}
          </button>
          <button onclick="switchPortalSection('tools')" class="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 text-teal-700 dark:text-teal-300 text-xs font-semibold transition">
            ${pf.seekerBtnCalc}
          </button>
        </div>
      </div>

      <div class="portal-card p-6 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/40 dark:from-slate-900 dark:to-slate-900 border border-indigo-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">${pf.empBadge}</span>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">${pf.empTitle}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400">${pf.empDesc}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button onclick="openQuickPostJobModal()" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition">
            ${pf.empBtnPost}
          </button>
          <a href="/index.html" class="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition">
            ${pf.empBtnAts}
          </a>
        </div>
      </div>
    </section>

    <!-- ======================================================================
         BLOCK 4: MAIN JOB EXPLORER WORKSPACE
         (Toggleable: International Split-View OR VietJobs Grid + Right Category Sidebar)
         ====================================================================== -->
    <section id="section-job-explorer" class="space-y-4">
      <!-- Explorer Toolbar: Sector Quick Pills + View Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-x-auto custom-scroll pb-1 max-w-full lg:max-w-[72%]">
          <button onclick="updatePortalFilter('cat', 'all')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border transition ${
              portalState.selectedCategory === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "portal-card text-slate-700 dark:text-slate-200"
            }">
            🌐 ${pd.allCategories} (${mkt.total_open_jobs || 30})
          </button>
          ${(mkt.categories || [])
            .map((cat) => {
              const active = portalState.selectedCategory === cat.name;
              return `
                <button onclick="updatePortalFilter('cat', '${cat.name.replace(/'/g, "\\'")}')"
                  class="px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 border transition flex items-center gap-1.5 ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm font-semibold"
                      : "portal-card text-slate-700 dark:text-slate-200"
                  }">
                  <span>${SECTOR_ICONS[cat.name] || "💼"}</span>
                  <span>${translateSector(cat.name)}</span>
                  <span class="px-1.5 py-0.5 rounded-full text-[10px] ${
                    active ? "bg-white/25 text-white" : "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold"
                  }">${cat.job_count}</span>
                </button>
              `;
            })
            .join("")}
        </div>

        <!-- View Mode Toggle (Split-View LinkedIn/Indeed vs VietJobs Grid+Sidebar) -->
        <div class="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
          <button onclick="setPortalViewMode('split')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              portalState.viewMode === "split"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }">
            ${ed.viewSplit}
          </button>
          <button onclick="setPortalViewMode('grid')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              portalState.viewMode === "grid"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }">
            ${pf.viewGridBtn}
          </button>
        </div>
      </div>

      ${
        portalState.viewMode === "split"
          ? renderSplitPaneJobExplorer(filteredJobs, activeJob, pd, ed)
          : renderBentoGridJobExplorer(filteredJobs, pd, ed)
      }
    </section>

    <!-- ======================================================================
         BLOCK 5: FEATURED TOP EMPLOYERS HIRING NOW
         (VietJobs "Nhà Tuyển Dụng Nổi Bật Đang Tuyển Dụng" Standard)
         ====================================================================== -->
    <section id="section-featured-employers" class="space-y-4 pt-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${pf.featEmpBadge}</span>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">${pf.featEmpTitle}</h2>
        </div>
        <button onclick="switchPortalSection('employers')" class="text-xs font-semibold text-blue-600 hover:underline">
          ${pf.featEmpViewAllPrefix} ${(mkt.employers || []).length || 6} ${pf.featEmpViewAllSuffix}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${(mkt.employers || [])
          .map((emp) => {
            const locCompany = translateEmployerName(emp.org_id, emp.company_name);
            const locCountry = translateCountry(emp.country);
            const monogram = getCompanyMonogram(emp.company_name);
            return `
              <div class="portal-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        ${monogram}
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-snug">${locCompany}</h3>
                        <div class="text-[11px] text-slate-500 mt-0.5">${locCountry} • ${pf.tenantCodeLabel} <span class="font-mono font-semibold">${emp.org_id}</span></div>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      ✔ Verified
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">
                    ${pf.featEmpDescPrefix} <b>${emp.open_jobs_count} ${pf.featEmpDescBold}</b> ${pf.featEmpDescSuffix}
                  </p>
                </div>
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">${pf.openJobsCountLabel} ${emp.open_jobs_count}</span>
                  <div class="flex items-center gap-2">
                    <button onclick="updatePortalFilter('emp', '${emp.org_id}'); scrollToPortalBlock('section-job-explorer');"
                      class="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold transition">
                      ${pf.btnFindJobs} (${emp.open_jobs_count})
                    </button>
                    <a href="/index.html?org_id=${encodeURIComponent(emp.org_id)}"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition">
                      ATS &rarr;
                    </a>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>

    <!-- ======================================================================
         BLOCK 6: BROWSE JOBS BY REGION & 63 PROVINCES / INDUSTRIAL ZONES
         (Vieclam24h "Việc làm theo Khu vực" + VietJobs Popular Provinces Standard)
         ====================================================================== -->
    <section id="section-regional-hubs" class="portal-card p-6 sm:p-8 rounded-3xl space-y-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div class="space-y-1">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">${pf.regHubBadge}</span>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">${pf.regHubTitle}</h2>
          <p class="text-xs text-slate-500">${pf.regHubSub}</p>
        </div>

        <!-- Region Group Tabs (Toàn quốc / Miền Bắc / Miền Trung / Miền Nam / Quốc tế) -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs">
          ${[
            { val: "all", label: pf.rgAll },
            { val: "Miền Bắc", label: pf.rgNorth },
            { val: "Miền Trung", label: pf.rgCentral },
            { val: "Miền Nam", label: pf.rgSouth },
            { val: "Quốc tế / ASEAN", label: pf.rgIntl },
          ]
            .map(
              (rg) => `
            <button onclick="selectMacroRegion('${rg.val}')"
              class="px-3.5 py-2 rounded-xl font-semibold border transition ${
                portalState.selectedMacroRegion === rg.val
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500"
              }">
              ${rg.label}
            </button>
          `
            )
            .join("")}
          <button onclick="openLocationManagerModal()"
            class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition">
            ${lmd.btnAddLocation}
          </button>
        </div>
      </div>

      <!-- Popular City & Industrial Hub Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        ${locationsList
          .filter(
            (loc) =>
              portalState.selectedMacroRegion === "all" ||
              loc.region_group === portalState.selectedMacroRegion
          )
          .map((loc) => {
            const cnt = allJobsEnriched.filter((j) => doesJobMatchLocationCode(j, loc.code)).length;
            const isSelected = portalState.selectedLocation === loc.code;
            const zoneText = typeof translateDynamicText === "function"
              ? translateDynamicText(loc.industrial_zone || loc.region_group || "Việt Nam")
              : (loc.industrial_zone || loc.region_group || "Việt Nam");
            return `
              <div onclick="updatePortalFilter('loc', '${loc.code}'); scrollToPortalBlock('section-job-explorer');"
                class="p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-teal-50/90 border-teal-500 dark:bg-teal-950/60 dark:border-teal-500 shadow-sm"
                    : "bg-slate-50/70 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:border-blue-400"
                }">
                <div class="min-w-0 space-y-0.5">
                  <div class="font-bold text-sm text-slate-900 dark:text-white truncate">📍 ${translateLocationPill(loc)}</div>
                  <div class="text-[11px] text-slate-500 truncate">${zoneText}</div>
                </div>
                <span class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0 ${
                  isSelected
                    ? "bg-teal-600 text-white"
                    : "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-700"
                }">
                  ${cnt} ${pf.jobsCountUnit}
                </span>
              </div>
            `;
          })
          .join("")}
      </div>

      <!-- Vietnam Expanded Provinces Quick Directory (VietJobs "Việc làm tại Việt Nam" style) -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-semibold text-slate-500">${pf.expandProvLabel}</span>
          ${["Hưng Yên", "Vĩnh Phúc", "Thái Nguyên", "Long An", "Nghệ An", "Khánh Hòa", "Thanh Hóa", "Phú Quốc"].map(
            (pName) => `
              <button onclick="openLocationManagerModal(); setTimeout(() => fillLocationPreset('${pName}', 'Miền Bắc', 'Khu Công nghiệp & Đô thị ${pName}'), 80);"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium transition">
                ${pf.expandProvBtnPrefix} ${pName}
              </button>
            `
          ).join("")}
        </div>
        <button onclick="updatePortalFilter('loc', 'all'); selectMacroRegion('all');" class="text-blue-600 font-semibold hover:underline">
          ${pf.viewAllVnJobs}
        </button>
      </div>
    </section>

    <!-- ======================================================================
         BLOCK 7: BROWSE BY OCCUPATION / 10 INDUSTRY SECTORS
         (Vieclam24h "Việc làm theo nghề nghiệp" Standard)
         ====================================================================== -->
    <section id="section-category-matrix" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">${pf.catMatrixBadge}</span>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">${pf.catMatrixTitle}</h2>
        </div>
        <button onclick="switchPortalSection('categories')" class="text-xs font-semibold text-blue-600 hover:underline">
          ${pf.catMatrixViewAll}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        ${(mkt.categories || [])
          .map((cat) => {
            const active = portalState.selectedCategory === cat.name;
            return `
              <div onclick="updatePortalFilter('cat', '${cat.name.replace(/'/g, "\\'")}'); scrollToPortalBlock('section-job-explorer');"
                class="portal-card p-4 rounded-2xl cursor-pointer flex flex-col justify-between gap-3 ${
                  active ? "portal-card-active" : ""
                }">
                <div class="flex items-center justify-between gap-2">
                  <span class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-lg">
                    ${SECTOR_ICONS[cat.name] || "💼"}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    ${cat.job_count} ${pf.jobsCountUnit}
                  </span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${translateSector(cat.name)}</h3>
                  <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">${pf.catSalaryRange}</div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>

    <!-- ======================================================================
         BLOCK 8: HOW JOB SEARCHING WORKS — 5-STEP VISUAL JOURNEY
         (VietJobs #jc-how-it-works 5-Step Route Standard)
         ====================================================================== -->
    <section id="section-how-it-works" class="portal-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/60 dark:from-slate-900 dark:to-slate-900 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">${pf.howBadge}</span>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">${pf.howTitle}</h2>
          <p class="text-xs text-slate-500">${pf.howSub}</p>
        </div>
        <button onclick="openCandidateAuthModal()" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shrink-0">
          ${pf.howBtnStart}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
        ${(pf.howSteps || [])
          .map(
            (st) => `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">${st.step}</span>
              <span class="text-lg">${st.icon}</span>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-xs">${st.title}</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${st.desc}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
  `;
  if (typeof renderPublicTrafficTelemetryWidgets === "function") {
    renderPublicTrafficTelemetryWidgets();
  }
  if (typeof applyPublicDomTranslationPass === "function") {
    applyPublicDomTranslationPass(container);
  }
}

function renderSplitPaneJobExplorer(filteredJobs, activeJob, pd, ed) {
  const pf = pFull();
  if (filteredJobs.length === 0) {
    return `
      <div class="portal-card p-12 rounded-3xl text-center space-y-4">
        <div class="text-4xl">🔍</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">${pd.emptyTrackMsg}</h3>
        <div class="flex items-center justify-center gap-3">
          <button onclick="resetAllPortalFilters()" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
            ${pd.btnClearCategory}
          </button>
          <button onclick="openLocationManagerModal()" class="px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
            ${locModalDict().btnAddLocation}
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LEFT COLUMN (5 Cols): Master Executive Job List -->
      <div class="lg:col-span-5 space-y-3.5 max-h-[860px] overflow-y-auto custom-scroll pr-1.5">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
            ${pd.secJobsTitle} <span class="text-blue-600 dark:text-blue-400">(${filteredJobs.length})</span>
          </span>
          ${
            portalState.selectedCategory !== "all" ||
            portalState.selectedEmployer !== "all" ||
            portalState.selectedLevel !== "all" ||
            portalState.selectedLocation !== "all" ||
            portalState.selectedMacroRegion !== "all" ||
            Number(portalState.minSalaryMillion) > 0
              ? `<button onclick="resetAllPortalFilters()" class="text-xs font-semibold text-red-600 hover:underline">
                  ${pd.btnClearCategory}
                </button>`
              : ""
          }
        </div>

        ${filteredJobs
          .map((job) => {
            const isSelected = activeJob && activeJob.id === job.id;
            const isSaved = portalState.savedJobs.includes(job.id);
            const monogram = getCompanyMonogram(job.company_name);
            const vipPillClass =
              job.vip_tier === "diamond_vip"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold shadow-sm"
                : job.vip_tier === "platinum_pro"
                ? "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 font-bold"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-semibold";
            return `
              <div onclick="selectPortalJob('${job.id}')"
                class="portal-card ${
                  isSelected ? "portal-card-active" : ""
                } ${job.vip_pinned ? "ring-1 ring-amber-400/70" : ""} p-5 rounded-2xl cursor-pointer space-y-3 relative">
                <!-- Top Row: Company Monogram + Name + AI Fit Badge + Save Star -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      ${monogram}
                    </div>
                    <div class="min-w-0 space-y-0.5">
                      <div class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                        ${job.localized_company}
                      </div>
                      <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <span>${job.org_id}</span>
                        <span>•</span>
                        <span>${job.localized_country}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                      ⚡ ${job.ai_match}%
                    </span>
                    <button onclick="toggleSavePortalJob('${job.id}', event)"
                      class="w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition ${
                        isSaved
                          ? "bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-950 dark:border-amber-700"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700"
                      }"
                      title="${isSaved ? ed.btnSavedJob : ed.btnSaveJob}">
                      ${isSaved ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                <!-- VIP Tier Priority Pill + Seniority + Industry Pill -->
                <div class="flex flex-wrap items-center gap-1.5">
                  <span onclick="event.stopPropagation(); openVipMechanismModal();" title="${pf.vipBtnTitle}"
                    class="px-2.5 py-0.5 rounded-md text-[10px] tracking-wide cursor-pointer ${vipPillClass}">
                    ${job.vip_badge || "👑 DIAMOND VIP"}${job.vip_pinned ? pf.vipPinnedSuffix : ""}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                    job.is_senior
                      ? "bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-teal-50 text-teal-800 border border-teal-200/80 dark:bg-teal-950 dark:text-teal-300"
                  }">
                    ${job.is_senior ? ed.badgeSeniorExec : ed.badgeMiddleMgr}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950 dark:text-blue-300 truncate max-w-[220px]">
                    ${SECTOR_ICONS[job.department] || "💼"} ${job.localized_department}
                  </span>
                </div>

                <!-- Job Title -->
                <h3 class="text-[15px] font-bold text-slate-900 dark:text-white leading-[1.5]">
                  ${job.localized_title}
                </h3>

                <!-- Compensation & Location Row -->
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                  <span class="font-bold text-emerald-700 dark:text-emerald-400">💰 ${job.localized_salary}</span>
                  <span class="text-slate-600 dark:text-slate-400 text-xs">📍 ${job.localized_location} • <b>${job.min_experience_years}+ ${pd.lblYears}</b></span>
                </div>

                <!-- Skill Tags + View Details Link -->
                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div class="flex flex-wrap gap-1.5">
                    ${(job.must_have_skills || [])
                      .slice(0, 3)
                      .map(
                        (s) =>
                          `<span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">${s}</span>`
                      )
                      .join("")}
                  </div>
                  <span class="text-[11px] font-semibold text-blue-600 shrink-0">${job.posted_days_ago} ${pf.daysAgoSuffix} &rarr;</span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>

      <!-- RIGHT STICKY COLUMN (7 Cols): Bright 360° Executive Role Dossier & Live AI Fit Breakdown -->
      <div class="lg:col-span-7 lg:sticky lg:top-24">
        ${activeJob ? renderExecutiveJobDossier(activeJob, pd, ed) : ""}
      </div>
    </div>
  `;
}

function renderExecutiveJobDossier(job, pd, ed) {
  const isSaved = portalState.savedJobs.includes(job.id);
  const monogram = getCompanyMonogram(job.company_name);
  const p1 = Math.min(99, job.ai_match + 2);
  const p2 = job.ai_match;
  const p3 = Math.max(84, job.ai_match - 2);
  const p4 = Math.min(98, job.ai_match + 1);

  return `
    <div class="portal-card rounded-3xl overflow-hidden border border-blue-200/80 dark:border-slate-800 shadow-lg">
      <!-- Bright, Airy Executive Dossier Header -->
      <div class="p-6 sm:p-7 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-teal-50/70 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-slate-900 dark:text-white border-b border-blue-100 dark:border-slate-800 space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-400/30 shadow-sm">
            ${ed.dossierHeaderBadge}
          </span>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-emerald-100/90 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ⚡ ${ed.aiMatchBadge}: ${job.ai_match}%
            </span>
            <button onclick="toggleSavePortalJob('${job.id}', event)"
              class="px-3.5 py-1 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-white/10 hover:border-amber-400 text-slate-700 dark:text-white text-xs font-semibold transition shadow-sm">
              ${isSaved ? `★ ${ed.btnSavedJob}` : `☆ ${ed.btnSaveJob}`}
            </button>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
            ${monogram}
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-blue-700 dark:text-cyan-300">${job.localized_company}</span>
              <span class="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-white/10 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-transparent">${job.org_id}</span>
              <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300">${ed.badgeVerifiedTenant}</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold leading-[1.5] text-slate-900 dark:text-white">
              ${job.localized_title}
            </h2>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
              <span class="font-medium">${SECTOR_ICONS[job.department] || "💼"} ${job.localized_department}</span>
              <span>•</span>
              <span class="font-medium text-teal-700 dark:text-teal-300">📍 ${job.localized_location}</span>
              <span>•</span>
              <span>⏱️ ${pd.lblMinExp} <b>${job.min_experience_years}+ ${pd.lblYears}</b></span>
            </div>
          </div>
        </div>

        <!-- Primary Action Bar inside Dossier Header -->
        <div class="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-blue-200/60 dark:border-white/10">
          <div>
            <div class="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Executive Compensation</div>
            <div class="text-lg font-bold text-emerald-700 dark:text-amber-300 mt-0.5">💰 ${job.localized_salary}</div>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <button onclick="openJobApplyModal('${job.id}')"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition">
              ${pd.btnApplyJob}
            </button>
            <a href="/index.html?org_id=${encodeURIComponent(job.org_id)}"
              class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/15 text-xs font-semibold transition shadow-sm">
              ${pd.btnOpenCompanyAts}
            </a>
          </div>
        </div>
      </div>

      <!-- Dossier Body Content -->
      <div class="p-6 sm:p-7 space-y-6 max-h-[560px] overflow-y-auto custom-scroll text-xs">
        <!-- 1. 4-Pillar Explainable AI Compatibility Matrix -->
        <div class="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3.5">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${ed.dossierAiTitle}</h4>
            <span class="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">👥 ${job.applicant_count} ${pd.lblApplicantsCount}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${[
              { label: ed.pillar1, score: p1, color: "bg-blue-600" },
              { label: ed.pillar2, score: p2, color: "bg-teal-600" },
              { label: ed.pillar3, score: p3, color: "bg-indigo-600" },
              { label: ed.pillar4, score: p4, color: "bg-emerald-600" },
            ]
              .map(
                (pl) => `
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-medium">
                  <span class="text-slate-700 dark:text-slate-300">${pl.label}</span>
                  <span class="font-mono font-bold text-slate-900 dark:text-white">${pl.score}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="${pl.color} h-full rounded-full" style="width: ${pl.score}%"></div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- 2. Executive Role Mandate & Key Responsibilities -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">${ed.mandateTitle}</h4>
          <ul class="space-y-2.5 text-slate-600 dark:text-slate-300 leading-[1.8] text-[13px]">
            <li class="flex items-start gap-2.5"><span class="text-blue-600 font-bold mt-0.5">▸</span><span>${ed.mandate1}</span></li>
            <li class="flex items-start gap-2.5"><span class="text-blue-600 font-bold mt-0.5">▸</span><span>${ed.mandate2}</span></li>
            <li class="flex items-start gap-2.5"><span class="text-blue-600 font-bold mt-0.5">▸</span><span>${ed.mandate3}</span></li>
            <li class="flex items-start gap-2.5"><span class="text-blue-600 font-bold mt-0.5">▸</span><span>${ed.mandate4}</span></li>
          </ul>
        </div>

        <!-- 3. Competency Matrix -->
        <div class="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">${ed.compMatrixTitle}</h4>
          <div class="space-y-2">
            <div class="text-xs font-semibold text-slate-500">${ed.lblCoreSkills}</div>
            <div class="flex flex-wrap gap-2">
              ${(job.must_have_skills || [])
                .map(
                  (s) =>
                    `<span class="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-xs">✔ ${s}</span>`
                )
                .join("")}
            </div>
          </div>
          ${
            (job.nice_to_have_skills || []).length > 0
              ? `<div class="space-y-2">
                  <div class="text-xs font-semibold text-slate-500">${ed.lblBonusSkills}</div>
                  <div class="flex flex-wrap gap-2">
                    ${(job.nice_to_have_skills || [])
                      .map(
                        (s) =>
                          `<span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">+ ${s}</span>`
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
        </div>

        <!-- 4. Executive Compensation & Benefits Package -->
        <div class="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5">
          <h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm">${ed.pkgTitle}</h4>
          <ul class="space-y-2 text-slate-700 dark:text-slate-300 text-[13px] leading-[1.75]">
            <li>• ${ed.pkg1}</li>
            <li>• ${ed.pkg2}</li>
            <li>• ${ed.pkg3}</li>
          </ul>
        </div>

        <!-- 5. 4-Stage Transparent Hiring Workflow -->
        <div class="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">${ed.pipelineTitle}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            ${[ed.step1, ed.step2, ed.step3, ed.step4]
              .map(
                (st, i) => `
              <div class="p-3 rounded-xl border ${
                i === 0
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              } font-semibold text-xs leading-relaxed">
                ${st}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   6B. VIETJOBS / VIECLAM24H 9+3 COLUMN GRID & SIDEBAR DIRECTORY EXPLORER
   ============================================================================ */
function renderBentoGridJobExplorer(filteredJobs, pd, ed) {
  const pf = pFull();
  const mkt = portalState.marketplace || {};
  const locs = getActiveLocationsList();

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LEFT 9 COLUMNS: Latest Job Cards Grid (VietJobs col-lg-9 layout) -->
      <div class="lg:col-span-9 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            ${pf.gridHeading} <span class="text-blue-600">(${filteredJobs.length})</span>
          </h2>
          <button onclick="setPortalViewMode('split')" class="text-xs font-semibold text-blue-600 hover:underline">
            ${pf.gridSwitchSplit}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${filteredJobs
            .map((job) => {
              const isSaved = portalState.savedJobs.includes(job.id);
              const monogram = getCompanyMonogram(job.company_name);
              return `
                <div class="portal-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          ${monogram}
                        </div>
                        <div class="min-w-0">
                          <button onclick="updatePortalFilter('emp', '${job.org_id}')"
                            class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline truncate block">
                            ${job.localized_company}
                          </button>
                          <div class="text-[11px] text-slate-500">📍 ${job.localized_location}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ⚡ ${job.ai_match}%
                        </span>
                        <button onclick="toggleSavePortalJob('${job.id}', event)"
                          class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${
                            isSaved ? "bg-amber-50 border-amber-300 text-amber-500" : "bg-slate-50 border-slate-200 text-slate-400"
                          }">
                          ${isSaved ? "★" : "☆"}
                        </button>
                      </div>
                    </div>

                    <h3 onclick="selectPortalJob('${job.id}'); setPortalViewMode('split');"
                      class="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer leading-[1.5]">
                      ${job.localized_title}
                    </h3>

                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      ${pf.gridRoleDescPrefix} ${job.localized_company} (${job.localized_location}).
                    </p>

                    <div class="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <span class="font-bold text-emerald-700 dark:text-emerald-400">💰 ${job.localized_salary}</span>
                      <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">${job.posted_days_ago} ${pf.daysAgoSuffix}</span>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button onclick="selectPortalJob('${job.id}'); setPortalViewMode('split');"
                      class="text-xs font-semibold text-blue-600 hover:underline">
                      ${pf.gridViewDetails}
                    </button>
                    <button onclick="openJobApplyModal('${job.id}')"
                      class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition">
                      ${pd.btnApplyJob}
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- RIGHT 3 COLUMNS: Category & Popular Location Sidebar (VietJobs col-lg-3 Sidebar Standard) -->
      <div class="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
        <div class="portal-card p-5 rounded-2xl space-y-3 text-xs">
          <div class="font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            ${pf.sidebarCatTitle}
          </div>
          <ul class="space-y-2">
            ${(mkt.categories || [])
              .map(
                (c) => `
              <li>
                <button onclick="updatePortalFilter('cat', '${c.name.replace(/'/g, "\\'")}')"
                  class="w-full text-left flex items-center justify-between gap-2 py-1 hover:text-blue-600 transition ${
                    portalState.selectedCategory === c.name ? "text-blue-600 font-bold" : "text-slate-600 dark:text-slate-300 font-medium"
                  }">
                  <span class="truncate">${SECTOR_ICONS[c.name] || "•"} ${translateSector(c.name)}</span>
                  <span class="text-[11px] font-mono text-slate-400">(${c.job_count})</span>
                </button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <div class="portal-card p-5 rounded-2xl space-y-3 text-xs">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="font-bold uppercase tracking-wider text-slate-900 dark:text-white">${pf.sidebarLocTitle}</span>
            <button onclick="openLocationManagerModal()" class="text-[11px] text-indigo-600 font-semibold hover:underline">${pf.sidebarAddLoc}</button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${locs
              .map(
                (l) => `
              <button onclick="updatePortalFilter('loc', '${l.code}')"
                class="px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                  portalState.selectedLocation === l.code
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500"
                }">
                📍 ${translateLocationPill(l)}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   7. DEDICATED VIEW: 10 INDUSTRY SECTORS & COMPENSATION BENCHMARKS (BRIGHT)
   ============================================================================ */
function renderCategoriesDedicatedView(container) {
  const pd = pDict();
  const ed = eDict();
  const mkt = portalState.marketplace || {};
  const allJobs = (mkt.jobs || []).map(localizePortalJob);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-teal-50 dark:from-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white border border-blue-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div class="space-y-2">
          <span class="text-[11px] font-semibold uppercase px-3 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            EXECUTIVE SECTOR MATRIX
          </span>
          <h1 class="text-2xl font-bold leading-[1.45]">${pd.secCategoriesTitle}</h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[1.75]">${pd.secCategoriesSub}</p>
        </div>
        <button onclick="switchPortalSection('jobs')"
          class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shrink-0 shadow-sm">
          💼 ${pd.navJobs} (${mkt.total_open_jobs || 30}) &rarr;
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${(mkt.categories || [])
          .map((cat) => {
            const sectorJobs = allJobs.filter((j) => j.department === cat.name);
            const topSkills = Array.from(
              new Set(sectorJobs.flatMap((j) => j.must_have_skills || []))
            ).slice(0, 6);
            const sampleSalary = sectorJobs[0] ? sectorJobs[0].localized_salary : localizePortalSalary("60 - 110 Triệu VNĐ");

            return `
              <div class="portal-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div class="space-y-3.5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3.5">
                      <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-2xl shrink-0">
                        ${SECTOR_ICONS[cat.name] || "💼"}
                      </div>
                      <div class="space-y-1">
                        <h3 class="text-base font-bold text-slate-900 dark:text-white leading-[1.45]">
                          ${translateSector(cat.name)}
                        </h3>
                        <div class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                          💰 ${ed.secBenchmarkLabel} ${sampleSalary}
                        </div>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shrink-0">
                      ${cat.job_count} ${pd.lblOpenJobsCount}
                    </span>
                  </div>

                  <!-- Open Roles Preview in this Sector -->
                  <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    ${sectorJobs
                      .slice(0, 3)
                      .map(
                        (sj) => `
                      <div onclick="portalState.selectedCategory='${cat.name.replace(/'/g, "\\'")}'; portalState.selectedJobId='${sj.id}'; switchPortalSection('jobs');"
                        class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 cursor-pointer flex items-center justify-between gap-2 text-xs transition">
                        <span class="font-medium text-slate-800 dark:text-slate-200 truncate">▸ ${sj.localized_title}</span>
                        <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">${sj.localized_salary}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>

                  <div class="flex flex-wrap gap-1.5 pt-1">
                    ${topSkills
                      .map(
                        (sk) =>
                          `<span class="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">${sk}</span>`
                      )
                      .join("")}
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button onclick="portalState.selectedCategory='${cat.name.replace(/'/g, "\\'")}'; switchPortalSection('jobs');"
                    class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition">
                    ${ed.secExploreBtn}
                  </button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

/* ============================================================================
   8. DEDICATED VIEW: VERIFIED B2B MULTI-TENANT ENTERPRISES (BRIGHT)
   ============================================================================ */
function renderEmployersDedicatedView(container) {
  const pd = pDict();
  const ed = eDict();
  const pf = pFull();
  const mkt = portalState.marketplace || {};
  const allJobs = (mkt.jobs || []).map(localizePortalJob);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 dark:from-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white border border-indigo-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div class="space-y-2 max-w-3xl">
          <span class="text-[11px] font-semibold uppercase px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
            B2B MULTI-TENANT SAAS ECOSYSTEM
          </span>
          <h1 class="text-2xl font-bold leading-[1.45]">${pd.secEmployersTitle}</h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[1.75]">${pd.secEmployersSub}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <button onclick="openQuickPostJobModal()"
            class="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold shadow-sm">
            📢 ${pf.btnPostJobHero}
          </button>
          <button onclick="openEmployerAuthModal('register')"
            class="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md">
            ${pd.btnRegNewEmployer}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${(mkt.employers || [])
          .map((emp) => {
            const locCompany = translateEmployerName(emp.org_id, emp.company_name);
            const locCountry = translateCountry(emp.country);
            const monogram = getCompanyMonogram(emp.company_name);
            const empJobs = allJobs.filter((j) => j.org_id === emp.org_id);

            return `
              <div class="portal-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div class="space-y-3.5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        ${monogram}
                      </div>
                      <div class="space-y-0.5">
                        <span class="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          ${emp.org_id}
                        </span>
                        <div class="text-xs font-medium text-slate-500">${locCountry}</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${ed.badgeVerifiedTenant}
                    </span>
                  </div>

                  <h3 class="text-base font-bold text-slate-900 dark:text-white leading-[1.45]">${locCompany}</h3>

                  <div class="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                    <span class="font-mono text-blue-600 dark:text-blue-400 truncate">🌐 https://${emp.subdomain}</span>
                    <span class="font-semibold text-slate-600 dark:text-slate-300 shrink-0">💼 ${emp.open_jobs_count} • 👥 ${emp.total_applicants}</span>
                  </div>

                  <!-- Preview of Top Open Roles at this Enterprise -->
                  <div class="space-y-1.5 pt-1">
                    ${empJobs
                      .slice(0, 3)
                      .map(
                        (ej) => `
                      <div onclick="portalState.selectedEmployer='${emp.org_id}'; portalState.selectedJobId='${ej.id}'; switchPortalSection('jobs');"
                        class="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between gap-2 text-xs transition">
                        <span class="font-medium text-slate-700 dark:text-slate-300 truncate">• ${ej.localized_title}</span>
                        <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">${ej.localized_salary}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>

                <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button onclick="portalState.selectedEmployer='${emp.org_id}'; switchPortalSection('jobs');"
                    class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    🔍 ${pd.btnFilterByEmployer} (${emp.open_jobs_count})
                  </button>
                  <a href="/index.html?org_id=${encodeURIComponent(emp.org_id)}"
                    class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm">
                    ${pd.btnOpenCompanyAts}
                  </a>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

/* ============================================================================
   8A. DEDICATED VIEW: CAREER TOOLS SUITE (GROSS ⇄ NET SALARY & AI CV SCORER)
   (Vieclam24h "Công cụ" + Glassdoor Salary Benchmark Standard)
   ============================================================================ */
function renderCareerToolsDedicatedView(container) {
  const pf = pFull();
  container.innerHTML = `
    <div class="space-y-6">
      <div class="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-teal-50/80 to-blue-50 dark:from-slate-900 dark:to-teal-950 text-slate-900 dark:text-white border border-emerald-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div class="space-y-2 max-w-3xl">
          <span class="text-[11px] font-semibold uppercase px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            VIECLAM24H • GLASSDOOR CAREER TOOLS SUITE
          </span>
          <h1 class="text-2xl font-bold leading-[1.45]">${pf.toolsTitle}</h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[1.75]">
            ${pf.toolsSub}
          </p>
        </div>
        <button onclick="switchPortalSection('jobs')" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shrink-0 shadow-sm">
          ${pf.toolsBackBtn}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left 5 Cols: Gross ⇄ Net Input Form -->
        <div class="lg:col-span-5 portal-card p-6 rounded-3xl space-y-4 text-xs">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">${pf.toolsParamTitle}</h3>

          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${pf.toolsMonthlyIncome}</label>
            <input id="calc-salary-input" type="number" value="65000000" step="1000000" min="5000000"
              oninput="computeGrossNetSalary('gross_to_net')"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-blue-700 dark:text-blue-300" />
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${[30000000, 50000000, 65000000, 85000000, 120000000].map(
                (v) => `
                <button type="button" onclick="document.getElementById('calc-salary-input').value='${v}'; computeGrossNetSalary('gross_to_net');"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
                  ${(v / 1000000).toFixed(0)}M
                </button>
              `
              ).join("")}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${pf.toolsDependents}</label>
              <input id="calc-dependents" type="number" value="1" min="0" max="10"
                oninput="computeGrossNetSalary('gross_to_net')"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${pf.toolsRegion}</label>
              <select id="calc-region" onchange="computeGrossNetSalary('gross_to_net')"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold">
                <option value="1">${pf.toolsReg1}</option>
                <option value="2">${pf.toolsReg2}</option>
                <option value="3">${pf.toolsReg3}</option>
                <option value="4">${pf.toolsReg4}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onclick="computeGrossNetSalary('gross_to_net')"
              class="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition">
              GROSS &rarr; NET
            </button>
            <button type="button" onclick="computeGrossNetSalary('net_to_gross')"
              class="py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-sm transition">
              NET &rarr; GROSS
            </button>
          </div>
        </div>

        <!-- Right 7 Cols: Detailed Breakdown Result Table -->
        <div class="lg:col-span-7 portal-card p-6 rounded-3xl space-y-4 text-xs" id="calc-salary-result-box">
        </div>
      </div>
    </div>
  `;
  setTimeout(() => computeGrossNetSalary("gross_to_net"), 30);
}

function computeGrossNetSalary(mode = "gross_to_net") {
  const pf = pFull();
  const inputVal = Number(document.getElementById("calc-salary-input")?.value || 65000000);
  const dependents = Number(document.getElementById("calc-dependents")?.value || 0);
  const box = document.getElementById("calc-salary-result-box");
  if (!box) return;

  const fmtVnd = (n) => Math.round(n).toLocaleString("vi-VN") + " VND";
  const calcFromGross = (gross) => {
    const capBhxh = 46800000; // 20 x Lương cơ sở
    const capBhtn = 99200000; // 20 x Lương tối thiểu vùng I
    const bhxh = Math.min(gross, capBhxh) * 0.08;
    const bhyt = Math.min(gross, capBhxh) * 0.015;
    const bhtn = Math.min(gross, capBhtn) * 0.01;
    const totalIns = bhxh + bhyt + bhtn;
    const incomeBeforeTax = gross - totalIns;
    const personalDeduction = 11000000;
    const depDeduction = dependents * 4400000;
    const taxableIncome = Math.max(0, incomeBeforeTax - personalDeduction - depDeduction);

    // 7-tier progressive PIT Vietnam
    let pit = 0;
    const brackets = [
      { max: 5000000, rate: 0.05 },
      { max: 10000000, rate: 0.1 },
      { max: 18000000, rate: 0.15 },
      { max: 32000000, rate: 0.2 },
      { max: 52000000, rate: 0.25 },
      { max: 80000000, rate: 0.3 },
      { max: Infinity, rate: 0.35 },
    ];
    let prev = 0;
    for (const b of brackets) {
      if (taxableIncome > prev) {
        const taxableInBracket = Math.min(taxableIncome, b.max) - prev;
        pit += taxableInBracket * b.rate;
        prev = b.max;
      } else {
        break;
      }
    }
    const net = incomeBeforeTax - pit;
    return { gross, bhxh, bhyt, bhtn, totalIns, incomeBeforeTax, personalDeduction, depDeduction, taxableIncome, pit, net };
  };

  let res;
  if (mode === "gross_to_net") {
    res = calcFromGross(inputVal);
  } else {
    // Binary search Gross from target Net
    let low = inputVal;
    let high = inputVal * 1.65;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const test = calcFromGross(mid);
      if (test.net < inputVal) low = mid;
      else high = mid;
    }
    res = calcFromGross((low + high) / 2);
  }

  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">${pf.toolsBreakdownTitle} (${mode === "gross_to_net" ? "GROSS &rarr; NET" : "NET &rarr; GROSS"})</h3>
      <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">${pf.toolsStandardBadge}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
        <div class="text-[11px] text-slate-500 font-semibold">${pf.toolsGrossLbl}</div>
        <div class="text-base font-mono font-bold text-blue-700 dark:text-blue-300 mt-1">${fmtVnd(res.gross)}</div>
      </div>
      <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
        <div class="text-[11px] text-slate-500 font-semibold">${pf.toolsInsTaxLbl}</div>
        <div class="text-base font-mono font-bold text-amber-700 dark:text-amber-300 mt-1">- ${fmtVnd(res.totalIns + res.pit)}</div>
      </div>
      <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700">
        <div class="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">${pf.toolsNetLbl}</div>
        <div class="text-base font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-1">${fmtVnd(res.net)}</div>
      </div>
    </div>

    <div class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <div class="flex justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 font-semibold">
        <span>${pf.toolsRow1}</span>
        <span class="font-mono">${fmtVnd(res.gross)}</span>
      </div>
      <div class="flex justify-between px-4 py-2 text-slate-600 dark:text-slate-300">
        <span>${pf.toolsRowBhxh}</span>
        <span class="font-mono">- ${fmtVnd(res.bhxh)}</span>
      </div>
      <div class="flex justify-between px-4 py-2 text-slate-600 dark:text-slate-300">
        <span>${pf.toolsRowBhyt}</span>
        <span class="font-mono">- ${fmtVnd(res.bhyt)}</span>
      </div>
      <div class="flex justify-between px-4 py-2 text-slate-600 dark:text-slate-300">
        <span>${pf.toolsRowBhtn}</span>
        <span class="font-mono">- ${fmtVnd(res.bhtn)}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 font-semibold">
        <span>${pf.toolsRow2}</span>
        <span class="font-mono">${fmtVnd(res.incomeBeforeTax)}</span>
      </div>
      <div class="flex justify-between px-4 py-2 text-slate-600 dark:text-slate-300">
        <span>${pf.toolsRowPersonalDed}</span>
        <span class="font-mono">- ${fmtVnd(res.personalDeduction)}</span>
      </div>
      <div class="flex justify-between px-4 py-2 text-slate-600 dark:text-slate-300">
        <span>${pf.toolsRowDepDedPrefix} (${dependents} ${pf.toolsRowDepUnit})</span>
        <span class="font-mono">- ${fmtVnd(res.depDeduction)}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 font-semibold">
        <span>${pf.toolsRow3}</span>
        <span class="font-mono">${fmtVnd(res.taxableIncome)}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5 text-red-600 dark:text-red-400 font-semibold">
        <span>${pf.toolsRow4}</span>
        <span class="font-mono">- ${fmtVnd(res.pit)}</span>
      </div>
      <div class="flex justify-between px-4 py-3 bg-emerald-50/90 dark:bg-emerald-950/60 font-bold text-sm text-emerald-800 dark:text-emerald-300">
        <span>${pf.toolsRow5}</span>
        <span class="font-mono">${fmtVnd(res.net)}</span>
      </div>
    </div>
  `;
}

/* ============================================================================
   8B. MODAL: QUICK POST A JOB FOR EMPLOYERS (VietJobs "Đăng tuyển" CTA)
   ============================================================================ */
const QUICK_POST_JOB_I18N = {
  vi: {
    badge: "NHÀ TUYỂN DỤNG • ĐĂNG TIN TUYỂN DỤNG NHANH",
    title: "📢 Đăng Tin Tuyển Dụng Vị Trí Mới",
    sub: "Tin tuyển dụng sẽ hiển thị ngay lập tức trên Bảng tin Việc làm Trực tuyến (Live Job Board) và Cổng Quản trị ATS.",
    lblTitle: "Chức danh Vị trí Tuyển dụng *",
    defTitle: "[Quản lý Cao cấp] Giám đốc Chuyển đổi Số & AI",
    lblOrg: "Doanh nghiệp / Tập đoàn (Tenant) *",
    lblDept: "Ngành nghề *",
    lblLoc: "Khu vực / Tỉnh thành *",
    lblSalary: "Mức đãi ngộ (Salary) *",
    defSalary: "75 - 120 Triệu VNĐ",
    lblExp: "Kinh nghiệm tối thiểu (Năm)",
    lblSkills: "Kỹ năng cốt lõi (cách nhau dấu phẩy)",
    btnSubmit: "✔ Đăng Tin Tuyển Dụng Lên Cổng Việc Làm Ngay",
    toastPosted: "📢 Đã đăng tin tuyển dụng mới:",
  },
  en: {
    badge: "EMPLOYERS • INSTANT JOB POSTING STUDIO",
    title: "📢 Post a New Executive / Specialist Job",
    sub: "Your job posting will immediately appear on the Live Job Board and synchronize with the Enterprise ATS.",
    lblTitle: "Job Position Title *",
    defTitle: "[Senior Executive] VP of Digital Transformation & AI",
    lblOrg: "Enterprise / Organization (Tenant) *",
    lblDept: "Industry Sector *",
    lblLoc: "Location / Province / Hub *",
    lblSalary: "Compensation Range (Salary) *",
    defSalary: "$3,000 - $4,800 / month (75 - 120M VND)",
    lblExp: "Minimum Experience (Years)",
    lblSkills: "Core Competencies & Skills (comma-separated)",
    btnSubmit: "✔ Publish Job Posting to Career Portal Now",
    toastPosted: "📢 Published new job posting:",
  },
  ja: {
    badge: "採用企業向け • クイック求人掲載スタジオ",
    title: "📢 新規求人ポジションを掲載",
    sub: "掲載した求人はリアルタイム求人ボード（Live Job Board）および企業管理ATSに即時反映されます。",
    lblTitle: "募集職種・ポジション名 *",
    defTitle: "【上級管理職】DX・AI推進本部長 (VP of Digital & AI)",
    lblOrg: "採用企業・グループ (Tenant) *",
    lblDept: "業種・セクター *",
    lblLoc: "勤務地・省・都市 *",
    lblSalary: "想定給与レンジ (Salary) *",
    defSalary: "7,500万〜1億2,000万 VND (約$3,000 - $4,800)",
    lblExp: "最低必要経験年数（年）",
    lblSkills: "必須スキル・コアコンピテンシー（カンマ区切り）",
    btnSubmit: "✔ 求人ポータルへ今すぐ公開する",
    toastPosted: "📢 新規求人を公開しました:",
  },
  ko: {
    badge: "기업 회원 전용 • 빠른 채용공고 등록",
    title: "📢 신규 채용 포지션 공고 등록",
    sub: "등록된 채용공고는 실시간 채용 보드(Live Job Board)와 기업용 ATS에 즉시 노출됩니다.",
    lblTitle: "채용 직무 / 포지션명 *",
    defTitle: "[임원급] 디지털 전환(DX) 및 AI 총괄 본부장",
    lblOrg: "채용 기업 / 그룹사 (Tenant) *",
    lblDept: "산업군 / 직무 분야 *",
    lblLoc: "근무 지역 / 성·시 *",
    lblSalary: "급여 및 처우 (Salary) *",
    defSalary: "7,500만 ~ 1억 2,000만 VND ($3,000 - $4,800)",
    lblExp: "최소 요구 경력 (년)",
    lblSkills: "핵심 역량 및 필수 스킬 (쉼표로 구분)",
    btnSubmit: "✔ 채용 포털에 즉시 공고 게시하기",
    toastPosted: "📢 신규 채용공고가 등록되었습니다:",
  },
  zh: {
    badge: "招聘企业专区 • 快速发布招聘职位",
    title: "📢 发布新招聘职位",
    sub: "职位发布后将立即显示在实时职位看板（Live Job Board）及企业 ATS 管理后台。",
    lblTitle: "招聘职位名称 *",
    defTitle: "【高管】数字化转型与 AI 总监 (VP of Digital & AI)",
    lblOrg: "所属企业 / 集团租户 (Tenant) *",
    lblDept: "所属行业 *",
    lblLoc: "工作地区 / 省市 *",
    lblSalary: "薪资待遇范围 (Salary) *",
    defSalary: "7500万 - 1.2亿越南盾 ($3,000 - $4,800/月)",
    lblExp: "最低工作经验要求（年）",
    lblSkills: "核心技能要求（用逗号分隔）",
    btnSubmit: "✔ 立即发布职位至招聘门户",
    toastPosted: "📢 已发布新招聘职位:",
  },
  th: {
    badge: "สำหรับองค์กรผู้ประกอบการ • ลงประกาศงานด่วน",
    title: "📢 ลงประกาศรับสมัครงานตำแหน่งใหม่",
    sub: "ประกาศงานจะแสดงผลทันทีบนกระดานงานออนไลน์ (Live Job Board) และระบบบริหาร ATS",
    lblTitle: "ชื่อตำแหน่งงานที่เปิดรับ *",
    defTitle: "[ผู้บริหารระดับสูง] ผู้อำนวยการฝ่ายดิจิทัลและ AI",
    lblOrg: "องค์กร / บริษัท (Tenant) *",
    lblDept: "หมวดหมู่อุตสาหกรรม *",
    lblLoc: "พื้นที่ทำงาน / จังหวัด *",
    lblSalary: "ช่วงเงินเดือนและผลตอบแทน (Salary) *",
    defSalary: "75 - 120 ล้านดอง ($3,000 - $4,800 / เดือน)",
    lblExp: "ประสบการณ์ขั้นต่ำ (ปี)",
    lblSkills: "ทักษะหลักที่ต้องการ (คั่นด้วยเครื่องหมายจุลภาค)",
    btnSubmit: "✔ เผยแพร่ประกาศงานขึ้นพอร์ทัลทันที",
    toastPosted: "📢 ลงประกาศงานใหม่สำเร็จ:",
  },
  lo: {
    badge: "ສຳລັບຜູ້ประกอบການ • ປະກາດຮັບສະໝັກວຽກດ່ວນ",
    title: "📢 ປະກາດຮັບສະໝັກວຽກຕຳແໜ່ງໃໝ່",
    sub: "ປະກາດວຽກຈະສະແດງທັນທີເທິງກະດານວຽກອອນລາຍ (Live Job Board) ແລະ ລະບົບບໍລິຫານ ATS.",
    lblTitle: "ຊື່ຕຳແໜ່ງວຽກທີ່ຮັບສະໝັກ *",
    defTitle: "[ຜູ້ບໍລິຫານລະດັບສູງ] ຜູ້ອຳນວຍການຝ່າຍຫັນປ່ຽນດີຈີຕອນ & AI",
    lblOrg: "ວິສາຫະກິດ / ກຸ່ມບໍລິສັດ (Tenant) *",
    lblDept: "ຂະແໜງອຸດສາຫະກຳ *",
    lblLoc: "ພື້ນທີ່ເຮັດວຽກ / ແຂວງ *",
    lblSalary: "ລະດັບເງິນເດືອນ (Salary) *",
    defSalary: "75 - 120 ລ້ານດົງ ($3,000 - $4,800 / ເດືອນ)",
    lblExp: "ປະສົບການຂັ້ນຕ່ຳ (ປີ)",
    lblSkills: "ທັກສະຫຼັກ (ຂັ້ນດ້ວຍຈຸດ ,)",
    btnSubmit: "✔ ປະກາດຮັບສະໝັກວຽກຂຶ້ນເວັບໄຊທັນທີ",
    toastPosted: "📢 ປະກາດຮັບສະໝັກວຽກໃໝ່ສຳເລັດ:",
  },
  km: {
    badge: "សម្រាប់និយោជក • ប្រកាសជ្រើសរើសបុគ្គលិករហ័ស",
    title: "📢 ប្រកាសជ្រើសរើសបុគ្គលិកតំណែងថ្មី",
    sub: "ដំណឹងជ្រើសរើសបុគ្គលិកនឹងបង្ហាញភ្លាមៗនៅលើតារាងការងារផ្ទាល់ (Live Job Board) និងប្រព័ន្ធគ្រប់គ្រង ATS។",
    lblTitle: "ចំណងជើងតំណែងការងារ *",
    defTitle: "[ថ្នាក់ដឹកនាំជាន់ខ្ពស់] នាយកផ្នែកបរិវត្តកម្មឌីជីថល និង AI",
    lblOrg: "សហគ្រាស / ក្រុមហ៊ុន (Tenant) *",
    lblDept: "វិស័យឧស្សាហកម្ម *",
    lblLoc: "តំបន់ / ខេត្តក្រុង *",
    lblSalary: "កម្រិតប្រាក់បៀវត្សរ៍ (Salary) *",
    defSalary: "75 - 120 លានដុង ($3,000 - $4,800 / ខែ)",
    lblExp: "បទពិសោធន៍អប្បបរមា (ឆ្នាំ)",
    lblSkills: "ជំនាញស្នូល (បំបែកដោយសញ្ញាក្បៀស ,)",
    btnSubmit: "✔ បោះពុម្ពផ្សាយដំណឹងជ្រើសរើសបុគ្គលិកភ្លាមៗ",
    toastPosted: "📢 បានប្រកាសដំណឹងជ្រើសរើសបុគ្គលិកថ្មី:",
  },
};

function openQuickPostJobModal() {
  const pd = pDict();
  const qd = QUICK_POST_JOB_I18N[portalState.lang] || QUICK_POST_JOB_I18N.en || QUICK_POST_JOB_I18N.vi;
  const mkt = portalState.marketplace || {};
  const locs = getActiveLocationsList();
  const cats = (mkt.categories || []).map((c) => c.name);
  const emps = mkt.employers || [];

  openPortalModal(`
    <div class="space-y-4 text-xs">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span class="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            ${qd.badge}
          </span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-1">${qd.title}</h3>
          <p class="text-slate-500">${qd.sub}</p>
        </div>
        <button onclick="closePortalModal()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold">${pd.btnClose}</button>
      </div>

      <form onsubmit="submitQuickPostJob(event)" class="space-y-3.5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">${qd.lblTitle}</label>
            <input id="post-job-title" type="text" required value="${qd.defTitle}"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold" />
          </div>
          <div>
            <label class="block font-semibold mb-1">${qd.lblOrg}</label>
            <select id="post-job-org" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold">
              ${emps
                .map((e) => `<option value="${e.org_id}">${translateEmployerName(e.org_id, e.company_name)} (${e.org_id})</option>`)
                .join("")}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold mb-1">${qd.lblDept}</label>
            <select id="post-job-dept" class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold">
              ${cats.map((c) => `<option value="${c}">${SECTOR_ICONS[c] || "📂"} ${translateSector(c)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1">${qd.lblLoc}</label>
            <select id="post-job-loc" class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold">
              ${locs.map((l) => `<option value="${l.name}">${translateLocationPill(l)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1">${qd.lblSalary}</label>
            <input id="post-job-salary" type="text" required value="${qd.defSalary}"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-emerald-700" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">${qd.lblExp}</label>
            <input id="post-job-exp" type="number" value="5" min="1" max="20"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold" />
          </div>
          <div>
            <label class="block font-semibold mb-1">${qd.lblSkills}</label>
            <input id="post-job-skills" type="text" value="Digital Strategy, AI Governance, P&L Leadership, Enterprise ERP"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          </div>
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md transition">
          ${qd.btnSubmit}
        </button>
      </form>
    </div>
  `, openQuickPostJobModal);
}

async function submitQuickPostJob(e) {
  e.preventDefault();
  const qd = QUICK_POST_JOB_I18N[portalState.lang] || QUICK_POST_JOB_I18N.en || QUICK_POST_JOB_I18N.vi;
  const title = document.getElementById("post-job-title").value.trim();
  const org_id = document.getElementById("post-job-org").value;
  const department = document.getElementById("post-job-dept").value;
  const location = document.getElementById("post-job-loc").value;
  const salary_range = document.getElementById("post-job-salary").value.trim();
  const min_experience_years = Number(document.getElementById("post-job-exp").value || 5);
  const skillsRaw = document.getElementById("post-job-skills").value;
  const must_have_skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      org_id,
      title,
      department,
      location,
      salary_range,
      language: portalState.lang || "vi",
      jd_text: `${title} — ${location} (${department}). ${salary_range}.`,
      must_have_skills,
      nice_to_have_skills: ["Executive Leadership", "Multilingual Communication"],
      min_experience_years,
      blind_mode: true,
    }),
  });

  if (res.ok) {
    const created = await res.json();
    closePortalModal();
    await loadMarketplaceData();
    if (created && created.id) {
      portalState.selectedJobId = created.id;
      renderPortalMain();
    }
    showPortalToast(`${qd.toastPosted} ${title}`);
  }
}

/* ============================================================================
   8C. MODAL: CREATE & MANAGE RECRUITMENT LOCATIONS (63 PROVINCES & GLOBAL)
   ============================================================================ */
function openLocationManagerModal() {
  const pd = pDict();
  const lmd = locModalDict();
  const locationsList = getActiveLocationsList();
  const mktJobs = (portalState.marketplace.jobs || []).map(localizePortalJob);

  const quickPresets = [
    { name: "Nghệ An", label: localizePortalLocation("Nghệ An"), region: "Miền Trung", zone: "VSIP Nghe An & Dong Nam Economic Zone" },
    { name: "Khánh Hòa (Nha Trang)", label: localizePortalLocation("Khánh Hòa"), region: "Miền Trung", zone: "Van Phong EZ & Nha Trang Hub" },
    { name: "Hưng Yên", label: localizePortalLocation("Hưng Yên"), region: "Miền Bắc", zone: "Thang Long II Industrial Park" },
    { name: "Vĩnh Phúc", label: localizePortalLocation("Vĩnh Phúc"), region: "Miền Bắc", zone: "Binh Xuyen & Ba Thien IP" },
    { name: "Thái Nguyên", label: localizePortalLocation("Thái Nguyên"), region: "Miền Bắc", zone: "Yen Binh Hi-Tech Complex" },
    { name: "Long An", label: localizePortalLocation("Long An"), region: "Miền Nam", zone: "Duc Hoa & Can Giuoc IP" },
    { name: "Thanh Hóa", label: localizePortalLocation("Thanh Hóa"), region: "Miền Trung", zone: "Nghi Son Economic Zone" },
    { name: "Phú Quốc", label: localizePortalLocation("Phú Quốc"), region: "Miền Nam", zone: "International Hospitality & Resort Hub" },
    { name: "Singapore / Tokyo / Seoul", label: "Singapore / Tokyo / Seoul", region: "Quốc tế / ASEAN", zone: "APAC Regional Headquarters" },
  ];

  openPortalModal(`
    <div class="space-y-5 text-xs">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="space-y-1">
          <span class="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            ${lmd.modalBadge}
          </span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">${lmd.modalTitle}</h3>
          <p class="text-slate-500 leading-relaxed">${lmd.modalSub}</p>
        </div>
        <button onclick="closePortalModal()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold shrink-0">${pd.btnClose}</button>
      </div>

      <!-- 1-Click Quick Province Presets -->
      <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-200/80 dark:border-slate-700 space-y-2.5">
        <div class="font-semibold text-blue-900 dark:text-blue-300">${lmd.presetLabel}</div>
        <div class="flex flex-wrap gap-1.5">
          ${quickPresets
            .map(
              (pr) => `
            <button type="button" onclick="fillLocationPreset('${pr.name}', '${pr.region}', '${pr.zone}')"
              class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:border-blue-500 border border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium transition shadow-sm">
              ➕ ${pr.label}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Form to Create New Recruitment Location -->
      <form onsubmit="submitCreatePortalLocation(event)" class="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div class="font-bold text-sm text-slate-900 dark:text-white">${lmd.formHeading}</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${lmd.lblLocName}</label>
            <input id="new-loc-name" type="text" required placeholder="${lmd.placeholderLocName || "Hung Yen, Nghe An..."}"
              value="${localizePortalLocation("Hưng Yên")}"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${lmd.lblRegionGroup}</label>
            <select id="new-loc-region" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold">
              <option value="Miền Bắc">${lmd.optNorth || "Northern Vietnam"}</option>
              <option value="Miền Trung">${lmd.optCentral || "Central Vietnam"}</option>
              <option value="Miền Nam">${lmd.optSouth || "Southern Vietnam"}</option>
              <option value="Quốc tế / ASEAN">${lmd.optAsean || "ASEAN & Global"}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${lmd.lblIndZone}</label>
            <input id="new-loc-zone" type="text" value="Thang Long II Industrial Park & Pho Noi"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${lmd.lblWorkMode}</label>
            <select id="new-loc-mode" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold">
              <option value="On-site / Hybrid">${lmd.optModeHybrid || "On-site / Hybrid"}</option>
              <option value="100% On-site">${lmd.optModeOnsite || "100% On-site"}</option>
              <option value="100% Remote / Linh hoạt">${lmd.optModeRemote || "100% Remote / Flexible"}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">${lmd.lblAssignJob}</label>
          <select id="new-loc-job-id" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium">
            <option value="job_07">${lmd.optDefaultJobPrefix || "Default:"} ${mktJobs.find((j) => j.id === "job_07")?.localized_title || "Job #07"}</option>
            <option value="">${lmd.optNoAssign}</option>
            ${mktJobs
              .map((j) => `<option value="${j.id}">[${j.id}] ${j.localized_title} (${j.localized_location})</option>`)
              .join("")}
          </select>
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition">
          ${lmd.btnSubmitCreateLoc}
        </button>
      </form>

      <!-- Active Locations List -->
      <div class="space-y-2.5 pt-2">
        <div class="font-bold text-sm text-slate-900 dark:text-white">${lmd.listHeading} (${locationsList.length})</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto custom-scroll pr-1">
          ${locationsList
            .map((loc) => {
              const cnt = mktJobs.filter((j) => doesJobMatchLocationCode(j, loc.code)).length;
              return `
                <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 dark:text-white truncate">📍 ${translateLocationPill(loc)}</div>
                    <div class="text-[11px] text-slate-500 truncate">${localizePortalLocation(loc.region_group || "Việt Nam")} • ${loc.industrial_zone || loc.work_mode || ""}</div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button onclick="closePortalModal(); updatePortalFilter('loc', '${loc.code}'); switchPortalSection('jobs');"
                      class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px]">
                      ${lmd.btnFilterThisLoc} (${cnt})
                    </button>
                    ${
                      !loc.is_default && !["hanoi", "hcmc", "danang"].includes(loc.code)
                        ? `<button onclick="deletePortalLocation('${loc.code}')" class="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px]">✕</button>`
                        : ""
                    }
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `, openLocationManagerModal);
}

function fillLocationPreset(name, region, zone) {
  const nameEl = document.getElementById("new-loc-name");
  const regEl = document.getElementById("new-loc-region");
  const zoneEl = document.getElementById("new-loc-zone");
  if (nameEl) nameEl.value = name;
  if (regEl) regEl.value = region;
  if (zoneEl) zoneEl.value = zone;
}

async function submitCreatePortalLocation(e) {
  e.preventDefault();
  const lmd = locModalDict();
  const name = document.getElementById("new-loc-name").value.trim();
  const region_group = document.getElementById("new-loc-region").value;
  const industrial_zone = document.getElementById("new-loc-zone").value.trim();
  const work_mode = document.getElementById("new-loc-mode").value;
  const assign_to_job_id = document.getElementById("new-loc-job-id").value;
  if (!name) return;

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "") || `loc${Date.now()}`;
  const newLocObj = {
    id: `loc_${Date.now()}`,
    code: slug,
    name,
    region_group,
    industrial_zone,
    work_mode,
    is_default: false,
  };

  try {
    const res = await fetch(`${API_BASE}/api/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        region_group,
        industrial_zone,
        work_mode,
        country: "Việt Nam",
        assign_to_job_id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.location) newLocObj.code = data.location.code;
    }
  } catch (err) {
    console.warn("Saved location locally:", err);
  }

  portalState.selectedLocation = newLocObj.code;
  closePortalModal();
  await loadMarketplaceData();
  showPortalToast(`${lmd.toastCreated} ${name}`);
}

async function deletePortalLocation(locCode) {
  try {
    await fetch(`${API_BASE}/api/locations/${encodeURIComponent(locCode)}`, { method: "DELETE" });
  } catch (e) {}
  if (portalState.selectedLocation === locCode) portalState.selectedLocation = "all";
  await loadMarketplaceData();
  openLocationManagerModal();
  showPortalToast(locModalDict().toastDeleted);
}

function updatePortalFilter(type, val) {
  if (type === "q") portalState.searchQuery = val;
  if (type === "cat") portalState.selectedCategory = val;
  if (type === "emp") portalState.selectedEmployer = val;
  if (type === "lvl") portalState.selectedLevel = val;
  if (type === "loc") portalState.selectedLocation = val;
  if (type === "sort") portalState.sortBy = val;
  if (type === "salary_min") portalState.minSalaryMillion = Number(val || 0);
  if (type === "date") portalState.dateListedFilter = val;
  renderPortalMain();
}

function resetAllPortalFilters() {
  portalState.searchQuery = "";
  portalState.selectedCategory = "all";
  portalState.selectedEmployer = "all";
  portalState.selectedLevel = "all";
  portalState.selectedLocation = "all";
  portalState.selectedMacroRegion = "all";
  portalState.minSalaryMillion = 0;
  portalState.dateListedFilter = "any";
  renderPortalHeader();
  renderPortalMain();
}

/* ============================================================================
   5. CANDIDATE ACCOUNT REGISTRATION & LOGIN MODAL (100% LOCALIZED)
   ============================================================================ */
function openCandidateAuthModal() {
  const pd = pDict();
  const pf = pFull();
  const demoCands = portalState.demoAccounts.candidates || [];
  const sectors = Object.keys(SECTOR_ICONS);
  const ssoSubMap = {
    vi: "Đăng nhập nhanh 1 chạm hoặc chuyển sang Trang Đăng nhập Tập trung (SSO).",
    en: "1-Click instant demo login or switch to the Centralized Enterprise SSO Login Page.",
    ja: "ワンクリック即時ログイン、または統合SSOログインページへ移動できます。",
    ko: "원클릭 빠른 로그인 또는 통합 SSO 로그인 페이지로 이동합니다.",
    zh: "一键快速登录或切换至统一单点登录 (SSO) 页面。",
    th: "เข้าสู่ระบบด่วนในคลิกเดียว หรือเปลี่ยนไปยังหน้าเข้าสู่ระบบกลาง (SSO)",
    lo: "ເຂົ້າສູ່ລະບົບດ່ວນ 1-Click ຫຼື ປ່ຽນໄປໜ້າເຂົ້າສູ່ລະບົບລວມສູນ (SSO).",
    km: "ចូលប្រើរហ័ស 1-Click ឬប្តូរទៅទំព័រចូលប្រើប្រាស់មជ្ឈការ (SSO)។",
  };

  openPortalModal(`
    <div class="space-y-6">
      <div class="p-5 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div class="space-y-1">
          <span class="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">${pd.candModalBadge}</span>
          <h3 class="text-xl font-extrabold text-white mt-1">${pd.candModalTitle}</h3>
          <p class="text-xs text-teal-100">${ssoSubMap[portalState.lang] || ssoSubMap.en}</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/login.html?role=candidate" class="px-4 py-2 rounded-xl bg-white text-teal-800 font-extrabold text-xs shadow hover:bg-teal-50 transition">
            🔐 ${pf.btnSsoHero} &rarr;
          </a>
          <button onclick="closePortalModal()" class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold">${pd.btnClose}</button>
        </div>
      </div>

      <!-- Quick Demo Login -->
      <div class="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2.5">
        <div class="font-extrabold text-teal-900 dark:text-teal-200 text-sm">${pd.candDemoTitle}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${demoCands
            .map(
              (c) => `
            <button onclick="quickLoginEmail('${c.email}')"
              class="p-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-left flex items-center justify-between shadow-sm transition">
              <span>👤 ${c.full_name} (${c.email})</span>
              <span class="text-xs bg-white/20 px-2 py-0.5 rounded-lg">1-Click &rarr;</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Registration Form -->
      <form onsubmit="submitCandidateRegister(event)" class="space-y-4">
        <div class="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
          ${pd.candRegHeading}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1">${pd.lblCandFullName}</label>
            <input id="reg-cand-name" type="text" required value="${portalState.lang === "vi" ? "Lê Hoàng Khôi" : "Le Hoang Khoi"}"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblCandEmail}</label>
            <input id="reg-cand-email" type="email" required value="hoangkhoi.exec@hiremind.vn"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1">${pd.lblCandPhone}</label>
            <input id="reg-cand-phone" type="text" required value="+84 908 777 999"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblCandExpYears}</label>
            <input id="reg-cand-exp" type="number" step="0.5" required value="8"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold" />
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">${pd.lblCandSector}</label>
          <select id="reg-cand-sector" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold">
            ${sectors.map((s) => `<option value="${s}">${SECTOR_ICONS[s]} ${translateSector(s)}</option>`).join("")}
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1">${pd.lblCandSkills}</label>
          <input id="reg-cand-skills" type="text" required value="System Architecture, Cloud FinOps, Microservices, AI/LLM, Agile OKRs, P&L Management"
            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
        </div>

        <div>
          <label class="block font-bold mb-1">${pd.lblCandBio}</label>
          <textarea id="reg-cand-bio" rows="4" required
            class="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs">Full Name: Le Hoang Khoi | Email: hoangkhoi.exec@hiremind.vn | Phone: +84 908 777 999
Experience: 8+ years VP of Engineering & Enterprise Architecture.
Core Competencies: System Architecture, Cloud FinOps, Microservices, AI/LLM, Agile OKRs, P&L Management.</textarea>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-extrabold shadow-lg">
          ${pd.btnCandSubmitReg}
        </button>
      </form>
    </div>
  `, openCandidateAuthModal);
}

async function submitCandidateRegister(e) {
  e.preventDefault();
  const skills = document
    .getElementById("reg-cand-skills")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const res = await fetch(`${API_BASE}/api/auth/register-candidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: document.getElementById("reg-cand-name").value,
      email: document.getElementById("reg-cand-email").value,
      phone: document.getElementById("reg-cand-phone").value,
      experience_years: parseFloat(document.getElementById("reg-cand-exp").value || "8"),
      preferred_sector: document.getElementById("reg-cand-sector").value,
      skills,
      bio_cv_text: document.getElementById("reg-cand-bio").value,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    portalState.currentUser = data.user;
    localStorage.setItem("hiremind_portal_user", JSON.stringify(data.user));
    portalState.selectedCategory = data.user.preferred_sector || "all";
    closePortalModal();
    renderPortalHeader();
    renderPortalMain();
    showPortalToast(`🎉 ${data.user.full_name} — ${translateSector(data.user.preferred_sector)}`);
  }
}

/* ============================================================================
   6. EMPLOYER REGISTRATION & LOGIN MODAL (B2B MULTI-TENANT, 100% LOCALIZED)
   ============================================================================ */
function openEmployerModal() {
  openEmployerAuthModal();
}

function openEmployerAuthModal() {
  const pd = pDict();
  const pf = pFull();
  const demoEmps = portalState.demoAccounts.employers || [];
  const sectors = Object.keys(SECTOR_ICONS);
  const countryKeys = Object.keys(COUNTRY_TRANSLATIONS);
  const empSubMap = {
    vi: "Khởi tạo Không gian Quản trị Tuyển dụng riêng (Multi-Tenant SaaS) cho Doanh nghiệp.",
    en: "Provision a dedicated Multi-Tenant SaaS Recruitment & AI ATS Workspace for your enterprise.",
    ja: "貴社専用のマルチテナントSaaS採用管理・AI選考ワークスペースを即時発行します。",
    ko: "귀사 전용 멀티테넌트 SaaS 채용 관리 및 AI ATS 워크스페이스를 즉시 생성합니다.",
    zh: "为您的企业创建专属多租户 SaaS 招聘管理与 AI ATS 工作空间。",
    th: "สร้างพื้นที่จัดการการสรรหาบุคลากรเฉพาะองค์กร (Multi-Tenant SaaS) สำหรับบริษัทของคุณ",
    lo: "ສ້າງພື້ນທີ່ບໍລິຫານການຮັບສະໝັກວຽກສະເພາະອົງກອນ (Multi-Tenant SaaS) ສຳລັບວິສາຫະກິດ.",
    km: "បង្កើតប្រព័ន្ធគ្រប់គ្រងការជ្រើសរើសបុគ្គលិកដាច់ដោយឡែក (Multi-Tenant SaaS) សម្រាប់សហគ្រាស។",
  };

  openPortalModal(`
    <div class="space-y-6">
      <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-700 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div class="space-y-1">
          <span class="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">${pd.empModalBadge}</span>
          <h3 class="text-xl font-extrabold text-white mt-1">${pd.empModalTitle}</h3>
          <p class="text-xs text-indigo-100">${empSubMap[portalState.lang] || empSubMap.en}</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/login.html?role=employer" class="px-4 py-2 rounded-xl bg-white text-indigo-900 font-extrabold text-xs shadow hover:bg-indigo-50 transition">
            🔐 ${pf.authB2bSso} &rarr;
          </a>
          <button onclick="closePortalModal()" class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold">${pd.btnClose}</button>
        </div>
      </div>

      <!-- Quick Demo Employer Login -->
      <div class="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
        <div class="font-extrabold text-indigo-900 dark:text-indigo-200 text-sm">${pd.empDemoTitle}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${demoEmps
            .map((emp) => {
              const locComp = translateEmployerName(emp.org_id, emp.company_name);
              return `
            <button onclick="quickLoginEmail('${emp.email}')"
              class="p-3 rounded-xl bg-white dark:bg-slate-900 hover:border-indigo-600 border border-indigo-200 dark:border-indigo-800 text-left transition shadow-sm">
              <div class="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">${locComp}</div>
              <div class="text-xs text-slate-500 mt-0.5">${pd.lblOrgId} <b>${emp.org_id}</b> • ${emp.email}</div>
            </button>
          `;
            })
            .join("")}
        </div>
      </div>

      <!-- New Employer Registration Form -->
      <form onsubmit="submitEmployerRegister(event)" class="space-y-4">
        <div class="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
          ${pd.empRegHeading}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpCompanyName}</label>
            <input id="reg-emp-company" type="text" required value="VinaPacific Technology & Investment Group"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpCountry}</label>
            <select id="reg-emp-country" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold">
              ${countryKeys.map((ck) => `<option value="${ck}">${translateCountry(ck)}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpAdminName}</label>
            <input id="reg-emp-admin" type="text" required value="Tran Thanh Ha (CHRO)"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpEmail}</label>
            <input id="reg-emp-email" type="email" required value="chro@vinapacific.vn"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpIndustry}</label>
            <select id="reg-emp-industry" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold">
              ${sectors.map((s) => `<option value="${s}">${SECTOR_ICONS[s]} ${translateSector(s)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblEmpSubdomain}</label>
            <input id="reg-emp-sub" type="text" required value="vinapacific.hiremind.vn"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono" />
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          ${pd.empBenefitBox}
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-600 hover:from-indigo-600 hover:to-blue-500 text-white font-extrabold shadow-lg">
          ${pd.btnEmpSubmitReg}
        </button>
      </form>
    </div>
  `, openEmployerAuthModal);
}

async function submitEmployerRegister(e) {
  e.preventDefault();
  const res = await fetch(`${API_BASE}/api/auth/register-employer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: document.getElementById("reg-emp-company").value,
      country: document.getElementById("reg-emp-country").value,
      admin_name: document.getElementById("reg-emp-admin").value,
      email: document.getElementById("reg-emp-email").value,
      industry: document.getElementById("reg-emp-industry").value,
      subdomain: document.getElementById("reg-emp-sub").value,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    portalState.currentUser = data.user;
    localStorage.setItem("hiremind_portal_user", JSON.stringify(data.user));
    localStorage.setItem("hiremind_active_org_id", data.user.org_id);
    closePortalModal();
    await loadMarketplaceData();
    showPortalToast(`🏢 ${data.user.company_name} (${data.user.org_id})`);
    setTimeout(() => {
      window.location.href = `/index.html?org_id=${encodeURIComponent(data.user.org_id)}`;
    }, 900);
  }
}

async function quickLoginEmail(email) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (res.ok) {
    const data = await res.json();
    portalState.currentUser = data.user;
    localStorage.setItem("hiremind_portal_user", JSON.stringify(data.user));
    closePortalModal();
    renderPortalHeader();
    if (data.user.role === "employer") {
      localStorage.setItem("hiremind_active_org_id", data.user.org_id);
      portalState.selectedEmployer = data.user.org_id === "ALL" ? "all" : data.user.org_id;
      renderPortalMain();
      showPortalToast(`🏢 ${translateEmployerName(data.user.org_id, data.user.company_name)} (${data.user.org_id})`);
    } else {
      portalState.trackQuery = data.user.email;
      renderPortalMain();
      showPortalToast(`👤 ${data.user.full_name}`);
    }
  }
}

/* ============================================================================
   7. 1-CLICK JOB APPLICATION & INSTANT AI SCREENING MODAL (100% LOCALIZED)
   ============================================================================ */
function openJobApplyModal(jobId) {
  const pd = pDict();
  const rawJob = (portalState.marketplace.jobs || []).find((j) => j.id === jobId);
  if (!rawJob) return;
  const job = localizePortalJob(rawJob);
  const u = portalState.currentUser;
  const isCand = u && u.role === "candidate";

  const prefillName = isCand ? u.full_name : "Nguyen Minh Hoang";
  const prefillBio = isCand
    ? u.bio_cv_text
    : `Candidate: Nguyen Minh Hoang | Email: minhhoang.exec@hiremind.vn | Phone: +84 909 888 999\nExperience: 9+ years Executive Management in ${job.localized_department}.\nCore Skills: ${(job.must_have_skills || []).join(", ")}.\nKey Achievements: Led cross-functional transformation and exceeded P&L KPI targets by 125%.`;

  openPortalModal(`
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
            🏢 ${job.localized_company} (${job.org_id})
          </span>
          <h3 class="text-base font-extrabold mt-1">${job.localized_title}</h3>
          <p class="text-xs text-slate-500">📍 ${job.localized_location} • 💰 ${job.localized_salary}</p>
        </div>
        <button onclick="closePortalModal()" class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">${pd.btnClose}</button>
      </div>

      ${
        isCand
          ? `<div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              ${pd.applyAutoFillBanner} (${u.full_name} • ${u.email})
            </div>`
          : ""
      }

      <form onsubmit="submitPortalJobApp(event, '${job.id}')" class="space-y-3 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">${pd.lblCandFullName}</label>
            <input id="apply-cand-name" type="text" required value="${prefillName}"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">${pd.lblPrefInterviewLang}</label>
            <select id="apply-cand-lang" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold">
              <option value="${portalState.lang}">[${portalState.lang.toUpperCase()}] ${pd.lblCurrentLangOpt}</option>
              <option value="vi">[VI] Tiếng Việt</option>
              <option value="en">[EN] English</option>
              <option value="ja">[JA] 日本語</option>
              <option value="ko">[KO] 한국어</option>
              <option value="zh">[ZH] 中文</option>
              <option value="th">[TH] ภาษาไทย</option>
              <option value="lo">[LO] ພາສາລາວ</option>
              <option value="km">[KM] ភាសាខ្មែរ</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">${pd.lblAttachCvFile}</label>
          <input id="apply-cv-file" type="file" accept=".pdf,.docx,.txt"
            class="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white" />
        </div>

        <div>
          <label class="block font-bold mb-1">${pd.lblCvSummaryText}</label>
          <textarea id="apply-cv-text" rows="5" required
            class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]">${prefillBio}</textarea>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
          ${pd.applyPrivacyBox}
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold shadow-lg">
          ${pd.btnSubmitApply}
        </button>
      </form>
    </div>
  `, () => openJobApplyModal(job.id));
}

async function submitPortalJobApp(e, jobId) {
  e.preventDefault();
  const pd = pDict();
  const fullName = document.getElementById("apply-cand-name").value;
  const prefLang = document.getElementById("apply-cand-lang").value;
  const rawText = document.getElementById("apply-cv-text").value;
  const fileInput = document.getElementById("apply-cv-file");

  const formData = new FormData();
  formData.append("job_id", jobId);
  formData.append("full_name", fullName);
  formData.append("preferred_language", prefLang);
  formData.append("source", "Global Career Portal");
  if (rawText) formData.append("raw_cv_text", rawText);
  if (fileInput && fileInput.files && fileInput.files[0]) {
    formData.append("cv_file", fileInput.files[0]);
  }

  const res = await fetch(`${API_BASE}/api/screening/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) return;
  const data = await res.json();
  await loadMarketplaceData();

  openPortalModal(`
    <div class="space-y-5 text-center py-2">
      <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto font-extrabold">
        ✔
      </div>
      <div class="space-y-1">
        <span class="text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          ${pd.resBadge}
        </span>
        <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">${pd.resTitle}</h3>
        <p class="text-xs text-slate-500">${pd.lblAppId} <span class="font-mono font-bold">${data.application_id}</span></p>
      </div>

      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <div class="text-xs text-slate-500 font-bold">${pd.resScoreLabel}</div>
        <div class="text-4xl font-extrabold text-blue-700 dark:text-blue-400">${data.total_score} / 100</div>
        <div class="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
          ${pd.resPrivateVaultNote}
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a href="/index.html?interview=${encodeURIComponent(data.invite_token)}"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold shadow-lg">
          ${pd.btnEnterAiInterview}
        </a>
        <button onclick="closePortalModal(); portalState.trackQuery='${fullName}'; switchPortalSection('my_apps');"
          class="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold">
          ${pd.btnTrackMySubmitted}
        </button>
      </div>
    </div>
  `);
}

/* ============================================================================
   8. MY APPLICATIONS & SAVED JOBS COCKPIT (5-STAGE PIPELINE STEPPER)
   ============================================================================ */
async function loadMyApplications() {
  const q =
    portalState.trackQuery ||
    (portalState.currentUser && portalState.currentUser.role === "candidate"
      ? portalState.currentUser.full_name
      : "app_01");
  portalState.trackQuery = q;
  const res = await fetch(`${API_BASE}/api/public/track?query=${encodeURIComponent(q)}`);
  if (res.ok) {
    const data = await res.json();
    portalState.myApplications = data.items || [];
  }
  renderPortalMain();
}

function renderMyAppsSection(container) {
  const pd = pDict();
  const ed = eDict();
  const items = portalState.myApplications || [];
  const mktJobs = (portalState.marketplace.jobs || []).map(localizePortalJob);
  const savedJobObjs = mktJobs.filter((j) => portalState.savedJobs.includes(j.id));

  const stagesOrder = ["new", "screening", "interview", "offer", "hired"];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Part A: Bookmarked / Saved Executive Roles -->
      <div class="portal-card p-6 rounded-3xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white">
            ${ed.savedJobsHeading} <span class="text-amber-600">(${savedJobObjs.length})</span>
          </h3>
          <button onclick="switchPortalSection('jobs')" class="text-xs font-extrabold text-blue-700 hover:underline">
            + ${pd.navJobs} &rarr;
          </button>
        </div>
        ${
          savedJobObjs.length === 0
            ? `<div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500">${ed.savedJobsEmpty}</div>`
            : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${savedJobObjs
                  .map(
                    (sj) => `
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 text-xs">
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-extrabold text-indigo-700 dark:text-indigo-300 truncate">${sj.localized_company}</span>
                        <button onclick="toggleSavePortalJob('${sj.id}', event)" class="text-amber-500 font-extrabold">★</button>
                      </div>
                      <div class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">${sj.localized_title}</div>
                      <div class="text-emerald-700 dark:text-emerald-400 font-bold">💰 ${sj.localized_salary} • 📍 ${sj.localized_location}</div>
                    </div>
                    <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700">
                      <button onclick="selectPortalJob('${sj.id}'); switchPortalSection('jobs');" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">
                        ${ed.btnInspectJob}
                      </button>
                      <button onclick="openJobApplyModal('${sj.id}')" class="px-3 py-1.5 rounded-lg bg-blue-700 text-white font-extrabold">
                        ${pd.btnApplyJob}
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>`
        }
      </div>

      <!-- Part B: Submitted Applications & 5-Stage Pipeline Tracker -->
      <div class="portal-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">${pd.myAppsTitle}</h2>
            <p class="text-xs text-slate-500 mt-1">${pd.myAppsSub}</p>
          </div>

          <form onsubmit="submitTrackQuery(event)" class="flex gap-2 w-full lg:max-w-lg">
            <input id="track-query-input" type="text" required value="${portalState.trackQuery}"
              placeholder="${pd.trackPlaceholder}"
              class="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold" />
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow shrink-0">
              ${pd.btnSearchTrack}
            </button>
          </form>
        </div>

        ${
          items.length === 0
            ? `<div class="p-8 text-center text-xs text-slate-500">${pd.emptyTrackMsg} "${portalState.trackQuery}".</div>`
            : `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${items
                  .map((item) => {
                    const locTitle = translateJobTitle(item.job_id, item.job_title);
                    const locStage = translateStage(item.stage);
                    const locDept = translateSector(item.department);
                    const locLocation = localizePortalLocation(item.location);
                    const locSalary = localizePortalSalary(item.salary_range);
                    const stIdx = Math.max(0, stagesOrder.indexOf(item.stage));

                    return `
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 text-xs">
                    <div class="space-y-3">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          ${pd.lblAppId} ${item.application_id}
                        </span>
                        <span class="px-2.5 py-0.5 rounded-full font-extrabold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ${pd.lblStage} ${locStage} • ${pd.lblAiScore} ${item.overall_score}/100
                        </span>
                      </div>
                      <h3 class="text-base font-extrabold text-blue-700 dark:text-blue-400">${locTitle}</h3>
                      <div class="text-slate-600 dark:text-slate-300 font-semibold">
                        👤 ${pd.lblCandidate} <b>${item.full_name}</b> (${item.email} • ${item.phone})
                      </div>
                      <div class="text-slate-500">
                        📂 ${locDept} • 📍 ${locLocation} • 💰 ${locSalary}
                      </div>

                      <!-- 5-Stage Visual Progress Stepper -->
                      <div class="grid grid-cols-5 gap-1 pt-2">
                        ${stagesOrder
                          .map((stCode, idx) => {
                            const done = idx <= stIdx;
                            return `
                            <div class="space-y-1 text-center">
                              <div class="h-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}"></div>
                              <div class="text-[9px] font-bold truncate ${done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}">
                                ${translateStage(stCode)}
                              </div>
                            </div>
                          `;
                          })
                          .join("")}
                      </div>
                    </div>

                    <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap">
                      <a href="${API_BASE}${item.pdf_url}" target="_blank"
                        class="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold">
                        ${pd.btnViewPdfCv}
                      </a>
                      ${
                        item.invite_token
                          ? `<a href="/index.html?interview=${encodeURIComponent(item.invite_token)}"
                              class="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow">
                              ${pd.btnEnterAiInterview}
                            </a>`
                          : ""
                      }
                    </div>
                  </div>
                `;
                  })
                  .join("")}
              </div>`
        }
      </div>
    </div>
  `;
}

function submitTrackQuery(e) {
  e.preventDefault();
  portalState.trackQuery = document.getElementById("track-query-input")?.value || "";
  loadMyApplications();
}

/* ============================================================================
   9. INTERACTIVE AI AUTO-TRANSLATION STUDIO MODAL (8 LANGUAGES)
   ============================================================================ */
function openAiTranslatorModal() {
  const pd = pDict();
  openPortalModal(`
    <div class="space-y-4 text-xs">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${pd.transModalBadge}
          </span>
          <h3 class="text-lg font-extrabold mt-1">${pd.transModalTitle}</h3>
          <p class="text-slate-500 mt-0.5">${pd.transModalSub}</p>
        </div>
        <button onclick="closePortalModal()" class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">${pd.btnClose}</button>
      </div>

      <!-- Coverage KPI Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div class="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">100%</div>
          <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">UI & Modals (8 Langs)</div>
        </div>
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
          <div class="text-lg font-extrabold text-blue-700 dark:text-blue-300">30 / 30</div>
          <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Executive Jobs</div>
        </div>
        <div class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <div class="text-lg font-extrabold text-indigo-700 dark:text-indigo-300">10 / 10</div>
          <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Industry Categories</div>
        </div>
        <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
          <div class="text-lg font-extrabold text-purple-700 dark:text-purple-300">motapis.com/v1</div>
          <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Live AI Gateway</div>
        </div>
      </div>

      <!-- Quick 8-Language Switcher Pills -->
      <div class="flex flex-wrap gap-1.5 pt-1">
        ${[
          { code: "vi", label: "🇻🇳 Tiếng Việt" },
          { code: "en", label: "🇬🇧 English" },
          { code: "ja", label: "🇯🇵 日本語" },
          { code: "ko", label: "🇰🇷 한국어" },
          { code: "zh", label: "🇨🇳 中文" },
          { code: "th", label: "🇹🇭 ภาษาไทย" },
          { code: "lo", label: "🇱🇦 ພາສາລາວ" },
          { code: "km", label: "🇰🇭 ភាសាខ្មែរ" },
        ]
          .map(
            (l) => `
          <button onclick="changePortalLang('${l.code}'); openAiTranslatorModal();"
            class="px-3 py-1.5 rounded-xl font-extrabold border transition ${
              portalState.lang === l.code
                ? "bg-blue-700 text-white border-blue-700 shadow"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            }">
            ${l.label}
          </button>
        `
          )
          .join("")}
      </div>

      <!-- On-Demand AI Translator Box -->
      <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label class="block font-extrabold">${pd.lblCustomTransInput}</label>
        <textarea id="ai-custom-trans-input" rows="3"
          class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]">[Quản lý Cao cấp] Giám đốc Khối Phát triển Kinh doanh & Chiến lược tại Tập đoàn Công nghệ TechVina Holdings (TP. Hồ Chí Minh • 70 - 110 Triệu VNĐ)</textarea>
        <div class="flex flex-wrap gap-2">
          <button onclick="runCustomAiTranslateBox()"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow">
            ${pd.btnRunCustomTrans}
          </button>
          <button onclick="syncAndTranslateEntirePortal()"
            class="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold shadow">
            ${pd.btnSyncAllPageTrans}
          </button>
        </div>
        <div id="ai-custom-trans-output" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-blue-700 dark:text-blue-300 min-h-[44px]">
          [${portalState.lang.toUpperCase()}] ${translateJobTitle("custom", "[Quản lý Cao cấp] Giám đốc Khối Phát triển Kinh doanh & Chiến lược")} — ${translateEmployerName("TENANT-VN-01", "Tập đoàn Công nghệ & Bán lẻ TechVina Holdings")} (${localizePortalLocation("TP. Hồ Chí Minh")} • ${localizePortalSalary("70 - 110 Triệu VNĐ")})
        </div>
      </div>
    </div>
  `, () => openAiTranslatorModal());
}

async function runCustomAiTranslateBox() {
  const inputEl = document.getElementById("ai-custom-trans-input");
  const outEl = document.getElementById("ai-custom-trans-output");
  if (!inputEl || !outEl) return;
  const raw = inputEl.value.trim();
  if (!raw) return;
  outEl.textContent = "⏳ AI (motapis.com/v1) translating...";
  try {
    const res = await fetch(`${API_BASE}/api/ai/translate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_lang: portalState.lang,
        texts: [raw],
        use_live_llm: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const translated = (data.translations && data.translations[raw]) || translateJobTitle("custom", raw);
      portalState.dynamicCache[`${portalState.lang}::${raw}`] = translated;
      saveDynamicCache();
      outEl.textContent = `[${portalState.lang.toUpperCase()}] ${translated}`;
    }
  } catch (e) {
    outEl.textContent = `[${portalState.lang.toUpperCase()}] ${translateJobTitle("custom", raw)}`;
  }
}

async function syncAndTranslateEntirePortal() {
  await runAutoTranslateDynamicStrings(true);
  renderPortalHeader();
  renderPortalMain();
  closePortalModal();
  showPortalToast(`✔ 100% [${portalState.lang.toUpperCase()}] — ${pDict().btnAiTranslator}`);
}

// =========================================================
// EXECUTIVE 5-COLUMN FOOTER FUNCTIONAL PAGES MODAL & 24/7 AI CONCIERGE CHATBOT
// =========================================================
function openFunctionalPageModal(pageKey) {
  const pd = pDict();
  const pages = {
    about: {
      badge: "VỀ HIREMIND GLOBAL • ENTERPRISE CAREER ECOSYSTEM",
      title: "Về HireMind Global — Nền tảng Tuyển dụng & Quản trị Nhân tài AI Quốc tế",
      subtitle: "Kết nối hơn 500+ Tập đoàn đa quốc gia, Doanh nghiệp FDI và hàng triệu chuyên gia chất lượng cao tại Việt Nam & Đông Nam Á.",
      body: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
            <div class="text-2xl font-extrabold text-blue-700 dark:text-blue-400">63+</div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">Tỉnh thành & Khu công nghiệp</div>
            <p class="text-[11px] text-slate-500 mt-1">Phủ sóng toàn quốc từ Hà Nội, TP.HCM, Hải Phòng, Đà Nẵng, Cần Thơ đến Bắc Ninh, Bình Dương.</p>
          </div>
          <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
            <div class="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">99.95%</div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">Multi-Tenant SaaS SLA</div>
            <p class="text-[11px] text-slate-500 mt-1">Cách ly dữ liệu độc lập cho từng Tổ chức/Tập đoàn đạt chuẩn ISO/IEC 27001.</p>
          </div>
          <div class="p-4 rounded-2xl bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
            <div class="text-2xl font-extrabold text-purple-700 dark:text-purple-400">8 Ngôn ngữ</div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">AI Localization Tức thì</div>
            <p class="text-[11px] text-slate-500 mt-1">Hỗ trợ Tiếng Việt, Anh, Nhật, Hàn, Trung, Thái, Lào, Khmer tích hợp motapis.com/v1.</p>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 leading-relaxed">
          <div class="font-bold text-slate-900 dark:text-white">Sứ mệnh & Tầm nhìn Quốc tế</div>
          <p class="text-slate-600 dark:text-slate-300">HireMind Global kết hợp cổng thông tin việc làm chuẩn quốc tế (tương tự VietnamWorks, LinkedIn Talent, ViecLam24h) với hệ thống Quản trị Tuyển dụng Doanh nghiệp (Enterprise ATS), giúp rút ngắn 60% thời gian tuyển dụng nhờ công nghệ AI chấm điểm độ khớp CV và phỏng vấn thông minh.</p>
        </div>
      `,
      ctaLabel: "🔍 Khám phá Việc làm đang tuyển",
      ctaAction: "closePortalModal(); switchPortalSection('jobs');",
    },
    intech: {
      badge: "HIREMIND inTECH • AI CLOUD & R&D LABS",
      title: "HireMind inTECH — Trung tâm Công nghệ AI Tuyển dụng & Chuyển đổi số HR",
      subtitle: "Nền tảng công nghệ lõi vận hành bởi cổng AI LLM motapis.com/v1, Big Data Lương 2026 và Kiến trúc Multi-Tenant.",
      body: `
        <div class="space-y-3">
          <div class="p-4 rounded-2xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-indigo-900 dark:text-indigo-300">🚀 Các trụ cột công nghệ tại HireMind inTECH:</div>
            <ul class="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
              <li><strong>AI Resume Parser & Matching Score:</strong> Tự động bóc tách kỹ năng, kinh nghiệm từ CV PDF/Word và đối sánh với JD trong 2 giây.</li>
              <li><strong>AI Localization Engine (8 ngôn ngữ):</strong> Dịch thuật tự động toàn bộ JD, tên công ty và mức lương theo thời gian thực.</li>
              <li><strong>Enterprise RBAC & Audit Trail:</strong> Phân quyền chặt chẽ cho HR Director, Recruiter, Hiring Manager và Ứng viên.</li>
            </ul>
          </div>
        </div>
      `,
      ctaLabel: "🌐 Mở Công cụ Dịch AI Tự động",
      ctaAction: "closePortalModal(); openAiTranslatorModal();",
    },
    contact: {
      badge: "LIÊN HỆ & TRỤ SỞ HIREMIND GLOBAL",
      title: "Liên hệ Trung tâm Hỗ trợ Ứng viên & Doanh nghiệp",
      subtitle: "Đội ngũ Chuyên gia Tư vấn Tuyển dụng & CSKH 24/7 luôn sẵn sàng đồng hành cùng bạn.",
      body: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-slate-900 dark:text-white">🏢 Trụ sở Chính (TP. Hồ Chí Minh)</div>
            <p class="text-slate-600 dark:text-slate-300">Tầng 20, Tòa nhà E.Town Central, 11 Đoàn Văn Bơ, Phường Xóm Chiếu, Quận 4, TP. Hồ Chí Minh</p>
            <div class="text-blue-600 font-bold">📞 Hotline Miền Nam: (028) 3925 8888</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-slate-900 dark:text-white">🏛️ Văn phòng Đại diện (Hà Nội & Đà Nẵng)</div>
            <p class="text-slate-600 dark:text-slate-300">Tầng 15, Tòa nhà Capital Place, 29 Liễu Giai, Quận Ba Đình, Hà Nội</p>
            <div class="text-blue-600 font-bold">📞 Hotline Miền Bắc: (024) 3974 9999</div>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">📧 Email Hỗ trợ 24/7: support@hiremind.vn | b2b@hiremind.vn</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Hoặc trò chuyện trực tiếp với Trợ lý AI CSKH 24/7 ở góc phải màn hình.</div>
          </div>
          <button onclick="closePortalModal(); toggleSupportChatbot(true);" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow">
            🤖 Mở Chat CSKH 24/7
          </button>
        </div>
      `,
      ctaLabel: "🤖 Trò chuyện ngay với CSKH 24/7",
      ctaAction: "closePortalModal(); toggleSupportChatbot(true);",
    },
    faq: {
      badge: "HỎI ĐÁP (FAQ) • TRUNG TÂM TRỢ GIÚP",
      title: "Câu hỏi Thường gặp dành cho Ứng viên & Nhà tuyển dụng",
      subtitle: "Giải đáp chi tiết về quy trình nộp CV, bảo mật thông tin cá nhân và đăng ký tài khoản Doanh nghiệp SaaS.",
      body: `
        <div class="space-y-3">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="font-bold text-slate-900 dark:text-white">1. Làm sao để nộp hồ sơ ứng tuyển và theo dõi tiến độ?</div>
            <p class="text-slate-600 dark:text-slate-300 mt-1">Bạn chỉ cần chọn vị trí công việc mong muốn, nhấn <strong>Ứng tuyển ngay</strong>, tải lên CV hoặc điền thông tin. Sau đó vào mục <strong>Hồ sơ đã nộp (5 bước)</strong> để theo dõi trạng thái thời gian thực (Tiếp nhận → AI chấm điểm → Phỏng vấn → Offer → Nhận việc).</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="font-bold text-slate-900 dark:text-white">2. Doanh nghiệp đăng ký Tenant trên cổng Public có được tách biệt dữ liệu không?</div>
            <p class="text-slate-600 dark:text-slate-300 mt-1">Có! Mỗi doanh nghiệp đăng ký được cấp mã <code>Tenant ID</code> độc lập, đảm bảo dữ liệu tin đăng và CV ứng viên chỉ hiển thị trong không gian quản trị của tổ chức đó.</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="font-bold text-slate-900 dark:text-white">3. Cách tính lương Gross sang Net chuẩn 2026 như thế nào?</div>
            <p class="text-slate-600 dark:text-slate-300 mt-1">Hệ thống tích hợp sẵn Công cụ tính lương Gross ↔ Net áp dụng mức giảm trừ gia cảnh bản thân 11 triệu VNĐ/tháng, người phụ thuộc 4.4 triệu VNĐ/tháng và biểu thuế lũy tiến 7 bậc chuẩn quy định hiện hành.</p>
          </div>
        </div>
      `,
      ctaLabel: "🧮 Mở Công cụ Tính lương Gross-Net",
      ctaAction: "closePortalModal(); switchPortalSection('tools');",
    },
    terms: {
      badge: "THỎA THUẬN SỬ DỤNG • TERMS OF SERVICE",
      title: "Thỏa thuận Sử dụng Dịch vụ Sàn Giao dịch Việc làm HireMind Global",
      subtitle: "Cập nhật lần cuối: Tháng 10/2026 • Áp dụng cho toàn bộ Ứng viên và Tổ chức Tuyển dụng (B2B Tenants).",
      body: `
        <div class="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scroll pr-2">
          <p><strong>Điều 1. Quyền và nghĩa vụ của Ứng viên:</strong> Ứng viên được sử dụng miễn phí 100% các tính năng tìm kiếm việc làm, tạo hồ sơ CV, ứng tuyển trực tuyến, tra cứu lương Gross-Net và nhận tư vấn từ Chatbot AI 24/7. Ứng viên cam kết cung cấp thông tin trung thực trong hồ sơ dự tuyển.</p>
          <p><strong>Điều 2. Quyền và nghĩa vụ của Nhà tuyển dụng (Tenant):</strong> Doanh nghiệp đăng ký tài khoản tổ chức cam kết chỉ đăng tải các thông tin tuyển dụng hợp pháp, minh bạch về mức lương, địa điểm làm việc và chế độ đãi ngộ theo Bộ luật Lao động Việt Nam.</p>
          <p><strong>Điều 3. Sở hữu trí tuệ & Công nghệ AI:</strong> Toàn bộ thuật toán chấm điểm CV, công cụ dịch thuật đa ngôn ngữ và giao diện sàn việc làm thuộc bản quyền của Công ty Cổ phần HireMind Global Việt Nam.</p>
        </div>
      `,
      ctaLabel: "✔ Tôi đã hiểu và đồng ý",
      ctaAction: "closePortalModal();",
    },
    privacy: {
      badge: "QUY ĐỊNH BẢO MẬT • NGHỊ ĐỊNH 13/2023/NĐ-CP & GDPR",
      title: "Chính sách Bảo mật Dữ liệu Cá nhân & Hồ sơ Ứng viên",
      subtitle: "Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân tại Việt Nam và tiêu chuẩn quốc tế ISO/IEC 27001.",
      body: `
        <div class="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 font-semibold text-emerald-900 dark:text-emerald-300">
            🔒 Cam kết Bảo mật 3 Lớp: Mã hóa TLS 1.3 • Cách ly Multi-Tenant Database • Quyền Ẩn danh CV chủ động.
          </div>
          <p>1. <strong>Mục đích thu thập:</strong> Dữ liệu CV, email và số điện thoại của ứng viên chỉ được chuyển tới đúng Doanh nghiệp mà ứng viên chủ động nhấn nộp hồ sơ.</p>
          <p>2. <strong>Quyền của chủ thể dữ liệu:</strong> Ứng viên có toàn quyền chỉnh sửa, tải xuống hoặc yêu cầu xóa vĩnh viễn hồ sơ cá nhân khỏi hệ thống bất kỳ lúc nào.</p>
        </div>
      `,
      ctaLabel: "🔒 Đóng cửa sổ",
      ctaAction: "closePortalModal();",
    },
    ecommerce_policy: {
      badge: "QUY CHẾ HOẠT ĐỘNG SÀN TMĐT • ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG",
      title: "Quy chế Hoạt động Sàn Giao dịch Thương mại Điện tử & Dịch vụ Việc làm",
      subtitle: "Giấy phép Hoạt động Dịch vụ Việc làm số 18/SLĐTBXH-GP & Đăng ký Sàn TMĐT với Bộ Công Thương.",
      body: `
        <div class="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
          <p><strong>1. Nguyên tắc hoạt động:</strong> Sàn giao dịch việc làm trực tuyến HireMind Global kết nối trực tiếp nhu cầu tuyển dụng nhân sự của các Doanh nghiệp đã xác thực mã số thuế (Verified Enterprise Tenants) với người lao động.</p>
          <p><strong>2. Quy trình kiểm duyệt tin đăng:</strong> Mọi tin tuyển dụng mới tạo qua Cổng Doanh nghiệp đều được kiểm tra tự động và hậu kiểm nhằm chống tin rác, đảm bảo không thu bất kỳ khoản phí nào từ người tìm việc.</p>
          <p><strong>3. Cơ chế giải quyết tranh chấp, khiếu nại:</strong> Tiếp nhận phản ánh 24/7 qua Hotline (028) 3925 8888 hoặc Chatbot CSKH trực tuyến, xử lý và phản hồi trong vòng 24 giờ làm việc.</p>
        </div>
      `,
      ctaLabel: "🏛️ Xem Danh sách Doanh nghiệp Đã xác thực",
      ctaAction: "closePortalModal(); switchPortalSection('companies');",
    },
    sitemap: {
      badge: "SƠ ĐỒ TRANG WEB • FULL PORTAL SITEMAP",
      title: "Sơ đồ Cấu trúc Toàn diện Cổng Tuyển dụng & Quản trị HireMind",
      subtitle: "Điều hướng nhanh tới mọi phân hệ chức năng dành cho Ứng viên, Nhà tuyển dụng và Quản trị viên.",
      body: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-blue-700 dark:text-blue-400">👤 Phân hệ Dành cho Ứng viên</div>
            <div class="flex flex-col gap-1.5 text-slate-700 dark:text-slate-300">
              <button onclick="closePortalModal(); switchPortalSection('jobs');" class="text-left hover:text-blue-600">• Việc làm Đang tuyển & AI Gợi ý</button>
              <button onclick="closePortalModal(); switchPortalSection('companies');" class="text-left hover:text-blue-600">• Danh bạ Tập đoàn & Công ty Hàng đầu</button>
              <button onclick="closePortalModal(); switchPortalSection('my_apps');" class="text-left hover:text-blue-600">• Theo dõi Hồ sơ đã nộp (5 bước)</button>
              <button onclick="closePortalModal(); switchPortalSection('tools');" class="text-left hover:text-blue-600">• Công cụ Tính lương Gross-Net & Cẩm nang</button>
            </div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-emerald-700 dark:text-emerald-400">🏢 Phân hệ Doanh nghiệp & Hệ thống</div>
            <div class="flex flex-col gap-1.5 text-slate-700 dark:text-slate-300">
              <button onclick="closePortalModal(); switchPortalSection('employer_workspace');" class="text-left hover:text-blue-600">• Không gian Nhà tuyển dụng (Đăng tin & Quản lý CV)</button>
              <button onclick="closePortalModal(); openEmployerModal('register');" class="text-left hover:text-blue-600">• Đăng ký Cấp phát Tenant Doanh nghiệp</button>
              <button onclick="closePortalModal(); openLocationManagerModal();" class="text-left hover:text-blue-600">• Quản lý 63 Tỉnh thành & Khu công nghiệp</button>
              <a href="/index.html" class="text-left hover:text-blue-600 font-semibold">• Chuyển sang Hệ thống Quản trị ATS Nội bộ ↗</a>
            </div>
          </div>
        </div>
      `,
      ctaLabel: "🔍 Về Trang Tìm kiếm Việc làm",
      ctaAction: "closePortalModal(); switchPortalSection('jobs');",
    },
    resume_search: {
      badge: "TÌM KIẾM HỒ SƠ • AI TALENT SOURCING",
      title: "Kho Hồ sơ Ứng viên Chất lượng cao & Sàng lọc AI Tự động",
      subtitle: "Truy cập kho dữ liệu 50,000+ CV chuyên gia đã xác thực kỹ năng, phân loại theo ngành nghề và mức điểm AI Matching.",
      body: `
        <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 space-y-2.5">
          <div class="font-bold text-slate-900 dark:text-white">🎯 Tính năng nổi bật dành cho Nhà tuyển dụng:</div>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
            <li>Tìm kiếm ứng viên theo từ khóa kỹ năng (Python, React, Kế toán trưởng, QA/QC, Tiếng Nhật N2...).</li>
            <li>Xem điểm AI Matching (0-100%) và tóm tắt điểm mạnh/điểm yếu tự động của từng ứng viên.</li>
            <li>Chuyển trạng thái phỏng vấn, gửi thư mời Offer ngay trong <strong>Không gian Nhà tuyển dụng</strong>.</li>
          </ul>
        </div>
      `,
      ctaLabel: "🏢 Mở Không gian Nhà tuyển dụng & Kho Hồ sơ",
      ctaAction: "closePortalModal(); switchPortalSection('employer_workspace');",
    },
    market_report: {
      badge: "BÁO CÁO THỊ TRƯỜNG TUYỂN DỤNG & LƯƠNG 2026",
      title: "Báo cáo Thị trường Lao động & Khung Lương Chuẩn Quốc tế 2026",
      subtitle: "Tổng hợp từ 12,500+ tin tuyển dụng thực tế của các Tập đoàn Công nghệ, Ngân hàng, Sản xuất FDI tại Việt Nam.",
      body: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="text-xs font-bold text-slate-500">CNTT, AI & Phần mềm</div>
            <div class="text-base font-extrabold text-blue-600 mt-1">35 - 110 Triệu VNĐ</div>
            <div class="text-[11px] text-emerald-600 font-semibold mt-0.5">▲ Tăng trưởng nhu cầu +28%</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="text-xs font-bold text-slate-500">Tài chính, Ngân hàng & Kế toán</div>
            <div class="text-base font-extrabold text-blue-600 mt-1">22 - 75 Triệu VNĐ</div>
            <div class="text-[11px] text-emerald-600 font-semibold mt-0.5">▲ Tăng trưởng nhu cầu +19%</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="text-xs font-bold text-slate-500">Sản xuất FDI & Chuỗi cung ứng</div>
            <div class="text-base font-extrabold text-blue-600 mt-1">20 - 65 Triệu VNĐ</div>
            <div class="text-[11px] text-emerald-600 font-semibold mt-0.5">▲ Tăng trưởng nhu cầu +34% (Hải Phòng, Bắc Ninh, Bình Dương)</div>
          </div>
        </div>
      `,
      ctaLabel: "📊 Xem Chi tiết tại Công cụ Lương & Cẩm nang",
      ctaAction: "closePortalModal(); switchPortalSection('tools');",
    },
    contact_b2b: {
      badge: "B2B ENTERPRISE SOLUTIONS • TƯ VẤN DOANH NGHIỆP",
      title: "Đăng ký Tư vấn Giải pháp Tuyển dụng & Cấp phát Tenant Doanh nghiệp",
      subtitle: "Khởi tạo không gian tuyển dụng riêng cho Tập đoàn của bạn chỉ trong 30 giây hoặc liên hệ Chuyên gia B2B.",
      body: `
        <div class="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 space-y-2">
          <div class="font-bold text-emerald-900 dark:text-emerald-300">✨ Quyền lợi Gói Enterprise SaaS Tenant:</div>
          <p class="text-slate-600 dark:text-slate-300">• Trang thương hiệu tuyển dụng riêng biệt • Đăng tin tuyển dụng đa khu vực (63 tỉnh thành) • Hệ thống ATS quản lý ứng viên độc lập • Báo cáo xuất Excel/PDF chuẩn UTF-8.</p>
          <div class="font-bold text-slate-900 dark:text-white pt-1">📞 Hotline B2B Doanh nghiệp: 1900 6868 • Email: enterprise@hiremind.vn</div>
        </div>
      `,
      ctaLabel: "🏢 Đăng ký Cấp phát Tenant Doanh nghiệp ngay",
      ctaAction: "closePortalModal(); openEmployerModal('register');",
    },
    mobile_app: {
      badge: "ỨNG DỤNG DI ĐỘNG HIREMIND • iOS & ANDROID",
      title: "Trải nghiệm Ứng dụng Di động HireMind Global (PWA & Mobile App)",
      subtitle: "Nhận thông báo việc làm phù hợp từ AI, nộp CV 1 chạm và nhận lịch phỏng vấn tức thì trên điện thoại.",
      body: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div class="font-bold text-slate-900 dark:text-white">📱 Tính năng trên Mobile App:</div>
            <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Thông báo đẩy (Push Notification) ngay khi Nhà tuyển dụng xem CV hoặc mời phỏng vấn.</li>
              <li>Tích hợp AI Chatbot CSKH 24/7 và Công cụ tính lương Gross-Net mượt mà trên mọi thiết bị di động.</li>
            </ul>
          </div>
          <div class="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-center space-y-2">
            <div class="text-3xl">📲</div>
            <div class="font-bold text-slate-900 dark:text-white">Phiên bản Web-App Chuẩn Responsive</div>
            <p class="text-[11px] text-slate-500">Bạn có thể thêm trực tiếp trang này vào Màn hình chính (Add to Home Screen) trên iOS Safari hoặc Android Chrome để sử dụng như ứng dụng bản địa.</p>
          </div>
        </div>
      `,
      ctaLabel: "✔ Đã hiểu",
      ctaAction: "closePortalModal();",
    },
    zalo_connect: {
      badge: "ZALO OFFICIAL ACCOUNT • KẾT NỐI CSKH 24/7",
      title: "Kết nối Zalo Official Account — HireMind Global Việt Nam",
      subtitle: "Nhận hỗ trợ trực tiếp qua Zalo OA hoặc trò chuyện ngay với Trợ lý AI CSKH 24/7 trên website.",
      body: `
        <div class="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 space-y-2.5">
          <div class="font-bold text-blue-900 dark:text-blue-300">💬 Hỗ trợ Đa kênh Tức thì (Zalo OA + Live AI Concierge 24/7)</div>
          <p class="text-slate-600 dark:text-slate-300">Kênh Zalo Official Account của HireMind Global hỗ trợ thông báo kết quả ứng tuyển, lịch phỏng vấn và giải đáp thắc mắc cho cả Ứng viên lẫn Nhà tuyển dụng. Bạn cũng có thể chat trực tiếp ngay trên khung <strong>Chat CSKH 24/7</strong> mà không cần rời khỏi trang web!</p>
        </div>
      `,
      ctaLabel: "🤖 Mở Khung Chat CSKH 24/7 ngay",
      ctaAction: "closePortalModal(); toggleSupportChatbot(true);",
    },
  };

  const info = pages[pageKey] || pages.about;
  openPortalModal(`
    <div class="space-y-4 text-xs">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div class="space-y-1">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            ${info.badge}
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">${info.title}</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed">${info.subtitle}</p>
        </div>
        <button onclick="closePortalModal()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold shrink-0">
          ${pd.btnClose || "Đóng"}
        </button>
      </div>
      <div class="space-y-3">
        ${info.body}
      </div>
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
        <button onclick="closePortalModal()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
          ${pd.btnClose || "Đóng"}
        </button>
        <button onclick="${info.ctaAction}" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition">
          ${info.ctaLabel}
        </button>
      </div>
    </div>
  `, () => openFunctionalPageModal(pageKey));
}

function toggleSupportChatbot(forceState) {
  const panel = document.getElementById("support-chatbot-panel");
  if (!panel) return;
  const isHidden = panel.classList.contains("hidden");
  const shouldOpen = typeof forceState === "boolean" ? forceState : isHidden;
  if (shouldOpen) {
    panel.classList.remove("hidden");
    const input = document.getElementById("support-chatbot-input") || document.getElementById("support-chat-input");
    if (input) setTimeout(() => input.focus(), 80);
  } else {
    panel.classList.add("hidden");
  }
}

function sendQuickConciergePrompt(promptText) {
  const input = document.getElementById("support-chatbot-input") || document.getElementById("support-chat-input");
  if (!input) return;
  input.value = promptText;
  submitSupportChatMessage(new Event("submit"));
}

async function submitSupportChatMessage(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  const input = document.getElementById("support-chatbot-input") || document.getElementById("support-chat-input");
  const container = document.getElementById("support-chatbot-messages") || document.getElementById("support-chat-messages");
  if (!input || !container) return;

  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";

  // Render User Bubble
  const userDiv = document.createElement("div");
  userDiv.className = "flex justify-end";
  userDiv.innerHTML = `
    <div class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%] shadow-sm leading-relaxed">
      ${msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </div>
  `;
  container.appendChild(userDiv);

  // Render Typing Indicator
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "flex gap-2.5 items-start";
  loadingDiv.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">AI</div>
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm text-slate-500">
      ⏳ Chuyên viên AI đang tra cứu dữ liệu thời gian thực...
    </div>
  `;
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/public/concierge-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: msg,
        lang: portalState.lang || "vi",
        role: portalState.employer ? "employer" : portalState.candidate ? "candidate" : "visitor",
      }),
    });

    let data = null;
    if (res.ok) {
      data = await res.json();
    }

    loadingDiv.remove();

    const replyHtml = data && data.reply
      ? data.reply.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>")
      : "Cảm ơn bạn đã liên hệ! Bạn có thể tra cứu việc làm đang mở, sử dụng công cụ tính lương Gross-Net hoặc đăng ký tài khoản Doanh nghiệp ngay trên thanh công cụ.";

    let jobsHtml = "";
    if (data && Array.isArray(data.suggested_jobs) && data.suggested_jobs.length > 0) {
      jobsHtml = `
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
          <div class="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Việc làm gợi ý trực tiếp:</div>
          ${data.suggested_jobs
            .map(
              (j) => `
            <button type="button" onclick="openJobApplyModal('${j.id}')"
              class="w-full text-left p-2 rounded-xl bg-blue-50/70 dark:bg-slate-900 hover:bg-blue-100/80 border border-blue-200/70 dark:border-slate-700 transition block">
              <div class="font-bold text-slate-900 dark:text-white text-[11px] truncate">${j.title}</div>
              <div class="text-[10px] text-slate-500 truncate">📍 ${j.location} • 💰 ${j.salary_range}</div>
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    let actionBtnHtml = "";
    if (data && data.action === "open_salary_tool") {
      actionBtnHtml = `<button type="button" onclick="switchPortalSection('tools')" class="mt-2 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]">🧮 Mở Công cụ Tính lương Gross-Net</button>`;
    } else if (data && data.action === "open_employer_modal") {
      actionBtnHtml = `<button type="button" onclick="openEmployerAuthModal()" class="mt-2 w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]">🏢 Đăng ký Tenant Doanh nghiệp</button>`;
    } else if (data && data.action === "open_my_apps") {
      actionBtnHtml = `<button type="button" onclick="switchPortalSection('my_apps')" class="mt-2 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]">📋 Xem Tiến độ Hồ sơ (5 bước)</button>`;
    } else if (data && data.action === "open_location_manager") {
      actionBtnHtml = `<button type="button" onclick="openLocationManagerModal()" class="mt-2 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]">🗺️ Mở Quản lý 63 Tỉnh thành</button>`;
    }

    const botDiv = document.createElement("div");
    botDiv.className = "flex gap-2.5 items-start";
    botDiv.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">AI</div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-[88%]">
        <div>${replyHtml}</div>
        ${jobsHtml}
        ${actionBtnHtml}
      </div>
    `;
    container.appendChild(botDiv);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    loadingDiv.remove();
  }
}

/* ============================================================================
   14. VIP ACCOUNT PRIORITY ENGINE & LEFT/RIGHT SKYSCRAPER AD BANNERS
   ============================================================================ */
const DEFAULT_PUBLIC_AD_BANNERS = [
  {
    id: "AD-VIP-01",
    position: "left_top",
    vip_tier: "diamond_vip",
    badge_text: "👑 DIAMOND VIP • TOP 1",
    company_name: "TechVina AI & Cloud Holdings",
    title: "Tuyển 50+ Kỹ sư AI, Cloud & Giám đốc Khối Số hóa 2026",
    subtitle: "Đãi ngộ đến $6,500/tháng • Thưởng cổ phần ESOP • Làm việc Hybrid",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    target_url: "https://techvina.vn/careers-vip",
    facebook_url: "https://facebook.com/techvinaholdings.official",
    zalo_url: "https://zalo.me/techvinahr",
    cta_label: "🌐 Website Tuyển dụng",
    bg_accent: "from-blue-900 via-indigo-900 to-slate-900",
    is_active: true,
    priority_order: 1,
    clicks: 1284,
    impressions: 18450,
  },
  {
    id: "AD-VIP-02",
    position: "right_top",
    vip_tier: "diamond_vip",
    badge_text: "👑 DIAMOND VIP • GLOBAL FDI",
    company_name: "K-Semicon Vina Semiconductor",
    title: "Chiến dịch Tuyển dụng Kỹ sư Bán dẫn & R&D Hàn Quốc",
    subtitle: "Tài trợ 100% khóa đào tạo tại Seoul • Lương thưởng vượt trội",
    image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    target_url: "https://k-semicon.vn/tuyen-dung",
    facebook_url: "https://facebook.com/ksemiconvina.careers",
    zalo_url: "https://zalo.me/ksemiconvina",
    cta_label: "🌐 Website Tập đoàn",
    bg_accent: "from-indigo-950 via-blue-900 to-cyan-900",
    is_active: true,
    priority_order: 1,
    clicks: 1095,
    impressions: 16290,
  },
  {
    id: "AD-VIP-03",
    position: "left_bottom",
    vip_tier: "platinum_pro",
    badge_text: "💎 PLATINUM VIP • JAPAN FDI",
    company_name: "Nippon Precision Manufacturing",
    title: "Tuyển Quản đốc Nhà máy & Kỹ sư Tự động hóa VSIP",
    subtitle: "Chuẩn phúc lợi Nhật Bản • Xe đưa đón Hà Nội - Bắc Ninh - TP.HCM",
    image_url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=600&q=80",
    target_url: "https://nipponprecision.jp/vn-jobs",
    facebook_url: "https://facebook.com/nipponprecision.vn",
    zalo_url: "https://zalo.me/nipponprecision",
    cta_label: "🌐 Trang Tuyển dụng",
    bg_accent: "from-emerald-950 via-teal-900 to-slate-900",
    is_active: true,
    priority_order: 2,
    clicks: 840,
    impressions: 12900,
  },
  {
    id: "AD-VIP-04",
    position: "right_bottom",
    vip_tier: "platinum_pro",
    badge_text: "💎 PLATINUM VIP • FINTECH & RESORT",
    company_name: "Angkor Royal Digital Bank & Resort",
    title: "Cơ hội Quản lý Cấp cao Ngân hàng Số & Nghỉ dưỡng 5 Sao",
    subtitle: "Làm việc tại TP.HCM, Phú Quốc & Đông Nam Á • Gói Relocation VIP",
    image_url: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=600&q=80",
    target_url: "https://angkorroyal.com/executive-careers",
    facebook_url: "https://facebook.com/angkorroyal.group",
    zalo_url: "https://zalo.me/angkorroyal",
    cta_label: "🌐 Khám phá Cơ hội",
    bg_accent: "from-amber-900 via-orange-950 to-slate-900",
    is_active: true,
    priority_order: 2,
    clicks: 765,
    impressions: 11400,
  },
  {
    id: "AD-VIP-05",
    position: "hero_1",
    placement: "hero_1",
    vip_tier: "diamond_vip",
    badge_text: "🔥 HERO SPOTLIGHT #1",
    company_name: "TechVina AI & Cloud Holdings",
    title: "FPT & TechVina AI Cloud — Tuyển Giám đốc Chuyển đổi Số & Kỹ sư AI Toàn cầu",
    subtitle: "Gói thu nhập tới $8,000/tháng • Thưởng cổ phần ESOP • Làm việc tại Hà Nội & TP.HCM",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    target_url: "https://techvina-enterprise.vn/ai-leadership",
    facebook_url: "https://facebook.com/TechVinaGlobalCareers",
    zalo_url: "https://zalo.me/techvinahr",
    cta_label: "🌐 Ứng tuyển Fast-Track",
    bg_accent: "from-slate-900 via-blue-950 to-indigo-950",
    is_active: true,
    priority_order: 1,
    clicks: 1940,
    impressions: 24680,
  },
  {
    id: "AD-VIP-06",
    position: "hero_2",
    placement: "hero_2",
    vip_tier: "diamond_vip",
    badge_text: "🔥 HERO SPOTLIGHT #2",
    company_name: "Hanul Semiconductor & Electronics (Hàn Quốc)",
    title: "Hanul Semiconductor Hàn Quốc — Tuyển 30 Kỹ sư Thiết kế Vi mạch & R&D",
    subtitle: "Tài trợ 100% khóa đào tạo tại Seoul • Phụ cấp ngoại ngữ TOPIK / IELTS hấp dẫn",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    target_url: "https://hanul-semi.kr/vietnam-rnd-center",
    facebook_url: "https://facebook.com/HanulSemiconductorVN",
    zalo_url: "https://zalo.me/ksemiconvina",
    cta_label: "🌐 Khám phá R&D Center",
    bg_accent: "from-indigo-950 via-slate-900 to-blue-950",
    is_active: true,
    priority_order: 1,
    clicks: 1680,
    impressions: 21950,
  },
  {
    id: "AD-VIP-07",
    position: "hero_3",
    placement: "hero_3",
    vip_tier: "platinum_pro",
    badge_text: "🔥 HERO SPOTLIGHT #3",
    company_name: "Sakura Precision Manufacturing FDI (Nhật Bản)",
    title: "Sakura Precision Nhật Bản — Tuyển Giám đốc Nhà máy & Kỹ sư Cầu nối BrSE N2+",
    subtitle: "Thưởng 4 tháng lương/năm • Bảo hiểm sức khỏe Quốc tế cho cả gia đình",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    target_url: "https://sakura-fdi.co.jp/careers-vietnam",
    facebook_url: "https://facebook.com/SakuraPrecisionVietnam",
    zalo_url: "https://zalo.me/nipponprecision",
    cta_label: "🌐 Xem Đãi ngộ Nhật Bản",
    bg_accent: "from-teal-950 via-slate-900 to-emerald-950",
    is_active: true,
    priority_order: 1,
    clicks: 1420,
    impressions: 19320,
  },
  {
    id: "AD-VIP-08",
    position: "hero_4",
    placement: "hero_4",
    vip_tier: "platinum_pro",
    badge_text: "🔥 HERO SPOTLIGHT #4",
    company_name: "Liên minh Tài chính & Bán lẻ ASEAN",
    title: "Angkor Digital Bank & Siam Retail — Tuyển Giám đốc Khối Fintech & Chuỗi Cung Ứng",
    subtitle: "Làm việc tại TP.HCM, Bangkok & Phnom Penh • Gói Relocation Quốc tế toàn diện",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    target_url: "https://angkorbank.com.kh/asean-executive",
    facebook_url: "https://facebook.com/ASEANExecutiveCareers",
    zalo_url: "https://zalo.me/angkorroyal",
    cta_label: "🌐 Ứng tuyển Khối ASEAN",
    bg_accent: "from-amber-950 via-slate-900 to-indigo-950",
    is_active: true,
    priority_order: 1,
    clicks: 1310,
    impressions: 17840,
  },
];

function getEmployerVipTierInfo(orgId, idx = 0) {
  const empFromDb = (portalState.marketplace?.employers || []).find((e) => e.org_id === orgId);
  if (empFromDb && empFromDb.vip_tier) {
    const tierUpper = String(empFromDb.vip_tier).toUpperCase();
    if (tierUpper.includes("DIAMOND")) {
      return {
        tier_code: "diamond_vip",
        badge_label: "👑 DIAMOND VIP • X5.0",
        priority_score: 100,
        is_pinned: idx < 6,
      };
    }
    if (tierUpper.includes("PLATINUM")) {
      return {
        tier_code: "platinum_pro",
        badge_label: "💎 PLATINUM PRO • X3.0",
        priority_score: 75,
        is_pinned: false,
      };
    }
    if (tierUpper.includes("GOLD")) {
      return {
        tier_code: "gold_verified",
        badge_label: "⭐ GOLD VERIFIED • X1.8",
        priority_score: 50,
        is_pinned: false,
      };
    }
  }
  const map = {
    "TENANT-VN-01": {
      tier_code: "diamond_vip",
      badge_label: "👑 DIAMOND VIP • X5.0",
      priority_score: 100,
      is_pinned: idx < 4,
    },
    "TENANT-KR-03": {
      tier_code: "diamond_vip",
      badge_label: "👑 DIAMOND VIP • X5.0",
      priority_score: 100,
      is_pinned: idx < 6,
    },
    "TENANT-JP-02": {
      tier_code: "platinum_pro",
      badge_label: "💎 PLATINUM PRO • X3.0",
      priority_score: 75,
      is_pinned: false,
    },
    "TENANT-KH-06": {
      tier_code: "platinum_pro",
      badge_label: "💎 PLATINUM PRO • X3.0",
      priority_score: 75,
      is_pinned: false,
    },
    "TENANT-TH-04": {
      tier_code: "gold_verified",
      badge_label: "⭐ GOLD VERIFIED • X1.8",
      priority_score: 50,
      is_pinned: false,
    },
    "TENANT-LA-05": {
      tier_code: "gold_verified",
      badge_label: "⭐ GOLD VERIFIED • X1.8",
      priority_score: 50,
      is_pinned: false,
    },
  };
  return (
    map[orgId] || {
      tier_code: "standard",
      badge_label: "🏢 VERIFIED STANDARD",
      priority_score: 10,
      is_pinned: false,
    }
  );
}

let publicAdBannersState = [];

async function loadAndRenderPublicAdBanners() {
  let banners = [];
  let loadedFromServer = false;
  try {
    const res = await fetch(`${API_BASE}/api/ad-banners?active_only=true`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        banners = data.items;
        loadedFromServer = true;
        try {
          localStorage.setItem("hiremind_ad_banners_cache", JSON.stringify(banners));
        } catch (_e) {}
      }
    }
  } catch (e) {
    // Fallback to localStorage or default seeded VIP banners when offline
  }

  if (!loadedFromServer && (!banners || banners.length === 0)) {
    try {
      const cached = JSON.parse(localStorage.getItem("hiremind_ad_banners_cache") || "[]");
      if (Array.isArray(cached) && cached.length > 0) {
        banners = cached.filter((b) => b.is_active !== false);
      }
    } catch (e) {
      // ignore
    }
  }

  if (!loadedFromServer && (!banners || banners.length === 0)) {
    banners = DEFAULT_PUBLIC_AD_BANNERS;
  }

  publicAdBannersState = banners;
  renderPublicAdWings(banners);
}

const AD_AND_FOOTER_I18N = {
  vi: {
    leftWingTitle: "Banner Trái",
    rightWingTitle: "Banner Phải",
    createAdShort: "+ Tạo QC",
    vipPricingBtn: "Bảng giá VIP",
    vipMechTitle: "👑 Cơ chế Tài khoản VIP",
    vipMechSub: "Xem bảng phân cấp & Đặt Banner",
    adminAdTitle: "📢 Tạo Tin Quảng cáo Admin",
    adminAdSub: "Thêm ảnh Banner, Website & Facebook",
    mobilePartnersTitle: "👑 ĐỐI TÁC TUYỂN DỤNG DIAMOND VIP & PLATINUM",
    footerShowcaseTitle: "CHIẾN DỊCH QUẢNG CÁO DOANH NGHIỆP DIAMOND & PLATINUM VIP TẠI CHÂN TRANG",
    stickyCollapsedText: "👑 Thanh Footer Quảng cáo VIP & Thống kê Trực tuyến",
    stickyRunningText: "chiến dịch đang chạy",
    stickyExpandBtn: "▲ Mở rộng Banner Quảng cáo Footer",
    stickyCollapseBtn: "▼ Thu gọn",
    stickyPartnerDesc: "Đối tác Tuyển dụng Chiến lược (Nhấp trực tiếp vào Website hoặc Fanpage Facebook của Doanh nghiệp):",
    onlineLabel: "Online",
    todayLabel: "Hôm nay",
    visitsUnit: "lượt",
    fbFanpage: "📘 Fanpage Facebook",
    websiteBtn: "🌐 Website",
    topBarRegion: "Vùng:",
    topBarTraffic: "📊 Thống kê Truy cập",
    topBarVip: "Cấp độ VIP & QC",
    topBarLoc: "63 Tỉnh/Thành",
    topBarAds: "📢 Tạo Quảng cáo",
    footerHotlineSouth: "📞 Hotline Hỗ trợ Miền Nam",
    footerHotlineNorth: "📞 Hotline Hỗ trợ Miền Bắc & Trung",
    footerAiB2b: "🤖 Tổng đài AI & Tư vấn B2B 24/7",
    footerAiB2bSub: "Cấp phát Tenant ATS & Sàng lọc Hồ sơ Tự động",
    footerChatBtn: "Chat CSKH 24/7",
    footerPostJobBtn: "📢 Đăng tuyển dụng",
    col1Title: "HireMind Global",
    col1About: "Về HireMind Global",
    col1Intech: "Về HireMind inTECH & AI Cloud",
    col1Contact: "Liên Hệ",
    col1Faq: "Hỏi Đáp (FAQ)",
    col1Terms: "Thỏa Thuận Sử Dụng",
    col1Privacy: "Quy Định Bảo Mật",
    col1Ecommerce: "Quy Chế Hoạt Động Sàn Giao Dịch Thương Mại Điện Tử HireMind Global",
    col1Sitemap: "Sơ Đồ Trang Web (Sitemap)",
    col2Title: "Dành cho Nhà tuyển dụng",
    col2PostJob: "Đăng tuyển dụng",
    col2ResumeSearch: "Tìm kiếm hồ sơ",
    col2MarketReport: "Báo cáo thị trường tuyển dụng",
    col2AtsSystem: "Hệ thống Quản trị ATS",
    col2RegisterTenant: "Đăng ký Tenant Doanh nghiệp",
    col2ContactB2b: "Liên hệ B2B",
    col3Title: "Việc làm theo khu vực",
    col3AllRegions: "Xem tất cả khu vực",
    col4Title: "Việc làm theo ngành nghề",
    col4Accounting: "Kế toán & Kiểm toán",
    col4Banking: "Ngân hàng & Tài chính",
    col4Software: "Phần mềm & AI Cloud",
    col4ItSupport: "IT Support / Help Desk",
    col4Construction: "Xây dựng & Bất động sản",
    col4Manufacturing: "Sản xuất & Chế tạo FDI",
    col4FindJobs: "Tìm việc làm",
    col5AppTitle: "Ứng dụng di động",
    col5DownloadOn: "Tải về trên",
    col5CertifiedBy: "Chứng nhận bởi",
    col5RegisteredMoit: "ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG",
    col5FollowUs: "Theo dõi HireMind Global trên",
    copyrightTitle: "Copyright © Công Ty Cổ Phần Công Nghệ Tuyển Dụng Quốc Tế HireMind Global Việt Nam",
    copyrightAddress: "Tầng 20, Tòa nhà E.Town Central, 11 Đoàn Văn Bơ, Quận 4, TP.HCM • Tòa nhà Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội",
    bottomGrossNet: "🧮 Công cụ Gross-Net",
    adsContent: {
      "AD-VIP-01": {
        title: "Tuyển 50+ Kỹ sư AI, Cloud & Giám đốc Khối Số hóa 2026",
        subtitle: "Đãi ngộ đến $6,500/tháng • Thưởng cổ phần ESOP • Làm việc Hybrid",
        cta: "🌐 Website Tuyển dụng",
      },
      "AD-VIP-02": {
        title: "Chiến dịch Tuyển dụng Kỹ sư Bán dẫn & R&D Hàn Quốc",
        subtitle: "Tài trợ 100% khóa đào tạo tại Seoul • Lương thưởng vượt trội",
        cta: "🌐 Website Tập đoàn",
      },
      "AD-VIP-03": {
        title: "Tuyển Quản đốc Nhà máy & Kỹ sư Tự động hóa VSIP",
        subtitle: "Chuẩn phúc lợi Nhật Bản • Xe đưa đón Hà Nội - Bắc Ninh - TP.HCM",
        cta: "🌐 Trang Tuyển dụng",
      },
      "AD-VIP-04": {
        title: "Cơ hội Quản lý Cấp cao Ngân hàng Số & Nghỉ dưỡng 5 Sao",
        subtitle: "Làm việc tại TP.HCM, Phú Quốc & Đông Nam Á • Gói Relocation VIP",
        cta: "🌐 Khám phá Cơ hội",
      },
    },
  },
  en: {
    leftWingTitle: "Left Ad Wing",
    rightWingTitle: "Right Ad Wing",
    createAdShort: "+ Create Ad",
    vipPricingBtn: "VIP Tiers",
    vipMechTitle: "👑 VIP Account Priority",
    vipMechSub: "View VIP Tiers & Book Ad Banners",
    adminAdTitle: "📢 Admin Ad Banner Studio",
    adminAdSub: "Upload Banner, Website & Facebook URL",
    mobilePartnersTitle: "👑 DIAMOND & PLATINUM VIP RECRUITMENT PARTNERS",
    footerShowcaseTitle: "DIAMOND & PLATINUM VIP ENTERPRISE AD CAMPAIGNS IN FOOTER",
    stickyCollapsedText: "👑 Sticky VIP Ad Footer & Live Traffic Telemetry",
    stickyRunningText: "active campaigns",
    stickyExpandBtn: "▲ Expand Footer Ad Banners",
    stickyCollapseBtn: "▼ Collapse",
    stickyPartnerDesc: "Strategic Hiring Partners (Click directly to visit Official Website or Facebook Fanpage):",
    onlineLabel: "Online",
    todayLabel: "Today",
    visitsUnit: "visits",
    fbFanpage: "📘 Facebook Fanpage",
    websiteBtn: "🌐 Official Website",
    topBarRegion: "Region:",
    topBarTraffic: "📊 Live Traffic",
    topBarVip: "VIP Tiers & Ads",
    topBarLoc: "63 Provinces",
    topBarAds: "📢 Create Ad",
    footerHotlineSouth: "📞 Southern Region Hotline",
    footerHotlineNorth: "📞 Northern & Central Hotline",
    footerAiB2b: "🤖 24/7 AI Concierge & B2B Desk",
    footerAiB2bSub: "Enterprise ATS Provisioning & Automated AI Screening",
    footerChatBtn: "24/7 Support Chat",
    footerPostJobBtn: "📢 Post a Job",
    col1Title: "HireMind Global",
    col1About: "About HireMind Global",
    col1Intech: "HireMind inTECH & AI Cloud",
    col1Contact: "Contact Us",
    col1Faq: "Frequently Asked Questions (FAQ)",
    col1Terms: "Terms of Service",
    col1Privacy: "Privacy & Data Protection Policy",
    col1Ecommerce: "HireMind Global E-Commerce Recruitment Exchange Charter",
    col1Sitemap: "Portal Sitemap",
    col2Title: "For Employers (B2B)",
    col2PostJob: "Post a Job Campaign",
    col2ResumeSearch: "AI Talent & Resume Search",
    col2MarketReport: "2026 Salary & Hiring Report",
    col2AtsSystem: "Enterprise ATS Workspace",
    col2RegisterTenant: "Register Corporate Tenant",
    col2ContactB2b: "B2B Partnership Inquiry",
    col3Title: "Jobs by Location",
    col3AllRegions: "Explore all locations",
    col4Title: "Jobs by Industry",
    col4Accounting: "Accounting & Auditing",
    col4Banking: "Banking & Financial Services",
    col4Software: "Software & AI Cloud",
    col4ItSupport: "IT Support / Infrastructure",
    col4Construction: "Real Estate & Construction",
    col4Manufacturing: "FDI Manufacturing & Electronics",
    col4FindJobs: "Browse all jobs",
    col5AppTitle: "Mobile Applications",
    col5DownloadOn: "Download on the",
    col5CertifiedBy: "Certified & Accredited By",
    col5RegisteredMoit: "REGISTERED WITH MOIT",
    col5FollowUs: "Follow HireMind Global on",
    copyrightTitle: "Copyright © HireMind Global International Recruitment Technology JSC",
    copyrightAddress: "Level 20, E.Town Central, Dist. 4, HCMC • Lotte Center, 54 Lieu Giai, Ba Dinh Dist., Hanoi, Vietnam",
    bottomGrossNet: "🧮 Gross-Net Calculator",
    adsContent: {
      "AD-VIP-01": {
        title: "Hiring 50+ AI, Cloud Engineers & VP of Digital Transformation",
        subtitle: "Compensation up to $6,500/mo • ESOP Equity • Hybrid Work",
        cta: "🌐 Careers Website",
      },
      "AD-VIP-02": {
        title: "Global Semiconductor & R&D Engineering Hiring Campaign",
        subtitle: "100% Sponsored Training in Seoul • Market-Leading Package",
        cta: "🌐 Corporate Website",
      },
      "AD-VIP-03": {
        title: "Hiring Plant Directors & VSIP Automation Engineers",
        subtitle: "Japanese Executive Benefits • Shuttle Bus Hanoi - Bac Ninh - HCMC",
        cta: "🌐 Recruitment Portal",
      },
      "AD-VIP-04": {
        title: "Executive Leadership Roles in Digital Banking & 5-Star Resorts",
        subtitle: "Work in HCMC, Phu Quoc & ASEAN • VIP Relocation Package",
        cta: "🌐 Explore Roles",
      },
    },
  },
  ja: {
    leftWingTitle: "左バナー枠",
    rightWingTitle: "右バナー枠",
    createAdShort: "+ 広告作成",
    vipPricingBtn: "VIP料金表",
    vipMechTitle: "👑 VIP会員優先システム",
    vipMechSub: "VIPランク比較・バナー広告掲載",
    adminAdTitle: "📢 管理画面で広告を作成",
    adminAdSub: "バナー画像・Web・Facebookリンク設定",
    mobilePartnersTitle: "👑 DIAMOND & PLATINUM VIP 採用パートナー企業",
    footerShowcaseTitle: "フッター特別掲載：DIAMOND & PLATINUM VIP 企業採用キャンペーン",
    stickyCollapsedText: "👑 VIP広告フッター＆リアルタイム統計",
    stickyRunningText: "件のキャンペーン掲載中",
    stickyExpandBtn: "▲ フッター広告バナーを展開",
    stickyCollapseBtn: "▼ 折りたたむ",
    stickyPartnerDesc: "戦略的採用パートナー（公式WebサイトまたはFacebookページへ直接アクセス）：",
    onlineLabel: "オンライン",
    todayLabel: "本日",
    visitsUnit: "アクセス",
    fbFanpage: "📘 公式Facebook",
    websiteBtn: "🌐 公式Webサイト",
    topBarRegion: "地域:",
    topBarTraffic: "📊 アクセス統計",
    topBarVip: "VIP制度・広告",
    topBarLoc: "全63省・都市",
    topBarAds: "📢 広告掲載",
    footerHotlineSouth: "📞 南部サポートホットライン",
    footerHotlineNorth: "📞 北部・中部サポートホットライン",
    footerAiB2b: "🤖 24時間AI＆法人サポート窓口",
    footerAiB2bSub: "企業専用ATSテナント発行＆AI自動書類選考",
    footerChatBtn: "24時間チャット相談",
    footerPostJobBtn: "📢 求人を掲載する",
    col1Title: "HireMind Globalについて",
    col1About: "会社概要",
    col1Intech: "HireMind inTECH & AIクラウド",
    col1Contact: "お問い合わせ",
    col1Faq: "よくある質問 (FAQ)",
    col1Terms: "利用規約",
    col1Privacy: "プライバシーポリシー",
    col1Ecommerce: "電子商取引プラットフォーム運営規約",
    col1Sitemap: "サイトマップ",
    col2Title: "採用企業様向け (B2B)",
    col2PostJob: "求人広告を掲載",
    col2ResumeSearch: "AI人材・履歴書検索",
    col2MarketReport: "採用市場・給与レポート",
    col2AtsSystem: "エンタープライズATS管理",
    col2RegisterTenant: "法人テナント登録",
    col2ContactB2b: "法人お問い合わせ",
    col3Title: "勤務地から探す",
    col3AllRegions: "すべての地域を見る",
    col4Title: "業種・職種から探す",
    col4Accounting: "会計・経理・財務",
    col4Banking: "銀行・金融サービス",
    col4Software: "IT・ソフトウェア・AI",
    col4ItSupport: "社内SE・ヘルプデスク",
    col4Construction: "建設・不動産開発",
    col4Manufacturing: "日系・外資系製造業 (FDI)",
    col4FindJobs: "すべての求人を見る",
    col5AppTitle: "モバイルアプリ",
    col5DownloadOn: "ダウンロード",
    col5CertifiedBy: "公的認証・セキュリティ基準",
    col5RegisteredMoit: "商工省登録済プラットフォーム",
    col5FollowUs: "公式SNSをフォロー",
    copyrightTitle: "Copyright © HireMind Global International Recruitment Technology JSC",
    copyrightAddress: "ホーチミン市4区 E.Town Central 20階 • ハノイ市バーディン区 Lotte Center",
    bottomGrossNet: "🧮 給与計算ツール",
    adsContent: {
      "AD-VIP-01": {
        title: "AI・クラウドエンジニア＆DX部門長 50名以上採用",
        subtitle: "月給最大 $6,500 • ESOP株式報酬 • ハイブリッド勤務",
        cta: "🌐 採用サイトへ",
      },
      "AD-VIP-02": {
        title: "半導体＆R&Dエンジニア特別採用キャンペーン",
        subtitle: "ソウル研修100%会社負担 • 業界最高水準の待遇",
        cta: "🌐 企業サイトへ",
      },
      "AD-VIP-03": {
        title: "工場長＆VSIP自動化エンジニア募集（日系製造）",
        subtitle: "日本基準の福利厚生 • ハノイ・バクニン・HCMC送迎バス完備",
        cta: "🌐 求人詳細を見る",
      },
      "AD-VIP-04": {
        title: "デジタル銀行＆5つ星リゾート幹部候補採用",
        subtitle: "HCMC・フーコック・ASEAN勤務 • VIP赴任パッケージ",
        cta: "🌐 キャリア機会を見る",
      },
    },
  },
  ko: {
    leftWingTitle: "좌측 배너",
    rightWingTitle: "우측 배너",
    createAdShort: "+ 광고등록",
    vipPricingBtn: "VIP 안내",
    vipMechTitle: "👑 VIP 계정 우선순위 안내",
    vipMechSub: "VIP 등급 비교 및 배너 광고 신청",
    adminAdTitle: "📢 관리자 배너 광고 등록",
    adminAdSub: "배너 이미지, 웹사이트 및 페이스북 연결",
    mobilePartnersTitle: "👑 DIAMOND & PLATINUM VIP 채용 파트너",
    footerShowcaseTitle: "하단 푸터 DIAMOND & PLATINUM VIP 기업 채용 캠페인",
    stickyCollapsedText: "👑 고정형 VIP 광고 푸터 및 실시간 접속 통계",
    stickyRunningText: "개 캠페인 진행 중",
    stickyExpandBtn: "▲ 하단 광고 배너 펼치기",
    stickyCollapseBtn: "▼ 접기",
    stickyPartnerDesc: "전략적 채용 파트너 (기업 공식 웹사이트 또는 페이스북 페이지로 바로 이동):",
    onlineLabel: "접속중",
    todayLabel: "오늘",
    visitsUnit: "회",
    fbFanpage: "📘 공식 페이스북",
    websiteBtn: "🌐 공식 웹사이트",
    topBarRegion: "지역:",
    topBarTraffic: "📊 실시간 통계",
    topBarVip: "VIP 등급·광고",
    topBarLoc: "63개 성·시",
    topBarAds: "📢 광고 등록",
    footerHotlineSouth: "📞 남부 고객지원 핫라인",
    footerHotlineNorth: "📞 북부·중부 고객지원 핫라인",
    footerAiB2b: "🤖 24/7 AI 및 기업 B2B 상담센터",
    footerAiB2bSub: "기업용 ATS 테넌트 발급 및 AI 자동 서류 스크리닝",
    footerChatBtn: "24/7 고객센터 채팅",
    footerPostJobBtn: "📢 채용공고 등록",
    col1Title: "HireMind Global 소개",
    col1About: "회사 소개",
    col1Intech: "HireMind inTECH & AI 클라우드",
    col1Contact: "문의하기",
    col1Faq: "자주 묻는 질문 (FAQ)",
    col1Terms: "이용약관",
    col1Privacy: "개인정보 처리방침",
    col1Ecommerce: "전자상거래 채용 플랫폼 운영 규정",
    col1Sitemap: "사이트맵",
    col2Title: "기업 회원 서비스 (B2B)",
    col2PostJob: "채용공고 등록",
    col2ResumeSearch: "AI 인재 및 이력서 검색",
    col2MarketReport: "채용 시장 및 연봉 리포트",
    col2AtsSystem: "기업용 ATS 관리 시스템",
    col2RegisterTenant: "기업 테넌트 계정 신청",
    col2ContactB2b: "기업 제휴 문의",
    col3Title: "지역별 채용공고",
    col3AllRegions: "전체 지역 보기",
    col4Title: "직무·산업별 채용공고",
    col4Accounting: "회계·재무·감사",
    col4Banking: "은행·금융·핀테크",
    col4Software: "IT·소프트웨어·AI",
    col4ItSupport: "IT 기술지원·인프라",
    col4Construction: "건설·부동산 개발",
    col4Manufacturing: "외투기업 제조·반도체 (FDI)",
    col4FindJobs: "전체 채용공고 찾기",
    col5AppTitle: "모바일 앱 다운로드",
    col5DownloadOn: "다운로드:",
    col5CertifiedBy: "공식 인증 및 보안 표준",
    col5RegisteredMoit: "베트남 산업무역부 등록 완료",
    col5FollowUs: "HireMind Global 공식 채널",
    copyrightTitle: "Copyright © HireMind Global International Recruitment Technology JSC",
    copyrightAddress: "호치민시 4군 E.Town Central 20층 • 하노이 바딘군 롯데센터 54 Lieu Giai",
    bottomGrossNet: "🧮 급여 실수령액 계산기",
    adsContent: {
      "AD-VIP-01": {
        title: "2026 AI·클라우드 엔지니어 및 디지털 본부장 50명+ 채용",
        subtitle: "월 최대 $6,500 대우 • ESOP 스톡옵션 • 하이브리드 근무",
        cta: "🌐 채용 웹사이트",
      },
      "AD-VIP-02": {
        title: "한국계 반도체 & R&D 핵심 엔지니어 대규모 채용",
        subtitle: "서울 본사 연수 100% 지원 • 업계 최고 수준 연봉 및 성과급",
        cta: "🌐 그룹 공식 홈페이지",
      },
      "AD-VIP-03": {
        title: "VSIP 공장장 및 자동화 설비 엔지니어 채용",
        subtitle: "글로벌 수준 복리후생 • 하노이·박닌·호치민 통근버스 운영",
        cta: "🌐 채용 페이지 이동",
      },
      "AD-VIP-04": {
        title: "디지털 뱅킹 & 5성급 리조트 임원급 리더십 채용",
        subtitle: "호치민·푸꾸옥·동남아 근무 • VIP 주재원 패키지 제공",
        cta: "🌐 채용기회 확인",
      },
    },
  },
  zh: {
    leftWingTitle: "左侧广告栏",
    rightWingTitle: "右侧广告栏",
    createAdShort: "+ 创建广告",
    vipPricingBtn: "VIP等级",
    vipMechTitle: "👑 VIP账户优先机制",
    vipMechSub: "查看VIP权益对比与广告位预订",
    adminAdTitle: "📢 后台创建广告横幅",
    adminAdSub: "添加横幅图片、企业官网与Facebook链接",
    mobilePartnersTitle: "👑 钻石与白金 VIP 战略招聘合作伙伴",
    footerShowcaseTitle: "页脚钻石与白金 VIP 企业品牌招聘广告专区",
    stickyCollapsedText: "👑 底部固定 VIP 广告栏与实时访问统计",
    stickyRunningText: "个推广活动进行中",
    stickyExpandBtn: "▲ 展开底部广告横幅",
    stickyCollapseBtn: "▼ 收起",
    stickyPartnerDesc: "战略招聘合作伙伴（点击直接访问企业官方网站或 Facebook 主页）：",
    onlineLabel: "当前在线",
    todayLabel: "今日访问",
    visitsUnit: "次",
    fbFanpage: "📘 Facebook 主页",
    websiteBtn: "🌐 企业官网",
    topBarRegion: "区域:",
    topBarTraffic: "📊 流量统计",
    topBarVip: "VIP机制与广告",
    topBarLoc: "63省市与东盟",
    topBarAds: "📢 发布广告",
    footerHotlineSouth: "📞 南部客户支持热线",
    footerHotlineNorth: "📞 北部与中部支持热线",
    footerAiB2b: "🤖 24/7 AI 与企业 B2B 专线",
    footerAiB2bSub: "开通企业专属 ATS 租户与 AI 自动简历筛选",
    footerChatBtn: "24/7 在线客服",
    footerPostJobBtn: "📢 发布招聘职位",
    col1Title: "关于 HireMind Global",
    col1About: "公司简介",
    col1Intech: "HireMind inTECH 与 AI 云",
    col1Contact: "联系我们",
    col1Faq: "常见问题解答 (FAQ)",
    col1Terms: "服务使用协议",
    col1Privacy: "隐私与数据安全政策",
    col1Ecommerce: "HireMind Global 电子商务招聘平台运营章程",
    col1Sitemap: "网站地图 (Sitemap)",
    col2Title: "企业招聘服务 (B2B)",
    col2PostJob: "发布高管与核心职位",
    col2ResumeSearch: "AI 人才库与简历搜索",
    col2MarketReport: "2026 薪酬与招聘市场报告",
    col2AtsSystem: "企业级 ATS 管理系统",
    col2RegisterTenant: "注册企业专属租户",
    col2ContactB2b: "企业商务合作",
    col3Title: "按地区查找职位",
    col3AllRegions: "查看全部地区",
    col4Title: "按行业查找职位",
    col4Accounting: "财务・会计・审计",
    col4Banking: "银行・金融・投资",
    col4Software: "软件研发・人工智能・云",
    col4ItSupport: "IT运维・技术支持",
    col4Construction: "建筑工程・房地产",
    col4Manufacturing: "外资制造・电子半导体 (FDI)",
    col4FindJobs: "浏览全部职位",
    col5AppTitle: "移动客户端下载",
    col5DownloadOn: "下载平台",
    col5CertifiedBy: "权威认证与合规标准",
    col5RegisteredMoit: "越南工贸部备案认证",
    col5FollowUs: "关注 HireMind Global 官方账号",
    copyrightTitle: "Copyright © HireMind Global 国际招聘科技股份公司",
    copyrightAddress: "胡志明市第四郡 E.Town Central 20层 • 河内市巴亭郡乐天中心 54 Lieu Giai",
    bottomGrossNet: "🧮 税前税后薪资计算器",
    adsContent: {
      "AD-VIP-01": {
        title: "诚聘 50+ AI、云计算工程师及数字化转型总监",
        subtitle: "月薪高达 $6,500 • ESOP 股权激励 • 混合办公模式",
        cta: "🌐 访问招聘官网",
      },
      "AD-VIP-02": {
        title: "韩国半导体与研发中心核心工程师专项招聘",
        subtitle: "100% 资助首尔总部培训 • 行业领先薪酬福利",
        cta: "🌐 集团官方网站",
      },
      "AD-VIP-03": {
        title: "诚聘 VSIP 工厂厂长及自动化设备工程师",
        subtitle: "日企高管福利标准 • 河内-北宁-胡志明市班车接送",
        cta: "🌐 查看招聘专栏",
      },
      "AD-VIP-04": {
        title: "数字银行与五星级度假集团高管职位虚位以待",
        subtitle: "工作地点：胡志明市、富国岛及东盟 • VIP 外派安置礼遇",
        cta: "🌐 探索高管职位",
      },
    },
  },
  th: {
    leftWingTitle: "แบนเนอร์ซ้าย",
    rightWingTitle: "แบนเนอร์ขวา",
    createAdShort: "+ สร้างโฆษณา",
    vipPricingBtn: "แพ็กเกจ VIP",
    vipMechTitle: "👑 สิทธิพิเศษบัญชี VIP",
    vipMechSub: "ดูตารางระดับ VIP และจองแบนเนอร์โฆษณา",
    adminAdTitle: "📢 สร้างแบนเนอร์โฆษณา (Admin)",
    adminAdSub: "เพิ่มรูปแบนเนอร์ เว็บไซต์ และลิงก์ Facebook",
    mobilePartnersTitle: "👑 พันธมิตรองค์กรระดับ DIAMOND & PLATINUM VIP",
    footerShowcaseTitle: "แคมเปญโฆษณาองค์กรระดับ DIAMOND & PLATINUM VIP ที่ส่วนท้ายเว็บ",
    stickyCollapsedText: "👑 แถบโฆษณา VIP ด้านล่างและสถิติผู้เข้าชมสด",
    stickyRunningText: "แคมเปญที่กำลังแสดง",
    stickyExpandBtn: "▲ ขยายแบนเนอร์โฆษณาด้านล่าง",
    stickyCollapseBtn: "▼ ย่อแถบ",
    stickyPartnerDesc: "พันธมิตรองค์กรชั้นนำ (คลิกเพื่อเข้าสู่เว็บไซต์ทางการหรือเพจ Facebook ของบริษัท):",
    onlineLabel: "ออนไลน์",
    todayLabel: "วันนี้",
    visitsUnit: "ครั้ง",
    fbFanpage: "📘 เพจ Facebook",
    websiteBtn: "🌐 เว็บไซต์บริษัท",
    topBarRegion: "ภูมิภาค:",
    topBarTraffic: "📊 สถิติผู้เข้าชม",
    topBarVip: "ระดับ VIP & โฆษณา",
    topBarLoc: "63 จังหวัด & อาเซียน",
    topBarAds: "📢 ลงโฆษณา",
    footerHotlineSouth: "📞 สายด่วนภาคใต้",
    footerHotlineNorth: "📞 สายด่วนภาคเหนือและภาคกลาง",
    footerAiB2b: "🤖 ศูนย์บริการ AI และลูกค้าองค์กร 24/7",
    footerAiB2bSub: "เปิดระบบ ATS สำหรับองค์กรและคัดกรองเรซูเม่ด้วย AI",
    footerChatBtn: "แชทกับฝ่ายบริการ 24/7",
    footerPostJobBtn: "📢 ลงประกาศงาน",
    col1Title: "เกี่ยวกับ HireMind Global",
    col1About: "เกี่ยวกับเรา",
    col1Intech: "HireMind inTECH & AI Cloud",
    col1Contact: "ติดต่อเรา",
    col1Faq: "คำถามที่พบบ่อย (FAQ)",
    col1Terms: "ข้อกำหนดการใช้งาน",
    col1Privacy: "นโยบายความเป็นส่วนตัว",
    col1Ecommerce: "ระเบียบการดำเนินงานแพลตฟอร์มจัดหางานอิเล็กทรอนิกส์",
    col1Sitemap: "แผนผังเว็บไซต์ (Sitemap)",
    col2Title: "สำหรับองค์กรและผู้ประกอบการ",
    col2PostJob: "ลงประกาศรับสมัครงาน",
    col2ResumeSearch: "ค้นหาเรซูเม่และผู้เชี่ยวชาญ",
    col2MarketReport: "รายงานตลาดแรงงานและฐานเงินเดือน",
    col2AtsSystem: "ระบบบริหารงานบุคคล ATS",
    col2RegisterTenant: "ลงทะเบียนบัญชีองค์กร",
    col2ContactB2b: "ติดต่อฝ่ายขาย B2B",
    col3Title: "หางานตามพื้นที่",
    col3AllRegions: "ดูพื้นที่ทั้งหมด",
    col4Title: "หางานตามสายอาชีพ",
    col4Accounting: "บัญชีและการเงิน",
    col4Banking: "ธนาคารและการลงทุน",
    col4Software: "ซอฟต์แวร์และ AI Cloud",
    col4ItSupport: "IT Support / โครงสร้างพื้นฐาน",
    col4Construction: "อสังหาริมทรัพย์และก่อสร้าง",
    col4Manufacturing: "อุตสาหกรรมการผลิต FDI",
    col4FindJobs: "ค้นหางานทั้งหมด",
    col5AppTitle: "แอปพลิเคชันมือถือ",
    col5DownloadOn: "ดาวน์โหลดได้ที่",
    col5CertifiedBy: "ได้รับการรับรองโดย",
    col5RegisteredMoit: "จดทะเบียนกับกระทรวงอุตสาหกรรมฯ",
    col5FollowUs: "ติดตาม HireMind Global บน",
    copyrightTitle: "Copyright © HireMind Global International Recruitment Technology JSC",
    copyrightAddress: "ชั้น 20 อาคาร E.Town Central นครโฮจิมินห์ • อาคาร Lotte Center กรุงฮานอย เวียดนาม",
    bottomGrossNet: "🧮 คำนวณเงินเดือน Gross-Net",
    adsContent: {
      "AD-VIP-01": {
        title: "รับสมัครวิศวกร AI, Cloud และผู้อำนวยการฝ่ายดิจิทัล 50+ อัตรา",
        subtitle: "เงินเดือนสูงสุด $6,500 • หุ้น ESOP • ทำงานแบบไฮบริด",
        cta: "🌐 เว็บไซต์รับสมัครงาน",
      },
      "AD-VIP-02": {
        title: "แคมเปญรับสมัครวิศวกรเซมิคอนดักเตอร์และ R&D เกาหลีใต้",
        subtitle: "ทุนฝึกอบรมที่กรุงโซล 100% • สวัสดิการและโบนัสระดับท็อป",
        cta: "🌐 เว็บไซต์องค์กร",
      },
      "AD-VIP-03": {
        title: "รับสมัครผู้จัดการโรงงานและวิศวกรระบบอัตโนมัติ VSIP",
        subtitle: "สวัสดิการมาตรฐานญี่ปุ่น • รถรับส่ง ฮานอย - บั๊กนิญ - โฮจิมินห์",
        cta: "🌐 ดูตำแหน่งงาน",
      },
      "AD-VIP-04": {
        title: "โอกาสร่วมงานระดับผู้บริหาร ธนาคารดิจิทัลและรีสอร์ท 5 ดาว",
        subtitle: "ปฏิบัติงานที่โฮจิมินห์ ฟู้โกว๊ก และอาเซียน • แพ็กเกจย้ายถิ่นฐาน VIP",
        cta: "🌐 สำรวจตำแหน่งงาน",
      },
    },
  },
  lo: {
    leftWingTitle: "ປ້າຍໂຄສະນາຊ້າຍ",
    rightWingTitle: "ປ້າຍໂຄສະນາຂວາ",
    createAdShort: "+ ສ້າງໂຄສະນາ",
    vipPricingBtn: "ລະດັບ VIP",
    vipMechTitle: "👑 ກົນໄກບັນຊີ VIP ບູລິມະສິດ",
    vipMechSub: "ເບິ່ງຕາຕະລາງລະດັບ VIP ແລະ ຈອງປ້າຍໂຄສະນາ",
    adminAdTitle: "📢 ສ້າງປ້າຍໂຄສະນາ (Admin)",
    adminAdSub: "ເພີ່ມຮູບພາບ, ເວັບໄຊ ແລະ ລິ້ງ Facebook",
    mobilePartnersTitle: "👑 ຄູ່ຮ່ວມງານຮັບສະໝັກລະດັບ DIAMOND & PLATINUM VIP",
    footerShowcaseTitle: "ແຄມເປນໂຄສະນາວິສາຫະກິດລະດັບ DIAMOND & PLATINUM VIP ຢູ່ສ່ວນທ້າຍເວັບ",
    stickyCollapsedText: "👑 ແຖບໂຄສະນາ VIP ທ້າຍໜ້າ ແລະ ສະຖິຕິອອນລາຍສົດ",
    stickyRunningText: "ແຄມເປນກຳລັງແລ່ນ",
    stickyExpandBtn: "▲ ຂະຫຍາຍປ້າຍໂຄສະນາທ້າຍໜ້າ",
    stickyCollapseBtn: "▼ ຫຍໍ້ລົງ",
    stickyPartnerDesc: "ຄູ່ຮ່ວມງານຍຸດທະສາດ (ຄລິກໂດຍກົງເພື່ອເຂົ້າເບິ່ງເວັບໄຊ ຫຼື ເຟສບຸກທາງການຂອງບໍລິສັດ):",
    onlineLabel: "ອອນລາຍ",
    todayLabel: "ມື້ນີ້",
    visitsUnit: "ຄັ້ງ",
    fbFanpage: "📘 ເພຈ Facebook",
    websiteBtn: "🌐 ເວັບໄຊທາງການ",
    topBarRegion: "ພາກພື້ນ:",
    topBarTraffic: "📊 ສະຖິຕິເຂົ້າຊົມ",
    topBarVip: "ລະດັບ VIP & ໂຄສະນາ",
    topBarLoc: "63 ແຂວງ & ອາຊຽນ",
    topBarAds: "📢 ສ້າງໂຄສະນາ",
    footerHotlineSouth: "📞 ສາຍດ່ວນພາກໃຕ້",
    footerHotlineNorth: "📞 ສາຍດ່ວນພາກເໜືອ ແລະ ພາກກາງ",
    footerAiB2b: "🤖 ສູນບໍລິການ AI ແລະ ທີ່ປຶກສາ B2B 24/7",
    footerAiB2bSub: "ສະໜອງລະບົບ ATS ວິສາຫະກິດ ແລະ ຄັດกรองຊີວະປະຫວັດດ້ວຍ AI",
    footerChatBtn: "ແຊັດບໍລິການລູກຄ້າ 24/7",
    footerPostJobBtn: "📢 ປະກາດຮັບສະໝັກງານ",
    col1Title: "ກ່ຽວກັບ HireMind Global",
    col1About: "ກ່ຽວກັບພວກເຮົາ",
    col1Intech: "HireMind inTECH & AI Cloud",
    col1Contact: "ຕິດຕໍ່ພວກເຮົາ",
    col1Faq: "ຄຳຖາມທີ່ພົບເລື້ອຍ (FAQ)",
    col1Terms: "ຂໍ້ຕົກລົງການນຳໃຊ້",
    col1Privacy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
    col1Ecommerce: "ກົດລະບຽບການດຳເນີນງານເວທີການຄ້າອີເລັກໂທຣນິກ HireMind Global",
    col1Sitemap: "ແຜນຜັງເວັບໄຊ (Sitemap)",
    col2Title: "ສຳລັບຜູ້ໃຊ້ແຮງງານ (B2B)",
    col2PostJob: "ປະກາດຮັບສະໝັກງານ",
    col2ResumeSearch: "ຄົ້ນຫາຊີວະປະຫວັດຜູ້ສະໝັກ",
    col2MarketReport: "ລາຍງານຕະຫຼາດແຮງງານ ແລະ ເງິນເດືອນ",
    col2AtsSystem: "ລະບົບຄຸ້ມຄອງ ATS ວິສາຫະກິດ",
    col2RegisterTenant: "ລົງທະບຽນບັນຊີວິສາຫະກິດ",
    col2ContactB2b: "ຕິດຕໍ່ຝ່າຍບໍລິການ B2B",
    col3Title: "ວຽກເຮັດງານທຳຕາມພາກພື້ນ",
    col3AllRegions: "ເບິ່ງທຸກພາກພື້ນ",
    col4Title: "ວຽກເຮັດງານທຳຕາມຂະແໜງການ",
    col4Accounting: "ບັນຊີ ແລະ ການກວດສອບ",
    col4Banking: "ທະນາຄານ ແລະ ການເງິນ",
    col4Software: "ຊອບແວ ແລະ AI Cloud",
    col4ItSupport: "ໄອທີຊັບພອດ / Help Desk",
    col4Construction: "ກໍ່ສ້າງ ແລະ ອະສັງຫາລິມະຊັບ",
    col4Manufacturing: "ການຜະລິດອຸດສາຫະກຳ FDI",
    col4FindJobs: "ຄົ້ນຫາວຽກທັງໝົດ",
    col5AppTitle: "ແອັບພລິເຄຊັນມືຖື",
    col5DownloadOn: "ດາວໂຫຼດໄດ້ທີ່",
    col5CertifiedBy: "ຢັ້ງຢືນມາດຕະຖານໂດຍ",
    col5RegisteredMoit: "ຈົດທະບຽນກັບກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ",
    col5FollowUs: "ຕິດຕາມ HireMind Global ຜ່ານທາງ",
    copyrightTitle: "Copyright © ບໍລິສັດ ຫຸ້ນສ່ວນ ເຕັກໂນໂລຊີ ການຈັດຫາງານສາກົນ HireMind Global",
    copyrightAddress: "ຊັ້ນ 20, ອາຄານ E.Town Central, ນະຄອນໂຮ່ຈີມິນ • ອາຄານ Lotte Center, ນະຄອນຫຼວງຮ່າໂນ້ຍ",
    bottomGrossNet: "🧮 ເຄື່ອງມືຄິດໄລ່ເງິນເດືອນ Gross-Net",
    adsContent: {
      "AD-VIP-01": {
        title: "ຮັບສະໝັກ 50+ ວິສະວະກອນ AI, Cloud ແລະ ຜູ້ອຳນວຍການຝ່າຍດິຈິຕອນ",
        subtitle: "ເງິນເດືອນສູງສຸດ $6,500/ເດືອນ • ຫຸ້ນ ESOP • ເຮັດວຽກແບບ Hybrid",
        cta: "🌐 ເວັບໄຊຮັບສະໝັກງານ",
      },
      "AD-VIP-02": {
        title: "ແຄມເປນຮັບສະໝັກວິສະວະກອນ Semiconductor ແລະ R&D ເກົາຫຼີ",
        subtitle: "ສະໜັບສະໜູນທຶນຝຶກອົບຮົມຢູ່ໂຊລ 100% • ເງິນເດືອນ ແລະ ໂບນັດສູງ",
        cta: "🌐 ເວັບໄຊກຸ່ມບໍລິສັດ",
      },
      "AD-VIP-03": {
        title: "ຮັບສະໝັກຜູ້ຈັດການໂຮງງານ ແລະ ວິສະວະກອນອັດຕະໂນມັດ VSIP",
        subtitle: "ສະຫວັດດີການມາດຕະຖານຍີ່ປຸ່ນ • ລົດຮັບສົ່ງ ຮ່າໂນ້ຍ - ບັກນິງ - ໂຮ່ຈີມິນ",
        cta: "🌐 ໜ້າຮັບສະໝັກງານ",
      },
      "AD-VIP-04": {
        title: "ໂອກາດຜູ້ບໍລິຫານລະດັບສູງ ທະນາຄານດິຈິຕອນ ແລະ ລີສອດ 5 ດາວ",
        subtitle: "ເຮັດວຽກຢູ່ ໂຮ່ຈີມິນ, ຟູ໋ກວກ ແລະ ອາຊຽນ • ແພັກເກັດຍ້າຍບ່ອນຢູ່ VIP",
        cta: "🌐 ສຳຫຼວດຕຳແໜ່ງງານ",
      },
    },
  },
  km: {
    leftWingTitle: "ផ្ទាំងពាណិជ្ជកម្មឆ្វេង",
    rightWingTitle: "ផ្ទាំងពាណិជ្ជកម្មស្តាំ",
    createAdShort: "+ បង្កើតពាណិជ្ជកម្ម",
    vipPricingBtn: "តារាង VIP",
    vipMechTitle: "👑 យន្តការគណនីអាទិភាព VIP",
    vipMechSub: "មើលតារាងកម្រិត VIP និងកក់ផ្ទាំងពាណិជ្ជកម្ម",
    adminAdTitle: "📢 បង្កើតផ្ទាំងពាណិជ្ជកម្ម (Admin)",
    adminAdSub: "បន្ថែមរូបភាព គេហទំព័រ និងតំណភ្ជាប់ Facebook",
    mobilePartnersTitle: "👑 ដៃគូជ្រើសរើសបុគ្គលិក DIAMOND & PLATINUM VIP",
    footerShowcaseTitle: "យុទ្ធនាការពាណិជ្ជកម្មសហគ្រាស DIAMOND & PLATINUM VIP នៅផ្នែកខាងក្រោម",
    stickyCollapsedText: "👑 របារពាណិជ្ជកម្ម VIP ខាងក្រោម និងស្ថិតិផ្ទាល់",
    stickyRunningText: "យុទ្ធនាការកំពុងដំណើរការ",
    stickyExpandBtn: "▲ ពង្រីកផ្ទាំងពាណិជ្ជកម្មខាងក្រោម",
    stickyCollapseBtn: "▼ បង្រួម",
    stickyPartnerDesc: "ដៃគូជ្រើសរើសបុគ្គលិកយុទ្ធសាស្ត្រ (ចុចផ្ទាល់ទៅកាន់គេហទំព័រផ្លូវការ ឬទំព័រ Facebook របស់ក្រុមហ៊ុន)៖",
    onlineLabel: "អនឡាញ",
    todayLabel: "ថ្ងៃនេះ",
    visitsUnit: "ដង",
    fbFanpage: "📘 ទំព័រ Facebook",
    websiteBtn: "🌐 គេហទំព័រផ្លូវការ",
    topBarRegion: "តំបន់៖",
    topBarTraffic: "📊 ស្ថិតិចូលមើល",
    topBarVip: "កម្រិត VIP & ពាណិជ្ជកម្ម",
    topBarLoc: "63 ខេត្ត/ក្រុង & អាស៊ាន",
    topBarAds: "📢 បង្កើតពាណិជ្ជកម្ម",
    footerHotlineSouth: "📞 ខ្សែទូរស័ព្ទជំនួយភាគខាងត្បូង",
    footerHotlineNorth: "📞 ខ្សែទូរស័ព្ទជំនួយភាគខាងជើង និងកណ្តាល",
    footerAiB2b: "🤖 មជ្ឈមណ្ឌល AI និងប្រឹក្សាយោបល់ B2B 24/7",
    footerAiB2bSub: "ផ្តល់ប្រព័ន្ធ ATS សហគ្រាស និងคัดกรองប្រវត្តិរូបស្វ័យប្រវត្តិដោយ AI",
    footerChatBtn: "ជជែកជាមួយផ្នែកบริการ 24/7",
    footerPostJobBtn: "📢 ប្រកាសជ្រើសរើសបុគ្គលិក",
    col1Title: "អំពី HireMind Global",
    col1About: "អំពី HireMind Global",
    col1Intech: "អំពី HireMind inTECH & AI Cloud",
    col1Contact: "ទំនាក់ទំនងយើងខ្ញុំ",
    col1Faq: "សំណួរដែលសួរញឹកញាប់ (FAQ)",
    col1Terms: "លក្ខខណ្ឌនៃការប្រើប្រាស់",
    col1Privacy: "គោលការណ៍ឯកជនភាព និងទិន្នន័យ",
    col1Ecommerce: "បទប្បញ្ញត្តិប្រតិបត្តិការវេទិកាពាណិជ្ជកម្មអេឡិចត្រូនិក HireMind Global",
    col1Sitemap: "ផែនទីគេហទំព័រ (Sitemap)",
    col2Title: "សម្រាប់និយោជក (B2B)",
    col2PostJob: "ប្រកាសជ្រើសរើសបុគ្គលិក",
    col2ResumeSearch: "ស្វែងរកប្រវត្តិរូបបេក្ខជន",
    col2MarketReport: "របាយការណ៍ទីផ្សារការងារ និងប្រាក់បៀវត្សរ៍",
    col2AtsSystem: "ប្រព័ន្ធគ្រប់គ្រង ATS សហគ្រាស",
    col2RegisterTenant: "ចុះឈ្មោះគណនីសហគ្រាស (Tenant)",
    col2ContactB2b: "ទំនាក់ទំនងផ្នែក B2B",
    col3Title: "ការងារតាមតំបន់",
    col3AllRegions: "មើលតំបន់ទាំងអស់",
    col4Title: "ការងារតាមវិស័យ",
    col4Accounting: "គណនេយ្យ និងសវនកម្ម",
    col4Banking: "ធនាគារ និងហិរញ្ញវត្ថុ",
    col4Software: "ซอฟต์แวร์ និង AI Cloud",
    col4ItSupport: "ជំនួយបច្ចេកទេស IT / Help Desk",
    col4Construction: "សំណង់ និងអចលនទ្រព្យ",
    col4Manufacturing: "ផលិតកម្មឧស្សាហកម្ម FDI",
    col4FindJobs: "ស្វែងរកការងារទាំងអស់",
    col5AppTitle: "កម្មវិធីទូរស័ព្ទ (Mobile App)",
    col5DownloadOn: "ទាញយកនៅលើ",
    col5CertifiedBy: "ទទួលស្គាល់ដោយ",
    col5RegisteredMoit: "ចុះបញ្ជីជាមួយក្រសួងឧស្សាហកម្ម និងពាណិជ្ជកម្ម",
    col5FollowUs: "តាមដាន HireMind Global នៅលើ",
    copyrightTitle: "Copyright © ក្រុមហ៊ុនបច្ចេកវិទ្យាជ្រើសរើសបុគ្គលិកអន្តរជាតិ HireMind Global",
    copyrightAddress: "ជាន់ទី 20 អគារ E.Town Central ទីក្រុងហូជីមិញ • អគារ Lotte Center ទីក្រុងហាណូយ",
    bottomGrossNet: "🧮 គណនាប្រាក់ខែ Gross-Net",
    adsContent: {
      "AD-VIP-01": {
        title: "ជ្រើសរើសវិស្វករ AI, Cloud និងនាយកផ្នែកឌីជីថល 50+ នាក់",
        subtitle: "ប្រាក់ខែរហូតដល់ $6,500/ខែ • ភាគហ៊ុន ESOP • ធ្វើការបែប Hybrid",
        cta: "🌐 គេហទំព័រជ្រើសរើសបុគ្គលិក",
      },
      "AD-VIP-02": {
        title: "យុទ្ធនាការជ្រើសរើសវិស្វករ Semiconductor និង R&D កូរ៉េ",
        subtitle: "ឧបត្ថម្ភការបណ្តុះបណ្តាលនៅសេអ៊ូល 100% • ប្រាក់ខែ និងអត្ថប្រโยជន៍ខ្ពស់",
        cta: "🌐 គេហទំព័រសម្ព័ន្ធក្រុមហ៊ុន",
      },
      "AD-VIP-03": {
        title: "ជ្រើសរើសប្រធានរោងចក្រ និងវិស្វករស្វ័យប្រវត្តិកម្ម VSIP",
        subtitle: "អត្ថប្រយោជន៍ស្តង់ដារជប៉ុន • រថយន្តដឹកជញ្ជូន ហាណូយ - បាក់និញ - ហូជីមិញ",
        cta: "🌐 ទំព័រជ្រើសរើសបុគ្គលិក",
      },
      "AD-VIP-04": {
        title: "ឱកាសថ្នាក់ដឹកនាំជាន់ខ្ពស់ ធនាគារឌីជីថល និងរមណីយដ្ឋានផ្កាយ 5",
        subtitle: "ធ្វើការនៅហូជីមិញ ភូកុក និងអាស៊ាន • កញ្ចប់ផ្លាស់ប្តូរទីលំនៅ VIP",
        cta: "🌐 ស្វែងយល់ពីឱកាសការងារ",
      },
    },
  },
};

const HERO_SPOTLIGHT_I18N = {
  vi: {
    badge: "🔥 HERO SPOTLIGHT • 4 BANNER TRUNG TÂM DƯỚI HERO SLIDER",
    title: "Chiến dịch Tuyển dụng Tiêu điểm (Vị trí Vàng Dưới Hero Slider — CTR Cao Gấp 2.8x)",
    sub: "Hiển thị 100% trên mọi màn hình Desktop, Laptop & Mobile • Nhấp trực tiếp mở Website hoặc Fanpage Doanh nghiệp",
    slotPrefix: "Ô Hero",
    bookBtn: "📢 Đặt Banner Dưới Hero Slider",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — Tuyển Giám đốc Chuyển đổi Số & Kỹ sư AI Toàn cầu",
        subtitle: "Gói thu nhập tới $8,000/tháng • Thưởng cổ phần ESOP • Làm việc tại Hà Nội & TP.HCM",
        cta: "🌐 Ứng tuyển Fast-Track",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor Hàn Quốc — Tuyển 30 Kỹ sư Thiết kế Vi mạch & R&D",
        subtitle: "Tài trợ 100% khóa đào tạo tại Seoul • Phụ cấp ngoại ngữ TOPIK / IELTS hấp dẫn",
        cta: "🌐 Khám phá R&D Center",
      },
      "AD-VIP-07": {
        title: "Sakura Precision Nhật Bản — Tuyển Giám đốc Nhà máy & Kỹ sư Cầu nối BrSE N2+",
        subtitle: "Thưởng 4 tháng lương/năm • Bảo hiểm sức khỏe Quốc tế cho cả gia đình",
        cta: "🌐 Xem Đãi ngộ Nhật Bản",
      },
      "AD-VIP-08": {
        title: "Angkor Digital Bank & Siam Retail — Tuyển Giám đốc Khối Fintech & Chuỗi Cung Ứng",
        subtitle: "Làm việc tại TP.HCM, Bangkok & Phnom Penh • Gói Relocation Quốc tế toàn diện",
        cta: "🌐 Ứng tuyển Khối ASEAN",
      },
    },
  },
  en: {
    badge: "🔥 HERO SPOTLIGHT • 4 BILLBOARD BANNERS BELOW HERO SLIDER",
    title: "Featured Enterprise Campaigns (Prime Above-the-Fold Placement — 2.8x Higher CTR)",
    sub: "100% visibility across Desktop, Laptop & Mobile • Direct links to Corporate Website & Official Facebook",
    slotPrefix: "Hero Slot",
    bookBtn: "📢 Book Under-Hero Banner",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — Hiring VP of Digital Transformation & Global AI Engineers",
        subtitle: "Compensation up to $8,000/mo • ESOP Stock Grant • Hybrid in Hanoi & HCMC",
        cta: "🌐 Fast-Track Apply",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor Korea — Hiring 30 IC Design & Semiconductor R&D Engineers",
        subtitle: "100% Sponsored Training in Seoul • Top TOPIK / IELTS Language Allowances",
        cta: "🌐 Explore R&D Center",
      },
      "AD-VIP-07": {
        title: "Sakura Precision Japan — Hiring Plant Director & Senior Bridge SE (JLPT N2+)",
        subtitle: "4-Month Annual Bonus • Comprehensive International Family Health Insurance",
        cta: "🌐 View Japan Perks",
      },
      "AD-VIP-08": {
        title: "Angkor Digital Bank & Siam Retail — Hiring VP of Fintech & Regional Supply Chain",
        subtitle: "Based in HCMC, Bangkok & Phnom Penh • Full Executive Relocation Package",
        cta: "🌐 Apply ASEAN Roles",
      },
    },
  },
  ja: {
    badge: "🔥 HERO SPOTLIGHT • ヒーロースライダー直下4枠プレミアム広告",
    title: "注目グローバル企業 特別採用キャンペーン（CTR 2.8倍の最優先枠）",
    sub: "PC・ノートPC・スマホ全画面で100%表示 • 公式Webサイト・Facebookページへ直接アクセス",
    slotPrefix: "ヒーロー枠",
    bookBtn: "📢 ヒーロー直下枠を予約",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — DX推進本部長＆グローバルAIエンジニア採用",
        subtitle: "月給最大 $8,000 • ESOP株式報酬 • ハノイ＆ホーチミン勤務",
        cta: "🌐 優先選考に応募",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor 韓国 — 半導体回路設計＆R&Dエンジニア30名募集",
        subtitle: "ソウル本社研修100%負担 • TOPIK / IELTS語学手当充実",
        cta: "🌐 R&Dセンター詳細",
      },
      "AD-VIP-07": {
        title: "Sakura Precision 日系製造 — 工場長＆上級ブリッジSE（JLPT N2+）募集",
        subtitle: "賞与年4ヶ月分 • 家族全員対象の国際医療保険完備",
        cta: "🌐 日系待遇を見る",
      },
      "AD-VIP-08": {
        title: "Angkorデジタル銀行＆Siamリテール — フィンテック＆SCM部門長募集",
        subtitle: "HCMC・バンコク・プノンペン勤務 • 役員向け海外赴任パッケージ完備",
        cta: "🌐 ASEAN求人を見る",
      },
    },
  },
  ko: {
    badge: "🔥 HERO SPOTLIGHT • 히어로 슬라이더 하단 4대 프리미엄 배너",
    title: "주목받는 글로벌 기업 핵심 채용 캠페인 (히어로 하단 골든존 — 클릭률 2.8배)",
    sub: "데스크톱·노트북·모바일 100% 노출 보장 • 기업 공식 홈페이지 및 페이스북 바로가기 지원",
    slotPrefix: "히어로 슬롯",
    bookBtn: "📢 히어로 하단 배너 신청",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — 디지털 전환 본부장 및 글로벌 AI 엔지니어 채용",
        subtitle: "월 최대 $8,000 대우 • ESOP 스톡옵션 • 하노이 & 호치민 근무",
        cta: "🌐 패스트트랙 지원",
      },
      "AD-VIP-06": {
        title: "한울 반도체(Hanul Semiconductor) — 반도체 설계 및 R&D 엔지니어 30명 채용",
        subtitle: "서울 본사 연수 100% 지원 • TOPIK / IELTS 어학 수당 최고 대우",
        cta: "🌐 R&D 센터 보기",
      },
      "AD-VIP-07": {
        title: "사쿠라 정밀(Sakura Precision) — 공장장 및 시니어 브릿지 SE (JLPT N2+) 채용",
        subtitle: "연간 상여금 4개월분 • 전 가족 글로벌 프리미엄 의료보험 지원",
        cta: "🌐 복리후생 확인",
      },
      "AD-VIP-08": {
        title: "앙코르 디지털 뱅크 & 시암 리테일 — 핀테크 및 공급망(SCM) 총괄 임원 채용",
        subtitle: "호치민·방콕·프놈펜 근무 • 글로벌 주재원 패키지 완벽 지원",
        cta: "🌐 아세안 채용 지원",
      },
    },
  },
  zh: {
    badge: "🔥 HERO SPOTLIGHT • 首屏横幅下方 4 大黄金展位",
    title: "焦点名企高管与核心技术专场招聘（首屏黄金视觉区 — 点击率提升 2.8 倍）",
    sub: "台式机、笔记本与手机端 100% 完整展示 • 一键直达企业招聘官网与 Facebook 主页",
    slotPrefix: "首屏展位",
    bookBtn: "📢 预订首屏下方广告位",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — 诚聘数字化转型副总裁与全球 AI 工程师",
        subtitle: "月薪高达 $8,000 • ESOP 股权激励 • 河内与胡志明市混合办公",
        cta: "🌐 绿色通道申请",
      },
      "AD-VIP-06": {
        title: "韩国 Hanul 半导体集团 — 诚聘 30 名芯片设计与研发核心工程师",
        subtitle: "100% 资助首尔总部研修 • 优厚 TOPIK / IELTS 语言津贴",
        cta: "🌐 探索研发中心",
      },
      "AD-VIP-07": {
        title: "日本 Sakura 精密制造 — 诚聘工厂厂长与高级对日桥梁工程师 (N2+)",
        subtitle: "年终奖 4 个月薪资 • 覆盖全家的国际高端医疗保险",
        cta: "🌐 查看日企福利",
      },
      "AD-VIP-08": {
        title: "Angkor 数字银行与 Siam 零售集团 — 诚聘金融科技与供应链总监",
        subtitle: "工作地点：胡志明市、曼谷、金边 • 全套高管跨国安置津贴",
        cta: "🌐 申请东盟职位",
      },
    },
  },
  th: {
    badge: "🔥 HERO SPOTLIGHT • 4 แบนเนอร์เด่นใต้สไลเดอร์หลัก",
    title: "แคมเปญรับสมัครงานองค์กรชั้นนำ (พื้นที่ทองคำใต้ Hero Slider — อัตราคลิกสูงกว่า 2.8 เท่า)",
    sub: "แสดงผล 100% บนทุกหน้าจอ คอมพิวเตอร์ โน้ตบุ๊ก และมือถือ • ลิงก์ตรงสู่เว็บไซต์และเพจ Facebook",
    slotPrefix: "สล็อต Hero",
    bookBtn: "📢 จองแบนเนอร์ใต้ Hero Slider",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — รับสมัครผู้อำนวยการฝ่ายดิจิทัลและวิศวกร AI ระดับโลก",
        subtitle: "รายได้สูงสุด $8,000/เดือน • หุ้น ESOP • ปฏิบัติงานที่ฮานอยและโฮจิมินห์",
        cta: "🌐 สมัครด่วน Fast-Track",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor เกาหลีใต้ — รับสมัครวิศวกรออกแบบชิปและ R&D 30 อัตรา",
        subtitle: "ทุนฝึกอบรมที่กรุงโซล 100% • เบี้ยเลี้ยงภาษา TOPIK / IELTS สูง",
        cta: "🌐 ดูศูนย์วิจัย R&D",
      },
      "AD-VIP-07": {
        title: "Sakura Precision ญี่ปุ่น — รับสมัครผู้จัดการโรงงานและวิศวกร BrSE (JLPT N2+)",
        subtitle: "โบนัส 4 เดือน/ปี • ประกันสุขภาพระดับสากลสำหรับครอบครัว",
        cta: "🌐 ดูสวัสดิการญี่ปุ่น",
      },
      "AD-VIP-08": {
        title: "Angkor Digital Bank & Siam Retail — รับสมัครผู้อำนวยการ Fintech และซัพพลายเชน",
        subtitle: "ทำงานที่โฮจิมินห์ กรุงเทพฯ และพนมเปญ • แพ็กเกจย้ายถิ่นฐานผู้บริหาร",
        cta: "🌐 สมัครงานอาเซียน",
      },
    },
  },
  lo: {
    badge: "🔥 HERO SPOTLIGHT • 4 ປ້າຍໂຄສະນາຈຸດເດັ່ນກ້ອງ Hero Slider",
    title: "ແຄມເປນຮັບສະໝັກງານບໍລິສັດຊັ້ນນຳ (ຕຳແໜ່ງຄຳກ້ອງ Hero Slider — ອັດຕາຄລິກສູງກວ່າ 2.8 ເທົ່າ)",
    sub: "ສະແດງຜົນ 100% ທຸກໜ້າຈໍ ຄອມພິວເຕີ ແລະ ມືຖື • ຄລິກເຂົ້າເວັບໄຊ ແລະ ເຟສບຸກບໍລິສັດໂດຍກົງ",
    slotPrefix: "ຊ່ອງ Hero",
    bookBtn: "📢 ຈອງປ້າຍໂຄສະນາກ້ອງ Hero",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — ຮັບສະໝັກຜູ້ອຳນວຍການຫັນປ່ຽນດິຈິຕອນ ແລະ ວິສະວະກອນ AI",
        subtitle: "ລາຍຮັບສູງສຸດ $8,000/ເດືອນ • ຫຸ້ນ ESOP • ເຮັດວຽກຢູ່ຮ່າໂນ້ຍ ແລະ ໂຮ່ຈີມິນ",
        cta: "🌐 ສະໝັກດ່ວນ Fast-Track",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor ເກົາຫຼີ — ຮັບສະໝັກ 30 ວິສະວະກອນອອກແບບຊິບ ແລະ R&D",
        subtitle: "ທຶນຝຶກອົບຮົມຢູ່ໂຊລ 100% • ເງິນອຸດໜູນພາສາ TOPIK / IELTS ສູງ",
        cta: "🌐 ສຳຫຼວດສູນ R&D",
      },
      "AD-VIP-07": {
        title: "Sakura Precision ຍີ່ປຸ່ນ — ຮັບສະໝັກຜູ້ຈັດການໂຮງງານ ແລະ ວິສະວະກອນ BrSE (N2+)",
        subtitle: "ໂບນັດ 4 ເດືອນ/ປີ • ປະກັນສຸຂະພາບສາກົນສຳລັບຄອບຄົວ",
        cta: "🌐 ເບິ່ງສະຫວັດດີການຍີ່ປຸ່ນ",
      },
      "AD-VIP-08": {
        title: "Angkor Digital Bank & Siam Retail — ຮັບສະໝັກຜູ້ອຳນວຍການ Fintech ແລະ ລະບົບສະໜອງ",
        subtitle: "ເຮັດວຽກຢູ່ ໂຮ່ຈີມິນ, ບາງກອກ ແລະ ພະນົມເປັນ • ແພັກເກັດຜູ້ບໍລິຫານອາຊຽນ",
        cta: "🌐 ສະໝັກວຽກອາຊຽນ",
      },
    },
  },
  km: {
    badge: "🔥 HERO SPOTLIGHT • ផ្ទាំងពាណិជ្ជកម្មពិសេសទាំង 4 នៅក្រោម Hero Slider",
    title: "យុទ្ធនាការជ្រើសរើសបុគ្គលិកក្រុមហ៊ុនឈានមុខ (ទីតាំងមាសក្រោម Hero Slider — CTR ខ្ពស់ជាង 2.8 ដង)",
    sub: "បង្ហាញ 100% លើគ្រប់អេក្រង់កុំព្យូទ័រ និងទូរស័ព្ទ • ចុចផ្ទាល់ទៅកាន់គេហទំព័រ និងទំព័រ Facebook ផ្លូវការ",
    slotPrefix: "ប្រអប់ Hero",
    bookBtn: "📢 កក់ផ្ទាំងពាណិជ្ជកម្មក្រោម Hero",
    adsContent: {
      "AD-VIP-05": {
        title: "FPT & TechVina AI Cloud — ជ្រើសរើសនាយកផ្នែកឌីជីថល និងវិស្វករ AI សកល",
        subtitle: "ប្រាក់ចំណូលរហូតដល់ $8,000/ខែ • ភាគហ៊ុន ESOP • ធ្វើការនៅហាណូយ និងហូជីមិញ",
        cta: "🌐 ដាក់ពាក្យ Fast-Track",
      },
      "AD-VIP-06": {
        title: "Hanul Semiconductor កូរ៉េ — ជ្រើសរើសវិស្វកររចនាបន្ទះឈីប និង R&D 30 នាក់",
        subtitle: "ឧបត្ថម្ភការបណ្តុះបណ្តាលនៅសេអ៊ូល 100% • ប្រាក់ឧបត្ថម្ភភាសា TOPIK / IELTS ខ្ពស់",
        cta: "🌐 ស្វែងយល់ពីមជ្ឈមណ្ឌល R&D",
      },
      "AD-VIP-07": {
        title: "Sakura Precision ជប៉ុន — ជ្រើសរើសប្រធានរោងចក្រ និងវិស្វករ BrSE (JLPT N2+)",
        subtitle: "ប្រាក់រង្វាន់ 4 ខែ/ឆ្នាំ • ធានារ៉ាប់រងសុខភាពអន្តរជាតិសម្រាប់គ្រួសារទាំងមូល",
        cta: "🌐 មើលអត្ថប្រយោជន៍ជប៉ុន",
      },
      "AD-VIP-08": {
        title: "Angkor Digital Bank & Siam Retail — ជ្រើសរើសនាយកផ្នែក Fintech និងខ្សែសង្វាក់ផ្គត់ផ្គង់",
        subtitle: "ធ្វើការនៅហូជីមិញ បាងកក និងភ្នំពេញ • កញ្ចប់ផ្លាស់ប្តូរទីលំនៅអន្តរជាតិ VIP",
        cta: "🌐 ដាក់ពាក្យតំបន់អាស៊ាន",
      },
    },
  },
};

function getAdFooterI18n() {
  const lang = portalState.lang || "vi";
  return AD_AND_FOOTER_I18N[lang] || AD_AND_FOOTER_I18N.vi;
}

function getHeroSpotlightI18n() {
  const lang = portalState.lang || "vi";
  return HERO_SPOTLIGHT_I18N[lang] || HERO_SPOTLIGHT_I18N.vi;
}

function localizeAdBannerContent(ad) {
  const dict = getAdFooterI18n();
  const heroDict = getHeroSpotlightI18n();
  const mapped =
    (dict.adsContent && dict.adsContent[ad.id]) ||
    (heroDict.adsContent && heroDict.adsContent[ad.id]);
  const rawTitle = mapped ? mapped.title : ad.title || "Chiến dịch Tuyển dụng Đặc biệt";
  const rawSubtitle = mapped
    ? mapped.subtitle
    : ad.subtitle || "Đãi ngộ dẫn đầu thị trường • Phỏng vấn AI Fast-Track";
  const rawCta = mapped ? mapped.cta : ad.cta_label || ad.cta_text || dict.websiteBtn;

  return {
    title: typeof translateDynamicText === "function" ? translateDynamicText(rawTitle) : rawTitle,
    subtitle: typeof translateDynamicText === "function" ? translateDynamicText(rawSubtitle) : rawSubtitle,
    cta: typeof translateDynamicText === "function" ? translateDynamicText(rawCta) : rawCta,
    company_name:
      typeof translateDynamicText === "function"
        ? translateDynamicText(ad.company_name || "Tập đoàn Đối tác VIP")
        : ad.company_name || "Tập đoàn Đối tác VIP",
  };
}

function renderHeroSpotlightBannersSection(bannersInput) {
  const hs = getHeroSpotlightI18n();
  const af = getAdFooterI18n();
  const sourceList =
    Array.isArray(bannersInput) && bannersInput.length > 0
      ? bannersInput
      : Array.isArray(publicAdBannersState) && publicAdBannersState.length > 0
      ? publicAdBannersState
      : DEFAULT_PUBLIC_AD_BANNERS;

  const activeBanners = sourceList
    .filter((b) => b.is_active !== false && b.active !== false)
    .sort((a, b) => (Number(a.priority_order) || 1) - (Number(b.priority_order) || 1));

  // Filter banners assigned to hero_1..hero_4; fallback to default hero banners so 4 slots are always rich
  let heroAds = activeBanners.filter((b) =>
    String(b.placement || b.position || "").toLowerCase().startsWith("hero")
  );
  if (heroAds.length < 4) {
    const defaultHeroAds = DEFAULT_PUBLIC_AD_BANNERS.filter((b) =>
      String(b.placement || b.position || "").toLowerCase().startsWith("hero")
    );
    const existingIds = new Set(heroAds.map((x) => x.id));
    for (const d of defaultHeroAds) {
      if (!existingIds.has(d.id) && heroAds.length < 4) {
        heroAds.push(d);
      }
    }
  }
  const finalHeroFour = heroAds.slice(0, 4);

  return `
    <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border border-amber-400/50 shadow-xl space-y-3.5 relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 text-xs relative z-10">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
            ${hs.badge}
          </span>
          <span class="font-extrabold text-white text-xs sm:text-sm">
            ${hs.title}
          </span>
          <span class="hidden xl:inline text-[11px] text-cyan-200/80">
            • ${hs.sub}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="openVipMechanismModal()"
            class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-amber-300 font-bold text-[11px] transition">
            ${af.vipPricingBtn}
          </button>
          <a href="/index.html?tab=ads"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition">
            ${hs.bookBtn}
          </a>
        </div>
      </div>

      <!-- 4-Column Hero Spotlight Banner Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 relative z-10">
        ${finalHeroFour
          .map((ad, idx) => {
            const cardHtml = renderSkyscraperBannerCard(
              {
                ...ad,
                badge_text: ad.badge_text || `🔥 ${hs.slotPrefix} #${idx + 1}`,
              },
              `hero_${idx + 1}`
            );
            return cardHtml;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderSkyscraperBannerCard(ad, sideLabel) {
  const af = getAdFooterI18n();
  const locAd = localizeAdBannerContent(ad);
  const tierNorm = String(ad.vip_tier || "").toLowerCase();
  const isDiamond = tierNorm.includes("diamond");
  const isPlatinum = tierNorm.includes("platinum");
  const tierRibbonClass = isDiamond
    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold"
    : isPlatinum
    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold"
    : "bg-emerald-500 text-white font-bold";

  const safeWebsite = ad.target_url || "https://hiremind.global";
  const safeFb = ad.facebook_url || "";
  const safeImg =
    ad.image_url ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80";

  return `
    <div class="group rounded-2xl overflow-hidden bg-slate-900 text-white border ${
      isDiamond ? "border-amber-400/70 shadow-[0_10px_30px_-8px_rgba(245,158,11,0.35)]" : "border-blue-500/40 shadow-lg"
    } transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      <!-- Top VIP Ribbon -->
      <div class="px-2.5 py-1.5 ${tierRibbonClass} text-[9px] uppercase tracking-wider flex items-center justify-between gap-1">
        <span class="truncate">${ad.badge_text || "👑 DIAMOND VIP"}</span>
        <span class="px-1.5 py-0.5 rounded bg-black/20 text-[8px] font-mono shrink-0">AD</span>
      </div>

      <!-- Banner Visual Image (Clickable to Website) -->
      <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
        onclick="recordPublicAdClick('${ad.id}')"
        class="relative h-36 xl:h-40 w-full overflow-hidden block bg-slate-950">
        <img src="${safeImg}" alt="${(locAd.title || "").replace(/"/g, "&quot;")}"
          onerror="this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'"
          class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent"></div>
        <div class="absolute bottom-2 left-2.5 right-2.5">
          <div class="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide truncate">
            🏢 ${locAd.company_name}
          </div>
        </div>
      </a>

      <!-- Banner Copy & Direct Links (Website + Facebook Fanpage) -->
      <div class="p-3 bg-gradient-to-b ${ad.bg_accent || "from-slate-900 to-slate-950"} space-y-2.5 flex-1 flex flex-col justify-between">
        <div class="space-y-1">
          <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
            onclick="recordPublicAdClick('${ad.id}')"
            class="text-xs font-extrabold text-white hover:text-amber-300 leading-snug line-clamp-2 transition block">
            ${locAd.title}
          </a>
          <p class="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
            ${locAd.subtitle}
          </p>
        </div>

        <!-- Dual Target Links: Website URL + Facebook Fanpage -->
        <div class="space-y-1.5 pt-1 border-t border-white/10">
          <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
            onclick="recordPublicAdClick('${ad.id}')"
            class="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm transition">
            <span class="truncate">${locAd.cta}</span>
            <span>&nearr;</span>
          </a>

          ${
            safeFb
              ? `
            <a href="${safeFb}" target="_blank" rel="noopener noreferrer"
              onclick="recordPublicAdClick('${ad.id}')"
              class="w-full py-1.5 px-2.5 rounded-xl bg-[#1877F2]/90 hover:bg-[#1877F2] text-white font-bold text-[10px] flex items-center justify-center gap-1 transition">
              <span>${af.fbFanpage}</span>
              <span>&nearr;</span>
            </a>
          `
              : ""
          }

          <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-0.5">
            <span>👁️ ${(ad.impressions || 12500).toLocaleString()}</span>
            <span id="pub-ad-clicks-${ad.id}">🖱️ ${(ad.clicks || 850).toLocaleString()} clicks</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPublicAdWings(banners) {
  const af = getAdFooterI18n();
  const leftWing = document.getElementById("public-left-ad-wing");
  const rightWing = document.getElementById("public-right-ad-wing");
  const mobileStrip = document.getElementById("public-mobile-ad-strip");
  const heroSpotlightSec = document.getElementById("section-hero-spotlight-ads");

  if (heroSpotlightSec) {
    heroSpotlightSec.innerHTML = renderHeroSpotlightBannersSection(banners);
  }

  const activeBanners = (banners || [])
    .filter((b) => b.is_active !== false && b.active !== false)
    .sort((a, b) => (Number(a.priority_order) || 1) - (Number(b.priority_order) || 1));

  const leftAds = activeBanners.filter((b) => String(b.position || b.placement || "").startsWith("left"));
  const rightAds = activeBanners.filter((b) => String(b.position || b.placement || "").startsWith("right"));

  // Ensure both wings always have at least the default banners if none are active
  const finalLeftAds = leftAds.length > 0 ? leftAds : DEFAULT_PUBLIC_AD_BANNERS.filter((b) => String(b.position || b.placement || "").startsWith("left"));
  const finalRightAds = rightAds.length > 0 ? rightAds : DEFAULT_PUBLIC_AD_BANNERS.filter((b) => String(b.position || b.placement || "").startsWith("right"));

  if (leftWing) {
    leftWing.innerHTML = `
      <div class="px-3 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 text-white border border-blue-800/70 flex items-center justify-between gap-1 shadow-sm">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
          <span>👑</span>
          <span>${af.leftWingTitle} (${finalLeftAds.length})</span>
        </span>
        <a href="/index.html?tab=ads" class="text-[9px] font-bold text-cyan-300 hover:underline">${af.createAdShort}</a>
      </div>
      ${finalLeftAds.map((ad) => renderSkyscraperBannerCard(ad, "left")).join("")}
      <button onclick="openVipMechanismModal()"
        class="w-full p-2.5 rounded-2xl bg-amber-50/90 hover:bg-amber-100 dark:bg-slate-900 border border-dashed border-amber-400 text-amber-900 dark:text-amber-300 text-center space-y-0.5 transition shadow-sm">
        <div class="text-[10px] font-extrabold">${af.vipMechTitle}</div>
        <div class="text-[9px] text-amber-700 dark:text-slate-400">${af.vipMechSub}</div>
      </button>
    `;
  }

  if (rightWing) {
    rightWing.innerHTML = `
      <div class="px-3 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-800/70 flex items-center justify-between gap-1 shadow-sm">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
          <span>💎</span>
          <span>${af.rightWingTitle} (${finalRightAds.length})</span>
        </span>
        <button onclick="openVipMechanismModal()" class="text-[9px] font-bold text-amber-300 hover:underline">${af.vipPricingBtn}</button>
      </div>
      ${finalRightAds.map((ad) => renderSkyscraperBannerCard(ad, "right")).join("")}
      <a href="/index.html?tab=ads"
        class="w-full p-2.5 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100 dark:bg-slate-900 border border-dashed border-indigo-400 text-indigo-900 dark:text-indigo-300 text-center space-y-0.5 transition shadow-sm block">
        <div class="text-[10px] font-extrabold">${af.adminAdTitle}</div>
        <div class="text-[9px] text-indigo-700 dark:text-slate-400">${af.adminAdSub}</div>
      </a>
    `;
  }

  if (mobileStrip) {
    const topMobileAds = [...finalLeftAds, ...finalRightAds];
    mobileStrip.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 space-y-3">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="font-extrabold text-amber-300">${af.mobilePartnersTitle} (${topMobileAds.length})</span>
          <div class="flex items-center gap-2">
            <button onclick="openVipMechanismModal()" class="text-[11px] text-cyan-300 font-bold underline">${af.vipPricingBtn}</button>
            <a href="/index.html?tab=ads" class="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-[11px]">${af.createAdShort}</a>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${topMobileAds.map((ad) => renderSkyscraperBannerCard(ad, "mobile")).join("")}
        </div>
      </div>
    `;
  }

  // Render All Active VIP Ad Banners Showcase inside the Main Footer (#footer-ad-banners-showcase)
  const footerShowcase = document.getElementById("footer-ad-banners-showcase");
  const allActiveAds = [...finalLeftAds, ...finalRightAds];
  if (footerShowcase) {
    footerShowcase.innerHTML = `
      <div class="space-y-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-[10px]">👑 VIP AD NETWORK (${allActiveAds.length})</span>
            <span class="font-extrabold text-white uppercase tracking-wider">
              ${af.footerShowcaseTitle}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openVipMechanismModal()" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-[11px] transition">
              ${af.vipMechTitle}
            </button>
            <a href="/index.html?tab=ads" class="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition">
              ${af.adminAdTitle}
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${allActiveAds.map((ad) => renderSkyscraperBannerCard(ad, "footer")).join("")}
        </div>
      </div>
    `;
  }

  // Render Fixed Bottom Footer Ad Banner Bar (#sticky-bottom-ad-footer) when scrolling
  renderStickyBottomAdFooter(allActiveAds);
}

let isStickyFooterCollapsed = false;

function toggleStickyBottomAdFooter() {
  isStickyFooterCollapsed = !isStickyFooterCollapsed;
  const allAds =
    publicAdBannersState && publicAdBannersState.length > 0
      ? publicAdBannersState
      : DEFAULT_PUBLIC_AD_BANNERS;
  renderStickyBottomAdFooter(allAds);
}

function renderStickyBottomAdFooter(adsList) {
  const dock = document.getElementById("sticky-bottom-ad-footer");
  if (!dock) return;
  const af = getAdFooterI18n();
  const ads = (adsList || DEFAULT_PUBLIC_AD_BANNERS).slice(0, 4);

  if (isStickyFooterCollapsed) {
    dock.innerHTML = `
      <div class="max-w-[1880px] mx-auto px-4 py-1.5 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span class="font-extrabold text-amber-300">${af.stickyCollapsedText} (${ads.length} ${af.stickyRunningText})</span>
        </div>
        <div class="flex items-center gap-2">
          <a href="/index.html?tab=ads" class="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-[11px]">${af.createAdShort}</a>
          <button onclick="toggleStickyBottomAdFooter()" class="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px]">
            ${af.stickyExpandBtn}
          </button>
        </div>
      </div>
    `;
    return;
  }

  dock.innerHTML = `
    <div class="max-w-[1880px] mx-auto px-3 sm:px-6 py-2.5 space-y-2">
      <!-- Top Control Row -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-[10px]">
            👑 STICKY FOOTER VIP ADS
          </span>
          <span class="font-bold text-amber-200 hidden sm:inline">
            ${af.stickyPartnerDesc}
          </span>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <button onclick="openPublicTrafficStatsModal()" class="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-[10px]">
            🟢 ${af.onlineLabel}: ${Number(publicTrafficStatsState?.online_now || 342).toLocaleString()} • ${af.todayLabel}: ${Number(publicTrafficStatsState?.today_visits || 14820).toLocaleString()} ${af.visitsUnit}
          </button>
          <a href="/index.html?tab=ads" class="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] transition">
            ${af.adminAdTitle}
          </a>
          <button onclick="toggleStickyBottomAdFooter()" class="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[10px] transition">
            ${af.stickyCollapseBtn}
          </button>
        </div>
      </div>

      <!-- 4 Compact Horizontal Banner Cards Fixed at Bottom Footer -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        ${ads
          .map((ad) => {
            const locAd = localizeAdBannerContent(ad);
            const safeWebsite = ad.target_url || "https://hiremind.global";
            const safeFb = ad.facebook_url || "";
            const safeImg =
              ad.image_url ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80";
            return `
              <div class="p-2 rounded-xl bg-slate-900/95 border border-amber-400/40 hover:border-amber-400 flex items-center gap-2.5 transition group">
                <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
                  onclick="recordPublicAdClick('${ad.id}')"
                  class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 block">
                  <img src="${safeImg}" alt="${(locAd.company_name || "").replace(/"/g, "&quot;")}"
                    onerror="this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'"
                    class="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                </a>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] font-extrabold text-amber-300 truncate">${locAd.company_name}</span>
                  </div>
                  <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
                    onclick="recordPublicAdClick('${ad.id}')"
                    class="text-[11px] font-bold text-white hover:text-amber-300 truncate block">
                    ${locAd.title}
                  </a>
                  <div class="flex items-center gap-1.5 mt-1">
                    <a href="${safeWebsite}" target="_blank" rel="noopener noreferrer"
                      onclick="recordPublicAdClick('${ad.id}')"
                      class="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[9px] transition">
                      ${af.websiteBtn} &nearr;
                    </a>
                    ${
                      safeFb
                        ? `<a href="${safeFb}" target="_blank" rel="noopener noreferrer"
                            onclick="recordPublicAdClick('${ad.id}')"
                            class="px-2 py-0.5 rounded bg-[#1877F2] hover:opacity-90 text-white font-bold text-[9px] transition">
                            📘 Facebook &nearr;
                          </a>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function localizePublicFooterAndTopBar() {
  const af = getAdFooterI18n();
  const pd = pDict();
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };

  // 1. Localize Top Utility Bar
  setTxt("top-bar-ai-status", pd.heroBadge || "Ứng tuyển 1 chạm • AI Sàng lọc & Phỏng vấn 24/7");
  setTxt("top-bar-region-label", af.topBarRegion);
  setTxt("macro-reg-all", pd.macroAll || "Toàn quốc");
  setTxt("macro-reg-north", pd.macroNorth || "Miền Bắc");
  setTxt("macro-reg-central", pd.macroCentral || "Miền Trung");
  setTxt("macro-reg-south", pd.macroSouth || "Miền Nam");
  setTxt("macro-reg-asean", "ASEAN");
  setTxt("top-bar-traffic-btn", af.topBarTraffic);
  setTxt("top-bar-vip-btn", af.topBarVip);
  setTxt("top-bar-loc-btn", af.topBarLoc);
  setTxt("top-bar-ads-btn", af.topBarAds);

  // 2. Localize 5-Column International Footer (#footer-localized-body)
  const footerBody = document.getElementById("footer-localized-body");
  if (!footerBody) return;

  const locName = (code, fallback) => {
    const found = (typeof getActiveLocationsList === "function" ? getActiveLocationsList() : []).find((l) => l.code === code);
    return found ? translateLocationPill(found) : fallback;
  };

  footerBody.innerHTML = `
    <!-- Top Hotline & Quick Support Strip -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A2558]/90 border border-blue-800/70 text-xs shadow-inner">
      <div class="space-y-1">
        <div class="text-[11px] font-semibold uppercase text-cyan-300">${af.footerHotlineSouth}</div>
        <div class="text-sm font-bold text-white">(028) 7108 2424</div>
        <div class="text-[11px] text-blue-200/75">${locName("hcmc", "TP.HCM")} • ${locName("binhduong", "Bình Dương")} • ${locName("dongnai", "Đồng Nai")} • ${locName("cantho", "Cần Thơ")}</div>
      </div>
      <div class="space-y-1">
        <div class="text-[11px] font-semibold uppercase text-cyan-300">${af.footerHotlineNorth}</div>
        <div class="text-sm font-bold text-white">(024) 7308 2424</div>
        <div class="text-[11px] text-blue-200/75">${locName("hanoi", "Hà Nội")} • ${locName("haiphong", "Hải Phòng")} • ${locName("bacninh", "Bắc Ninh")} • ${locName("danang", "Đà Nẵng")}</div>
      </div>
      <div class="space-y-1">
        <div class="text-[11px] font-semibold uppercase text-emerald-300">${af.footerAiB2b}</div>
        <div class="text-sm font-bold text-white">ntd@hiremind.global</div>
        <div class="text-[11px] text-blue-200/75">${af.footerAiB2bSub}</div>
      </div>
      <div class="flex items-center justify-start md:justify-end gap-2 flex-wrap">
        <button onclick="toggleSupportChatbot(true)" class="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5">
          <span>💬</span>
          <span>${af.footerChatBtn}</span>
        </button>
        <button onclick="openQuickPostJobModal()" class="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition">
          ${af.footerPostJobBtn}
        </button>
      </div>
    </div>

    <!-- Main 5-Column Functional Directory (Synchronized with Header Language Selector) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 text-[13px]">
      <!-- COLUMN 1 (3 Cols): Về HireMind Global -->
      <div class="lg:col-span-3 space-y-3">
        <h4 class="font-bold text-white text-sm tracking-wide">${af.col1Title}</h4>
        <ul class="space-y-2 text-blue-200/85">
          <li><button onclick="openFunctionalPageModal('about')" class="hover:text-white hover:underline transition text-left">${af.col1About}</button></li>
          <li><button onclick="openFunctionalPageModal('intech')" class="hover:text-white hover:underline transition text-left">${af.col1Intech}</button></li>
          <li><button onclick="openFunctionalPageModal('contact')" class="hover:text-white hover:underline transition text-left">${af.col1Contact}</button></li>
          <li><button onclick="openFunctionalPageModal('faq')" class="hover:text-white hover:underline transition text-left">${af.col1Faq}</button></li>
          <li><button onclick="openFunctionalPageModal('terms')" class="hover:text-white hover:underline transition text-left">${af.col1Terms}</button></li>
          <li><button onclick="openFunctionalPageModal('privacy')" class="hover:text-white hover:underline transition text-left">${af.col1Privacy}</button></li>
          <li>
            <button onclick="openFunctionalPageModal('ecommerce_policy')" class="hover:text-white hover:underline transition text-left leading-snug">
              ${af.col1Ecommerce}
            </button>
          </li>
          <li><button onclick="openFunctionalPageModal('sitemap')" class="hover:text-white hover:underline transition text-left">${af.col1Sitemap}</button></li>
        </ul>
      </div>

      <!-- COLUMN 2 (2 Cols): Dành cho Nhà tuyển dụng -->
      <div class="lg:col-span-2 space-y-3">
        <h4 class="font-bold text-white text-sm tracking-wide">${af.col2Title}</h4>
        <ul class="space-y-2 text-blue-200/85">
          <li><button onclick="openQuickPostJobModal()" class="hover:text-white hover:underline transition text-left">${af.col2PostJob}</button></li>
          <li><button onclick="openFunctionalPageModal('resume_search')" class="hover:text-white hover:underline transition text-left">${af.col2ResumeSearch}</button></li>
          <li><button onclick="openFunctionalPageModal('market_report')" class="hover:text-white hover:underline transition text-left">${af.col2MarketReport}</button></li>
          <li><a href="/index.html" class="hover:text-white hover:underline transition block">${af.col2AtsSystem}</a></li>
          <li><button onclick="openEmployerAuthModal('register')" class="hover:text-white hover:underline transition text-left">${af.col2RegisterTenant}</button></li>
          <li><button onclick="openFunctionalPageModal('contact_b2b')" class="hover:text-white hover:underline transition text-left">${af.col2ContactB2b}</button></li>
        </ul>
      </div>

      <!-- COLUMN 3 (2 Cols): Việc làm theo khu vực -->
      <div class="lg:col-span-2 space-y-3">
        <h4 class="font-bold text-white text-sm tracking-wide">${af.col3Title}</h4>
        <ul class="space-y-2 text-blue-200/85">
          <li><button onclick="updatePortalFilter('loc', 'hcmc'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("hcmc", "Hồ Chí Minh")}</button></li>
          <li><button onclick="updatePortalFilter('loc', 'hanoi'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("hanoi", "Hà Nội")}</button></li>
          <li><button onclick="updatePortalFilter('loc', 'haiphong'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("haiphong", "Hải Phòng")}</button></li>
          <li><button onclick="updatePortalFilter('loc', 'danang'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("danang", "Đà Nẵng")}</button></li>
          <li><button onclick="updatePortalFilter('loc', 'cantho'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("cantho", "Cần Thơ")}</button></li>
          <li><button onclick="updatePortalFilter('loc', 'binhduong'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${locName("binhduong", "Bình Dương")} & ${locName("bacninh", "Bắc Ninh")}</button></li>
        </ul>
        <div class="pt-2">
          <button onclick="scrollToPortalBlock('section-regional-hubs')" class="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-semibold transition">
            <span>${af.col3AllRegions}</span>
            <span class="text-base leading-none">&rsaquo;</span>
          </button>
        </div>
      </div>

      <!-- COLUMN 4 (2 Cols): Việc làm theo ngành nghề -->
      <div class="lg:col-span-2 space-y-3">
        <h4 class="font-bold text-white text-sm tracking-wide">${af.col4Title}</h4>
        <ul class="space-y-2 text-blue-200/85">
          <li><button onclick="applyQuickTrendingSearch('Kế toán')" class="hover:text-white hover:underline transition text-left">${af.col4Accounting}</button></li>
          <li><button onclick="updatePortalFilter('cat', 'Tài chính, Ngân hàng & Đầu tư (BFSI)'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${af.col4Banking}</button></li>
          <li><button onclick="updatePortalFilter('cat', 'Công nghệ Thông tin, AI & Chuyển đổi số'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${af.col4Software}</button></li>
          <li><button onclick="applyQuickTrendingSearch('Cloud')" class="hover:text-white hover:underline transition text-left">${af.col4ItSupport}</button></li>
          <li><button onclick="updatePortalFilter('cat', 'Bất động sản, Xây dựng & Hạ tầng'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${af.col4Construction}</button></li>
          <li><button onclick="updatePortalFilter('cat', 'Sản xuất Công nghiệp, Điện tử & FDI'); scrollToPortalBlock('section-job-explorer');" class="hover:text-white hover:underline transition text-left">${af.col4Manufacturing}</button></li>
        </ul>
        <div class="pt-2">
          <button onclick="scrollToPortalBlock('section-job-explorer')" class="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-semibold transition">
            <span>${af.col4FindJobs}</span>
            <span class="text-base leading-none">&rsaquo;</span>
          </button>
        </div>
      </div>

      <!-- COLUMN 5 (3 Cols): Ứng dụng di động & Mạng xã hội -->
      <div class="lg:col-span-3 space-y-5">
        <div class="space-y-2.5">
          <h4 class="font-bold text-white text-sm tracking-wide">${af.col5AppTitle}</h4>
          <div class="flex flex-wrap items-center gap-2.5">
            <button onclick="openFunctionalPageModal('mobile_app')"
              class="px-3.5 py-2 rounded-lg bg-black hover:bg-slate-900 border border-slate-500/80 text-white flex items-center gap-2.5 transition shadow-sm">
              <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3z"/></svg>
              <div class="text-left leading-tight">
                <div class="text-[9px] text-slate-300">${af.col5DownloadOn}</div>
                <div class="text-xs font-bold">App Store</div>
              </div>
            </button>

            <button onclick="openFunctionalPageModal('mobile_app')"
              class="px-3.5 py-2 rounded-lg bg-black hover:bg-slate-900 border border-slate-500/80 text-white flex items-center gap-2.5 transition shadow-sm">
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M3.6 2.4c-.3.3-.5.8-.5 1.4v16.4c0 .6.2 1.1.5 1.4l.1.1 9.2-9.2v-.2L3.7 2.3l-.1.1z"/><path fill="#FBBC05" d="M16 15.4l-3.1-3.1v-.2L16 9l.1.1 3.6 2.1c1 .6 1 1.5 0 2.1l-3.6 2.1-.1 0z"/><path fill="#EA4335" d="M16.1 15.3L12.9 12 3.6 21.3c.3.4.9.4 1.6 0l10.9-6z"/><path fill="#34A853" d="M16.1 8.7L5.2 2.7c-.7-.4-1.3-.4-1.6 0l9.3 9.3 3.2-3.3z"/></svg>
              <div class="text-left leading-tight">
                <div class="text-[9px] text-slate-300">${af.col5DownloadOn}</div>
                <div class="text-xs font-bold">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-bold text-white text-sm tracking-wide">${af.col5FollowUs}</h4>
          <div class="flex items-center gap-2.5">
            <button onclick="openFunctionalPageModal('contact')" title="Facebook Official"
              class="w-8 h-8 rounded-full bg-[#1877F2] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center shadow transition">f</button>
            <button onclick="openFunctionalPageModal('contact')" title="LinkedIn Executive Network"
              class="w-8 h-8 rounded-full bg-[#0A66C2] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center shadow transition">in</button>
            <button onclick="openFunctionalPageModal('contact')" title="TikTok Career Channel"
              class="w-8 h-8 rounded-full bg-black border border-slate-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center shadow transition">♪</button>
            <button onclick="openFunctionalPageModal('contact')" title="YouTube HR Nexus"
              class="w-8 h-8 rounded-full bg-[#FF0000] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center shadow transition">▶</button>
            <button onclick="openFunctionalPageModal('contact')" title="Spotify Career Podcast"
              class="w-8 h-8 rounded-full bg-[#1DB954] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center shadow transition">)))</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Centered Corporate Copyright & Registered Address -->
    <div class="pt-6 border-t border-blue-900/70 text-center space-y-1 text-[11px] text-blue-200/60">
      <div class="font-medium text-blue-100/80">
        ${af.copyrightTitle}
      </div>
      <div>
        ${af.copyrightAddress}
      </div>
    </div>

    <!-- Bottom Sub-Brand Ecosystem Bar -->
    <div class="pt-5 border-t border-blue-900/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      <div class="flex items-center gap-6 flex-wrap">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="TechCorp HireMind Logo" class="w-7 h-7 rounded-lg bg-white p-0.5 object-contain shadow-sm" />
          <span class="font-bold text-white">© TechCorp HireMindWorks</span>
        </div>
        <div class="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <span>hiremind</span>
          <span class="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono">inTECH</span>
        </div>
        <div class="flex items-center gap-1.5 text-blue-200/80">
          <span class="text-[11px]">Powered by</span>
          <span class="font-bold text-white tracking-wider">MOTAPIS &bull; GLOBAL AI CLOUD</span>
        </div>
      </div>

      <div class="flex items-center gap-4 flex-wrap text-[11px] text-blue-200/80">
        <button onclick="openLocationManagerModal()" class="hover:text-white hover:underline">📍 ${af.topBarLoc}</button>
        <span>•</span>
        <button onclick="switchPortalSection('tools')" class="hover:text-white hover:underline">${af.bottomGrossNet}</button>
        <span>•</span>
        <a href="/index.html" class="text-cyan-300 hover:text-white font-semibold hover:underline" id="footer-ats-link-bottom">${pd.footerAtsLink || "Enterprise ATS →"}</a>
      </div>
    </div>
  `;
}

async function recordPublicAdClick(bannerId) {
  try {
    const res = await fetch(`${API_BASE}/api/ad-banners/${encodeURIComponent(bannerId)}/click`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      const el = document.getElementById(`pub-ad-clicks-${bannerId}`);
      if (el && data.clicks) {
        el.textContent = `🖱️ ${Number(data.clicks).toLocaleString()} clicks`;
      }
    }
  } catch (e) {
    // ignore offline error
  }
}

function openVipMechanismModal() {
  openPortalModal(`
    <div class="space-y-6 text-xs">
      <!-- Header -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-amber-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
            👑 VIP PRIORITY ENGINE & DUAL-WING AD NETWORK
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white">
            Cơ chế Ưu tiên Tài khoản VIP & Sự khác biệt Các Cấp độ Tài khoản
          </h3>
          <p class="text-blue-200/90 text-xs leading-relaxed">
            Hệ thống phân tầng đặc quyền thông minh dành cho cả <b>Nhà Tuyển Dụng B2B (4 cấp độ)</b> và <b>Ứng viên Tài năng (3 cấp độ)</b>, kết hợp mạng lưới <b>Banner Quảng cáo Skyscraper 2 bên Trái/Phải</b>.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
          <a href="/index.html?tab=ads"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg text-center transition">
            📢 Mở Trang Tạo Tin Quảng Cáo (Admin) &rarr;
          </a>
          <button onclick="closePortalModal()"
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition">
            Đóng cửa sổ
          </button>
        </div>
      </div>

      <!-- Part 1: 4 Employer B2B Tiers -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Sự khác biệt 4 Cấp độ Tài khoản Nhà Tuyển Dụng (Employer B2B Tiers)
          </h4>
          <span class="text-[11px] font-semibold text-amber-600">Thuật toán Trọng số Ưu tiên (Priority Weighting)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- Tier 1: Diamond VIP -->
          <div class="p-4 rounded-2xl bg-gradient-to-b from-amber-50/90 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-amber-400 shadow-md space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-[10px]">👑 DIAMOND VIP</span>
              <span class="font-mono font-extrabold text-amber-700 dark:text-amber-300 text-xs">Ưu tiên x5.0</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">Enterprise Diamond VIP</div>
            <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">25.000.000 ₫ / tháng</div>
            <ul class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-200/70 dark:border-slate-700">
              <li>✔ <b>Độc quyền đặt Banner Quảng cáo 2 bên Trái/Phải</b> (Skyscraper Wing) gắn kèm Link Website & Fanpage Facebook</li>
              <li>✔ <b>Ghim cố định Top 1–3</b> trên Bảng tin Việc làm Trực tuyến (Live Ticker) & Đầu danh sách tìm kiếm</li>
              <li>✔ Mở khóa <b>100% Kho CV Chuyên gia / C-Level</b> + AI Headhunter tự động săn ứng viên 24/7</li>
              <li>✔ Không giới hạn chiến dịch & vị trí tuyển dụng đồng thời</li>
            </ul>
          </div>

          <!-- Tier 2: Platinum Pro -->
          <div class="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-indigo-400/80 shadow-sm space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-[10px]">💎 PLATINUM PRO</span>
              <span class="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-xs">Ưu tiên x3.0</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">Corporate Platinum Pro</div>
            <div class="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">12.000.000 ₫ / tháng</div>
            <ul class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-indigo-200/70 dark:border-slate-700">
              <li>✔ <b>Đặt Banner Quảng cáo nửa dưới Trái/Phải</b> (Left/Right Bottom Slot) trên trang Public</li>
              <li>✔ Ưu tiên hiển thị ngay sau nhóm Diamond VIP với huy hiệu <b>💎 PLATINUM PRO</b></li>
              <li>✔ Mở khóa <b>500 CV/tháng</b> + Phỏng vấn AI đa ngôn ngữ tự động</li>
              <li>✔ Tối đa <b>50 vị trí tuyển dụng</b> đang mở cùng lúc</li>
            </ul>
          </div>

          <!-- Tier 3: Gold Verified -->
          <div class="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white dark:from-slate-800 dark:to-slate-900 border border-emerald-300 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">⭐ GOLD VERIFIED</span>
              <span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">Ưu tiên x1.8</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">Growth Gold Verified</div>
            <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">5.500.000 ₫ / tháng</div>
            <ul class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/70 dark:border-slate-700">
              <li>✔ Huy hiệu <b>✔ Doanh nghiệp Xác thực (Gold Verified)</b> tăng 180% tỷ lệ nộp đơn</li>
              <li>✔ Tự động làm mới (Auto-Refresh) tin tuyển dụng mỗi tuần</li>
              <li>✔ Mở khóa <b>150 CV/tháng</b> + Chấm điểm 4 trụ cột AI</li>
              <li>✔ Tối đa <b>15 vị trí tuyển dụng</b> đang mở</li>
            </ul>
          </div>

          <!-- Tier 4: Standard -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px]">🏢 STANDARD</span>
              <span class="font-mono font-bold text-slate-500 text-xs">Mặc định x1.0</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">Standard Member</div>
            <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400">Miễn phí (0 ₫)</div>
            <ul class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
              <li>✔ Hiển thị theo thứ tự thời gian đăng thông thường</li>
              <li>✔ Tối đa <b>03 tin tuyển dụng</b> cơ bản</li>
              <li>✔ Nhận hồ sơ ứng viên nộp trực tiếp qua cổng Public</li>
              <li>✖ Không bao gồm vị trí Banner Quảng cáo 2 bên</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Part 2: 3 Candidate Account Tiers -->
      <div class="space-y-3">
        <h4 class="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          2. Sự khác biệt 3 Cấp độ Tài khoản Ứng viên (Candidate Talent Tiers)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div class="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px]">🌟 EXECUTIVE VIP FAST-TRACK</span>
              <span class="font-mono font-bold text-amber-700 text-[11px]">Top 1% Hồ sơ</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-xs">Chuyên gia Cấp cao & Quản lý (Executive VIP)</div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Hồ sơ được gắn nhãn <b>🔥 Top Talent VIP</b>, đẩy thẳng lên đầu cột <b>Sàng lọc AI (Vòng 2)</b> của các Tập đoàn Diamond VIP, được AI tối ưu CV đa ngôn ngữ và bảo mật danh tính tuyệt đối.
            </p>
          </div>
          <div class="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">✔ VERIFIED TALENT</span>
              <span class="font-mono font-bold text-blue-700 text-[11px]">Ưu tiên x2.0</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-xs">Ứng viên Đã Xác thực Năng lực & Kỹ năng</div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Đã hoàn thành bài phỏng vấn AI hoặc xác thực bằng cấp; được ưu tiên thông báo sớm các vị trí lương cao trước 24h.
            </p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">👤 STANDARD MEMBER</span>
              <span class="font-mono font-bold text-slate-500 text-[11px]">Mặc định x1.0</span>
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-xs">Tài khoản Ứng viên Tiêu chuẩn</div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Tạo hồ sơ CV miễn phí, ứng tuyển 1 chạm và sử dụng công cụ tính lương Gross ⇄ Net.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer CTA to Admin Ad Studio -->
      <div class="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="font-extrabold text-slate-900 dark:text-white text-xs">📢 Bạn muốn tạo hoặc thay đổi Banner Quảng cáo 2 bên Trái / Phải?</div>
          <div class="text-[11px] text-slate-600 dark:text-slate-300">Truy cập ngay phân hệ <b>Quản trị Quảng cáo & VIP</b> tại trang Admin để tải ảnh Banner, gắn Link Website, Link Fanpage Facebook & bật/tắt chiến dịch tức thì.</div>
        </div>
        <a href="/index.html?tab=ads"
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shrink-0 shadow-md transition">
          Mở Trang Tạo Tin Quảng Cáo (Admin) &rarr;
        </a>
      </div>
    </div>
  `, () => openVipMechanismModal());
}

/* ============================================================================
   15. PUBLIC TRAFFIC, ENTERPRISE B2B REGISTRATIONS & CANDIDATE APPLICATIONS TELEMETRY
   ============================================================================ */
let publicTrafficStatsState = {
  online_now: 342,
  today_visits: 14820,
  yesterday_visits: 13950,
  total_visits_30d: 386400,
  daily_growth_pct: 6.2,
  today_employer_registrations: 28,
  total_employer_members: 1486,
  vip_employer_members: 312,
  today_candidate_applications: 419,
  today_candidate_registrations: 265,
  total_candidate_applications: 48920,
  ai_interviews_completed_today: 184,
  daily_history: [
    { date: "12/10", label: "Thứ 2", visits: 11420, employers: 19, applications: 310 },
    { date: "13/10", label: "Thứ 3", visits: 12380, employers: 22, applications: 345 },
    { date: "14/10", label: "Thứ 4", visits: 13150, employers: 24, applications: 368 },
    { date: "15/10", label: "Thứ 5", visits: 12890, employers: 21, applications: 352 },
    { date: "16/10", label: "Thứ 6", visits: 14210, employers: 26, applications: 395 },
    { date: "17/10", label: "Thứ 7", visits: 13950, employers: 25, applications: 384 },
    { date: "18/10 (Hôm nay)", label: "Chủ nhật", visits: 14820, employers: 28, applications: 419 },
  ],
};

async function loadAndRenderPublicTrafficStats() {
  try {
    const hasRecordedVisit = sessionStorage.getItem("hiremind_public_visit_recorded");
    const endpoint = hasRecordedVisit
      ? `${API_BASE}/api/public/traffic-stats`
      : `${API_BASE}/api/public/traffic-stats/record`;
    const options = hasRecordedVisit
      ? { method: "GET" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_type: "visit" }),
        };

    const res = await fetch(endpoint, options);
    if (res.ok) {
      const data = await res.json();
      publicTrafficStatsState = { ...publicTrafficStatsState, ...data };
      if (!hasRecordedVisit) {
        sessionStorage.setItem("hiremind_public_visit_recorded", "1");
      }
    }
  } catch (e) {
    // Use local fallback state if offline
  }
  renderPublicTrafficTelemetryWidgets();
}

async function recordPublicTrafficEvent(eventType = "visit", showFeedback = false) {
  try {
    const res = await fetch(`${API_BASE}/api/public/traffic-stats/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: eventType }),
    });
    if (res.ok) {
      const data = await res.json();
      publicTrafficStatsState = { ...publicTrafficStatsState, ...data };
    } else {
      if (eventType === "employer_register") {
        publicTrafficStatsState.today_employer_registrations += 1;
        publicTrafficStatsState.total_employer_members += 1;
      } else if (eventType === "candidate_apply" || eventType === "candidate_register") {
        publicTrafficStatsState.today_candidate_applications += 1;
        publicTrafficStatsState.total_candidate_applications += 1;
      } else {
        publicTrafficStatsState.today_visits += 1;
        publicTrafficStatsState.total_visits_30d += 1;
      }
    }
  } catch (e) {
    if (eventType === "employer_register") {
      publicTrafficStatsState.today_employer_registrations += 1;
      publicTrafficStatsState.total_employer_members += 1;
    } else if (eventType === "candidate_apply" || eventType === "candidate_register") {
      publicTrafficStatsState.today_candidate_applications += 1;
      publicTrafficStatsState.total_candidate_applications += 1;
    } else {
      publicTrafficStatsState.today_visits += 1;
      publicTrafficStatsState.total_visits_30d += 1;
    }
  }
  renderPublicTrafficTelemetryWidgets();
  if (showFeedback) {
    showPortalToast("📈 Đã cập nhật bộ đếm Thống kê Trực tuyến thời gian thực!");
    openPublicTrafficStatsModal();
  }
}

const TRAFFIC_WIDGET_I18N = {
  vi: {
    mainHeader: "📊 THỐNG KÊ TRUY CẬP THEO NGÀY, ĐĂNG KÝ DOANH NGHIỆP & CÁ NHÂN ỨNG TUYỂN (LIVE TELEMETRY)",
    onlineNow: "🟢 Đang trực tuyến:",
    usersUnit: "người",
    view7DaysBtn: "📈 Xem Biểu đồ 7 Ngày & Chi tiết →",
    c1Title: "🌐 Lượt truy cập hôm nay",
    c1SubPrefix: "so với hôm qua • 30 ngày:",
    c2Title: "🏢 Thành viên Doanh nghiệp B2B",
    c2TodaySuffix: "hôm nay",
    c2SubSuffix: "Tập đoàn Diamond & Platinum VIP",
    c3Title: "👨‍💼 Cá nhân Ứng tuyển hôm nay",
    c3Unit: "hồ sơ CV",
    c3SubPrefix: "Tổng tích lũy:",
    c3SubSuffix: "lượt ứng tuyển",
    c4Title: "🤖 Phỏng vấn AI hoàn tất hôm nay",
    c4Unit: "phiên 24/7",
    c4Sub: "⚡ Tốc độ chấm điểm CV trung bình: 1.8 giây",
    footerTitle: "📊 SỐ LIỆU THỐNG KÊ HOẠT ĐỘNG TRỰC TUYẾN (REAL-TIME PORTAL METRICS)",
    footerSub: "Minh bạch lưu lượng truy cập cho Nhà Tuyển Dụng đặt Banner Quảng cáo VIP & Ứng viên toàn quốc",
    fOnline: "🟢 Đang Online",
    fToday: "📈 Truy cập hôm nay",
    fB2b: "🏢 Thành viên B2B",
    fApps: "👨‍💼 Lượt ứng tuyển",
    fBtn: "📊 Chi tiết 7 ngày →",
  },
  en: {
    mainHeader: "📊 DAILY TRAFFIC, B2B ENTERPRISE REGISTRATIONS & CANDIDATE APPLICATIONS (LIVE TELEMETRY)",
    onlineNow: "🟢 Online Now:",
    usersUnit: "users",
    view7DaysBtn: "📈 7-Day Chart & Analytics →",
    c1Title: "🌐 Visits Today",
    c1SubPrefix: "vs. yesterday • 30-day total:",
    c2Title: "🏢 B2B Enterprise Members",
    c2TodaySuffix: "today",
    c2SubSuffix: "Diamond & Platinum VIP Corporations",
    c3Title: "👨‍💼 Candidate Applications Today",
    c3Unit: "CVs submitted",
    c3SubPrefix: "Cumulative total:",
    c3SubSuffix: "applications",
    c4Title: "🤖 AI Interviews Completed Today",
    c4Unit: "24/7 sessions",
    c4Sub: "⚡ Avg. 4-Pillar CV Scoring Speed: 1.8s",
    footerTitle: "📊 REAL-TIME PORTAL TRAFFIC & CONVERSION METRICS",
    footerSub: "Transparent audience telemetry for VIP Ad Sponsors, Enterprise Employers & Executive Talent",
    fOnline: "🟢 Online Now",
    fToday: "📈 Visits Today",
    fB2b: "🏢 B2B Employers",
    fApps: "👨‍💼 Applications",
    fBtn: "📊 7-Day Details →",
  },
  ja: {
    mainHeader: "📊 日次アクセス数・法人会員登録・求職者応募リアルタイム統計 (LIVE TELEMETRY)",
    onlineNow: "🟢 現在オンライン:",
    usersUnit: "名",
    view7DaysBtn: "📈 過去7日間の推移グラフ・詳細 →",
    c1Title: "🌐 本日のアクセス数",
    c1SubPrefix: "前日比 • 直近30日間:",
    c2Title: "🏢 B2B 採用企業会員数",
    c2TodaySuffix: "本日新規",
    c2SubSuffix: "社の Diamond & Platinum VIP 企業",
    c3Title: "👨‍💼 本日の求職者応募数",
    c3Unit: "件の履歴書",
    c3SubPrefix: "累計応募数:",
    c3SubSuffix: "件",
    c4Title: "🤖 本日のAI面接完了数",
    c4Unit: "セッション",
    c4Sub: "⚡ AI履歴書スコアリング平均速度: 1.8秒",
    footerTitle: "📊 リアルタイム・ポータル稼働統計 (REAL-TIME METRICS)",
    footerSub: "VIPバナー広告掲載企業および全国の求職者向けにトラフィック指標を透明化",
    fOnline: "🟢 オンライン",
    fToday: "📈 本日アクセス",
    fB2b: "🏢 法人会員数",
    fApps: "👨‍💼 累計応募数",
    fBtn: "📊 7日間統計 →",
  },
  ko: {
    mainHeader: "📊 일일 방문자 수 · 기업회원 가입 · 개인 입사지원 실시간 통계 (LIVE TELEMETRY)",
    onlineNow: "🟢 현재 접속자:",
    usersUnit: "명",
    view7DaysBtn: "📈 최근 7일 차트 및 상세 통계 →",
    c1Title: "🌐 오늘 방문자 수",
    c1SubPrefix: "어제 대비 • 최근 30일 누적:",
    c2Title: "🏢 B2B 기업회원 수",
    c2TodaySuffix: "오늘 신규",
    c2SubSuffix: "개 Diamond & Platinum VIP 그룹사",
    c3Title: "👨‍💼 오늘 개인 입사지원",
    c3Unit: "건 이력서",
    c3SubPrefix: "누적 입사지원:",
    c3SubSuffix: "건",
    c4Title: "🤖 오늘 완료된 AI 면접",
    c4Unit: "세션 (24/7)",
    c4Sub: "⚡ 평균 AI 이력서 평가 속도: 1.8초",
    footerTitle: "📊 실시간 포털 트래픽 및 채용 활동 지표 (REAL-TIME METRICS)",
    footerSub: "VIP 배너 광고주 및 구직자를 위한 투명한 실시간 트래픽 데이터 제공",
    fOnline: "🟢 현재 접속",
    fToday: "📈 오늘 방문",
    fB2b: "🏢 기업 회원",
    fApps: "👨‍💼 누적 지원",
    fBtn: "📊 7일 상세 →",
  },
  zh: {
    mainHeader: "📊 每日访问量、企业会员注册与个人求职申请实时统计 (LIVE TELEMETRY)",
    onlineNow: "🟢 当前在线:",
    usersUnit: "人",
    view7DaysBtn: "📈 查看近7天趋势图与详情 →",
    c1Title: "🌐 今日访问量",
    c1SubPrefix: "较昨日 • 近30天累计:",
    c2Title: "🏢 B2B 企业会员总数",
    c2TodaySuffix: "今日新增",
    c2SubSuffix: "家钻石与白金 VIP 集团",
    c3Title: "👨‍💼 今日个人投递简历",
    c3Unit: "份简历",
    c3SubPrefix: "累计投递总数:",
    c3SubSuffix: "次申请",
    c4Title: "🤖 今日完成 AI 面试",
    c4Unit: "场次 (24/7)",
    c4Sub: "⚡ AI 四维简历评分平均耗时: 1.8秒",
    footerTitle: "📊 平台实时流量与招聘转化数据 (REAL-TIME PORTAL METRICS)",
    footerSub: "为 VIP 广告合作伙伴、招聘企业及求职者提供透明的实时访问统计",
    fOnline: "🟢 当前在线",
    fToday: "📈 今日访问",
    fB2b: "🏢 企业会员",
    fApps: "👨‍💼 累计投递",
    fBtn: "📊 7天详情 →",
  },
  th: {
    mainHeader: "📊 สถิติผู้เข้าชมรายวัน การลงทะเบียนองค์กร B2B และผู้สมัครงานแบบเรียลไทม์",
    onlineNow: "🟢 ออนไลน์ขณะนี้:",
    usersUnit: "คน",
    view7DaysBtn: "📈 ดูกราฟย้อนหลัง 7 วันและรายละเอียด →",
    c1Title: "🌐 ยอดเข้าชมวันนี้",
    c1SubPrefix: "เทียบกับเมื่อวาน • 30 วัน:",
    c2Title: "🏢 สมาชิกองค์กร B2B",
    c2TodaySuffix: "วันนี้",
    c2SubSuffix: "องค์กรระดับ Diamond & Platinum VIP",
    c3Title: "👨‍💼 ผู้สมัครงานวันนี้",
    c3Unit: "เรซูเม่",
    c3SubPrefix: "ยอดสะสมทั้งหมด:",
    c3SubSuffix: "ใบสมัคร",
    c4Title: "🤖 สัมภาษณ์ AI เสร็จสิ้นวันนี้",
    c4Unit: "รอบ 24/7",
    c4Sub: "⚡ ความเร็วประเมินเรซูเม่ด้วย AI เฉลี่ย: 1.8 วินาที",
    footerTitle: "📊 ข้อมูลสถิติการใช้งานแพลตฟอร์มแบบเรียลไทม์ (REAL-TIME METRICS)",
    footerSub: "ความโปร่งใสด้านทราฟฟิกสำหรับผู้ลงโฆษณาแบนเนอร์ VIP และผู้หางานทั่วประเทศ",
    fOnline: "🟢 ออนไลน์",
    fToday: "📈 เข้าชมวันนี้",
    fB2b: "🏢 องค์กร B2B",
    fApps: "👨‍💼 ใบสมัครสะสม",
    fBtn: "📊 สถิติ 7 วัน →",
  },
  lo: {
    mainHeader: "📊 ສະຖິຕິການເຂົ້າຊົມລາຍວັນ, ການລົງທະບຽນວິສາຫະກິດ B2B ແລະ ຜູ້ສະໝັກວຽກສົດ",
    onlineNow: "🟢 ກຳລັງອອນລາຍ:",
    usersUnit: "ຄົນ",
    view7DaysBtn: "📈 ເບິ່ງກຣາຟ 7 ວັນ ແລະ ລາຍລະອຽດ →",
    c1Title: "🌐 ຍອດເຂົ້າຊົມມື້ນີ້",
    c1SubPrefix: "ທຽບກັບມື້ວານ • 30 ວັນ:",
    c2Title: "🏢 ສະມາຊິກວິສາຫະກິດ B2B",
    c2TodaySuffix: "ມື້ນີ້",
    c2SubSuffix: "ກຸ່ມບໍລິສັດ Diamond & Platinum VIP",
    c3Title: "👨‍💼 ຜູ້ສະໝັກວຽກມື້ນີ້",
    c3Unit: "ຊີວະປະຫວັດ",
    c3SubPrefix: "ລວມສະສົມທັງໝົດ:",
    c3SubSuffix: "ຄັ້ງສະໝັກ",
    c4Title: "🤖 ສຳພາດ AI ສຳເລັດມື້ນີ້",
    c4Unit: "ຄັ້ງ 24/7",
    c4Sub: "⚡ ຄວາມໄວໃຫ້ຄະແນນ CV ດ້ວຍ AI ສະເລ່ຍ: 1.8 ວິນາທີ",
    footerTitle: "📊 ຂໍ້ມູນສະຖິຕິການເຄື່ອນໄຫວອອນລາຍສົດ (REAL-TIME PORTAL METRICS)",
    footerSub: "ความໂປ່ງໃສດ້ານຜູ້ເຂົ້າຊົມສຳລັບຜູ້ລົງໂຄສະນາປ້າຍ VIP ແລະ ຜູ້ຊອກວຽກທົ່ວປະເທດ",
    fOnline: "🟢 ອອນລາຍ",
    fToday: "📈 ເຂົ້າຊົມມື້ນີ້",
    fB2b: "🏢 ສະມາຊິກ B2B",
    fApps: "👨‍💼 ຍອດສະໝັກວຽກ",
    fBtn: "📊 ລາຍລະອຽດ 7 ວັນ →",
  },
  km: {
    mainHeader: "📊 ស្ថិតិចូលមើលប្រចាំថ្ងៃ ការចុះឈ្មោះសហគ្រាស B2B និងបេក្ខជនដាក់ពាក្យផ្ទាល់",
    onlineNow: "🟢 កំពុងអនឡាញ៖",
    usersUnit: "នាក់",
    view7DaysBtn: "📈 មើលក្រាហ្វ 7 ថ្ងៃ និងព័ត៌មានលម្អិត →",
    c1Title: "🌐 ចំនួនចូលមើលថ្ងៃនេះ",
    c1SubPrefix: "ធៀបនឹងម្សិលមិញ • 30 ថ្ងៃ៖",
    c2Title: "🏢 សមាជិកសហគ្រាស B2B",
    c2TodaySuffix: "ថ្ងៃនេះ",
    c2SubSuffix: "សម្ព័ន្ធក្រុមហ៊ុន Diamond & Platinum VIP",
    c3Title: "👨‍💼 បេក្ខជនដាក់ពាក្យថ្ងៃនេះ",
    c3Unit: "ប្រវត្តិរូប CV",
    c3SubPrefix: "សរុបបង្គរ៖",
    c3SubSuffix: "ដង",
    c4Title: "🤖 សម្ភាសន៍ AI បញ្ចប់ថ្ងៃនេះ",
    c4Unit: "វគ្គ 24/7",
    c4Sub: "⚡ ល្បឿនវាយតម្លៃ CV ដោយ AI មធ្យម៖ 1.8 វិនាទី",
    footerTitle: "📊 ទិន្នន័យស្ថិតិសកម្មភាពអនឡាញផ្ទាល់ (REAL-TIME PORTAL METRICS)",
    footerSub: "តម្លាភាពចរាចរណ៍សម្រាប់ម្ចាស់ផ្ទាំងពាណិជ្ជកម្ម VIP និងបេក្ខជនទូទាំងប្រទេស",
    fOnline: "🟢 កំពុងអនឡាញ",
    fToday: "📈 ចូលមើលថ្ងៃនេះ",
    fB2b: "🏢 សមាជិក B2B",
    fApps: "👨‍💼 ចំនួនដាក់ពាក្យ",
    fBtn: "📊 លម្អិត 7 ថ្ងៃ →",
  },
};

function renderPublicTrafficTelemetryWidgets() {
  const st = publicTrafficStatsState;
  const tw = TRAFFIC_WIDGET_I18N[portalState.lang || "vi"] || TRAFFIC_WIDGET_I18N.vi;
  const mainBar = document.getElementById("public-live-traffic-bar");
  const footerBar = document.getElementById("footer-live-traffic-bar");

  if (mainBar) {
    mainBar.innerHTML = `
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-800/80 shadow-lg space-y-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="font-extrabold uppercase tracking-wider text-cyan-300">
              ${tw.mainHeader}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-[11px]">
              ${tw.onlineNow} ${Number(st.online_now || 342).toLocaleString()} ${tw.usersUnit}
            </span>
            <button onclick="openPublicTrafficStatsModal()"
              class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 font-bold text-[11px] transition">
              ${tw.view7DaysBtn}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <!-- Card 1: Lượt truy cập theo ngày -->
          <div onclick="openPublicTrafficStatsModal()" class="cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-[11px] text-blue-200/80 font-medium">${tw.c1Title}</div>
              <div class="text-xl font-extrabold text-white font-mono">${Number(st.today_visits || 14820).toLocaleString()}</div>
              <div class="text-[10px] text-emerald-300 font-semibold">
                ▲ +${st.daily_growth_pct || 6.2}% ${tw.c1SubPrefix} ${Number(st.total_visits_30d || 386400).toLocaleString()}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-lg shrink-0">
              📈
            </div>
          </div>

          <!-- Card 2: Lượt đăng ký thành viên Doanh nghiệp B2B -->
          <div onclick="openPublicTrafficStatsModal()" class="cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-[11px] text-blue-200/80 font-medium">${tw.c2Title}</div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-extrabold text-amber-300 font-mono">${Number(st.total_employer_members || 1486).toLocaleString()}</span>
                <span class="text-[11px] font-bold text-emerald-300">+${st.today_employer_registrations || 28} ${tw.c2TodaySuffix}</span>
              </div>
              <div class="text-[10px] text-amber-200/80 font-semibold">
                👑 ${st.vip_employer_members || 312} ${tw.c2SubSuffix}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-lg shrink-0">
              🏢
            </div>
          </div>

          <!-- Card 3: Lượt cá nhân ứng tuyển theo ngày -->
          <div onclick="openPublicTrafficStatsModal()" class="cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-[11px] text-blue-200/80 font-medium">${tw.c3Title}</div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-extrabold text-cyan-300 font-mono">+${Number(st.today_candidate_applications || 419).toLocaleString()}</span>
                <span class="text-[11px] text-blue-200">${tw.c3Unit}</span>
              </div>
              <div class="text-[10px] text-cyan-200/80 font-semibold">
                ${tw.c3SubPrefix} ${Number(st.total_candidate_applications || 48920).toLocaleString()} ${tw.c3SubSuffix}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-lg shrink-0">
              📄
            </div>
          </div>

          <!-- Card 4: Phỏng vấn AI & Kết nối thành công -->
          <div onclick="openPublicTrafficStatsModal()" class="cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-[11px] text-blue-200/80 font-medium">${tw.c4Title}</div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-extrabold text-emerald-300 font-mono">${Number(st.ai_interviews_completed_today || 184).toLocaleString()}</span>
                <span class="text-[11px] text-emerald-200">${tw.c4Unit}</span>
              </div>
              <div class="text-[10px] text-emerald-200/80 font-semibold">
                ${tw.c4Sub}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg shrink-0">
              ⚡
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (footerBar) {
    footerBar.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
          <div>
            <div class="font-extrabold text-white uppercase tracking-wider text-xs">
              ${tw.footerTitle}
            </div>
            <div class="text-[11px] text-blue-200/80">
              ${tw.footerSub}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
          <div class="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div class="text-[10px] text-cyan-300">${tw.fOnline}</div>
            <div class="text-sm font-extrabold text-white font-mono">${Number(st.online_now || 342).toLocaleString()}</div>
          </div>
          <div class="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div class="text-[10px] text-blue-200">${tw.fToday}</div>
            <div class="text-sm font-extrabold text-emerald-300 font-mono">${Number(st.today_visits || 14820).toLocaleString()}</div>
          </div>
          <div class="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div class="text-[10px] text-amber-300">${tw.fB2b}</div>
            <div class="text-sm font-extrabold text-white font-mono">${Number(st.total_employer_members || 1486).toLocaleString()} <span class="text-[10px] text-emerald-300">(+${st.today_employer_registrations || 28})</span></div>
          </div>
          <div class="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div class="text-[10px] text-cyan-200">${tw.fApps}</div>
            <div class="text-sm font-extrabold text-white font-mono">${Number(st.total_candidate_applications || 48920).toLocaleString()} <span class="text-[10px] text-emerald-300">(+${st.today_candidate_applications || 419})</span></div>
          </div>
        </div>

        <button onclick="openPublicTrafficStatsModal()"
          class="px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-extrabold text-xs shrink-0 transition">
          ${tw.fBtn}
        </button>
      </div>
    `;
  }
}

function openPublicTrafficStatsModal() {
  const st = publicTrafficStatsState;
  const history = Array.isArray(st.daily_history) ? st.daily_history : [];
  const maxVisits = Math.max(15000, ...history.map((d) => d.visits || 0));

  openPortalModal(`
    <div class="space-y-6 text-xs">
      <!-- Header -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-cyan-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>REAL-TIME MARKETPLACE TELEMETRY & SOCIAL PROOF</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white">
            📊 Thống kê Lượt truy cập theo ngày, Thành viên Doanh nghiệp & Cá nhân Ứng tuyển
          </h3>
          <p class="text-blue-200/90 text-xs leading-relaxed">
            Dữ liệu đo lường thời gian thực giúp <b>Ứng viên</b> nắm bắt sức nóng thị trường và giúp <b>Nhà Tuyển Dụng / Đối tác Quảng cáo VIP</b> đánh giá chính xác hiệu quả truyền thông (ROI & Traffic).
          </p>
        </div>
        <button onclick="closePortalModal()"
          class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs shrink-0 transition">
          Đóng cửa sổ
        </button>
      </div>

      <!-- 4 Top Live KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div class="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 space-y-1">
          <div class="text-[11px] font-bold text-blue-700 dark:text-blue-300">🌐 LƯỢT TRUY CẬP HÔM NAY</div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">${Number(st.today_visits || 14820).toLocaleString()}</div>
          <div class="text-[11px] text-emerald-600 font-semibold">▲ +${st.daily_growth_pct || 6.2}% so với hôm qua (${Number(st.yesterday_visits || 13950).toLocaleString()})</div>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 space-y-1">
          <div class="text-[11px] font-bold text-amber-800 dark:text-amber-300">🏢 ĐĂNG KÝ DOANH NGHIỆP B2B</div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">${Number(st.total_employer_members || 1486).toLocaleString()}</div>
          <div class="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">+${st.today_employer_registrations || 28} Doanh nghiệp mới hôm nay</div>
        </div>

        <div class="p-4 rounded-2xl bg-teal-50/80 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-1">
          <div class="text-[11px] font-bold text-teal-800 dark:text-teal-300">👨‍💼 CÁ NHÂN ỨNG TUYỂN HÔM NAY</div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">+${Number(st.today_candidate_applications || 419).toLocaleString()}</div>
          <div class="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">Tổng tích lũy: ${Number(st.total_candidate_applications || 48920).toLocaleString()} hồ sơ</div>
        </div>

        <div class="p-4 rounded-2xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 space-y-1">
          <div class="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">🟢 ĐANG TRỰC TUYẾN & AI</div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">${Number(st.online_now || 342).toLocaleString()} online</div>
          <div class="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">${st.ai_interviews_completed_today || 184} phiên phỏng vấn AI hôm nay</div>
        </div>
      </div>

      <!-- 7-Day Daily Breakdown Table & Visual Bars -->
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 class="text-sm font-extrabold text-slate-900 dark:text-white">📅 Biểu đồ Thống kê Chi tiết 7 Ngày Gần Nhất</h4>
            <p class="text-[11px] text-slate-500">Theo dõi đồng thời 3 chỉ số cốt lõi: Lượt truy cập (Visits) • Doanh nghiệp đăng ký mới (B2B) • Lượt Cá nhân nộp CV ứng tuyển</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
            Tổng 30 ngày: ${Number(st.total_visits_30d || 386400).toLocaleString()} lượt truy cập
          </span>
        </div>

        <div class="space-y-2.5">
          ${history
            .map((row, idx) => {
              const pct = Math.min(100, Math.round(((row.visits || 10000) / maxVisits) * 100));
              const isToday = idx === history.length - 1;
              return `
                <div class="p-3 rounded-xl ${
                  isToday
                    ? "bg-blue-50/90 dark:bg-slate-900 border-2 border-blue-500 shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700"
                } grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div class="md:col-span-3 flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">${row.date}</span>
                    <span class="font-bold text-slate-800 dark:text-white">${row.label}</span>
                  </div>
                  <div class="md:col-span-5 space-y-1">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-slate-500">Lưu lượng truy cập</span>
                      <span class="font-mono font-extrabold text-blue-700 dark:text-blue-400">${Number(row.visits).toLocaleString()} lượt</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400" style="width: ${pct}%"></div>
                    </div>
                  </div>
                  <div class="md:col-span-2 text-right font-mono">
                    <span class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200/70 font-bold text-[11px]">
                      🏢 +${row.employers} DN B2B
                    </span>
                  </div>
                  <div class="md:col-span-2 text-right font-mono">
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 font-bold text-[11px]">
                      👨‍💼 +${row.applications} CV nộp
                    </span>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- Interactive Real-Time Counter Verification Bar -->
      <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="font-extrabold text-slate-900 dark:text-white text-xs">⚡ Kiểm thử Ghi nhận Sự kiện Thời gian thực (Live Event Tracking)</div>
          <div class="text-[11px] text-slate-600 dark:text-slate-300">Mỗi khi có người truy cập, Doanh nghiệp mở tài khoản hoặc Ứng viên nộp CV, hệ thống tự động cộng dồn tức thì:</div>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button onclick="recordPublicTrafficEvent('visit', true)"
            class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition">
            +1 Lượt truy cập
          </button>
          <button onclick="recordPublicTrafficEvent('employer_register', true)"
            class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition">
            +1 Doanh nghiệp Đăng ký
          </button>
          <button onclick="recordPublicTrafficEvent('candidate_apply', true)"
            class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition">
            +1 Cá nhân Ứng tuyển
          </button>
        </div>
      </div>
    </div>
  `, () => openPublicTrafficStatsModal());
}

window.addEventListener("DOMContentLoaded", () => {
  loadMarketplaceData();
  localizePublicFooterAndTopBar();
  loadAndRenderPublicAdBanners();
  loadAndRenderPublicTrafficStats();
});




