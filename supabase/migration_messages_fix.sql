-- Step 1: Check what columns messages currently has (run this first, read the output)
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'messages'
order by ordinal_position;
