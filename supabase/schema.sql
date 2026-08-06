-- ====================================================================
-- COSMETICS ERP - COMPLETE SUPABASE POSTGRESQL SCHEMA MIGRATION SCRIPT
-- ====================================================================
-- Description: Full DDL schema for Cosmetics ERP on Supabase.
-- Features: UUID primary keys, FK constraints, Triggers, Views, Functions,
--           Storage Bucket inserts, RLS Policies, & Indexes.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. ENUMS & DOMAINS
-- ====================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE user_role_type AS ENUM ('Super Admin', 'Administrator', 'Manager', 'Sales Person');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status_type') THEN
    CREATE TYPE account_status_type AS ENUM ('Pending', 'Active', 'Suspended', 'Rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_transaction_type') THEN
    CREATE TYPE inventory_transaction_type AS ENUM ('Sale', 'Purchase', 'Adjustment', 'Return', 'Damage');
  END IF;
END $$;

-- ====================================================================
-- 3. TABLES DEFINITION
-- ====================================================================

-- 3.1 BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name VARCHAR(255) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(50),
  manager_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 PROFILES TABLE (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role_type NOT NULL DEFAULT 'Sales Person',
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  account_status account_status_type NOT NULL DEFAULT 'Pending',
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circular FK link for branch manager after profiles table creation
ALTER TABLE public.branches 
  ADD CONSTRAINT fk_branch_manager 
  FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3.3 USER APPROVAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.user_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role user_role_type NOT NULL,
  requested_branch UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  approval_status account_status_type NOT NULL DEFAULT 'Pending',
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  image TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(100) NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 3.10 EXPENSE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(255) NOT NULL UNIQUE
);

-- 3.11 EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  vendor VARCHAR(255),
  receipt_image TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) DEFAULT 'Paid',
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13 PURCHASE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 3.14 INVENTORY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_type inventory_transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.15 SETTINGS TABLE (Single Record Architecture)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL DEFAULT 'Cosmetics ERP',
  logo TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'NGN',
  enable_tax BOOLEAN DEFAULT FALSE,
  tax_name VARCHAR(50) DEFAULT 'VAT',
  tax_rate NUMERIC(5, 2) DEFAULT 7.50,
  show_tax_on_receipt BOOLEAN DEFAULT TRUE,
  receipt_footer TEXT DEFAULT 'Thank you for shopping with us!'
);

-- Insert default single settings record if absent
INSERT INTO public.settings (business_name, currency, enable_tax, tax_rate)
SELECT 'Glossy Cosmetics ERP', 'NGN', true, 7.50
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- 3.16 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.17 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.18 LOGIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  device TEXT,
  ip_address VARCHAR(50)
);

-- 3.19 RECOMMENDED: STOCK ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) NOT NULL, -- e.g. 'Increase', 'Decrease', 'Audit Correction'
  quantity INTEGER NOT NULL,
  reason TEXT,
  adjusted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.20 RECOMMENDED: RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_type VARCHAR(50) NOT NULL, -- 'Customer Return' or 'Supplier Return'
  reference_id UUID,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  refund_amount NUMERIC(12, 2) DEFAULT 0.00,
  reason TEXT,
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.21 RECOMMENDED: BUSINESS CASHBOOK TABLE
CREATE TABLE IF NOT EXISTS public.business_cashbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('Inflow', 'Outflow')),
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  reference_id UUID,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.22 RECOMMENDED: APP CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.app_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.23 RECOMMENDED: SYNC QUEUE TABLE (Offline synchronization)
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Synced', 'Failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ====================================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt ON public.sales(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson ON public.sales(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON public.profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON public.inventory_transactions(product_id);

-- ====================================================================
-- 5. DATABASE FUNCTIONS & TRIGGERS
-- ====================================================================

-- 5.1 AUTOMATIC PROFILE CREATION ON USER SIGNUP (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    account_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'requested_role')::user_role_type, 'Sales Person'::user_role_type),
    'Pending'::account_status_type
  );

  -- Notify Admins and Super Admins about new registration
  INSERT INTO public.notifications (title, message, recipient)
  SELECT 
    'New User Registration Pending',
    'New User Registration: ' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || ' has requested access.',
    p.id
  FROM public.profiles p
  WHERE p.role IN ('Super Admin', 'Administrator') AND p.account_status = 'Active';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 5.2 AUTOMATIC RECEIPT NUMBER GENERATOR
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    seq_val := (SELECT COUNT(*) + 1 FROM public.sales);
    NEW.receipt_number := 'REC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_val::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_receipt_number ON public.sales;
CREATE TRIGGER trg_generate_receipt_number
  BEFORE INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.generate_receipt_number();

-- 5.3 STOCK DEDUCTION & INVENTORY TRANSACTION LOGIC ON SALE ITEM INSERT
CREATE OR REPLACE FUNCTION public.process_sale_item_inventory()
RETURNS TRIGGER AS $$
DECLARE
  old_stock INTEGER;
  new_stock_val INTEGER;
BEGIN
  -- Check if product exists, get current stock
  SELECT stock_quantity INTO old_stock
  FROM public.products
  WHERE id = NEW.product_id;

  IF FOUND THEN
    new_stock_val := old_stock - NEW.quantity;

    -- Update product stock
    UPDATE public.products
    SET stock_quantity = new_stock_val,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    -- Record inventory transaction
    INSERT INTO public.inventory_transactions (
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      reference_id
    ) VALUES (
      NEW.product_id,
      'Sale'::inventory_transaction_type,
      -NEW.quantity,
      old_stock,
      new_stock_val,
      NEW.sale_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_process_sale_item ON public.sale_items;
CREATE TRIGGER trg_process_sale_item
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.process_sale_item_inventory();

-- 5.4 AUTO-CREATE PRODUCT OR GET ID FUNCTION
CREATE OR REPLACE FUNCTION public.get_or_create_product(
  p_name VARCHAR(255),
  p_selling_price NUMERIC(12, 2) DEFAULT 0.00,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
BEGIN
  SELECT id INTO v_product_id
  FROM public.products
  WHERE LOWER(product_name) = LOWER(p_name)
  LIMIT 1;

  IF v_product_id IS NULL THEN
    INSERT INTO public.products (
      product_name,
      selling_price,
      purchase_price,
      stock_quantity,
      created_by
    ) VALUES (
      p_name,
      p_selling_price,
      p_selling_price * 0.7, -- default 30% margin fallback
      100, -- initial stock allocation
      p_user_id
    ) RETURNING id INTO v_product_id;
  END IF;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 6. SQL VIEWS FOR REPORTING & ANALYTICS
-- ====================================================================

-- 6.1 TODAY'S SALES
CREATE OR REPLACE VIEW public.vw_todays_sales AS
SELECT 
  s.id,
  s.receipt_number,
  c.customer_name,
  p.full_name AS salesperson_name,
  s.total_amount,
  s.discount,
  s.payment_method,
  s.created_at
FROM public.sales s
LEFT JOIN public.customers c ON s.customer_id = c.id
LEFT JOIN public.profiles p ON s.salesperson_id = p.id
WHERE DATE(s.created_at AT TIME ZONE 'UTC') = CURRENT_DATE;

-- 6.2 TODAY'S EXPENSES
CREATE OR REPLACE VIEW public.vw_todays_expenses AS
SELECT 
  e.id,
  ec.category_name,
  e.description,
  e.amount,
  e.payment_method,
  e.vendor,
  p.full_name AS recorded_by,
  e.created_at
FROM public.expenses e
LEFT JOIN public.expense_categories ec ON e.expense_category_id = ec.id
LEFT JOIN public.profiles p ON e.created_by = p.id
WHERE DATE(e.created_at AT TIME ZONE 'UTC') = CURRENT_DATE;

-- 6.3 TODAY'S PROFIT & FINANCIAL SUMMARY
CREATE OR REPLACE VIEW public.vw_todays_profit AS
WITH total_sales AS (
  SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM public.sales WHERE DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE
),
total_exp AS (
  SELECT COALESCE(SUM(amount), 0) AS expenses FROM public.expenses WHERE DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE
),
cogs AS (
  SELECT COALESCE(SUM(si.quantity * pr.purchase_price), 0) AS cost_of_goods
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  JOIN public.products pr ON si.product_id = pr.id
  WHERE DATE(s.created_at AT TIME ZONE 'UTC') = CURRENT_DATE
)
SELECT 
  ts.revenue,
  te.expenses,
  cg.cost_of_goods,
  (ts.revenue - cg.cost_of_goods - te.expenses) AS net_profit
FROM total_sales ts, total_exp te, cogs cg;

-- 6.4 WEEKLY SALES
CREATE OR REPLACE VIEW public.vw_weekly_sales AS
SELECT 
  DATE_TRUNC('day', created_at) AS sale_day,
  COUNT(id) AS total_orders,
  SUM(total_amount) AS total_revenue
FROM public.sales
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sale_day
ORDER BY sale_day DESC;

-- 6.5 MONTHLY SALES
CREATE OR REPLACE VIEW public.vw_monthly_sales AS
SELECT 
  DATE_TRUNC('month', created_at) AS sale_month,
  COUNT(id) AS total_orders,
  SUM(total_amount) AS total_revenue
FROM public.sales
GROUP BY sale_month
ORDER BY sale_month DESC;

-- 6.6 TOP SELLING PRODUCTS
CREATE OR REPLACE VIEW public.vw_top_selling_products AS
SELECT 
  si.product_name,
  SUM(si.quantity) AS total_quantity_sold,
  SUM(si.total_price) AS total_revenue
FROM public.sale_items si
GROUP BY si.product_name
ORDER BY total_quantity_sold DESC;

-- 6.7 LOW STOCK ALERT VIEW
CREATE OR REPLACE VIEW public.vw_low_stock_alerts AS
SELECT 
  id,
  product_name,
  barcode,
  stock_quantity,
  reorder_level,
  selling_price
FROM public.products
WHERE stock_quantity <= reorder_level
ORDER BY stock_quantity ASC;

-- 6.8 INVENTORY SUMMARY VIEW
CREATE OR REPLACE VIEW public.vw_inventory_summary AS
SELECT 
  COUNT(id) AS total_products,
  SUM(stock_quantity) AS total_units_in_stock,
  SUM(stock_quantity * purchase_price) AS total_inventory_cost_value,
  SUM(stock_quantity * selling_price) AS total_inventory_retail_value
FROM public.products;

-- ====================================================================
-- 7. STORAGE BUCKETS SETUP
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('ProductImages', 'ProductImages', true),
  ('Receipts', 'Receipts', false),
  ('BusinessLogo', 'BusinessLogo', true),
  ('ProfilePhotos', 'ProfilePhotos', true)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role from RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role_type AS $$
DECLARE
  v_role user_role_type;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'Sales Person'::user_role_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.1 PROFILES POLICIES
CREATE POLICY "Super Admins & Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    get_current_user_role() IN ('Super Admin', 'Administrator') OR id = auth.uid()
  );

CREATE POLICY "Users can update their own basic profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super Admins can update any profile"
  ON public.profiles FOR ALL
  USING (get_current_user_role() = 'Super Admin');

-- 8.2 PRODUCTS POLICIES
CREATE POLICY "All authenticated active users can view products"
  ON public.products FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins & Managers can insert and edit products"
  ON public.products FOR ALL
  USING (get_current_user_role() IN ('Super Admin', 'Administrator', 'Manager'));

-- 8.3 SALES POLICIES
CREATE POLICY "Sales Persons can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sales Persons can view own sales"
  ON public.sales FOR SELECT
  USING (
    get_current_user_role() IN ('Super Admin', 'Administrator', 'Manager') 
    OR salesperson_id = auth.uid()
  );

-- 8.4 EXPENSES POLICIES (Sales Person CANNOT view or insert expenses)
CREATE POLICY "Managers and Admins can view and create expenses"
  ON public.expenses FOR ALL
  USING (get_current_user_role() IN ('Super Admin', 'Administrator', 'Manager'));

-- 8.5 AUDIT LOGS POLICIES
CREATE POLICY "Only Super Admins & Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (get_current_user_role() IN ('Super Admin', 'Administrator'));

-- ====================================================================
-- END OF SCHEMA MIGRATION SCRIPT
-- ====================================================================
