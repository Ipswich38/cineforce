-- Drop and rebuild messages table with correct schema
-- Run ONLY after migration_messages_fix.sql confirms the table has wrong columns

set search_path to public;

drop policy if exists "messages_read"   on messages;
drop policy if exists "messages_insert" on messages;
drop policy if exists "messages_select" on messages;

drop table if exists messages cascade;

create table messages (
  id             uuid default gen_random_uuid() primary key,
  connection_id  uuid references connection_requests(id) on delete cascade not null,
  sender_id      uuid references auth.users(id) on delete cascade not null,
  body           text not null,
  created_at     timestamptz default now()
);

alter table messages enable row level security;

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

alter publication supabase_realtime add table messages;

create index if not exists messages_connection_id_idx on messages(connection_id);
create index if not exists messages_created_at_idx    on messages(connection_id, created_at);
