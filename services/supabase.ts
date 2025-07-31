import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aohngemvmkwmclenlrrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaG5nZW12bWt3bWNsZW5scnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIzNzYsImV4cCI6MjA2OTExODM3Nn0.QyVJBJZHveKxH08I9EjDBaINcPbPVnd8ztf_Hw6JRIg';

export const supabase = createClient(supabaseUrl, supabaseKey);
