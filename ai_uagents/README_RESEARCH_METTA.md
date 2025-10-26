# Research Agent with MeTTa Knowledge Graphs

## Overview
An intelligent market research agent that combines ASI:One LLM capabilities with SingularityNET's MeTTa knowledge graphs for structured reasoning and deep market analysis.

## Features
- 🧠 **MeTTa Knowledge Graphs**: Structured knowledge representation and reasoning
- 📊 **Market Analysis**: Comprehensive competitor and market research
- 🔍 **Historical Context**: Leverages past research for better insights
- 🎯 **Pattern Recognition**: Identifies market trends and success factors
- 🤖 **ASI:One Integration**: Powered by ASI Alliance's native LLM

## Capabilities
- Conducts intelligent market research with structured reasoning
- Analyzes competitors, market size, and opportunities
- Provides strategic recommendations for positioning
- Learns from historical data and similar research
- Stores and queries business knowledge graphs

## REST Endpoints

### Research Idea (with MeTTa)
**POST** `/research-idea-metta`

**Request:**
```json
{
  "idea": {
    "title": "Smart Plant Monitor",
    "description": "IoT device that monitors houseplants"
  }
}
```

**Response:**
```json
{
  "competitors": [...],
  "market_analysis": {...},
  "recommendations": {...},
  "metta_insights": {
    "historical_context": "...",
    "similar_research": [...],
    "market_patterns": {...},
    "success_factors": [...]
  }
}
```

## Technologies Used
- uAgents Framework (Fetch.ai)
- MeTTa Knowledge Graphs (SingularityNET)
- ASI:One LLM (ASI Alliance)
- Python 3.9+

## Use Cases
- Startup market validation
- Product-market fit analysis
- Competitive intelligence
- Strategic positioning
- Investment research

## Author
AI Company Platform - ASI Alliance Hackathon Entry
