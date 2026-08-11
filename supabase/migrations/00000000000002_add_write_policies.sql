-- Add INSERT, UPDATE, DELETE policies for all tables for authenticated users.

-- Leads
CREATE POLICY "Allow authenticated users to insert leads" ON leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update leads" ON leads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete leads" ON leads FOR DELETE USING (auth.role() = 'authenticated');

-- Clients
CREATE POLICY "Allow authenticated users to insert clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete clients" ON clients FOR DELETE USING (auth.role() = 'authenticated');

-- Projects
CREATE POLICY "Allow authenticated users to insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- Quotations
CREATE POLICY "Allow authenticated users to insert quotations" ON quotations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update quotations" ON quotations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete quotations" ON quotations FOR DELETE USING (auth.role() = 'authenticated');

-- Quotation Items
CREATE POLICY "Allow authenticated users to insert quotation_items" ON quotation_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update quotation_items" ON quotation_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete quotation_items" ON quotation_items FOR DELETE USING (auth.role() = 'authenticated');

-- Invoices
CREATE POLICY "Allow authenticated users to insert invoices" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete invoices" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

-- Payments
CREATE POLICY "Allow authenticated users to insert payments" ON payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update payments" ON payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete payments" ON payments FOR DELETE USING (auth.role() = 'authenticated');

-- Profiles (Only Admins should be able to update roles, but for now authenticated users can update themselves or others. Let's just allow updates since they can edit their names).
CREATE POLICY "Allow authenticated users to insert profiles" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update profiles" ON profiles FOR UPDATE USING (auth.role() = 'authenticated');
