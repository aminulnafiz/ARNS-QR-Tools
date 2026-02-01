
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kapsnfcislibfiyjjlgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcHNuZmNpc2xpYmZpeWpqbGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODIwMjIsImV4cCI6MjA4NTQ1ODAyMn0.JnDmi-KmCBHv4OqftptjPIyRgV5qcqNsPbf6lA9MP5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
