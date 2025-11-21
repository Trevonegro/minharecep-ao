import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dedxpspxiqahvxqnnlmg.supabase.co';
// Usando apenas a chave ANON PUBLIC fornecida. 
// A chave service_role NUNCA deve ser usada no frontend/cliente por motivos de segurança.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZHhwc3B4aXFhaHZ4cW5ubG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDA0MzcsImV4cCI6MjA3OTMxNjQzN30.rXZJP04MT2rvhgElWm3d_QOqukw9QSeIf9omHDzXszg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);