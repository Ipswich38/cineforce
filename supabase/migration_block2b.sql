set search_path to public;

drop policy if exists "crew_avail_own"  on crew_availability;
drop policy if exists "crew_avail_read" on crew_availability;

create policy "crew_avail_own" on crew_availability
  as permissive for all to authenticated
  using (auth.uid() = crew_id)
  with check (auth.uid() = crew_id);

create policy "crew_avail_read" on crew_availability
  as permissive for select to anon, authenticated
  using (true);
