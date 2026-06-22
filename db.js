const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mbxgnirwvtkumzzqehyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieGduaXJ3dnRrdW16enFlaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTQ4NDEsImV4cCI6MjA5NzY5MDg0MX0.imxYh_B3Lrz5ChGoeBbGa2Y35X1zw9INIBukASentTA';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;