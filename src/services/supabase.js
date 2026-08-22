import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://ffauweryjzpnskdaqcyp.supabase.co';

const supabaseKey = 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_bLkboY3aqcA-LRqg7VROgw_IjxTh84f';

export const supabaseProjectOne = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'project_crm',
  },
});

export const supabase = supabaseProjectOne;
export default supabaseProjectOne;
