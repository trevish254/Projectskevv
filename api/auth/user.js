const supabaseUrl = process.env.SUPABASE_URL || 'https://afixydlauedkpgplqzbc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaXh5ZGxhdWVka3BncGxxemJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNDgwMzAsImV4cCI6MjEwNDkyNDAzMH0.AIqe_dJcPnEDKGcH8TdKPApFFk3neyiqT8yuQd5lVBc';

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: req.headers.authorization || '' }
    });
    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Authentication service unavailable', message: error.message });
  }
};
