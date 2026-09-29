-- Diagnóstico de solo lectura. Ejecutar en SQL Editor del mismo proyecto de Vercel.
-- El envío de correos se configura en Authentication / SMTP, no en SQL.
select table_name from information_schema.tables
where table_schema = 'public' and table_name in
('profiles', 'ai_sessions', 'ai_session_messages', 'activity_attempts');
select trigger_name, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'auth' and event_object_table = 'users';
select column_name, data_type, is_nullable
from information_schema.columns where table_schema = 'public' and table_name = 'profiles';
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'profiles';
-- Si un alta devuelve "Database error saving new user", revisar Auth Logs para
-- identificar la restricción o el trigger que falla antes de modificar datos.
