-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     role VARCHAR(50) DEFAULT 'customer',
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );
CREATE TABLE customers (
    -- Use BIGINT for high-scale apps, or INT if you expect < 2.1 billion users
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE products (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     slug VARCHAR(255) UNIQUE NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

CREATE TABLE products (
    -- Use BIGINT for better performance and future-proofing
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE product_variants (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     product_id UUID REFERENCES products(id) ON DELETE CASCADE,
--     sku VARCHAR(100) UNIQUE NOT NULL,
--     price INTEGER NOT NULL, -- store in cents
--     stock INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

CREATE TABLE product_variants (
    -- 1. Changed to BIGINT identity to match your products table style
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- 2. MUST be BIGINT to match products(id). UUID will cause a Foreign Key error.
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,

    sku VARCHAR(100) UNIQUE NOT NULL,
    price INTEGER NOT NULL, -- Great choice storing in cents/smallest unit!
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE categories (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(255) NOT NULL,
--     slug VARCHAR(255) UNIQUE NOT NULL
-- );
CREATE TABLE categories (
    -- Use BIGINT Identity for auto-increment
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- CREATE TABLE product_categories (
--     product_id UUID REFERENCES products(id) ON DELETE CASCADE,
--     category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
--     PRIMARY KEY (product_id, category_id)
-- );
CREATE TABLE product_categories (
    -- Changed from UUID to BIGINT to match the parent tables
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,

    -- Composite primary key (prevents duplicate links)
    PRIMARY KEY (product_id, category_id)
);

CREATE TYPE order_status AS ENUM (
  'draft',
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
);

-- CREATE TABLE orders (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES users(id),
--     status order_status DEFAULT 'draft',
--     total INTEGER NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );
-- CREATE TABLE orders (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES users(id),
--     status VARCHAR(50) DEFAULT 'pending',
--     total INTEGER NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- First, ensure your custom status type exists (run this once)
-- DO $$ BEGIN
--     CREATE TYPE order_status AS ENUM ('draft', 'adding_items', 'arranging_payment', 'payment_settled', 'shipped');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

CREATE TABLE orders (
    -- 1. Changed to BIGINT Identity for auto-increment
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- 2. Changed to BIGINT to match customers(id)
    -- 3. Changed reference from 'users' to 'customers'
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,

    status order_status DEFAULT 'draft',
    total INTEGER NOT NULL, -- Storing in cents
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE order_items (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
--     product_variant_id UUID REFERENCES product_variants(id),
--     quantity INTEGER NOT NULL,
--     price INTEGER NOT NULL
-- );
CREATE TABLE order_items (
    -- 1. Auto-incrementing ID
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- 2. Matches BIGINT from your orders table
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,

    -- 3. Matches BIGINT from your product_variants table
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price INTEGER NOT NULL, -- Price at the time of purchase (in cents)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name ASC;
