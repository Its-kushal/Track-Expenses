import { createClient } from "@supabase/supabase-js";

// Local development variables
const supabaseUrl = process.env.LOCAL_NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.LOCAL_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Deployment variables
// const supabaseUrl = process.env.LOCAL_NEXT_PUBLIC_SUPABASE_URL!;
// const supabasePublishableKey =
//     process.env.LOCAL_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);