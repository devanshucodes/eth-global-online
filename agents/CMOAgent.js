const ASIOneAgent = require('./ASIOneAgent');

class CMOAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('CMO Agent', 'Marketing strategy and brand development', apiKey);
  }

  async developMarketingStrategy(idea, product, research) {
    console.log('📢 [CMO AGENT] Starting marketing strategy for product:', product.product_name);
    
    const prompt = `As a Chief Marketing Officer, develop a comprehensive marketing strategy for this product:

Product Details:
Name: ${product.product_name}
Description: ${product.product_description}
Target Market: ${JSON.stringify(product.target_market)}
Value Proposition: ${product.value_proposition || 'Not specified'}

Research Data:
Market Size: ${research?.market_analysis?.market_size || 'Not available'}
Competitors: ${JSON.stringify(research?.competitors || [])}
Target Audience: ${research?.recommendations?.target_audience || 'Not specified'}

Create a comprehensive marketing strategy including:

1. Brand positioning and messaging
2. Target audience segmentation
3. Marketing channels and tactics
4. Content marketing strategy
5. Social media strategy
6. Launch campaign plan
7. Budget allocation recommendations
8. Success metrics and KPIs

Format your response as JSON:
{
  "brand_positioning": "How the brand should be positioned in the market",
  "key_messages": ["Message 1", "Message 2", "Message 3"],
  "target_segments": [
    {
      "segment": "Primary target segment",
      "characteristics": "Key characteristics",
      "channels": ["Channel 1", "Channel 2"]
    }
  ],
  "marketing_channels": [
    {
      "channel": "Channel name",
      "strategy": "How to use this channel",
      "budget_allocation": "Percentage of budget"
    }
  ],
  "content_strategy": {
    "content_types": ["Type 1", "Type 2"],
    "content_themes": ["Theme 1", "Theme 2"],
    "publishing_schedule": "How often to publish"
  },
  "social_media": {
    "platforms": ["Platform 1", "Platform 2"],
    "strategy": "Social media approach",
    "engagement_tactics": ["Tactic 1", "Tactic 2"]
  },
  "launch_campaign": {
    "pre_launch": "Pre-launch activities",
    "launch_day": "Launch day strategy",
    "post_launch": "Post-launch follow-up"
  },
  "budget_recommendations": {
    "total_budget": "Recommended total budget",
    "allocation": {
      "digital_ads": "Percentage",
      "content_creation": "Percentage",
      "events": "Percentage",
      "pr": "Percentage"
    }
  },
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}`;

    let response;
    try {
      console.log('📢 [CMO AGENT] Calling ASI:One API...');
      response = await this.generateResponse(prompt, 3000);
      console.log('📢 [CMO AGENT] Raw ASI:One response length:', response?.length);
      
      // Clean the response to handle JSON parsing issues
      let cleanedResponse = response
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t'); // Escape tabs
      
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      console.log('📢 [CMO AGENT] Attempting JSON parse...');
      const strategy = JSON.parse(cleanedResponse);
      console.log('📢 [CMO AGENT] Successfully parsed JSON!');
      console.log('📢 [CMO AGENT] Marketing strategy data:', {
        channels_count: strategy.marketing_channels?.length || 0,
        target_segments: strategy.target_segments?.length || 0,
        has_launch_plan: !!strategy.launch_campaign
      });
      
      await this.logActivity('Developed marketing strategy', { 
        product_name: product.product_name,
        channels_count: strategy.marketing_channels?.length || 0
      });
      
      return strategy;
    } catch (error) {
      console.error('❌ [CMO AGENT] Error developing marketing strategy:', error.message);
      console.error('❌ [CMO AGENT] Raw response:', response);
      console.error('❌ [CMO AGENT] Using fallback data...');
      
      // Return fallback marketing strategy if JSON parsing fails
      const fallbackStrategy = {
        brand_positioning: 'Innovative AI-powered solution for modern needs',
        key_messages: ['Cutting-edge technology', 'User-friendly experience', 'Proven results'],
        target_segments: [
          {
            segment: 'Primary target market',
            characteristics: 'Tech-savvy professionals',
            channels: ['Digital marketing', 'Social media']
          }
        ],
        marketing_channels: [
          {
            channel: 'Digital Marketing',
            strategy: 'Comprehensive digital presence',
            budget_allocation: '40%'
          },
          {
            channel: 'Social Media',
            strategy: 'Engaging content strategy',
            budget_allocation: '30%'
          }
        ],
        content_strategy: {
          content_types: ['Blog posts', 'Videos', 'Infographics'],
          content_themes: ['Product features', 'User success stories'],
          publishing_schedule: 'Weekly'
        },
        social_media: {
          platforms: ['LinkedIn', 'Twitter', 'Facebook'],
          strategy: 'Professional and engaging content',
          engagement_tactics: ['Community building', 'User-generated content']
        },
        launch_campaign: {
          pre_launch: 'Build anticipation and awareness',
          launch_day: 'Major announcement and media coverage',
          post_launch: 'Sustained marketing and user acquisition'
        },
        budget_recommendations: {
          total_budget: '$50,000 - $100,000',
          allocation: {
            digital_ads: '40%',
            content_creation: '25%',
            events: '20%',
            pr: '15%'
          }
        },
        success_metrics: ['Brand awareness', 'Lead generation', 'Customer acquisition cost']
      };
      
      console.log('📢 [CMO AGENT] Returning fallback strategy:', fallbackStrategy);
      return fallbackStrategy;
    }
  }
}

module.exports = CMOAgent;
