-- Step 1: Add professional_type array to profiles to support multiple service roles
ALTER TABLE public.profiles ADD COLUMN professional_type TEXT[] DEFAULT '{}';

-- Step 2: Professional Profiles (Detailed stats and settings)
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'WORKER', 'DESIGNER', 'TRANSPORTER'
  sub_category TEXT, -- e.g., 'Mason', 'Carpenter', 'Interior Designer'
  company_name TEXT,
  years_experience INTEGER DEFAULT 0,
  service_radius_km INTEGER DEFAULT 50,
  base_price_amount DECIMAL,
  pricing_model TEXT, -- 'PER_HOUR', 'PER_SQFT', 'PER_KM', 'FIXED', 'NEGOTIABLE'
  verification_level INTEGER DEFAULT 1, -- 1: Basic, 2: Identity, 3: Professional, 4: Nestara Verified
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read professional_profiles" ON public.professional_profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own professional_profile" ON public.professional_profiles FOR ALL USING (auth.uid() = id);

-- Step 3: Professional Portfolios (For Designers/Workers to show past work)
CREATE TABLE public.professional_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT,
  budget_range TEXT,
  completion_year INTEGER,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.professional_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read professional_portfolios" ON public.professional_portfolios FOR SELECT USING (true);
CREATE POLICY "Users edit own portfolios" ON public.professional_portfolios FOR ALL USING (auth.uid() = professional_id);

-- Step 4: Transport Vehicles
CREATE TABLE public.transport_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  registration_number TEXT,
  load_capacity_kg INTEGER,
  insurance_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read transport_vehicles" ON public.transport_vehicles FOR SELECT USING (true);
CREATE POLICY "Users edit own transport_vehicles" ON public.transport_vehicles FOR ALL USING (auth.uid() = transporter_id);

-- Step 5: Service Requests (Leads for the Build Your Home & Services feature)
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  location_data JSONB,
  budget_approx DECIMAL,
  details TEXT,
  status TEXT DEFAULT 'OPEN', -- OPEN, QUOTED, ACCEPTED, COMPLETED
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
-- Customers can read their own requests
CREATE POLICY "Users read own requests" ON public.service_requests FOR SELECT USING (auth.uid() = customer_id);
-- Professionals can read OPEN requests (Global Lead Board)
CREATE POLICY "Professionals read open requests" ON public.service_requests FOR SELECT USING (status = 'OPEN');
-- Customers can create requests
CREATE POLICY "Users insert own requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Step 6: Quotes (Professionals bidding on requests)
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  quoted_amount DECIMAL NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
-- Customer can read quotes given to their requests
CREATE POLICY "Customer reads quotes" ON public.quotes FOR SELECT USING (
  auth.uid() IN (SELECT customer_id FROM public.service_requests WHERE id = request_id)
);
-- Professional can read and create their own quotes
CREATE POLICY "Professional reads own quotes" ON public.quotes FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Professional inserts own quote" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = professional_id);
