const supabaseUrl = process.env.SUPABASE_URL || 'https://afixydlauedkpgplqzbc.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5uotdJcv0WqSC5YCIiDEdw_kW9jHYOV';

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await fetch(`${supabaseUrl}/rest/v1/home_settings?select=id&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      cache: 'no-store'
    });

    if (!result.ok) {
      throw new Error(`Supabase returned ${result.status}`);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Supabase heartbeat failed:', error);
    return response.status(503).json({ ok: false });
  }
}
