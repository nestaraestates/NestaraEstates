-- Add professional_id to service_requests to support direct bookings/requests
ALTER TABLE public.service_requests 
ADD COLUMN professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE;

-- Update RLS so a professional can also see requests specifically targeted at them
DROP POLICY IF EXISTS "Professionals read open requests" ON public.service_requests;

CREATE POLICY "Professionals read open requests" ON public.service_requests 
FOR SELECT USING (
  status = 'OPEN' OR professional_id = auth.uid()
);
