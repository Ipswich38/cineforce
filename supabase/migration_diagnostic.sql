-- Run this if Block 2 keeps failing — shows current state of messages table
-- and which schema it resolves to.

-- What columns does public.messages have?
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'messages'
order by ordinal_position;

-- Does messages exist in other schemas (e.g. realtime)?
select table_schema, table_name
from information_schema.tables
where table_name = 'messages';

-- What RLS policies already exist on messages?
select schemaname, tablename, policyname, cmd
from pg_policies
where tablename = 'messages';
