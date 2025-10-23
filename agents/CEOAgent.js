const ASIOneAgent = require('./ASIOneAgent');

class CEOAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('CEO Agent', 'Strategic decision making and idea generation', apiKey);
  }

  async generateIdeas(count = 3) {
    const prompt = `You are a visionary CEO of an AI company. Generate ${count} innovative business ideas that could potentially generate $1 million in revenue. 

For each idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Potential revenue model
4. Why it could be successful

Format your response as JSON with this structure:
{
  "ideas": [
    {
      "title": "Idea Title",
      "description": "Brief description",
      "revenue_model": "How it makes money",
      "success_factors": "Why it could work"
    }
  ]
}`;

    try {
      const response = await this.generateResponse(prompt, 2000);
      let ideasObj;

      try {
        ideasObj = JSON.parse(response);
      } catch {
        // Attempt to extract JSON substring if model returned extra prose
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            ideasObj = JSON.parse(match[0]);
          } catch (e) {
            console.error('Failed to parse extracted JSON from model response');
            throw e;
          }
        } else {
          throw new Error('Model response was not valid JSON');
        }
      }

      await this.logActivity('Generated business ideas', { count: ideasObj.ideas?.length || 0 });
      return ideasObj.ideas || [];
    } catch (error) {
      console.error('Error generating ideas:', error);
      return [];
    }
  }

  async evaluateProduct(productData) {
    const prompt = `As a CEO, evaluate this product concept for market viability:

Product: ${productData.product_name}
Description: ${productData.product_description}
Features: ${productData.features}
Target Market: ${productData.target_market}

Provide your assessment in JSON format:
{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}`;

    try {
      const response = await this.generateResponse(prompt, 1000);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error evaluating product:', error);
      return { go_decision: false, viability_score: 0 };
    }
  }
}

module.exports = CEOAgent;
