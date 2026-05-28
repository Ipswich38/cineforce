set search_path to public;

alter publication supabase_realtime add table messages;

create index if not exists messages_connection_id_idx on messages(connection_id);
create index if not exists messages_created_at_idx    on messages(connection_id, created_at);
create index if not exists crew_avail_crew_date_idx   on crew_availability(crew_id, date);
