-- Block 2: RLS Policies for messages + crew_availability
-- Run this AFTER Block 1 (supabase/migration_block1.sql) succeeds.
-- If connection_id errors persist, run migration_diagnostic.sql first.

set search_path to public;

-- messages policies
drop policy if exists "messages_read"   on messages;
drop policy if exists "messages_insert" on messages;

create policy "messages_read" on messages
  as permissive for select to authenticated
  using (
    connection_id in (
      select id from connection_requests
      where (client_id = auth.uid() or crew_id = auth.uid())
        and status = 'accepted'
    )
  );

create policy "messages_insert" on messages
  as permissive for insert to authenticated
  with check (
    sender_id = auth.uid()
    and connection_id in (
      select id from connection_requests
      where (client_id = auth.uid() or crew_id = auth.uid())
        and status = 'accepted'
    )
  );

-- crew_availability policies
drop policy if exists "crew_avail_own"  on crew_availability;
drop policy if exists "crew_avail_read" on crew_availability;

create policy "crew_avail_own" on crew_availability
  as permissive for all to authenticated
  using (auth.uid() = crew_id)
  with check (auth.uid() = crew_id);

create policy "crew_avail_read" on crew_availability
  as permissive for select to anon, authenticated
  using (true);

-- Block 3: Realtime + indexes
-- Run after Block 2 succeeds.
-- alter publication supabase_realtime add table messages;

-- create index if not exists messages_connection_id_idx on messages(connection_id);
-- create index if not exists messages_created_at_idx    on messages(connection_id, created_at);
-- create index if not exists crew_avail_crew_date_idx   on crew_availability(crew_id, date);
