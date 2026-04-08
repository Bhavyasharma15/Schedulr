import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufuoqtsnfavwhkgzbkrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdW9xdHNuZmF2d2hrZ3pia3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDk5OTEsImV4cCI6MjA5MDQyNTk5MX0.0HtODdQXnHpbjCkCo5rH8xe8uqxX9It4W6ZjoTQJ_ZI';

export const supabase = createClient(supabaseUrl, supabaseKey);
