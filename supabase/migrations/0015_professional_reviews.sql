CREATE TABLE public.professional_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, customer_id)
);

ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" 
  ON public.professional_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON public.professional_reviews FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can edit own reviews" 
  ON public.professional_reviews FOR UPDATE 
  USING (auth.uid() = customer_id);

-- Add average rating cache to professional_profiles for fast querying
ALTER TABLE public.professional_profiles ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.professional_profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;

-- Function to update the average rating
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.professional_profiles
    SET 
      average_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.professional_reviews WHERE professional_id = NEW.professional_id),
      total_reviews = (SELECT COUNT(*) FROM public.professional_reviews WHERE professional_id = NEW.professional_id)
    WHERE id = NEW.professional_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.professional_profiles
    SET 
      average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.professional_reviews WHERE professional_id = OLD.professional_id), 0.0),
      total_reviews = (SELECT COUNT(*) FROM public.professional_reviews WHERE professional_id = OLD.professional_id)
    WHERE id = OLD.professional_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.professional_reviews
FOR EACH ROW EXECUTE FUNCTION update_professional_rating();
