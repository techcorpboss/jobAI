import os
import re
import sqlite3
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(ENV_PATH)

DB_ENGINE = os.getenv("DB_ENGINE", "mysql").strip().lower()
DB_HOST = os.getenv("DB_HOST", "localhost").strip()
DB_PORT = int(os.getenv("DB_PORT", "3306").strip() or "3306")
DB_USER = os.getenv("DB_USER", "root").strip()
DB_PASSWORD = os.getenv("DB_PASSWORD", "root123@").strip()
DB_NAME = os.getenv("DB_NAME", "jobai_db").strip()

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "hiremind_vn.db")
SQL_DUMP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "jobai_mysql.sql")

MYSQL_TABLES_DDL: List[Tuple[str, str]] = [
    (
        "organizations",
        """CREATE TABLE IF NOT EXISTS `organizations` (
            `id` VARCHAR(191) PRIMARY KEY,
            `name` VARCHAR(500) NOT NULL,
            `slug` VARCHAR(191) NOT NULL,
            `industry` VARCHAR(500),
            `plan_tier` VARCHAR(191),
            `default_language` VARCHAR(32),
            `supported_languages` LONGTEXT,
            `blind_screening_default` INT DEFAULT 0,
            `data_retention_months` INT DEFAULT 12,
            `zalo_oa_enabled` INT DEFAULT 1,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "users",
        """CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `full_name` VARCHAR(255) NOT NULL,
            `role` VARCHAR(100) NOT NULL,
            `preferred_language` VARCHAR(32) DEFAULT 'vi',
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "jobs",
        """CREATE TABLE IF NOT EXISTS `jobs` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `title` VARCHAR(500) NOT NULL,
            `department` VARCHAR(255) NOT NULL,
            `location` VARCHAR(255) NOT NULL,
            `employment_type` VARCHAR(100) DEFAULT 'Full-time',
            `salary_range` VARCHAR(255),
            `language` VARCHAR(32) DEFAULT 'vi',
            `report_languages` LONGTEXT,
            `status` VARCHAR(64) DEFAULT 'open',
            `jd_text` LONGTEXT NOT NULL,
            `must_have_skills` LONGTEXT,
            `nice_to_have_skills` LONGTEXT,
            `min_experience_years` DOUBLE DEFAULT 1.0,
            `rubric_config` LONGTEXT,
            `scoring_weights` LONGTEXT,
            `interview_questions` LONGTEXT,
            `blind_mode` INT DEFAULT 0,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "candidates",
        """CREATE TABLE IF NOT EXISTS `candidates` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `full_name` VARCHAR(255) NOT NULL,
            `masked_code` VARCHAR(100) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64),
            `zalo_phone` VARCHAR(64),
            `gender` VARCHAR(32),
            `birth_year` INT,
            `location` VARCHAR(255),
            `source` VARCHAR(255),
            `preferred_language` VARCHAR(32) DEFAULT 'vi',
            `content_hash` VARCHAR(191),
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "applications",
        """CREATE TABLE IF NOT EXISTS `applications` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `job_id` VARCHAR(191) NOT NULL,
            `candidate_id` VARCHAR(191) NOT NULL,
            `stage` VARCHAR(64) DEFAULT 'screening',
            `overall_score` DOUBLE DEFAULT 0,
            `human_override_score` DOUBLE,
            `human_override_by` VARCHAR(255),
            `human_override_note` LONGTEXT,
            `duplicate_of_candidate_id` VARCHAR(191),
            `prompt_injection_flagged` INT DEFAULT 0,
            `created_at` VARCHAR(64),
            `updated_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "resumes",
        """CREATE TABLE IF NOT EXISTS `resumes` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `candidate_id` VARCHAR(191) NOT NULL,
            `file_name` VARCHAR(500) NOT NULL,
            `raw_text` LONGTEXT NOT NULL,
            `parsed_json` LONGTEXT NOT NULL,
            `cv_embedding` LONGTEXT,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "screening_results",
        """CREATE TABLE IF NOT EXISTS `screening_results` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `application_id` VARCHAR(191) NOT NULL,
            `total_score` DOUBLE NOT NULL,
            `must_have_score` DOUBLE NOT NULL,
            `semantic_score` DOUBLE NOT NULL,
            `experience_score` DOUBLE NOT NULL,
            `matched_skills` LONGTEXT,
            `missing_skills` LONGTEXT,
            `explanations_i18n` LONGTEXT,
            `extracted_highlights` LONGTEXT,
            `security_warnings` LONGTEXT,
            `model_version` VARCHAR(191),
            `prompt_version` VARCHAR(191),
            `estimated_cost_usd` DOUBLE DEFAULT 0.008,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "interviews",
        """CREATE TABLE IF NOT EXISTS `interviews` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `application_id` VARCHAR(191) NOT NULL,
            `interview_type` VARCHAR(64) DEFAULT 'voice_async',
            `language` VARCHAR(32) DEFAULT 'vi',
            `status` VARCHAR(64) DEFAULT 'pending',
            `invite_token` VARCHAR(191) UNIQUE NOT NULL,
            `zalo_invited` INT DEFAULT 1,
            `tab_switch_count` INT DEFAULT 0,
            `paste_event_count` INT DEFAULT 0,
            `started_at` VARCHAR(64),
            `completed_at` VARCHAR(64),
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "interview_turns",
        """CREATE TABLE IF NOT EXISTS `interview_turns` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `interview_id` VARCHAR(191) NOT NULL,
            `turn_index` INT NOT NULL,
            `competency` VARCHAR(191) NOT NULL,
            `question_text` LONGTEXT NOT NULL,
            `is_follow_up` INT DEFAULT 0,
            `answer_transcript` LONGTEXT,
            `duration_seconds` INT DEFAULT 0,
            `ai_turn_score` DOUBLE,
            `ai_turn_feedback` LONGTEXT,
            `evidence_quote` LONGTEXT,
            `guardrail_passed` INT DEFAULT 1,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "evaluations",
        """CREATE TABLE IF NOT EXISTS `evaluations` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `application_id` VARCHAR(191) NOT NULL,
            `interview_id` VARCHAR(191),
            `rubric_scores` LONGTEXT NOT NULL,
            `overall_interview_score` DOUBLE NOT NULL,
            `recommendation` VARCHAR(191) NOT NULL,
            `summary_i18n` LONGTEXT NOT NULL,
            `strengths` LONGTEXT NOT NULL,
            `weaknesses` LONGTEXT NOT NULL,
            `evidence_quotes` LONGTEXT NOT NULL,
            `next_round_questions` LONGTEXT NOT NULL,
            `override_score` DOUBLE,
            `override_reason` LONGTEXT,
            `override_by` VARCHAR(255),
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "consents",
        """CREATE TABLE IF NOT EXISTS `consents` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `candidate_id` VARCHAR(191) NOT NULL,
            `consent_cv_processing` INT DEFAULT 1,
            `consent_audio_video_recording` INT DEFAULT 1,
            `consent_ai_evaluation` INT DEFAULT 1,
            `ip_address` VARCHAR(191),
            `retention_expires_at` VARCHAR(64),
            `consented_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "audit_logs",
        """CREATE TABLE IF NOT EXISTS `audit_logs` (
            `id` VARCHAR(191) PRIMARY KEY,
            `org_id` VARCHAR(191) NOT NULL,
            `actor_name` VARCHAR(255) NOT NULL,
            `actor_role` VARCHAR(100) NOT NULL,
            `action` VARCHAR(191) NOT NULL,
            `entity_type` VARCHAR(100) NOT NULL,
            `entity_id` VARCHAR(191) NOT NULL,
            `details` LONGTEXT,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "hr_requisitions",
        """CREATE TABLE IF NOT EXISTS `hr_requisitions` (
            `id` VARCHAR(191) PRIMARY KEY,
            `title` VARCHAR(500) NOT NULL,
            `department` VARCHAR(255) NOT NULL,
            `requester` VARCHAR(255) NOT NULL,
            `headcount` INT DEFAULT 1,
            `filled` INT DEFAULT 0,
            `priority` VARCHAR(64) DEFAULT 'high',
            `budget_band` VARCHAR(255),
            `reason` LONGTEXT,
            `approval_status` VARCHAR(64) DEFAULT 'pending_cfo',
            `approvers_json` LONGTEXT,
            `target_date` VARCHAR(64),
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "hr_schedules",
        """CREATE TABLE IF NOT EXISTS `hr_schedules` (
            `id` VARCHAR(191) PRIMARY KEY,
            `candidate_name` VARCHAR(255) NOT NULL,
            `job_title` VARCHAR(500) NOT NULL,
            `round_name` VARCHAR(255) NOT NULL,
            `interview_time` VARCHAR(191) NOT NULL,
            `mode` VARCHAR(255),
            `panelists_json` LONGTEXT,
            `zalo_reminder_sent` INT DEFAULT 1,
            `status` VARCHAR(64) DEFAULT 'confirmed',
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "hr_offers",
        """CREATE TABLE IF NOT EXISTS `hr_offers` (
            `id` VARCHAR(191) PRIMARY KEY,
            `candidate_name` VARCHAR(255) NOT NULL,
            `job_title` VARCHAR(500) NOT NULL,
            `base_salary_vnd` BIGINT DEFAULT 45000000,
            `market_median_vnd` BIGINT DEFAULT 43000000,
            `ai_compa_ratio` DOUBLE DEFAULT 104.6,
            `bonus_structure` LONGTEXT,
            `probation_policy` LONGTEXT,
            `start_date` VARCHAR(64),
            `status` VARCHAR(64) DEFAULT 'sent_waiting_sign',
            `onboarding_tasks_json` LONGTEXT,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "hr_talent_pool",
        """CREATE TABLE IF NOT EXISTS `hr_talent_pool` (
            `id` VARCHAR(191) PRIMARY KEY,
            `full_name` VARCHAR(255) NOT NULL,
            `previous_role` VARCHAR(500),
            `languages_json` LONGTEXT,
            `skills_json` LONGTEXT,
            `ai_rediscovery_match` DOUBLE DEFAULT 85.0,
            `matched_job` VARCHAR(500),
            `note` LONGTEXT,
            `consent_valid_until` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "saas_tenants",
        """CREATE TABLE IF NOT EXISTS `saas_tenants` (
            `id` VARCHAR(191) PRIMARY KEY,
            `company_name` VARCHAR(500) NOT NULL,
            `tax_id` VARCHAR(100),
            `country` VARCHAR(191),
            `industry` VARCHAR(255),
            `company_size` VARCHAR(191),
            `address` VARCHAR(500),
            `website` VARCHAR(255),
            `subdomain` VARCHAR(191),
            `plan` VARCHAR(191),
            `vip_tier` VARCHAR(100),
            `billing_cycle` VARCHAR(100),
            `mrr_usd` INT DEFAULT 790,
            `active_jobs` INT DEFAULT 0,
            `total_candidates` INT DEFAULT 0,
            `ai_quota_limit` INT DEFAULT 200000,
            `ai_quota_used` INT DEFAULT 0,
            `rls_isolation` VARCHAR(255),
            `sso_provider` VARCHAR(255),
            `status` VARCHAR(64) DEFAULT 'active',
            `admin_name` VARCHAR(255),
            `admin_title` VARCHAR(255),
            `admin_email` VARCHAR(255),
            `admin_phone` VARCHAR(64),
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "portal_users",
        """CREATE TABLE IF NOT EXISTS `portal_users` (
            `id` VARCHAR(191) PRIMARY KEY,
            `role` VARCHAR(64) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `password` VARCHAR(255) DEFAULT '123456',
            `full_name` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64),
            `org_id` VARCHAR(191) DEFAULT '',
            `company_name` VARCHAR(500) DEFAULT '',
            `country` VARCHAR(191) DEFAULT '🇻🇳 Việt Nam',
            `subdomain` VARCHAR(191) DEFAULT '',
            `location` VARCHAR(255) DEFAULT 'TP. Hồ Chí Minh',
            `target_title` VARCHAR(500) DEFAULT '',
            `salary_expectation` VARCHAR(255) DEFAULT '',
            `preferred_sector` VARCHAR(255) DEFAULT '',
            `experience_years` DOUBLE DEFAULT 5.0,
            `vip_tier` VARCHAR(100) DEFAULT 'CAND_VERIFIED',
            `verified_kyc` INT DEFAULT 1,
            `status` VARCHAR(64) DEFAULT 'active',
            `created_at` VARCHAR(64),
            `last_login` VARCHAR(64),
            `skills_json` LONGTEXT,
            `bio_cv_text` LONGTEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "recruitment_locations",
        """CREATE TABLE IF NOT EXISTS `recruitment_locations` (
            `id` VARCHAR(191) PRIMARY KEY,
            `code` VARCHAR(100) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `region_group` VARCHAR(191),
            `industrial_zone` VARCHAR(500),
            `work_mode` VARCHAR(191),
            `country` VARCHAR(191) DEFAULT 'Việt Nam',
            `is_default` INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "ad_banners",
        """CREATE TABLE IF NOT EXISTS `ad_banners` (
            `id` VARCHAR(191) PRIMARY KEY,
            `title` VARCHAR(500) NOT NULL,
            `subtitle` LONGTEXT,
            `company_name` VARCHAR(500),
            `org_id` VARCHAR(191),
            `vip_tier` VARCHAR(100),
            `placement` VARCHAR(100),
            `image_url` LONGTEXT,
            `link_type` VARCHAR(100),
            `target_url` LONGTEXT,
            `facebook_url` LONGTEXT,
            `cta_text` VARCHAR(255),
            `badge_text` VARCHAR(255),
            `theme_color` VARCHAR(100),
            `active` INT DEFAULT 1,
            `priority_order` INT DEFAULT 1,
            `impressions` INT DEFAULT 100,
            `clicks` INT DEFAULT 10,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "portal_telemetry",
        """CREATE TABLE IF NOT EXISTS `portal_telemetry` (
            `key` VARCHAR(191) PRIMARY KEY,
            `payload_json` LONGTEXT NOT NULL,
            `updated_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "job_categories",
        """CREATE TABLE IF NOT EXISTS `job_categories` (
            `id` VARCHAR(191) PRIMARY KEY,
            `code` VARCHAR(191) NOT NULL,
            `name` VARCHAR(500) NOT NULL,
            `icon` VARCHAR(64) DEFAULT '💼',
            `salary_benchmark` VARCHAR(255) DEFAULT '35 - 80 Triệu VNĐ',
            `level_group` VARCHAR(255) DEFAULT 'Manager / Senior Lead',
            `ai_weights_json` LONGTEXT,
            `core_skills_json` LONGTEXT,
            `description` LONGTEXT,
            `featured` INT DEFAULT 1,
            `status` VARCHAR(64) DEFAULT 'active',
            `sort_order` INT DEFAULT 1,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "system_notifications",
        """CREATE TABLE IF NOT EXISTS `system_notifications` (
            `id` VARCHAR(191) PRIMARY KEY,
            `category` VARCHAR(100) NOT NULL,
            `severity` VARCHAR(64) DEFAULT 'info',
            `title` VARCHAR(500) NOT NULL,
            `message` LONGTEXT NOT NULL,
            `action_source` VARCHAR(255) DEFAULT 'system',
            `entity_id` VARCHAR(191) DEFAULT '',
            `steps_json` LONGTEXT,
            `is_read` INT DEFAULT 0,
            `created_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "rbac_roles",
        """CREATE TABLE IF NOT EXISTS `rbac_roles` (
            `id` VARCHAR(191) PRIMARY KEY,
            `code` VARCHAR(100) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `badge_color` VARCHAR(64) DEFAULT 'blue',
            `description` LONGTEXT,
            `data_scope` VARCHAR(100) DEFAULT 'OWN_TENANT',
            `allowed_tabs_json` LONGTEXT NOT NULL,
            `permissions_json` LONGTEXT NOT NULL,
            `is_system` INT DEFAULT 0,
            `status` VARCHAR(64) DEFAULT 'active',
            `updated_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
    (
        "user_role_assignments",
        """CREATE TABLE IF NOT EXISTS `user_role_assignments` (
            `user_id` VARCHAR(191) PRIMARY KEY,
            `role_id` VARCHAR(191) NOT NULL,
            `assigned_by` VARCHAR(255) DEFAULT 'System',
            `updated_at` VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
    ),
]


def _sql_escape_val(v: Any) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    s = s.replace("\\", "\\\\").replace("'", "\\'").replace("\r", "\\r").replace("\n", "\\n")
    return f"'{s}'"


def provision_and_sync_mysql(export_sql_dump: bool = True) -> Dict[str, Any]:
    """
    1. Creates MySQL database `jobai_db` (if MySQL is reachable).
    2. Creates all 25 tables in MySQL `jobai_db`.
    3. Migrates/Syncs all rows from SQLite (`hiremind_vn.db`) into MySQL (`jobai_db`).
    4. Exports `database/jobai_mysql.sql` for local & Ubuntu server deployment.
    """
    sqlite_rows_by_table: Dict[str, Tuple[List[str], List[Tuple[Any, ...]]]] = {}
    if os.path.exists(SQLITE_PATH):
        s_conn = sqlite3.connect(SQLITE_PATH)
        s_cur = s_conn.cursor()
        for tbl_name, _ in MYSQL_TABLES_DDL:
            try:
                s_cur.execute(f"SELECT * FROM `{tbl_name}`")
                cols = [d[0] for d in s_cur.description]
                rows = s_cur.fetchall()
                sqlite_rows_by_table[tbl_name] = (cols, rows)
            except Exception:
                sqlite_rows_by_table[tbl_name] = ([], [])
        s_conn.close()

    # Export SQL dump file (`database/jobai_mysql.sql`)
    if export_sql_dump:
        os.makedirs(os.path.dirname(SQL_DUMP_PATH), exist_ok=True)
        lines: List[str] = [
            "-- =============================================================================",
            f"-- TECHCORP HIREMIND AI (JOBAI) — FULL MYSQL DATABASE SCHEMA & SEED ({DB_NAME})",
            "-- Compatible with MySQL 5.7 / 8.0 / 9.x & MariaDB 10.x+ (Local & Ubuntu aaPanel)",
            "-- =============================================================================",
            "SET NAMES utf8mb4;",
            "SET FOREIGN_KEY_CHECKS = 0;",
            "",
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            f"USE `{DB_NAME}`;",
            "",
        ]
        for tbl_name, ddl in MYSQL_TABLES_DDL:
            lines.append(f"-- Table: {tbl_name}")
            lines.append(ddl)
            cols, rows = sqlite_rows_by_table.get(tbl_name, ([], []))
            if cols and rows:
                col_list = ", ".join(f"`{c}`" for c in cols)
                for r in rows:
                    vals = ", ".join(_sql_escape_val(v) for v in r)
                    lines.append(f"REPLACE INTO `{tbl_name}` ({col_list}) VALUES ({vals});")
            lines.append("")
        lines.append("SET FOREIGN_KEY_CHECKS = 1;")
        with open(SQL_DUMP_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

    # Connect to MySQL server & sync
    try:
        import pymysql

        root_conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset="utf8mb4",
            autocommit=True,
            connect_timeout=4,
        )
        with root_conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            cur.execute(f"USE `{DB_NAME}`;")
            total_synced_rows = 0
            for tbl_name, ddl in MYSQL_TABLES_DDL:
                cur.execute(ddl)
                cols, rows = sqlite_rows_by_table.get(tbl_name, ([], []))
                if cols and rows:
                    # Only seed if MySQL table is empty or has fewer rows than SQLite
                    cur.execute(f"SELECT COUNT(*) FROM `{tbl_name}`")
                    existing_cnt = cur.fetchone()[0]
                    if existing_cnt < len(rows):
                        col_list = ", ".join(f"`{c}`" for c in cols)
                        placeholders = ", ".join(["%s"] * len(cols))
                        cur.executemany(
                            f"REPLACE INTO `{tbl_name}` ({col_list}) VALUES ({placeholders})",
                            rows,
                        )
                        total_synced_rows += len(rows)
                    else:
                        total_synced_rows += existing_cnt
        root_conn.close()
        return {
            "status": "connected",
            "engine": "mysql",
            "host": f"{DB_HOST}:{DB_PORT}",
            "database": DB_NAME,
            "tables_count": len(MYSQL_TABLES_DDL),
            "total_rows": total_synced_rows,
            "sql_dump": SQL_DUMP_PATH,
        }
    except Exception as exc:
        return {
            "status": "fallback_sqlite",
            "engine": "sqlite",
            "database": DB_NAME,
            "error": str(exc),
            "sql_dump": SQL_DUMP_PATH,
        }


if __name__ == "__main__":
    res = provision_and_sync_mysql(export_sql_dump=True)
    print("MySQL Provision Result:", res)
