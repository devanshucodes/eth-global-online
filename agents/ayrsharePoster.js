const SocialMediaAPI = require('social-media-api');

const apiKey = process.env.AYR_API_KEY;
if (!apiKey) {
  console.warn('⚠️ [Ayrshare] AYR_API_KEY not set in environment. Ayrshare posting will be simulated.');
}

// If AYR_API_KEY is 'TEST' or missing, we simulate posting to avoid external failures during local tests.
const SIMULATE = !apiKey || apiKey === 'TEST';
let social = null;
if (!SIMULATE) {
  social = new SocialMediaAPI(apiKey || '');
}

async function postToSocial({ text, platforms = ['linkedin', 'twitter'], mediaUrls = [], scheduleDate } = {}) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for social post');
  }

  if (SIMULATE) {
    // Return a simulated success response so we can test the flow locally without real API keys
    const now = Date.now();
    const resp = {
      success: true,
      simulated: true,
      id: `SIMULATED-${now}`,
      platforms,
      post: text,
      mediaUrls,
      scheduleDate: scheduleDate || null,
      created_at: new Date().toISOString()
    };
    console.log('ℹ️ [Ayrshare] Simulated post response:', resp.id);
    return resp;
  }

  try {
    const payload = {
      post: text,
      platforms,
    };

    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length) payload.mediaUrls = mediaUrls;
    if (scheduleDate) payload.scheduleDate = scheduleDate;

    console.log('📤 [Ayrshare] Posting to:', platforms);
    const resp = await social.post(payload);
    console.log('✅ [Ayrshare] Post successful:', { id: resp.id, status: resp.status });
    return resp;
  } catch (err) {
    console.error('❌ [Ayrshare] Post failed:', err.message);
    console.error('❌ [Ayrshare] Error details:', err.response?.data || err);
    const e = new Error('Ayrshare post failed: ' + (err?.message || String(err)));
    e.details = err?.response?.data || err;
    throw e;
  }
}

module.exports = { postToSocial };
