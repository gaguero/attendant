-- Create user_role enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'CONCIERGE', 'VIEWER');

-- Create guest_status enum  
CREATE TYPE guest_status AS ENUM ('ACTIVE', 'INACTIVE', 'VIP', 'BLACKLISTED');

-- Create vendor_category enum
CREATE TYPE vendor_category AS ENUM ('FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'MAINTENANCE', 'OTHER');

-- Create users table with all required columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role user_role NOT NULL DEFAULT 'STAFF',
    
    -- Contact & address fields
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_or_province TEXT,
    postal_code TEXT,
    country TEXT,
    
    -- Profile & preferences
    preferences JSONB,
    notes TEXT,
    theme TEXT,
    bio TEXT,
    avatarUrl TEXT,
    
    -- Supabase Auth integration
    auth_id TEXT UNIQUE, -- Supabase auth.users.id
    password_hash TEXT, -- bcrypt hashed password
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    date_of_birth TIMESTAMP(3),
    
    -- Address fields
    addressLine1 TEXT,
    addressLine2 TEXT,
    city TEXT,
    stateOrProvince TEXT,
    postalCode TEXT,
    country TEXT,
    
    preferences JSONB,
    external_booking_ids TEXT[] DEFAULT '{}',
    notes TEXT,
    status guest_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Relationships
    created_by_id UUID NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    category vendor_category NOT NULL DEFAULT 'OTHER',
    services_offered TEXT[] DEFAULT '{}',
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    phone TEXT,
    email TEXT,
    website TEXT,
    notes TEXT,
    
    -- Relationships
    created_by_id UUID NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMP(3) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    "newData" JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trigger for updated_at on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_created_by_id ON guests(created_by_id);
CREATE INDEX IF NOT EXISTS idx_vendors_created_by_id ON vendors(created_by_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);