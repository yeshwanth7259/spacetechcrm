-- Allow authenticated users to insert and update company settings
CREATE POLICY "Allow authenticated users to insert company_settings" ON company_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update company_settings" ON company_settings FOR UPDATE USING (auth.role() = 'authenticated');
