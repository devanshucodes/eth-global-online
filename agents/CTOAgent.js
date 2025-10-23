const ASIOneAgent = require('./ASIOneAgent');

class CTOAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('CTO Agent', 'Technical architecture and development strategy', apiKey);
  }

  async developTechnicalStrategy(idea, product, research) {
    console.log('⚙️ [CTO AGENT] Starting technical strategy for product:', product.product_name);
    
    const prompt = `As a Chief Technology Officer, develop a comprehensive technical strategy for this product:

Product Details:
Name: ${product.product_name}
Description: ${product.product_description}
Features: ${JSON.stringify(product.features || [])}
Target Market: ${JSON.stringify(product.target_market)}

Research Data:
Market Size: ${research?.market_analysis?.market_size || 'Not available'}
Competitors: ${JSON.stringify(research?.competitors || [])}
Key Challenges: ${JSON.stringify(research?.market_analysis?.key_challenges || [])}

Create a comprehensive technical strategy including:

1. Technology stack recommendations
2. System architecture design
3. Development methodology
4. Security and compliance requirements
5. Scalability and performance planning
6. Integration requirements
7. Development timeline and milestones
8. Team structure and hiring needs
9. Infrastructure requirements
10. Quality assurance strategy

Format your response as JSON:
{
  "technology_stack": {
    "frontend": ["Technology 1", "Technology 2"],
    "backend": ["Technology 1", "Technology 2"],
    "database": "Database technology",
    "cloud_platform": "Cloud provider",
    "ai_ml": ["AI/ML technology 1", "AI/ML technology 2"]
  },
  "architecture": {
    "overview": "High-level system architecture",
    "components": ["Component 1", "Component 2", "Component 3"],
    "data_flow": "How data flows through the system",
    "api_design": "API strategy and design"
  },
  "development_methodology": {
    "approach": "Agile/Waterfall/Other",
    "sprints": "Sprint duration and planning",
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "version_control": "Git strategy"
  },
  "security_compliance": {
    "security_measures": ["Measure 1", "Measure 2"],
    "compliance_requirements": ["Requirement 1", "Requirement 2"],
    "data_protection": "Data protection strategy",
    "authentication": "Authentication approach"
  },
  "scalability": {
    "performance_targets": "Performance goals",
    "scaling_strategy": "How to scale the system",
    "monitoring": "Monitoring and alerting strategy",
    "load_balancing": "Load balancing approach"
  },
  "integrations": {
    "third_party": ["Integration 1", "Integration 2"],
    "apis": "API integration strategy",
    "data_sources": "External data sources"
  },
  "timeline": {
    "phases": [
      {
        "phase": "Phase 1",
        "duration": "Duration",
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }
    ],
    "total_duration": "Total development time",
    "milestones": ["Milestone 1", "Milestone 2"]
  },
  "team_structure": {
    "roles_needed": ["Role 1", "Role 2", "Role 3"],
    "team_size": "Recommended team size",
    "hiring_priority": ["Priority 1", "Priority 2"]
  },
  "infrastructure": {
    "hosting": "Hosting requirements",
    "cdn": "CDN strategy",
    "backup": "Backup and disaster recovery",
    "monitoring": "Infrastructure monitoring"
  },
  "quality_assurance": {
    "testing_strategy": "Testing approach",
    "automation": "Test automation strategy",
    "performance_testing": "Performance testing plan",
    "security_testing": "Security testing approach"
  }
}`;

    let response;
    try {
      console.log('⚙️ [CTO AGENT] Calling ASI:One API...');
      response = await this.generateResponse(prompt, 3000);
      console.log('⚙️ [CTO AGENT] Raw ASI:One response length:', response?.length);
      
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
      
      console.log('⚙️ [CTO AGENT] Attempting JSON parse...');
      const strategy = JSON.parse(cleanedResponse);
      console.log('⚙️ [CTO AGENT] Successfully parsed JSON!');
      console.log('⚙️ [CTO AGENT] Technical strategy data:', {
        tech_stack_count: Object.keys(strategy.technology_stack || {}).length,
        phases_count: strategy.timeline?.phases?.length || 0,
        has_architecture: !!strategy.architecture
      });
      
      await this.logActivity('Developed technical strategy', { 
        product_name: product.product_name,
        tech_stack_count: Object.keys(strategy.technology_stack || {}).length
      });
      
      // Share with Head of Engineering
      await this.logActivity('Sharing technical strategy with Head of Engineering', { 
        product_name: product.product_name,
        strategy_shared: true
      });
      
      return strategy;
    } catch (error) {
      console.error('❌ [CTO AGENT] Error developing technical strategy:', error.message);
      console.error('❌ [CTO AGENT] Raw response:', response);
      console.error('❌ [CTO AGENT] Using fallback data...');
      
      // Return fallback technical strategy if JSON parsing fails
      const fallbackStrategy = {
        technology_stack: {
          frontend: ['React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'TypeScript'],
          database: 'PostgreSQL',
          cloud_platform: 'AWS',
          ai_ml: ['OpenAI API', 'TensorFlow', 'PyTorch']
        },
        architecture: {
          overview: 'Microservices architecture with API gateway',
          components: ['Frontend', 'Backend API', 'Database', 'AI Service'],
          data_flow: 'RESTful API communication between services',
          api_design: 'RESTful API with OpenAPI documentation'
        },
        development_methodology: {
          approach: 'Agile with 2-week sprints',
          sprints: '2-week sprints with daily standups',
          tools: ['Git', 'GitHub', 'Jira', 'Docker'],
          version_control: 'Git with feature branching'
        },
        security_compliance: {
          security_measures: ['HTTPS', 'JWT Authentication', 'Input validation'],
          compliance_requirements: ['GDPR', 'SOC 2'],
          data_protection: 'End-to-end encryption',
          authentication: 'OAuth 2.0 with JWT tokens'
        },
        scalability: {
          performance_targets: '99.9% uptime, <200ms response time',
          scaling_strategy: 'Horizontal scaling with load balancers',
          monitoring: 'Prometheus and Grafana',
          load_balancing: 'Application Load Balancer'
        },
        integrations: {
          third_party: ['Payment Gateway', 'Email Service', 'Analytics'],
          apis: 'RESTful API for third-party integrations',
          data_sources: 'External APIs and databases'
        },
        timeline: {
          phases: [
            {
              phase: 'MVP Development',
              duration: '3 months',
              deliverables: ['Core features', 'Basic UI', 'API']
            },
            {
              phase: 'Enhancement',
              duration: '2 months',
              deliverables: ['Advanced features', 'Performance optimization']
            }
          ],
          total_duration: '5 months',
          milestones: ['MVP Launch', 'Beta Release', 'Full Launch']
        },
        team_structure: {
          roles_needed: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer'],
          team_size: '4-6 developers',
          hiring_priority: ['Senior Backend Developer', 'DevOps Engineer']
        },
        infrastructure: {
          hosting: 'AWS EC2 with Auto Scaling',
          cdn: 'CloudFront for static assets',
          backup: 'Daily automated backups',
          monitoring: 'CloudWatch and custom monitoring'
        },
        quality_assurance: {
          testing_strategy: 'Unit, Integration, and E2E testing',
          automation: 'Automated testing pipeline with CI/CD',
          performance_testing: 'Load testing with realistic data',
          security_testing: 'Regular security audits and penetration testing'
        }
      };
      
      console.log('⚙️ [CTO AGENT] Returning fallback strategy:', fallbackStrategy);
      return fallbackStrategy;
    }
  }
}

module.exports = CTOAgent;
