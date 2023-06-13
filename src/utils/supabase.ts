import { createClient } from "@supabase/supabase-js";

export default createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);
