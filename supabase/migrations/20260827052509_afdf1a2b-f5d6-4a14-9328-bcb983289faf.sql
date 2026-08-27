CREATE TABLE public.fare_watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  destination_code TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  target_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fare_watches TO authenticated;
GRANT ALL ON public.fare_watches TO service_role;

ALTER TABLE public.fare_watches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own fare watches"
  ON public.fare_watches FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_fare_watches_updated_at
BEFORE UPDATE ON public.fare_watches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();