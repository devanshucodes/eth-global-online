const ASIOneAgent = require('./ASIOneAgent');

class CMOAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('CMO Agent', 'Marketing strategy and brand development', apiKey);
  }

  async developMarketingStrategy(idea, product, research) {
    console.log('📢 [CMO AGENT v2] Starting marketing strategy for product:', product.product_name);

    const prompt = `As a Chief Marketing Officer, develop a comprehensive marketing strategy for this product:\n\nProduct Details:\nName: ${product.product_name}\nDescription: ${product.product_description}\nTarget Market: ${JSON.stringify(product.target_market)}\nValue Proposition: ${product.value_proposition || 'Not specified'}\n\nResearch Data:\nMarket Size: ${research?.market_analysis?.market_size || 'Not available'}\nCompetitors: ${JSON.stringify(research?.competitors || [])}\nTarget Audience: ${research?.recommendations?.target_audience || 'Not specified'}\n\nCreate a comprehensive marketing strategy including:\n\n1. Brand positioning and messaging\n2. Target audience segmentation\n3. Marketing channels and tactics\n4. Content marketing strategy\n5. Social media strategy\n6. Launch campaign plan\n7. Budget allocation recommendations\n8. Success metrics and KPIs\n\nFormat your response as JSON.`;

    try {
      const response = await this.generateResponse(prompt, 3000);
      const cleaned = (response || '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\r/g, '\\r').replace(/\t/g, '\\t');

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);

      // Try to generate social drafts
      try {
        const socialPrompt = `Given the strategy, write a Twitter post (<=280 chars) and a LinkedIn post (<=700 chars). Return JSON {"post_text_twitter": "...", "post_text_linkedin": "..."}.\n\nStrategy:\n${JSON.stringify(parsed)}`;
        const socialResp = await this.generateResponse(socialPrompt, 800);
        const socialClean = (socialResp || '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        const match = socialClean.match(/\{[\s\S]*\}/);
        if (match) {
          const social = JSON.parse(match[0]);
          parsed.post_text_twitter = parsed.post_text_twitter || social.post_text_twitter || '';
          parsed.post_text_linkedin = parsed.post_text_linkedin || social.post_text_linkedin || '';
        }
      } catch (e) {
        console.warn('⚠️ [CMO AGENT v2] social draft generation failed', e?.message || e);
      }

      await this.logActivity('Developed marketing strategy v2', { product_name: product.product_name });
      return parsed;
    } catch (e) {
      console.error('❌ [CMO AGENT v2] Error building strategy', e?.message || e);
      return {
        brand_positioning: 'Fallback positioning',
        key_messages: ['Fallback message'],
        marketing_channels: [],
        post_text_twitter: `${product.product_name} — coming soon!`,
        post_text_linkedin: `Launching ${product.product_name} — details coming soon.`
      };
    }
  }
}

module.exports = CMOAgent;
