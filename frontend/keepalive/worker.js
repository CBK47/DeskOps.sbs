// Daily REST ping stops a Supabase free-tier project from auto-pausing.
// Configure the target through Cloudflare Worker secrets, never source control.
const worker = {
  async scheduled(_event, env) {
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("Keepalive worker is missing SUPABASE_URL or SUPABASE_ANON_KEY.");
      return;
    }

    const res = await fetch(`${url}/rest/v1/streams?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    console.log("keepalive ping:", res.status);
  },
};

export default worker;
