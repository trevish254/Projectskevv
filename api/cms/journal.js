const supabaseUrl = process.env.SUPABASE_URL || 'https://afixydlauedkpgplqzbc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3ODkzNDgwMzAsImV4cCI6MjEwNDkyNDAzMH0.AIqe_dJcPnEDKGcH8TdKPApFFk3neyiqT8yuQd5lVBc';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5uotdJcv0WqSC5YCIiDEdw_kW9jHYOV';

module.exports = async (req, res) => {
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    const response = await fetch(`${supabaseUrl}/rest/v1/journal_posts${requestUrl.search}`, {
      method: req.method,
      headers: {
        apikey: supabasePublishableKey,
        Authorization: req.headers.authorization || `Bearer ${supabasePublishableKey}`,
        Accept: 'application/json',
        ...(req.headers.prefer ? { Prefer: req.headers.prefer } : {}),
        ...(req.method !== 'GET' && req.method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {})
      },
      ...(req.method !== 'GET' && req.method !== 'DELETE' ? { body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}) } : {})
    });
    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Journal service unavailable', message: error.message });
  }
};