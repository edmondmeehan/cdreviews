-- Allow a single, understated sponsor on the maintenance splash page.
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_placement_check;--> statement-breakpoint
ALTER TABLE public.ads ADD CONSTRAINT ads_placement_check
  CHECK (placement IN ('home_break','review_inline','review_side','list_card','footer_strip','splash'));--> statement-breakpoint
