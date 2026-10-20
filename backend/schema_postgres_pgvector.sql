-- HireMind AI - PostgreSQL 16 + pgvector Schema with Multi-tenant Row-Level Security (RLS)
-- Tuân thủ Nghị định 13/2023/NĐ-CP & Kiến trúc Đa khách hàng (Multi-tenant)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Organizations (Multi-tenant root)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    industry TEXT DEFAULT 'Technology / FDI',
    plan_tier TEXT DEFAULT 'Growth',
    default_language TEXT DEFAULT 'vi',
    supported_languages JSONB DEFAULT '["vi", "en", "ja", "ko", "zh"]'::jsonb,
    blind_screening_default BOOLEAN DEFAULT FALSE,
    data_retention_months INTEGER DEFAULT 12,
    zalo_oa_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Roles & Users
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'recruiter', -- admin, recruiter, hiring_manager, super_admin
    preferred_language TEXT DEFAULT 'vi',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs (JD, Rubric, Ngôn ngữ, Trọng số chấm điểm)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Full-time',
    salary_range TEXT,
    language TEXT DEFAULT 'vi',
    report_languages JSONB DEFAULT '["vi", "en"]'::jsonb,
    status TEXT DEFAULT 'open', -- draft, open, paused, closed
    jd_Text TEXT NOT NULL,
    must_have_skills JSONB DEFAULT '[]'::jsonb,
    nice_to_have_skills JSONB DEFAULT '[]'::jsonb,
    min_experience_years REAL DEFAULT 1.0,
    rubric_config JSONB NOT NULL,
    scoring_weights JSONB DEFAULT '{"must_have": 0.40, "semantic": 0.35, "experience": 0.25}'::jsonb,
    interview_questions JSONB DEFAULT '[]'::jsonb,
    blind_mode BOOLEAN DEFAULT FALSE,
    jd_embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Candidates & Applications
CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    masked_code TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    zalo_phone TEXT,
    gender TEXT,
    birth_year INTEGER,
    location TEXT,
    source TEXT DEFAULT 'Direct Career Page', -- TopCV, VietnamWorks, LinkedIn, Referral, Direct
    preferred_language TEXT DEFAULT 'vi',
    content_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    stage TEXT DEFAULT 'screening', -- new, screening, interview, offer, hired, rejected
    overall_score REAL DEFAULT 0,
    human_override_score REAL,
    human_override_by TEXT,
    human_override_note TEXT,
    duplicate_of_candidate_id TEXT,
    prompt_injection_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Resumes (File, Parsed JSON, Vector Embedding)
CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    raw_text TEXT NOT NULL,
    parsed_json JSONB NOT NULL,
    cv_embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Screening Results (Điểm, Giải thích đa ngôn ngữ, Truy vết Model/Prompt version)
CREATE TABLE IF NOT EXISTS screening_results (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    total_score REAL NOT NULL,
    must_have_score REAL NOT NULL,
    semantic_score REAL NOT NULL,
    experience_score REAL NOT NULL,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    explanations_i18n JSONB NOT NULL,
    extracted_highlights JSONB DEFAULT '[]'::jsonb,
    security_warnings JSONB DEFAULT '[]'::jsonb,
    model_version TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    estimated_cost_usd REAL DEFAULT 0.008,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Interviews & Interview Turns
CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_type TEXT DEFAULT 'voice_async', -- text, voice_async, video_livekit
    language TEXT DEFAULT 'vi',
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    invite_token TEXT UNIQUE NOT NULL,
    zalo_invited BOOLEAN DEFAULT TRUE,
    tab_switch_count INTEGER DEFAULT 0,
    paste_event_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_turns (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    interview_id TEXT NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    turn_index INTEGER NOT NULL,
    competency TEXT NOT NULL,
    question_text TEXT NOT NULL,
    is_follow_up BOOLEAN DEFAULT FALSE,
    answer_transcript TEXT,
    audio_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    ai_turn_score REAL,
    ai_turn_feedback TEXT,
    evidence_quote TEXT,
    guardrail_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Evaluations (Rubric Scores, Báo cáo Đa ngôn ngữ, Human Override)
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_id TEXT REFERENCES interviews(id) ON DELETE SET NULL,
    rubric_scores JSONB NOT NULL,
    overall_interview_score REAL NOT NULL,
    recommendation TEXT NOT NULL, -- strong_hire, hire, consider, reject
    summary_i18n JSONB NOT NULL,
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,
    evidence_quotes JSONB NOT NULL,
    next_round_questions JSONB NOT NULL,
    override_score REAL,
    override_reason TEXT,
    override_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Consents (Tuân thủ Nghị định 13/2023/NĐ-CP & GDPR) & Audit Logs
CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    consent_cv_processing BOOLEAN NOT NULL DEFAULT TRUE,
    consent_audio_video_recording BOOLEAN NOT NULL DEFAULT TRUE,
    consent_ai_evaluation BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    retention_expires_at TIMESTAMPTZ,
    consented_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row-Level Security (RLS) cô lập dữ liệu Multi-tenant theo org_id
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_jobs ON jobs
    USING (org_id = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_candidates ON candidates
    USING (org_id = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_applications ON applications
    USING (org_id = current_setting('app.current_org_id', TRUE));
