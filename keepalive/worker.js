// ponytail: daily REST ping stops Supabase free-tier auto-pause; delete if project moves to Pro
export default {
  async scheduled(_event, _env, _ctx) {
    // anon key is public by design (shipped in the client bundle)
    const key = "REDACTED_SUPABASE_ANON_KEY";
    const res = await fetch(
      "https://project-ref.supabase.co/rest/v1/streams?select=id&limit=1",
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    console.log("keepalive ping:", res.status);
  },
};
