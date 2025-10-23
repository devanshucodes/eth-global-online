const ASIOneAgent = require('./ASIOneAgent');

class HeadOfEngineeringAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('Head of Engineering Agent', 'Technical implementation and website development strategy', apiKey);
  }

  async createBoltPrompt(idea, product, research, marketingStrategy, technicalStrategy) {
    // Add error handling for undefined idea
    if (!idea) {
      console.error('❌ [HEAD OF ENGINEERING] Error: idea parameter is undefined');
      throw new Error('Idea parameter is required but was not provided');
    }
    
    const prompt = `As a Head of Engineering, create a comprehensive Bolt prompt for building a website based on the following project:

Product Idea:
Title: ${idea.title}
Description: ${idea.description}

Product Concept:
Name: ${product.product_name}
Description: ${product.product_description}
Core Features: ${JSON.stringify(product.features)}
Target Market: ${JSON.stringify(product.target_market)}
Value Proposition: ${product.value_proposition}
Revenue Model: ${product.revenue_model}

Market Research Summary:
Market Size: ${research.market_analysis?.market_size || 'N/A'}
Growth Potential: ${research.market_analysis?.growth_potential || 'N/A'}
Competitors: ${JSON.stringify(research.competitors || [])}
Target Audience: ${research.recommendations?.target_audience || 'N/A'}

Marketing Strategy:
Brand Positioning: ${marketingStrategy.brand_positioning || 'N/A'}
Key Messages: ${JSON.stringify(marketingStrategy.key_messages || [])}
Target Segments: ${JSON.stringify(marketingStrategy.target_segments || [])}
Marketing Channels: ${JSON.stringify(marketingStrategy.marketing_channels || [])}

Technical Strategy:
Technology Stack: ${JSON.stringify(technicalStrategy.technology_stack || {})}
Architecture: ${technicalStrategy.architecture?.overview || 'N/A'}
Development Timeline: ${JSON.stringify(technicalStrategy.timeline || {})}

Create a detailed Bolt prompt that includes:
1. Website structure and pages needed
2. Design requirements and UI/UX specifications
3. Functional requirements and features
4. Content strategy and messaging
5. Technical specifications
6. Integration requirements
7. Performance and scalability needs
8. SEO and marketing considerations

Format your response as JSON:
{
  "website_title": "Website Title",
  "website_description": "Brief description of the website",
  "pages_required": ["Page 1", "Page 2", "Page 3"],
  "design_specifications": {
    "color_scheme": "Primary and secondary colors",
    "typography": "Font specifications",
    "layout_style": "Layout approach",
    "responsive_design": "Mobile-first requirements"
  },
  "functional_requirements": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "content_strategy": {
    "homepage_content": "Homepage content requirements",
    "about_page": "About page content",
    "features_page": "Features page content",
    "pricing_page": "Pricing page content",
    "contact_page": "Contact page content"
  },
  "technical_specifications": {
    "performance_requirements": "Performance targets",
    "seo_requirements": "SEO specifications",
    "analytics_setup": "Analytics requirements",
    "security_requirements": "Security measures"
  },
  "integration_requirements": [
    "Integration 1",
    "Integration 2"
  ],
  "bolt_prompt": "Complete Bolt prompt for website generation"
}`;

    let response;
    try {
      // Add timeout wrapper for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API call timeout after 30 seconds')), 30000);
      });
      
      const apiPromise = this.generateResponse(prompt, 4000);
      response = await Promise.race([apiPromise, timeoutPromise]);
      let cleanedResponse = response
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const boltPrompt = JSON.parse(cleanedResponse);
      
      await this.logActivity('Created Bolt prompt for website development', { 
        product_name: product.product_name,
        pages_count: boltPrompt.pages_required?.length || 0,
        features_count: boltPrompt.functional_requirements?.length || 0
      });
      
      return boltPrompt;
    } catch (error) {
      console.error('❌ [HEAD OF ENGINEERING] Error creating Bolt prompt:', error.message);
      console.error('❌ [HEAD OF ENGINEERING] Error type:', error.constructor.name);
      if (response) {
        console.error('❌ [HEAD OF ENGINEERING] Raw response length:', response.length);
        console.error('❌ [HEAD OF ENGINEERING] Raw response preview:', response.substring(0, 200));
      }
      return { 
        website_title: product.product_name + ' Website',
        website_description: product.product_description,
        pages_required: ['Home', 'About', 'Features', 'Pricing', 'Contact'],
        design_specifications: {
          color_scheme: 'Modern blue and white theme',
          typography: 'Clean, professional fonts',
          layout_style: 'Modern, minimalist design',
          responsive_design: 'Mobile-first approach'
        },
        functional_requirements: [
          'Responsive design',
          'Contact form',
          'Pricing calculator',
          'User testimonials'
        ],
        content_strategy: {
          homepage_content: 'Compelling headline and value proposition',
          about_page: 'Company story and mission',
          features_page: 'Detailed feature descriptions',
          pricing_page: 'Clear pricing tiers',
          contact_page: 'Contact information and form'
        },
        technical_specifications: {
          performance_requirements: 'Fast loading, optimized for speed',
          seo_requirements: 'SEO optimized content and structure',
          analytics_setup: 'Google Analytics integration',
          security_requirements: 'SSL certificate, secure forms'
        },
        integration_requirements: [
          'Email marketing integration',
          'Payment processing'
        ],
        bolt_prompt: `Create a modern, professional website for ${product.product_name}. The website should have a clean, minimalist design with a blue and white color scheme. Include a compelling homepage with hero section, features page showcasing the product capabilities, pricing page with clear tiers, about page with company story, and contact page with form. The site should be fully responsive and optimized for SEO. Focus on converting visitors into customers with clear call-to-action buttons and trust signals.`
      };
    }
  }
}

module.exports = HeadOfEngineeringAgent;
