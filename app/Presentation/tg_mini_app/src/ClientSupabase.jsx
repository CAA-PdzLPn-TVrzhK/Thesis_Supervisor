import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://dprwupbzatrqmqpdwcgq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE4NDc3NywiZXhwIjoyMDY2NzYwNzc3fQ.qXk-dH8RlRZFnRXu4AI316zyFH3OUW1d2WrWQhcL0wk"
  );