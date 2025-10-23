import React from 'react';
import './AgentFlow.css';

const AgentFlow = ({ 
  currentAgent, 
  agentActivity, 
  currentIdea, 
  research, 
  product, 
  marketingStrategy, 
  technicalStrategy, 
  boltPrompt, 
  onOpenBolt, 
  onStartMarketing 
}) => {
  // Define all agents in the system
  const agents = [
    { id: 'ceo', name: 'CEO Agent', subtitle: 'Strategic Overview', icon: '👔', position: 'top' },
    { id: 'research', name: 'Research Agent', subtitle: 'Market Analysis', icon: '🧠', position: 'left' },
    { id: 'product', name: 'Product Agent', subtitle: 'Product Development', icon: '🚀', position: 'center' },
    { id: 'cmo', name: 'CMO Agent', subtitle: 'Marketing Strategy', icon: '📢', position: 'right' },
    { id: 'cto', name: 'CTO Agent', subtitle: 'Technical Planning', icon: '⚙️', position: 'bottom-left' },
    { id: 'head-eng', name: 'Head of Engineering', subtitle: 'Bolt Prompt Creation', icon: '🎯', position: 'bottom-center' },
    { id: 'marketing', name: 'Marketing Agent', subtitle: marketingStrategy ? 'Work in Progress' : 'Campaign Execution', icon: '🎯', position: 'bottom-right' },
    { id: 'developer', name: 'Developer Agent', subtitle: boltPrompt ? 'Work in Progress' : 'Website Development', icon: '💻', position: 'bottom-right-2' }
  ];

  // Determine agent states based on current activity and workflow progress
  const getAgentState = (agentId) => {
    if (currentAgent && currentAgent.includes(agentId)) {
      return 'active';
    }
    
    // Check if agent has completed work based on workflow progress
    switch (agentId) {
      case 'ceo':
        return currentIdea ? 'completed' : 'waiting';
      case 'research':
        return research ? 'completed' : currentIdea ? 'waiting' : 'waiting';
      case 'product':
        return product ? 'completed' : research ? 'waiting' : 'waiting';
      case 'cmo':
        return marketingStrategy ? 'completed' : product ? 'waiting' : 'waiting';
      case 'cto':
        return technicalStrategy ? 'completed' : product ? 'waiting' : 'waiting';
      case 'head-eng':
        return boltPrompt ? 'completed' : (marketingStrategy && technicalStrategy) ? 'waiting' : 'waiting';
      case 'marketing':
        return marketingStrategy ? 'active' : product ? 'waiting' : 'waiting';
      case 'developer':
        return boltPrompt ? 'active' : 'waiting';
      default:
        return 'waiting';
    }
  };

  // Get communication flow between agents
  const getCommunicationFlow = () => {
    const flows = [];
    
    if (currentIdea && research) {
      flows.push({ from: 'ceo', to: 'research', status: 'completed' });
    }
    if (research && product) {
      flows.push({ from: 'research', to: 'product', status: 'completed' });
    }
    if (product) {
      flows.push({ from: 'product', to: 'cmo', status: 'active' });
      flows.push({ from: 'product', to: 'cto', status: 'active' });
    }
    if (marketingStrategy) {
      flows.push({ from: 'cmo', to: 'marketing', status: 'active' });
    }
    if (boltPrompt) {
      flows.push({ from: 'cto', to: 'head-eng', status: 'completed' });
      flows.push({ from: 'head-eng', to: 'developer', status: 'active' });
    }
    
    return flows;
  };

  const agentStates = agents.reduce((acc, agent) => {
    acc[agent.id] = getAgentState(agent.id);
    return acc;
  }, {});

  const communicationFlows = getCommunicationFlow();

  return (
    <div className="agent-flow">
      <div className="flow-header">
        <h3>Agent Workflow</h3>
        <div className="flow-status">
          {Object.values(agentStates).filter(state => state === 'completed').length} of {agents.length} completed
        </div>
      </div>
      
      <div className="flow-container">
        <div className="agents-grid">
          {agents.map((agent) => {
            const state = agentStates[agent.id];
            const isClickable = (agent.id === 'marketing' || agent.id === 'developer') && state === 'active';
            
            return (
              <div 
                key={agent.id} 
                className={`agent-card ${state} ${agent.position} ${isClickable ? 'clickable' : ''} ${agent.id === 'developer' ? 'developer-agent' : ''} ${agent.id === 'marketing' ? 'marketing-agent' : ''}`}
                onClick={isClickable ? () => {
                  if (agent.id === 'marketing') {
                    onStartMarketing();
                  } else if (agent.id === 'developer') {
                    onOpenBolt();
                  }
                } : undefined}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
              >
                <div className="agent-icon">
                  {agent.icon}
                </div>
                <div className="agent-info">
                  <h4>{agent.name}</h4>
                  <p className={(agent.id === 'developer' && boltPrompt) || (agent.id === 'marketing' && marketingStrategy) ? 'work-in-progress' : ''}>{agent.subtitle}</p>
                </div>
                <div className={`agent-status ${state}`}>
                  {state === 'active' && agent.id === 'marketing' && 'Active'}
                  {state === 'active' && agent.id === 'developer' && 'Active'}
                  {state === 'active' && agent.id !== 'marketing' && agent.id !== 'developer' && 'Working'}
                  {state === 'completed' && 'Complete'}
                  {state === 'waiting' && 'Waiting'}
                </div>
                {isClickable && (
                  <div className="click-indicator">
                    {agent.id === 'marketing' && '👆 Click to start campaigns'}
                    {agent.id === 'developer' && '👆 Click to open Developer agent'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Communication Lines */}
        <svg className="communication-lines" viewBox="0 0 800 600">
          {communicationFlows.map((flow, index) => {
            const fromAgent = agents.find(a => a.id === flow.from);
            const toAgent = agents.find(a => a.id === flow.to);
            
            if (!fromAgent || !toAgent) return null;

            // Calculate positions based on agent positions
            const positions = {
              top: { x: 400, y: 100 },
              left: { x: 150, y: 100 },
              center: { x: 650, y: 100 },
              right: { x: 900, y: 100 },
              'bottom-left': { x: 150, y: 300 },
              'bottom-center': { x: 400, y: 300 },
              'bottom-right': { x: 650, y: 300 },
              'bottom-right-2': { x: 900, y: 300 }
            };

            const fromPos = positions[fromAgent.position];
            const toPos = positions[toAgent.position];

            return (
              <line
                key={index}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                className={`flow-line ${flow.status}`}
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      {/* Current Activity Display */}
      {currentAgent && (
        <div className="current-activity">
          <div className="activity-indicator">
            <div className="pulse-dot"></div>
            <span>{currentAgent} is currently working...</span>
          </div>
        </div>
      )}

      {/* Recent Activity Log */}
      <div className="activity-summary">
        <h4>System Activity Log</h4>
        <div className="activity-list">
          {agentActivity.slice(-3).reverse().map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="agent-name">{activity.agent}:</span>
              <span className="action">{activity.action}</span>
              <span className="time">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentFlow;
