-- Supabase SQL Migration
-- SpaceTec Business Portal Schema V1

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales', 'project_manager', 'developer', 'designer', 'seo', 'employee', 'client');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'quotation_sent', 'negotiation', 'won', 'lost');
CREATE TYPE quotation_status AS ENUM ('draft', 'generated', 'sent', 'viewed', 'accepted', 'rejected');
CREATE TYPE project_status AS ENUM ('planning', 'requirement', 'design', 'development', 'testing', 'client_review', 'revision', 'deployment', 'completed', 'cancelled', 'on_hold');

-- 2. Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'employee',
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Company Settings
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    logo_url TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    gst_number TEXT,
    default_quotation_terms TEXT,
    default_payment_terms TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 4. Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    status lead_status DEFAULT 'new',
    estimated_value NUMERIC(12, 2),
    assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    next_followup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    gst_number TEXT,
    website TEXT,
    industry TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Services (Optional pre-defined services)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quotations (Supports versioning via parent_id, optional GST, automatic totals)
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES quotations(id), -- For versioning/duplicates
    client_id UUID REFERENCES clients(id),
    lead_id UUID REFERENCES leads(id),
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Finance (Calculated via functions or app logic, stored for record)
    subtotal NUMERIC(12, 2) DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    tax_enabled BOOLEAN DEFAULT false,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    
    payment_terms TEXT,
    notes TEXT,
    terms_conditions TEXT,
    status quotation_status DEFAULT 'draft',
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Quotation Items
-- Supports both (quantity * unit_price) AND manual amount. 
-- App logic handles calculation: if amount is 0 and (qty & price) are > 0, amount = qty * price.
CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id), -- Optional
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2),
    unit_price NUMERIC(12, 2),
    amount NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL, -- amount - discount
    sort_order INTEGER DEFAULT 0
);

-- 9. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) NOT NULL,
    quotation_id UUID REFERENCES quotations(id),
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    start_date DATE,
    deadline DATE,
    completed_date DATE,
    budget NUMERIC(12, 2),
    project_manager UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) NOT NULL,
    project_id UUID REFERENCES projects(id),
    quotation_id UUID REFERENCES quotations(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    tax_enabled BOOLEAN DEFAULT false,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    amount_due NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments (Source of Truth for Revenue)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number TEXT UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID REFERENCES clients(id) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    transaction_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Admin has full access, others scoped - fine tuning needed for production)
-- For now, authenticated users can read, but we will scope properly later.
CREATE POLICY "Allow authenticated users to read profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read company_settings" ON company_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read services" ON services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read quotations" ON quotations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read quotation_items" ON quotation_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to read payments" ON payments FOR SELECT USING (auth.role() = 'authenticated');

-- Create Profile Trigger on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'employee');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
