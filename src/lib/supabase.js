import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://arbiivdpyeerbujlmeji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYmlpdmRweWVlcmJ1amxtZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzA5ODksImV4cCI6MjA5MTMwNjk4OX0.Y1c9MCPG9rzQ2FofBiiU9xuNCQR27Ny2-mN-XtfUZ5I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
