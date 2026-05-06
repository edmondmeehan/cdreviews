UPDATE public.reviews SET date = CASE period
  WHEN 'Jan-May 1996' THEN 'Jan 1996'
  WHEN 'Jun-Dec 1995' THEN 'Jun 1995'
  WHEN 'Jul-Oct 1996' THEN 'Jul 1996'
  WHEN 'Latest (1999)' THEN '1999'
  ELSE date
END
WHERE period IS NOT NULL AND period <> '';