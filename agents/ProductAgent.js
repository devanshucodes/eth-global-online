const ASIOneAgent = require('./ASIOneAgent');

class ProductAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('Product Agent', 'Product strategy and concept development', apiKey);
  }

  async developProduct(idea, research) {
    const prompt = `As a product strategist, develop a detailed product concept based on this business idea and research:

Original Idea:
Title: ${idea.title}
Description: ${idea.description}
Revenue Model: ${idea.revenue_model}

Research Data:
Competitors: ${JSON.stringify(research.competitors || [])}
Market Analysis: ${JSON.stringify(research.market_analysis || {})}
Recommendations: ${JSON.stringify(research.recommendations || {})}

Create a comprehensive product concept that includes:

1. Product name and positioning
2. Core features and functionality
3. Target market segments
4. Value proposition
5. Go-to-market strategy
6. Revenue model refinement
7. Success metrics

Format your response as JSON:
{
  "product_name": "Final Product Name",
  "product_description": "Detailed product description",
  "core_features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "target_market": {
    "primary": "Primary target audience",
    "secondary": "Secondary target audience"
  },
  "value_proposition": "Why customers will choose this product",
  "go_to_market": {
    "channels": ["Channel 1", "Channel 2"],
    "pricing_strategy": "Pricing approach",
    "launch_plan": "Launch strategy"
  },
  "revenue_model": "How the product generates revenue",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}`;

    let response;
    try {
      response = await this.generateResponse(prompt, 3000);
      
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
      
      const product = JSON.parse(cleanedResponse);
      
      await this.logActivity('Developed product concept', { 
        product_name: product.product_name,
        features_count: product.core_features?.length || 0
      });
      
      return product;
    } catch (error) {
      console.error('Error developing product:', error);
      console.error('Raw response:', response);
      
      // Return a fallback product if JSON parsing fails
      return { 
        product_name: 'AI Product Concept', 
        product_description: 'A comprehensive product concept developed by AI agents',
        core_features: ['AI-powered functionality', 'User-friendly interface', 'Scalable architecture'],
        target_market: { primary: 'Target users', secondary: 'Secondary market' },
        value_proposition: 'Innovative AI solution for modern needs',
        go_to_market: { channels: ['Digital channels'], pricing_strategy: 'Subscription model', launch_plan: 'Phased rollout' },
        revenue_model: 'Subscription-based revenue model',
        success_metrics: ['User adoption', 'Revenue growth', 'Customer satisfaction']
      };
    }
  }
}

module.exports = ProductAgent;
