-- Separate migration script for explicit upgrade
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;

DO $$ BEGIN
    CREATE TYPE otp_purpose AS ENUM ('PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_status AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    purpose otp_purpose NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    verified_at TIMESTAMP WITH TIME ZONE,
    status otp_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_phone_status ON otp_challenges(phone_number, status);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires ON otp_challenges(expires_at) WHERE status = 'PENDING';

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
CREATE INDEX IF NOT EXISTS idx_checkins_processing_status ON checkins(processing_status);

DO $$ BEGIN
    CREATE TYPE sms_status AS ENUM ('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'RESPONDED', 'FAILED', 'EXPIRED', 'ESCALATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sms_message_type AS ENUM ('DISTRESS_CHECKIN', 'MOTIVATIONAL', 'INFORMATIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_sms_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    checkin_id UUID REFERENCES checkins(id) ON DELETE SET NULL,
    score_id UUID REFERENCES scores(id) ON DELETE SET NULL,
    message_type sms_message_type NOT NULL,
    message_body VARCHAR(1000),
    provider_message_id VARCHAR(255),
    status sms_status NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_text VARCHAR(500),
    response_type VARCHAR(50),
    follow_up_due_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sms_events_phone_status ON user_sms_events(phone_number, status);
CREATE INDEX IF NOT EXISTS idx_user_sms_events_follow_up ON user_sms_events(status, follow_up_due_at) WHERE status = 'SENT';
CREATE INDEX IF NOT EXISTS idx_user_sms_events_victim_type ON user_sms_events(victim_id, message_type);

DROP TRIGGER IF EXISTS trg_user_sms_events_updated_at ON user_sms_events;
CREATE TRIGGER trg_user_sms_events_updated_at
    BEFORE UPDATE ON user_sms_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

