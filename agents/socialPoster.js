const SocialMediaAPI = require('social-media-api');

class SocialPoster {
  constructor(apiKey) {
    this.social = apiKey ? new SocialMediaAPI(apiKey) : null;
    this.enabled = !!apiKey;
  }

  async postToTwitter(text) {
    if (!this.enabled || !this.social) {
      console.log('⚠️ [SOCIAL] Ayrshare not configured, skipping Twitter post');
      return { success: false, reason: 'No API key configured' };
    }

    try {
      console.log('📱 [SOCIAL] Posting to Twitter:', text.substring(0, 80) + '...');
      
      const result = await this.social.post({
        post: text,
        platforms: ['twitter']
      });
      
      console.log('✅ [SOCIAL] Successfully posted to Twitter! Post ID:', result.id);
      return { 
        success: true, 
        postId: result.id,
        platform: 'twitter'
      };
    } catch (error) {
      console.error('❌ [SOCIAL] Twitter post failed:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = SocialPoster;
