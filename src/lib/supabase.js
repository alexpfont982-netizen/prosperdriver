import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qdmsmvpwhmmywamtiqlz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbXNtdnB3aG1teXdhbXRpcWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjMyODksImV4cCI6MjA5NjUzOTI4OX0.Y5eDc3wmfObwt9YAFIQ85PbsWTPnRbMFnlUtNPt3V1w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);