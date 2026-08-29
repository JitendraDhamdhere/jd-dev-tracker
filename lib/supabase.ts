import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://flgyxjpzekixwrtaolnh.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZ3l4anB6ZWtpeHdydGFvbG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTExNTUsImV4cCI6MjEwMjg2NzE1NX0.uOf4u6nyo4fCEI_wJjJlBgTWsNORHwDk1FEaTcKcul0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
