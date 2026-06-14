-- 0001_core_identity.sql
-- Initial PostgreSQL schema for account, character, quest, faction, reputation,
-- and audit-log persistence described in docs/design/persistent-world-project.md.

BEGIN;

CREATE TABLE accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_cdkey_hash TEXT NOT NULL UNIQUE,
    player_name TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    ban_reason TEXT,
    CONSTRAINT accounts_public_cdkey_hash_not_blank CHECK (length(trim(public_cdkey_hash)) > 0),
    CONSTRAINT accounts_player_name_not_blank CHECK (length(trim(player_name)) > 0)
);

CREATE TABLE characters (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    bic_filename TEXT NOT NULL,
    character_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    level INTEGER NOT NULL DEFAULT 1,
    is_retired BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT characters_bic_filename_not_blank CHECK (length(trim(bic_filename)) > 0),
    CONSTRAINT characters_character_name_not_blank CHECK (length(trim(character_name)) > 0),
    CONSTRAINT characters_level_valid CHECK (level BETWEEN 1 AND 40),
    CONSTRAINT characters_account_bic_unique UNIQUE (account_id, bic_filename)
);

CREATE TABLE character_quest_state (
    character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    state TEXT NOT NULL,
    progress_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (character_id, quest_id),
    CONSTRAINT character_quest_state_quest_id_not_blank CHECK (length(trim(quest_id)) > 0),
    CONSTRAINT character_quest_state_state_not_blank CHECK (length(trim(state)) > 0),
    CONSTRAINT character_quest_state_progress_object CHECK (jsonb_typeof(progress_json) = 'object')
);

CREATE TABLE factions (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT,
    CONSTRAINT factions_id_not_blank CHECK (length(trim(id)) > 0),
    CONSTRAINT factions_display_name_not_blank CHECK (length(trim(display_name)) > 0)
);

CREATE TABLE character_reputation (
    character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    faction_id TEXT NOT NULL REFERENCES factions(id) ON DELETE RESTRICT,
    reputation INTEGER NOT NULL DEFAULT 0,
    rank TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (character_id, faction_id)
);

CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
    actor_character_id BIGINT REFERENCES characters(id) ON DELETE SET NULL,
    actor_dm_name TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT audit_log_action_not_blank CHECK (length(trim(action)) > 0),
    CONSTRAINT audit_log_details_object CHECK (jsonb_typeof(details_json) = 'object'),
    CONSTRAINT audit_log_actor_present CHECK (
        actor_account_id IS NOT NULL
        OR actor_character_id IS NOT NULL
        OR actor_dm_name IS NOT NULL
    )
);

CREATE INDEX idx_characters_account_id ON characters(account_id);
CREATE INDEX idx_character_quest_state_quest_id ON character_quest_state(quest_id);
CREATE INDEX idx_character_reputation_faction_id ON character_reputation(faction_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_actor_account_id ON audit_log(actor_account_id);
CREATE INDEX idx_audit_log_actor_character_id ON audit_log(actor_character_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);

COMMIT;
