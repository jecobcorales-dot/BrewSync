-- BrewSync PostgreSQL Schema
-- Multi-branch coffee shop platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'cashier', 'manager', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE ml_algorithm AS ENUM ('collaborative_filtering', 'association_rules', 'random_forest', 'xgboost');

-- Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT true,
    opening_time TIME DEFAULT '06:00',
    closing_time TIME DEFAULT '22:00',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (base auth table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (extends users)
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'Bronze',
    favorite_branch_id UUID REFERENCES branches(id),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    preferences JSONB DEFAULT '{}'
);

-- Employees (cashier, manager, admin)
CREATE TABLE employees (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    employee_code VARCHAR(20) UNIQUE,
    position VARCHAR(50),
    hire_date DATE DEFAULT CURRENT_DATE
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(40),
    sort_order INTEGER DEFAULT 0
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    calories INTEGER,
    rating DECIMAL(3,2) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-ons
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(40) DEFAULT 'extra',
    is_available BOOLEAN DEFAULT true
);

-- Product-AddOn mapping
CREATE TABLE product_add_ons (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, add_on_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    cashier_id UUID REFERENCES employees(id),
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    loyalty_points_earned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    add_ons JSONB DEFAULT '[]'
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'card',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    product_id UUID REFERENCES products(id),
    algorithm ml_algorithm NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    is_accepted BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(120) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    code VARCHAR(30) UNIQUE,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML Models registry
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    algorithm ml_algorithm NOT NULL,
    version VARCHAR(20) NOT NULL,
    accuracy DECIMAL(5,4),
    is_active BOOLEAN DEFAULT false,
    trained_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Reports
CREATE TABLE sales_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id),
    report_date DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    top_product_id UUID REFERENCES products(id),
    recommendation_acceptance_rate DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, report_date)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(40),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_recommendations_customer ON recommendations(customer_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
