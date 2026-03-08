import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://oxyrlpiknlsytygrdydh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_KEY || 'sb_publishable_MN_NO7gG2KqvSDrQlG9zog_2e2CK2ZT';

export const supabase = createClient(supabaseUrl, supabaseKey);
