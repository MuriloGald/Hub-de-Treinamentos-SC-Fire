const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local found");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("URL or Key missing", { url, key });
  process.exit(1);
}

console.log("Connecting to:", url);
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("subthemes").select("id, name").limit(5);
  if (error) {
    console.error("Error querying subthemes table:", error.message);
  } else {
    console.log("Success! Subthemes in DB:", data.length);
    console.log("Sample:", data);
  }
}

run();
