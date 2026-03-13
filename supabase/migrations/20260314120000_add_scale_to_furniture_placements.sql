-- Add scale column so saved layout keeps item size (default 1 = 100%)
ALTER TABLE public.furniture_placements
ADD COLUMN IF NOT EXISTS scale DOUBLE PRECISION NOT NULL DEFAULT 1;
