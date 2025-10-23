const ASIOneAgent = require('./ASIOneAgent');

class ResearchAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('Research Agent', 'Market research and competitive analysis', apiKey);
  }

  async researchIdea(idea) {
    console.log('🔍 [RESEARCH AGENT] Starting research for idea:', idea.title);
    console.log('🔍 [RESEARCH AGENT] Idea details:', {
      title: idea.title,
      description: idea.description?.substring(0, 100) + '...',
      revenue_model: idea.revenue_model?.substring(0, 100) + '...'
    });

    const prompt = `As a market research specialist, analyze this business idea:

Title: ${idea.title}
Description: ${idea.description}
Revenue Model: ${idea.revenue_model}

Conduct thorough research and provide:

1. Existing competitors in this space
2. Market size and opportunity
3. Key challenges and barriers
4. Success factors for this type of business
5. Recommended positioning strategy

Format your response as JSON:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "description": "What they do",
      "strengths": "Their advantages",
      "weaknesses": "Their limitations"
    }
  ],
  "market_analysis": {
    "market_size": "Estimated market size",
    "growth_potential": "High/Medium/Low",
    "key_challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  },
  "recommendations": {
    "positioning": "How to position this product",
    "differentiation": "How to stand out",
    "target_audience": "Primary target market"
  }
}`;

    let response;
    try {
      console.log('🔍 [RESEARCH AGENT] Calling ASI:One API...');
      response = await this.generateResponse(prompt, 2500);
      console.log('🔍 [RESEARCH AGENT] Raw ASI:One response length:', response?.length);
      console.log('🔍 [RESEARCH AGENT] Raw ASI:One response preview:', response?.substring(0, 200) + '...');
      
      // Clean the response to handle JSON parsing issues
      let cleanedResponse = response
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t'); // Escape tabs
      
      console.log('🔍 [RESEARCH AGENT] Cleaned response preview:', cleanedResponse?.substring(0, 200) + '...');
      
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
        console.log('🔍 [RESEARCH AGENT] Extracted JSON preview:', cleanedResponse?.substring(0, 200) + '...');
      }
      
      console.log('🔍 [RESEARCH AGENT] Attempting JSON parse...');
      const research = JSON.parse(cleanedResponse);
      console.log('🔍 [RESEARCH AGENT] Successfully parsed JSON!');
      console.log('🔍 [RESEARCH AGENT] Research data:', {
        competitors_count: research.competitors?.length || 0,
        market_size: research.market_analysis?.market_size || 'N/A',
        growth_potential: research.market_analysis?.growth_potential || 'N/A',
        target_audience: research.recommendations?.target_audience || 'N/A'
      });
      
      await this.logActivity('Conducted market research', { 
        idea_title: idea.title,
        competitors_found: research.competitors?.length || 0
      });
      
      return research;
    } catch (error) {
      console.error('❌ [RESEARCH AGENT] Error researching idea:', error.message);
      console.error('❌ [RESEARCH AGENT] Raw response:', response);
      console.error('❌ [RESEARCH AGENT] Using fallback data...');
      
      // Return fallback research data if JSON parsing fails
      const fallbackData = { 
        competitors: [
          { name: 'Competitor 1', description: 'Leading competitor in the market', strengths: 'Strong market presence', weaknesses: 'Limited innovation' },
          { name: 'Competitor 2', description: 'Emerging competitor', strengths: 'Innovative approach', weaknesses: 'Small market share' }
        ], 
        market_analysis: { 
          market_size: 'Large and growing market', 
          growth_potential: 'High',
          key_challenges: ['Market competition', 'Regulatory requirements'],
          opportunities: ['Growing demand', 'Technology advancement']
        }, 
        recommendations: {
          positioning: 'Innovative and user-focused solution',
          differentiation: 'Unique value proposition',
          target_audience: 'Primary target market'
        }
      };
      
      console.log('🔍 [RESEARCH AGENT] Returning fallback data:', fallbackData);
      return fallbackData;
    }
  }
}

module.exports = ResearchAgent;
