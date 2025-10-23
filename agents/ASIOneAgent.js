const axios = require('axios');

class ASIOneAgent {
  constructor(name, role, apiKey) {
    this.name = name;
    this.role = role;
    this.apiKey = apiKey;
    this.model = 'asi1-mini';
    this.baseURL = 'https://api.asi1.ai/v1';
  }

  async generateResponse(prompt, maxTokens = 1000) {
    try {
      console.log(`🔑 [${this.name}] API Key length: ${this.apiKey?.length || 0}`);
      console.log(`🔑 [${this.name}] API Key starts with sk_: ${this.apiKey?.startsWith('sk_') || false}`);
      console.log(`🔑 [${this.name}] API Key first 20 chars: ${this.apiKey?.substring(0, 20) || 'undefined'}`);
      console.log(`🔑 [${this.name}] Model: ${this.model}`);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`Error in ${this.name}:`, error.response?.data || error.message);
      throw new Error(`ASI:One API error: ${error.message}`);
    }
  }

  async logActivity(activity, data = {}) {
    // This would typically log to database
    console.log(`[${this.name}] ${activity}:`, data);
  }
}

module.exports = ASIOneAgent;
