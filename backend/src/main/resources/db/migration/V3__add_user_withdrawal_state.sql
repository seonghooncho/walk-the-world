ALTER TABLE users
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active',
    ADD COLUMN withdrawn_at TIMESTAMP NULL;

ALTER TABLE users
    ADD CONSTRAINT chk_users_status CHECK (status IN ('active', 'withdrawn'));

CREATE INDEX idx_users_status ON users (status);
