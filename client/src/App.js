import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AgentFlow from './AgentFlow';
import RevenueDashboard from './RevenueDashboard';

function App() {
  // Simple frontend state - no database IDs needed
  const [currentIdea, setCurrentIdea] = useState(null);
  const [research, setResearch] = useState(null);
  const [product, setProduct] = useState(null);
  const [marketingStrategy, setMarketingStrategy] = useState(null);
  const [technicalStrategy, setTechnicalStrategy] = useState(null);
  const [boltPrompt, setBoltPrompt] = useState(null);
  const [workflowStep, setWorkflowStep] = useState('initial'); // Track current workflow step
  const [agentActivity, setAgentActivity] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenHolderId] = useState('token_holder_' + Math.random().toString(36).substr(2, 9));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState('dashboard'); // New state for page navigation
  const [selectedCompany, setSelectedCompany] = useState(null); // For individual company view
  const [selectedAgent, setSelectedAgent] = useState(null); // For agent detail view
  const boltWindowRef = useRef(null);
  
  // Real data from API (replacing mock data)
  const [ceoAgents, setCeoAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  // Countdown timer state
  const [countdownTimers, setCountdownTimers] = useState({});

  // Real data from API (replacing mock data)
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
  // Portfolio data
  const [portfolioData, setPortfolioData] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  
  // Create CEO Agent form state
  const [createForm, setCreateForm] = useState({
    name: '',
    company_idea: '',
    description: '',
    ceo_characteristics: '',
    total_tokens: 100,
    price_per_token: 5.00,
    token_symbol: '',
    launch_timeline: 10, // minutes until launch
    time_duration: 10 // minutes for agent operation (same as launch_timeline)
  });
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [createFormMessage, setCreateFormMessage] = useState(null);

  // API Base URL normalization
  // Accept either a host (http://localhost:5001) or a full API URL (http://localhost:5001/api)
  const _API_HOST = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/+$/, '');
  const API_BASE = _API_HOST.endsWith('/api') ? _API_HOST : `${_API_HOST}/api`;

  // Debug: log API base and ensure it's correctly configured
  useEffect(() => {
    console.log('🚀 [FRONTEND] API_BASE =', API_BASE);
    
    // Verify API connectivity
    fetch(`${API_BASE}/health-check`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('✅ [FRONTEND] API connection successful');
        } else {
          console.error('❌ [FRONTEND] API health check failed');
        }
      })
      .catch(error => {
        console.error('❌ [FRONTEND] API connection error:', error.message);
      });
  }, [API_BASE]);

  // API Functions
  const fetchCeoAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(`${API_BASE}/ceo-agents`);
      const data = await response.json();
      if (data.success) {
        setCeoAgents(data.data || []);
        // Initialize countdown timers for agents with launch dates
        initializeCountdownTimers(data.data || []);
      } else {
        console.error('Failed to fetch CEO agents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching CEO agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Initialize countdown timers for agents
  const initializeCountdownTimers = (agents) => {
    const timers = {};
    agents.forEach(agent => {
      if (agent.launch_date && agent.status === 'available') {
        const launchTime = new Date(agent.launch_date).getTime();
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.floor((launchTime - now) / 1000));
        
        if (timeLeft > 0) {
          timers[agent.id] = timeLeft;
        } else {
          // If launch time has passed, launch immediately
          setTimeout(() => launchAgent(agent.id), 100);
        }
      }
    });
    setCountdownTimers(timers);
  };

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimers(prevTimers => {
        const newTimers = {};
        let hasActiveTimers = false;
        
        Object.entries(prevTimers).forEach(([agentId, timeLeft]) => {
          if (timeLeft > 1) {
            newTimers[agentId] = timeLeft - 1;
            hasActiveTimers = true;
          } else if (timeLeft === 1) {
            // Timer reached zero - launch the agent
            launchAgent(parseInt(agentId));
          }
        });
        
        if (!hasActiveTimers) {
          clearInterval(interval);
        }
        
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Launch agent when countdown reaches zero
  const launchAgent = async (agentId) => {
    // Check if agent is already being launched to prevent multiple calls
    if (countdownTimers[agentId] === 'launching') {
      return;
    }
    
    // Mark as launching
    setCountdownTimers(prev => ({
      ...prev,
      [agentId]: 'launching'
    }));
    
    try {
      const response = await fetch(`${API_BASE}/ceo-agents/${agentId}/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        // Remove from countdown timers
        setCountdownTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[agentId];
          return newTimers;
        });
        
        // Refresh both agents and companies lists
        fetchCeoAgents();
        fetchCompanies();
      } else {
        console.error('Failed to launch agent:', data.error);
      }
    } catch (error) {
      console.error('Error launching agent:', error);
    }
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch(`${API_BASE}/companies`);
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data || []);
      } else {
        console.error('Failed to fetch companies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchPortfolio = async () => {
    setLoadingPortfolio(true);
    try {
      const response = await fetch(`${API_BASE}/portfolio/${tokenHolderId}`);
      const data = await response.json();
      if (data.success) {
        setPortfolioData(data.portfolio);
      } else {
        console.error('Failed to fetch portfolio:', data.error);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const createCeoAgent = async (formData) => {
    setCreateFormLoading(true);
    setCreateFormMessage(null);
    try {
      const response = await fetch(`${API_BASE}/ceo-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creator_wallet: tokenHolderId
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCreateFormMessage({ type: 'success', text: data.message });
        setCreateForm({
          name: '',
          company_idea: '',
          description: '',
          ceo_characteristics: '',
          total_tokens: 100,
          price_per_token: 5.00,
          token_symbol: '',
          launch_timeline: 10,
          time_duration: 10
        });
        // Refresh CEO agents list
        fetchCeoAgents();
      } else {
        setCreateFormMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      console.error('Error creating CEO agent:', error);
      setCreateFormMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setCreateFormLoading(false);
    }
  };

  const buyTokens = async (agentId, tokensAmount) => {
    try {
      const response = await fetch(`${API_BASE}/ceo-agents/${agentId}/buy-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_wallet: tokenHolderId,
          tokens_to_buy: tokensAmount
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Success! ${data.message}`);
        // Refresh data
        fetchCeoAgents();
        fetchPortfolio();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error buying tokens:', error);
      alert('Network error. Please try again.');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCeoAgents();
    fetchCompanies();
    fetchPortfolio();
  }, [tokenHolderId]);

  // Load company workflow state when company dashboard is opened
  useEffect(() => {
    if (currentPage === 'company-dashboard' && selectedCompany) {
      loadCompanyWorkflow(selectedCompany.id);
    }
  }, [currentPage, selectedCompany]);

  // Load company workflow state from database
  const loadCompanyWorkflow = async (companyId) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/company-workflow/${companyId}`);
      const data = await response.json();
      
      if (data.success && data.workflow) {
        const workflow = data.workflow;
        
        // Set workflow step
        setWorkflowStep(workflow.current_step || 'initial');
        
        // Set up company idea
        const companyIdea = {
          id: companyId,
          title: selectedCompany.company_idea,
          description: selectedCompany.description,
          potential_revenue: "$1M+",
          status: 'approved'
        };
        setCurrentIdea(companyIdea);
        
        // Set up workflow state based on current step
        let activity = [{
          id: 1,
          agent: 'CEO Agent',
          activity: 'Company launched and ready to work',
          timestamp: new Date().toISOString(),
          data: companyIdea
        }];
        
        if (workflow.current_step === 'research' || workflow.current_step === 'product') {
          activity.push({
            id: 2,
            agent: 'Research Agent',
            activity: 'Conducting market research...',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.research_data) {
          setResearch(workflow.research_data);
          activity.push({
            id: 3,
            agent: 'Research Agent',
            activity: 'Research completed successfully!',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'product' || workflow.current_step === 'voting') {
          activity.push({
            id: 4,
            agent: 'Product Agent',
            activity: 'Developing product concept...',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.product_data) {
          setProduct(workflow.product_data);
          activity.push({
            id: 5,
            agent: 'Product Agent',
            activity: 'Product Development Report (PDR) completed!',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'voting') {
          activity.push({
            id: 6,
            agent: 'System',
            activity: 'PDR ready for token holder approval',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'approved' || workflow.current_step === 'complete') {
          activity.push({
            id: 7,
            agent: 'Token Holders',
            activity: 'PDR approved! CMO and CTO agents working...',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.marketing_strategy) {
          setMarketingStrategy(workflow.marketing_strategy);
          activity.push({
            id: 8,
            agent: 'CMO Agent',
            activity: 'Marketing strategy completed!',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.technical_strategy) {
          setTechnicalStrategy(workflow.technical_strategy);
          activity.push({
            id: 9,
            agent: 'CTO Agent',
            activity: 'Technical strategy completed!',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'engineering' || workflow.current_step === 'complete') {
          activity.push({
            id: 10,
            agent: 'Head of Engineering',
            activity: workflow.current_step === 'complete' ? 'Bolt prompt created! Developer Agent ready.' : 'Creating Bolt prompt for website development...',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'complete') {
          activity.push({
            id: 11,
            agent: 'Developer Agent',
            activity: '✅ Ready to build website! Click to open Bolt.diy',
            timestamp: new Date().toISOString()
          });
          activity.push({
            id: 12,
            agent: 'System',
            activity: '🎉 Complete workflow finished! All agents done!',
            timestamp: new Date().toISOString()
          });
        }
        
        if (workflow.current_step === 'rejected') {
          activity.push({
            id: 13,
            agent: 'Token Holders',
            activity: 'PDR rejected. Workflow paused.',
            timestamp: new Date().toISOString()
          });
        }
        
        setAgentActivity(activity);
        
        // If workflow is complete, fetch the bolt prompt
        if (workflow.current_step === 'complete') {
          fetchBoltPromptForCompany(companyId);
        }
      }
    } catch (error) {
      console.error('Error loading company workflow:', error);
    }
  };

  // Fetch bolt prompt for a company
  const fetchBoltPromptForCompany = async (companyId) => {
    try {
      console.log('🔍 [BOLT FETCH] Fetching bolt prompt for company:', companyId);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const url = `${apiUrl}/api/database/companies/${companyId}`;
      console.log('🔍 [BOLT FETCH] URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('🔍 [BOLT FETCH] Response data:', data);
      console.log('🔍 [BOLT FETCH] data.success:', data.success);
      console.log('🔍 [BOLT FETCH] data.company:', data.company);
      console.log('🔍 [BOLT FETCH] data.company.boltPrompt:', data.company?.boltPrompt);
      
      if (data.success && data.company && data.company.boltPrompt) {
        console.log('✅ [BOLT] Bolt prompt loaded for company', companyId, ':', data.company.boltPrompt.website_title);
        console.log('✅ [BOLT] Prompt preview:', data.company.boltPrompt.bolt_prompt?.substring(0, 100));
        setBoltPrompt(data.company.boltPrompt);
      } else {
        console.log('❌ [BOLT] No bolt prompt found for company', companyId);
        console.log('❌ [BOLT] Setting boltPrompt to null');
        setBoltPrompt(null);
      }
    } catch (error) {
      console.error('❌ [BOLT] Error fetching bolt prompt:', error);
    }
  };

  // Vote on company workflow (PDR approval)
  const voteOnCompanyWorkflow = async (vote, feedback = '') => {
    console.log('🗳️ [VOTE] Button clicked! Vote:', vote, 'Company:', selectedCompany?.id);
    
    if (!selectedCompany) {
      console.log('❌ [VOTE] No selected company!');
      alert('Error: No company selected. Please try refreshing the page.');
      return;
    }
    
    console.log('🗳️ [VOTE] Sending vote request to backend...');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/company-workflow/${selectedCompany.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          vote, 
          feedback, 
          voterId: tokenHolderId || 'anonymous' 
        }),
      });
      
      console.log('🗳️ [VOTE] Response status:', response.status);
      const data = await response.json();
      console.log('🗳️ [VOTE] Response data:', data);
      
      if (data.success) {
        setAgentActivity(prev => [...prev, { 
          agent: 'Token Holder', 
          action: `PDR ${vote}d`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Auto-continue workflow if approved
        if (vote === 'approve') {
          setTimeout(() => {
            setAgentActivity(prev => [...prev, { 
              agent: 'System', 
              action: 'PDR approved! CMO and CTO agents will start automatically...', 
              time: new Date().toLocaleTimeString() 
            }]);
            // Backend will automatically trigger CMO and CTO agents
            // Reload workflow state after a delay to get the updated strategies
            setTimeout(() => loadCompanyWorkflow(selectedCompany.id), 3000);
          }, 1000);
        }
        
        // Reload workflow state
        loadCompanyWorkflow(selectedCompany.id);
      } else {
        console.log('❌ [VOTE] Vote failed:', data.error);
        alert(`Vote failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ [VOTE] Error voting on workflow:', error);
      alert(`Error submitting vote: ${error.message}`);
      setAgentActivity(prev => [...prev, { 
        agent: 'System', 
        action: `Error: ${error.message}`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // Helper function to safely format target market segments
  const formatSegment = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') {
      if (val.segment) return val.segment;
      if (val.segments) return Array.isArray(val.segments) ? val.segments.join(', ') : String(val.segments);
      return Object.values(val).filter(v => typeof v === 'string').join(', ') || 'N/A';
    }
    return String(val);
  };

  // Initialize with empty state - no database dependency
  useEffect(() => {
    console.log('🚀 [FRONTEND] App initialized - ready for AI agent workflow');
  }, []);

  // Removed fetchIdeas function - no database dependency needed

  const generateIdeas = async () => {
    setLoading(true);
    setCurrentAgent('CEO Agent');
    
    // Clear all previous state to start fresh
    setCurrentIdea(null);
    setResearch(null);
    setProduct(null);
    setMarketingStrategy(null);
    setTechnicalStrategy(null);
    setBoltPrompt(null);
    setAgentActivity([]);
    
    setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Generating new business idea...', time: new Date().toLocaleTimeString() }]);
    
    try {
      // Use the NEW Python uAgent system via orchestrator
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/agents/process-complete-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_input: "User building AI agents for company workflow",
          idea_count: 1 
        }),
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        const workflowData = data.data;
        
        // Set all the workflow data
        if (workflowData.idea) {
          setCurrentIdea(workflowData.idea);
          setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: `Generated idea: ${workflowData.idea.title}`, time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.research) {
          setResearch(workflowData.research);
          setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Market research completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.product) {
          setProduct(workflowData.product);
          setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: `Product concept: ${workflowData.product.product_name}`, time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.marketing) {
          setMarketingStrategy(workflowData.marketing);
          setAgentActivity(prev => [...prev, { agent: 'CMO Agent', action: 'Marketing strategy completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.technical) {
          setTechnicalStrategy(workflowData.technical);
          setAgentActivity(prev => [...prev, { agent: 'CTO Agent', action: 'Technical strategy completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.bolt_prompt) {
          setBoltPrompt(workflowData.bolt_prompt);
          setAgentActivity(prev => [...prev, { agent: 'Head of Engineering', action: 'Bolt prompt created', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.finance) {
          setAgentActivity(prev => [...prev, { agent: 'Finance Agent', action: `Revenue analysis: $${workflowData.finance.revenue_projection?.most_likely?.toLocaleString()}`, time: new Date().toLocaleTimeString() }]);
        }
        
        setAgentActivity(prev => [...prev, { agent: 'Complete Workflow', action: '🎉 Complete workflow executed successfully!', time: new Date().toLocaleTimeString() }]);
        console.log('🎯 [FRONTEND] Complete workflow executed:', workflowData.workflow_summary);
      } else {
        setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: `Error: ${data.message || 'Workflow failed'}`, time: new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: `Error: ${error.message}`, time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  const runCompleteWorkflow = async () => {
    setLoading(true);
    setCurrentAgent('Complete Workflow');
    
    // Clear all previous state to start fresh
    setCurrentIdea(null);
    setResearch(null);
    setProduct(null);
    setMarketingStrategy(null);
    setTechnicalStrategy(null);
    setBoltPrompt(null);
    setAgentActivity([]);
    
    setAgentActivity(prev => [...prev, { agent: 'Complete Workflow', action: 'Starting complete AI company workflow...', time: new Date().toLocaleTimeString() }]);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/agents/process-complete-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_input: "User building AI agents for company workflow",
          idea_count: 1 
        }),
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        const workflowData = data.data;
        
        // Set all the workflow data
        if (workflowData.idea) {
          setCurrentIdea(workflowData.idea);
          setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: `Generated idea: ${workflowData.idea.title}`, time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.research) {
          setResearch(workflowData.research);
          setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Market research completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.product) {
          setProduct(workflowData.product);
          setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: `Product concept: ${workflowData.product.product_name}`, time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.marketing) {
          setMarketingStrategy(workflowData.marketing);
          setAgentActivity(prev => [...prev, { agent: 'CMO Agent', action: 'Marketing strategy completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.technical) {
          setTechnicalStrategy(workflowData.technical);
          setAgentActivity(prev => [...prev, { agent: 'CTO Agent', action: 'Technical strategy completed', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.bolt_prompt) {
          setBoltPrompt(workflowData.bolt_prompt);
          setAgentActivity(prev => [...prev, { agent: 'Head of Engineering', action: 'Bolt prompt created', time: new Date().toLocaleTimeString() }]);
        }
        
        if (workflowData.finance) {
          setAgentActivity(prev => [...prev, { agent: 'Finance Agent', action: `Revenue analysis: $${workflowData.finance.revenue_projection?.most_likely?.toLocaleString()}`, time: new Date().toLocaleTimeString() }]);
        }
        
        setAgentActivity(prev => [...prev, { agent: 'Complete Workflow', action: '🎉 Complete workflow executed successfully!', time: new Date().toLocaleTimeString() }]);
        console.log('🎯 [FRONTEND] Complete workflow executed:', workflowData.workflow_summary);
      } else {
        setAgentActivity(prev => [...prev, { agent: 'Complete Workflow', action: `Error: ${data.message || 'Workflow failed'}`, time: new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      console.error('Error running complete workflow:', error);
      setAgentActivity(prev => [...prev, { agent: 'Complete Workflow', action: `Error: ${error.message}`, time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  const researchIdea = async () => {
    if (!currentIdea) return;
    
    setLoading(true);
    setCurrentAgent('Research Agent');
    setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Conducting market research...', time: new Date().toLocaleTimeString() }]);
    
    try {
      // Use the NEW Python uAgent system directly
      const response = await fetch('http://localhost:8002/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: currentIdea }),
      });
      const data = await response.json();
      console.log('🔍 [FRONTEND] Research response:', data);
      
      if (data.success) {
        console.log('🔍 [FRONTEND] Setting research data:', data.research);
        setResearch(data.research);
        setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Research completed successfully!', time: new Date().toLocaleTimeString() }]);
        setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Sharing research data with Product Agent...', time: new Date().toLocaleTimeString() }]);
        
        // Auto-trigger Product Agent after research completes
        setTimeout(() => {
          console.log('🔍 [FRONTEND] About to call developProduct after timeout');
          setAgentActivity(prev => [...prev, { agent: '🔄 Data Transfer', action: 'Research data successfully transferred to Product Agent', time: new Date().toLocaleTimeString() }]);
          setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Received research data. Starting product development...', time: new Date().toLocaleTimeString() }]);
          developProductWithData(currentIdea, data.research);
        }, 2000);
      }
    } catch (error) {
      console.error('Error researching idea:', error);
      setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Error in research', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  const developProductWithData = async (ideaData, researchData) => {
    console.log('🚀 [FRONTEND] developProductWithData called with:', { idea: !!ideaData, research: !!researchData });
    
    if (!ideaData || !researchData) {
      console.log('❌ [FRONTEND] developProductWithData blocked - missing data:', { idea: !!ideaData, research: !!researchData });
      setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Error: Missing required data for product development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    setLoading(true);
    setCurrentAgent('Product Agent');
    setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Developing product concept...', time: new Date().toLocaleTimeString() }]);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/agents/develop-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          research: researchData
        }),
      });
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
        setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Product concept developed successfully!', time: new Date().toLocaleTimeString() }]);
        setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Sharing product concept with CEO Agent...', time: new Date().toLocaleTimeString() }]);
        
        // Auto-trigger CEO validation after product is ready
        setTimeout(() => {
          setAgentActivity(prev => [...prev, { agent: '🔄 Data Transfer', action: 'Product concept successfully transferred to CEO Agent', time: new Date().toLocaleTimeString() }]);
          setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Received product concept. Evaluating market viability...', time: new Date().toLocaleTimeString() }]);
          setTimeout(() => {
            setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Product evaluation complete! Approved for token holder vote.', time: new Date().toLocaleTimeString() }]);
            setAgentActivity(prev => [...prev, { agent: '🎯 Final Stage', action: 'Product concept ready for token holder approval!', time: new Date().toLocaleTimeString() }]);
          }, 3000);
        }, 2000);
      }
    } catch (error) {
      console.error('Error developing product:', error);
      setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Error in product development - using fallback data', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  // developProduct fallback function removed - using developProductWithData directly

  const triggerCMOAndCTOWithData = async (ideaData, productData, researchData) => {
    console.log('🚀 [FRONTEND] triggerCMOAndCTOWithData called with:', { idea: !!ideaData, product: !!productData, research: !!researchData });
    
    if (!ideaData || !productData) {
      console.log('❌ [FRONTEND] triggerCMOAndCTOWithData blocked - missing data:', { idea: !!ideaData, product: !!productData });
      setAgentActivity(prev => [...prev, { agent: 'CMO & CTO Agents', action: 'Error: Missing required data for strategy development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    console.log('🚀 [FRONTEND] Triggering CMO & CTO for product:', productData.product_name);
    setLoading(true);
    setCurrentAgent('CMO & CTO Agents');
    
    try {
      // Trigger CMO Agent
      setAgentActivity(prev => [...prev, { 
        agent: 'CMO Agent', 
        action: 'Developing marketing strategy...', 
        time: new Date().toLocaleTimeString() 
      }]);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const cmoResponse = await fetch(`${apiUrl}/api/agents/marketing-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          product: productData
        }),
      });
      const cmoData = await cmoResponse.json();
      
      if (cmoData.success) {
        setMarketingStrategy(cmoData.strategy);
        setAgentActivity(prev => [...prev, { 
          agent: 'CMO Agent', 
          action: `Marketing strategy complete! ${cmoData.strategy.marketing_channels?.length || 0} channels identified`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Trigger Marketing Agent after CMO completes
        setTimeout(() => {
          setAgentActivity(prev => [...prev, { 
            agent: '🔄 Data Transfer', 
            action: 'Marketing strategy shared with Marketing Agent', 
            time: new Date().toLocaleTimeString() 
          }]);
          setAgentActivity(prev => [...prev, { 
            agent: 'Marketing Agent', 
            action: 'Work in Progress - Click to check marketing agent', 
            time: new Date().toLocaleTimeString() 
          }]);
        }, 1000);
      }
      
      // Trigger CTO Agent
      setAgentActivity(prev => [...prev, { 
        agent: 'CTO Agent', 
        action: 'Developing technical strategy...', 
        time: new Date().toLocaleTimeString() 
      }]);
      
      // Use orchestrator for complete workflow instead of individual agent calls
      const ctoResponse = await fetch(`${apiUrl}/api/agents/process-complete-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_input: ideaData.title || "AI-powered business solution",
          idea_count: 1
        }),
      });
      const ctoData = await ctoResponse.json();
      
      if (ctoData.success && ctoData.data) {
        const workflowData = ctoData.data;
        
        // Set all the workflow data
        if (workflowData.technical) {
          setTechnicalStrategy(workflowData.technical);
          setAgentActivity(prev => [...prev, { 
            agent: 'CTO Agent', 
            action: `Technical strategy complete! ${Object.keys(workflowData.technical.technology_stack || {}).length} tech components planned`, 
            time: new Date().toLocaleTimeString() 
          }]);
        }
        
        if (workflowData.bolt_prompt) {
          setBoltPrompt(workflowData.bolt_prompt);
          setAgentActivity(prev => [...prev, { 
            agent: 'Head of Engineering', 
            action: 'Bolt prompt created for website development', 
            time: new Date().toLocaleTimeString() 
          }]);
        }
        
        if (workflowData.marketing) {
          setMarketingStrategy(workflowData.marketing);
          setAgentActivity(prev => [...prev, { 
            agent: 'CMO Agent', 
            action: 'Marketing strategy completed', 
            time: new Date().toLocaleTimeString() 
          }]);
        }
        
        // All agents completed via orchestrator - no need for individual calls
      }
      
      setAgentActivity(prev => [...prev, { 
        agent: 'System', 
        action: '🎉 Complete workflow executed! All agents finished successfully!', 
        time: new Date().toLocaleTimeString() 
      }]);
      
    } catch (error) {
      console.error('Error triggering CMO/CTO agents:', error);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  // Fallback function for backward compatibility
  const triggerCMOAndCTO = async () => {
    console.log('🚀 [FRONTEND] triggerCMOAndCTO (fallback) called with:', { currentIdea: !!currentIdea, product: !!product });
    
    if (!currentIdea || !product) {
      console.log('❌ [FRONTEND] triggerCMOAndCTO (fallback) blocked - missing data:', { currentIdea: !!currentIdea, product: !!product });
      setAgentActivity(prev => [...prev, { agent: 'CMO & CTO Agents', action: 'Error: Missing required data for strategy development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    // Use the new function with current state
    triggerCMOAndCTOWithData(currentIdea, product, research);
  };

  const createBoltPromptWithData = async (ideaData, productData, researchData, marketingStrategyData, technicalStrategyData) => {
    console.log('🔧 [FRONTEND] createBoltPromptWithData called with:', { 
      idea: !!ideaData, 
      product: !!productData, 
      research: !!researchData,
      marketing: !!marketingStrategyData,
      technical: !!technicalStrategyData
    });
    
    if (!ideaData || !productData || !marketingStrategyData || !technicalStrategyData) {
      console.log('❌ [FRONTEND] createBoltPromptWithData blocked - missing data');
      setAgentActivity(prev => [...prev, { agent: 'Head of Engineering', action: 'Error: Missing required data for bolt prompt creation', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    console.log('🔧 [FRONTEND] Starting Bolt prompt creation for product:', productData.product_name);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/agents/bolt-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          product: productData,
          research: researchData,
          marketingStrategy: marketingStrategyData,
          technicalStrategy: technicalStrategyData
        }),
      });
      const data = await response.json();
      console.log('🔧 [FRONTEND] Bolt prompt API response:', data);
      
      if (data.success) {
        setBoltPrompt(data.boltPrompt);
        
        setAgentActivity(prev => [...prev, { 
          agent: 'Head of Engineering', 
          action: `Bolt prompt created! ${data.boltPrompt.pages_required?.length || 0} pages planned for website`, 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: '🔄 Data Transfer', 
          action: 'Bolt prompt shared with Developer Agent (Bolt.diy)', 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: 'Developer Agent', 
          action: 'Work in Progress - Click to check developer agent', 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: '🎯 Final Stage', 
          action: 'Website development prompt ready! Click developer agent to start building!', 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Trigger revenue distribution for project completion
        setTimeout(() => {
          triggerRevenueDistribution(currentIdea.id, 'website_deployment', boltPrompt);
        }, 3000);
        
        // Developer Agent is now ready and clickable
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error creating Bolt prompt:', error);
      console.error('❌ [FRONTEND] Error details:', error.message);
      setAgentActivity(prev => [...prev, { 
        agent: 'Head of Engineering', 
        action: `Error creating Bolt prompt: ${error.message}`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // Trigger revenue distribution for completed projects
  const triggerRevenueDistribution = async (ideaId, projectType, completionData) => {
    try {
      console.log('💰 Triggering revenue distribution for project:', ideaId, projectType);
      
      setAgentActivity(prev => [...prev, { 
        agent: 'Finance Agent', 
        action: 'Processing revenue distribution...', 
        time: new Date().toLocaleTimeString() 
      }]);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/finance/complete-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: ideaId,
          completionType: projectType,
          revenueAmount: 0.1, // Default 0.1 AVAX for website deployment
          completionData: completionData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAgentActivity(prev => [...prev, { 
          agent: 'Finance Agent', 
          action: `✅ Revenue distributed: ${result.totalAmount} AVAX (80% to company, 20% to token holders)`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        if (result.transactionHash) {
          setAgentActivity(prev => [...prev, { 
            agent: 'Smart Contract', 
            action: `📋 Transaction: ${result.transactionHash}`, 
            time: new Date().toLocaleTimeString() 
          }]);
        }
      } else {
        setAgentActivity(prev => [...prev, { 
          agent: 'Finance Agent', 
          action: `❌ Revenue distribution failed: ${result.error}`, 
          time: new Date().toLocaleTimeString() 
        }]);
      }

    } catch (error) {
      console.error('Revenue distribution error:', error);
      setAgentActivity(prev => [...prev, { 
        agent: 'Finance Agent', 
        action: `❌ Error: ${error.message}`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // createBoltPrompt fallback function removed - using createBoltPromptWithData directly

  const getBoltUrl = () => {
    console.log('🔧 [BOLT URL] boltPrompt state:', boltPrompt);
    console.log('🔧 [BOLT URL] boltPrompt?.bolt_prompt:', boltPrompt?.bolt_prompt);
    
    const rawPrompt = boltPrompt?.bolt_prompt ||
      'Build a modern, responsive website. Include homepage, features, pricing, about, contact pages.';
    const promptText = typeof rawPrompt === 'string' ? rawPrompt : JSON.stringify(rawPrompt);
    
    console.log('🔧 [BOLT URL] Using prompt (first 100 chars):', promptText.substring(0, 100));
    
    const params = new URLSearchParams({
      prompt: promptText,
      autostart: '1',
    });
    const boltBase = (process.env.REACT_APP_BOLT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    return `${boltBase}/?${params.toString()}`;
  };

  const openBoltNewTab = () => {
    const url = getBoltUrl();
    // If we pre-opened a placeholder window, navigate it; else open a fresh tab
    if (boltWindowRef.current && !boltWindowRef.current.closed) {
      try {
        boltWindowRef.current.location.href = url;
        return;
      } catch (_) {
        // Fallback to opening a new tab
      }
    }
    window.open(url, '_blank', 'noopener');
  };

  const openBoltWithPrompt = () => {
    // If no boltPrompt exists, create a fallback one
    if (!boltPrompt) {
      const fallbackPrompt = {
        website_title: "AI Health Guardian Website",
        website_description: "A modern, responsive website for the AI Health Guardian platform",
        bolt_prompt: "Build a modern, responsive healthcare website for AI Health Guardian - a personalized AI health monitoring system. Include homepage, features page, pricing, about us, and contact pages. Use a clean, medical-themed design with blue and green colors. Include sections for: hero banner, features showcase, testimonials, pricing plans, and contact form. Make it mobile-responsive and professional."
      };
      setBoltPrompt(fallbackPrompt);
    }
    
    // Prefer opening a new tab for Developer Agent to avoid cross-origin isolation issues
    openBoltNewTab();
    setAgentActivity(prev => [...prev, { 
      agent: '🚀 System', 
      action: 'Opening Developer Agent (new tab) with website prompt...', 
      time: new Date().toLocaleTimeString() 
    }]);
  };

  const startMarketingCampaign = () => {
    setAgentActivity(prev => [...prev, { 
      agent: 'Marketing Agent', 
      action: 'Starting marketing campaign execution...', 
      time: new Date().toLocaleTimeString() 
    }]);
    
    // You can add actual marketing campaign logic here
    // For now, just show that the marketing agent is working
    setTimeout(() => {
      setAgentActivity(prev => [...prev, { 
        agent: 'Marketing Agent', 
        action: 'Marketing campaigns launched successfully!', 
        time: new Date().toLocaleTimeString() 
      }]);
    }, 2000);
  };

  const voteOnItem = async (itemType, vote, feedback = '') => {
    console.log('🗳️ [FRONTEND] Voting on:', { itemType, vote });
    
    // Simple frontend-only voting - no API call needed
    setAgentActivity(prev => [...prev, { 
      agent: 'Token Holder', 
      action: `${vote}d ${itemType}`, 
      time: new Date().toLocaleTimeString() 
    }]);
    
    // Auto-trigger next step if idea is approved
    if (itemType === 'idea' && vote === 'approve' && currentIdea) {
      setTimeout(() => {
        console.log('🔍 [FRONTEND] Starting research for idea:', currentIdea.title);
        researchIdea();
      }, 1000);
    }
    
    // Auto-trigger CMO and CTO agents after product approval
    if (itemType === 'product' && vote === 'approve' && product) {
      setTimeout(() => {
        console.log('📢 [FRONTEND] Starting CMO/CTO for product:', product.product_name);
        triggerCMOAndCTO();
      }, 1000);
    }
    
    // Auto-generate new idea if idea is rejected
    if (itemType === 'idea' && vote === 'reject') {
      setTimeout(() => {
        setAgentActivity(prev => [...prev, { 
          agent: 'CEO Agent', 
          action: 'Idea rejected. Generating new business idea...', 
          time: new Date().toLocaleTimeString() 
        }]);
        // Generate a completely new idea
        generateIdeas();
      }, 2000);
    }
  };

  // Page rendering functions
  // Dashboard Page - Current AI Workflow
  const renderDashboardPage = () => {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h2>📊 Portfolio Dashboard</h2>
          <p>Manage your AI company investments and token holdings</p>
        </div>

        <div className="workflow-section">
          {/* Portfolio Summary */}
          <div className="portfolio-summary">
            <div className="summary-card">
              <h3>Portfolio Value</h3>
              <div className="value">$2,450.00</div>
              <div className="change positive">+12.5% (24h)</div>
            </div>
            
            <div className="summary-card">
              <h3>Total Tokens</h3>
              <div className="value">85</div>
              <div className="companies">Across 3 companies</div>
            </div>
            
            <div className="summary-card">
              <h3>Voting Power</h3>
              <div className="value">15.2%</div>
              <div className="pending">2 pending votes</div>
            </div>
          </div>

          {/* Holdings Section */}
          <div className="holdings-section">
            <h3>Your Holdings</h3>
            <div className="holdings-list">
              <div className="holding-item">
                <div className="holding-info">
                  <h4>Steve Jobs AI (SJOB)</h4>
                  <p>Revolutionary EdTech Platform</p>
                </div>
                <div className="holding-stats">
                  <span>25 tokens</span>
                  <span>$125.00</span>
                  <span className="positive">+8.5%</span>
                </div>
                <div className="holding-actions">
                  <button className="vote-btn">🗳️ Vote (1 pending)</button>
                  <button className="manage-btn">⚙️ Manage</button>
                </div>
              </div>
              
              <div className="holding-item">
                <div className="holding-info">
                  <h4>Elon Musk AI (ELON)</h4>
                  <p>Sustainable Energy Solutions</p>
                </div>
                <div className="holding-stats">
                  <span>40 tokens</span>
                  <span>$340.00</span>
                  <span className="positive">+15.2%</span>
                </div>
                <div className="holding-actions">
                  <button className="vote-btn">🗳️ Vote (1 pending)</button>
                  <button className="manage-btn">⚙️ Manage</button>
                </div>
              </div>
              
              <div className="holding-item">
                <div className="holding-info">
                  <h4>Warren Buffett AI (BUFF)</h4>
                  <p>Smart Investment Platform</p>
                </div>
                <div className="holding-stats">
                  <span>20 tokens</span>
                  <span>$240.00</span>
                  <span className="positive">+12.1%</span>
                </div>
                <div className="holding-actions">
                  <button className="vote-btn">🗳️ Vote</button>
                  <button className="manage-btn">⚙️ Manage</button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    );
  };

  const handleCreateFormSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!createForm.name.trim()) {
      setCreateFormMessage({ type: 'error', text: 'CEO Agent Name is required' });
      return;
    }
    if (!createForm.company_idea.trim()) {
      setCreateFormMessage({ type: 'error', text: 'Company Idea is required' });
      return;
    }
    if (!createForm.description.trim()) {
      setCreateFormMessage({ type: 'error', text: 'Idea Description is required' });
      return;
    }
    if (!createForm.ceo_characteristics.trim()) {
      setCreateFormMessage({ type: 'error', text: 'CEO Characteristics is required' });
      return;
    }
    if (!createForm.token_symbol.trim()) {
      setCreateFormMessage({ type: 'error', text: 'Token Symbol is required' });
      return;
    }
    
    // Submit form
    createCeoAgent(createForm);
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCreatePage = () => (
    <div className="create-page">
      <div className="page-header">
        <h2>🚀 Create New AI Company</h2>
        <p>Launch your own AI-powered organization with a custom CEO agent</p>
      </div>
      
      {createFormMessage && (
        <div className={`form-message ${createFormMessage.type}`}>
          {createFormMessage.text}
        </div>
      )}
      
      <form className="create-form" onSubmit={handleCreateFormSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>CEO Agent Name</label>
            <input 
              type="text" 
              placeholder="e.g., Steve Jobs AI, Elon Musk AI"
              value={createForm.name}
              onChange={(e) => handleCreateFormChange('name', e.target.value)}
              disabled={createFormLoading}
            />
            <small>The name and personality of your AI CEO</small>
          </div>
          
          <div className="form-group">
            <label>Company Idea</label>
            <input 
              type="text" 
              placeholder="e.g., Revolutionary EdTech Platform"
              value={createForm.company_idea}
              onChange={(e) => handleCreateFormChange('company_idea', e.target.value)}
              disabled={createFormLoading}
            />
            <small>Brief title for your business concept</small>
          </div>
          
          <div className="form-group">
            <label>Idea Description</label>
            <textarea 
              rows="4" 
              placeholder="Detailed description of your business idea and vision..."
              value={createForm.description}
              onChange={(e) => handleCreateFormChange('description', e.target.value)}
              disabled={createFormLoading}
            />
            <small>Explain what your AI company will do</small>
          </div>
          
          <div className="form-group">
            <label>CEO Characteristics</label>
            <textarea 
              rows="3" 
              placeholder="e.g., Visionary, perfectionist, focuses on user experience and innovation..."
              value={createForm.ceo_characteristics}
              onChange={(e) => handleCreateFormChange('ceo_characteristics', e.target.value)}
              disabled={createFormLoading}
            />
            <small>Describe the personality and traits of your AI CEO</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Token Economics</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Total Tokens</label>
              <input 
                type="number" 
                min="10" 
                max="1000" 
                value={createForm.total_tokens}
                onChange={(e) => handleCreateFormChange('total_tokens', parseInt(e.target.value))}
                disabled={createFormLoading}
              />
              <small>How many tokens to create</small>
            </div>
            
            <div className="form-group">
              <label>Price per Token ($)</label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                step="0.01" 
                value={createForm.price_per_token}
                onChange={(e) => handleCreateFormChange('price_per_token', parseFloat(e.target.value))}
                disabled={createFormLoading}
              />
              <small>Initial price per token</small>
            </div>
          </div>
          
          <div className="form-group">
            <label>Token Symbol</label>
            <input 
              type="text" 
              placeholder="e.g., SJOB, ELON" 
              maxLength="5"
              value={createForm.token_symbol}
              onChange={(e) => handleCreateFormChange('token_symbol', e.target.value.toUpperCase())}
              disabled={createFormLoading}
            />
            <small>3-5 character symbol for your tokens</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Launch Timeline</h3>
          
          <div className="form-group">
            <label>When should your AI company launch?</label>
            <select 
              value={createForm.launch_timeline}
              onChange={(e) => handleCreateFormChange('launch_timeline', parseInt(e.target.value))}
              disabled={createFormLoading}
              className="timeline-select"
            >
              <option value={1}>⚡ Instant Demo - 1 minute (Ultra-fast demonstration)</option>
              <option value={5}>⚡ Quick Demo - 5 minutes (Fast demonstration)</option>
              <option value={10}>🚀 Standard Demo - 10 minutes (Recommended)</option>
              <option value={15}>🔬 Extended Demo - 15 minutes (Comprehensive showcase)</option>
            </select>
            <small>
              Your AI company will automatically launch and start working after this period. 
              Perfect for demonstration purposes.
            </small>
          </div>


          <div className="timeline-info">
            <div className="timeline-card">
              <h4>📅 Launch Schedule</h4>
              <p><strong>Creation Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Launch Time:</strong> {new Date(Date.now() + createForm.launch_timeline * 60 * 1000).toLocaleTimeString()}</p>
              <p><strong>Minutes Until Launch:</strong> {createForm.launch_timeline} minutes</p>
            </div>
            
          </div>
        </div>

        <div className="form-actions">
          <div className="cost-summary">
            <p><strong>Launch Cost: $5.00</strong></p>
            <p>Tokens Available for Sale: {createForm.total_tokens - 10} (keeping 10 for creator)</p>
            <p>Potential Funding: ${((createForm.total_tokens - 10) * createForm.price_per_token).toFixed(2)}</p>
          </div>
          
          <button 
            type="submit" 
            className="launch-btn"
            disabled={createFormLoading}
          >
            {createFormLoading ? '⏳ Creating...' : '🚀 Launch AI Company ($5.00)'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderCompaniesPage = () => (
    <div className="companies-page">
      <div className="page-header">
        <h2>🏢 Running AI Companies</h2>
        <p>Browse active AI companies and their performance</p>
        {!loadingCompanies && companies.length > 0 && (
          <div className="companies-stats">
            <span>📊 {companies.length} Running Companies</span>
            <span>💰 Total Revenue: ${companies.reduce((sum, c) => sum + (c.current_revenue || 0), 0).toLocaleString()}</span>
            <span>🎯 Average Performance: +18%</span>
          </div>
        )}
      </div>
      
      {loadingCompanies ? (
        <div className="loading-state">
          <p>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <p>No companies launched yet. Companies appear here when CEO agents get enough funding.</p>
        </div>
      ) : (
        <div className="companies-grid">
          {companies.map(company => (
            <div key={company.id} className="company-card">
              <div className="company-header">
                <h3>{company.name}</h3>
                <div className="company-status">
                  <span className={`status-badge ${company.status}`}>
                    {company.status === 'running' ? '🟢 Running' : '🟡 Launching'}
                  </span>
                </div>
              </div>
              
              <div className="company-stats">
                <div className="stat">
                  <span className="stat-label">CEO Agent</span>
                  <span className="stat-value">{company.ceo_agent_name}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Current Revenue</span>
                  <span className="stat-value">${(company.current_revenue || 0).toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Token Symbol</span>
                  <span className="stat-value">{company.token_symbol}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Launched</span>
                  <span className="stat-value">{company.launched_date || 'N/A'}</span>
                </div>
              </div>
              
              <div className="company-actions">
                <button 
                  className="view-btn"
                  onClick={() => {
                    setSelectedCompany(company);
                    setCurrentPage('company-dashboard');
                  }}
                >
                  👁️ View Company
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // CEO Agents Marketplace Page
  const renderCeoAgentsPage = () => (
    <div className="ceo-agents-page">
      <div className="page-header">
        <h2>🤖 CEO Agents Marketplace</h2>
        <p>Browse and invest in AI CEO agents to launch new companies</p>
        {!loadingAgents && ceoAgents.length > 0 && (
          <div className="marketplace-stats">
            <span>🎯 {ceoAgents.length} Available Agents</span>
            <span>💰 Total Value: ${ceoAgents.reduce((sum, agent) => sum + (agent.total_tokens * agent.price_per_token), 0).toLocaleString()}</span>
            <span>📊 Average Price: ${(ceoAgents.reduce((sum, agent) => sum + agent.price_per_token, 0) / ceoAgents.length).toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {loadingAgents ? (
        <div className="loading-state">
          <p>Loading CEO agents...</p>
        </div>
      ) : ceoAgents.length === 0 ? (
        <div className="empty-state">
          <p>No CEO agents available yet. Be the first to create one!</p>
          <button 
            className="create-first-btn"
            onClick={() => setCurrentPage('create')}
          >
            🚀 Create First CEO Agent
          </button>
        </div>
      ) : (
        <div className="agents-grid">
          {ceoAgents.map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <h3>{agent.name}</h3>
                <div className="agent-status">
                  {countdownTimers[agent.id] ? (
                    <div className="countdown-container">
                      <span className="countdown-label">🚀 Launching in:</span>
                      <span className="countdown-timer">{countdownTimers[agent.id]}s</span>
                    </div>
                  ) : (
                    <span className={`status-badge ${agent.status}`}>
                      {agent.status === 'available' ? '🟢 Available' : '🔴 Sold Out'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="agent-content">
                <div className="company-idea">
                  <h4>💡 {agent.company_idea}</h4>
                  <p>{agent.description}</p>
                </div>
                
                <div className="token-info">
                  <div className="token-stats">
                    <div className="stat">
                      <span className="label">Total Tokens</span>
                      <span className="value">{agent.total_tokens}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Available</span>
                      <span className="value">{agent.tokens_available}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Price per Token</span>
                      <span className="value">${agent.price_per_token}</span>
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${((agent.total_tokens - agent.tokens_available) / agent.total_tokens) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {Math.round(((agent.total_tokens - agent.tokens_available) / agent.total_tokens) * 100)}% funded
                  </p>
                </div>
              </div>
              
              <div className="agent-actions">
                <button 
                  className="view-btn"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setCurrentPage('agent-detail');
                  }}
                >
                  👁️ View Details
                </button>
                <button 
                  className="buy-btn"
                  onClick={() => {
                    const amount = prompt(`How many ${agent.token_symbol} tokens would you like to buy? (Available: ${agent.tokens_available})`);
                    if (amount && parseInt(amount) > 0 && parseInt(amount) <= agent.tokens_available) {
                      buyTokens(agent.id, parseInt(amount));
                    }
                  }}
                  disabled={agent.tokens_available === 0}
                >
                  💰 Buy Tokens
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Agent Detail Page
  const renderAgentDetailPage = () => {
    if (!selectedAgent) return null;
    
    return (
      <div className="agent-detail-page">
        <div className="back-button">
          <button onClick={() => setCurrentPage('ceo-agents')}>
            ← Back to CEO Agents
          </button>
        </div>
        
        <div className="agent-detail-header">
          <h1>{selectedAgent.name}</h1>
          <div className="agent-status">
            <span className={`status-badge ${selectedAgent.status}`}>
              {selectedAgent.status === 'available' ? '🟢 Available' : '🔴 Sold Out'}
            </span>
          </div>
        </div>
        
        <div className="agent-detail-content">
          <div className="left-column">
            <div className="detail-section">
              <h3>💡 Company Idea</h3>
              <h4>{selectedAgent.companyIdea}</h4>
              <p>{selectedAgent.description}</p>
            </div>
            
            <div className="detail-section">
              <h3>🎭 CEO Characteristics</h3>
              <p>{selectedAgent.ceoCharacteristics}</p>
            </div>
            
            <div className="detail-section">
              <h3>👤 Created By</h3>
              <p>{selectedAgent.creator}</p>
            </div>
          </div>
          
          <div className="right-column">
            <div className="investment-panel">
              <h3>💰 Investment Details</h3>
              
              <div className="investment-stats">
                <div className="stat-row">
                  <span>Token Symbol:</span>
                  <span className="token-symbol">{selectedAgent.tokenSymbol}</span>
                </div>
                <div className="stat-row">
                  <span>Total Tokens:</span>
                  <span>{selectedAgent.totalTokens}</span>
                </div>
                <div className="stat-row">
                  <span>Available:</span>
                  <span>{selectedAgent.tokensAvailable}</span>
                </div>
                <div className="stat-row">
                  <span>Price per Token:</span>
                  <span>${selectedAgent.pricePerToken}</span>
                </div>
              </div>
              
              <div className="progress-section">
                <div className="progress-bar large">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${((selectedAgent.totalTokens - selectedAgent.tokensAvailable) / selectedAgent.totalTokens) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="progress-text">
                  {Math.round(((selectedAgent.totalTokens - selectedAgent.tokensAvailable) / selectedAgent.totalTokens) * 100)}% funded
                </p>
              </div>
              
              <div className="buy-section">
                <div className="quantity-selector">
                  <label>Number of tokens to buy:</label>
                  <input type="number" min="1" max={selectedAgent.tokensAvailable} defaultValue="1" />
                </div>
                
                <div className="total-cost">
                  <span>Total Cost: $5.00</span>
                </div>
                
                <button 
                  className="buy-btn large"
                  disabled={selectedAgent.tokensAvailable === 0}
                >
                  💰 Buy Tokens
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyDashboard = () => {
    if (!selectedCompany) return null;
    
    return (
      <div className="company-dashboard">
        <div className="company-header-section">
          <button 
            className="back-btn"
            onClick={() => setCurrentPage('companies')}
          >
            ← Back to Companies
          </button>
          <div className="company-title">
            <h2>{selectedCompany.name}</h2>
            <p>{selectedCompany.company_idea}</p>
            <div className="company-meta">
              <span>{selectedCompany.token_symbol}</span>
              <span>${selectedCompany.price_per_token}/token</span>
              <span>{selectedCompany.total_tokens} total tokens</span>
        </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Company is already working on its idea */}
            <div className="company-status">
              <h3>🚀 {selectedCompany.ceo_agent_name} is actively working on: {selectedCompany.company_idea}</h3>
              <p>This AI company is automatically progressing through the development workflow.</p>
            </div>
            
            <div className="controls">
              <button 
                onClick={runCompleteWorkflow}
                className="complete-workflow-btn"
                disabled={loading}
              >
                {loading ? '⏳ Running...' : '🎯 Run Complete Workflow'}
              </button>
              <button 
                onClick={() => {
                  setCurrentIdea(null);
                  setResearch(null);
                  setProduct(null);
                  setMarketingStrategy(null);
                  setTechnicalStrategy(null);
                  setBoltPrompt(null);
                  setAgentActivity([]);
                  setCurrentAgent(null);
                }}
                className="clear-btn"
              >
                🗑️ Reset Workflow
              </button>
            </div>

        {/* Agent Flow Visualization */}
        <AgentFlow 
          currentAgent={currentAgent}
          agentActivity={agentActivity}
          currentIdea={currentIdea}
          research={research}
          product={product}
          marketingStrategy={marketingStrategy}
          technicalStrategy={technicalStrategy}
          boltPrompt={boltPrompt}
          workflowStep={workflowStep}
          onOpenBolt={openBoltWithPrompt}
          onStartMarketing={startMarketingCampaign}
        />

            {/* Rest of the existing dashboard content */}
            <div className="ideas-grid">
              {currentIdea ? (
                <div className="idea-card">
                  <h3>{currentIdea.title}</h3>
                  <p>{String(currentIdea.description)}</p>
                  {currentIdea.potential_revenue && (
                    <div className="idea-revenue">
                      <h6>💰 Revenue Potential:</h6>
                      <div>
                        {typeof currentIdea.potential_revenue === 'object' ? (
                          <ul>
                            {Object.entries(currentIdea.potential_revenue).map(([key, value]) => (
                              <li key={key}>
                                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>{String(currentIdea.potential_revenue)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="idea-status">
                    <span className="status-badge pending">
                      PENDING
                    </span>
                  </div>
                  
                  <div className="idea-actions">
                    {!research && (
                      <>
                        <button 
                          onClick={() => voteOnItem('idea', 'approve')}
                          className="approve-btn"
                        >
                          ✅ Approve & Start Research
                        </button>
                        <button 
                          onClick={() => voteOnItem('idea', 'reject')}
                          className="reject-btn"
                        >
                          ❌ Reject & Generate New
                        </button>
                      </>
                    )}
                    
                    {research && !product && (
                      <div className="workflow-status">
                        <span className="status-text">⏳ Product Agent will start automatically...</span>
                      </div>
                    )}

                    {currentAgent && currentAgent.includes('CEO Agent') && loading && (
                      <div className="workflow-status">
                        <span className="status-text">🤔 CEO Agent is thinking of a new idea...</span>
                      </div>
                    )}
                    
                    {product && !marketingStrategy && (
                      <div className="final-approval-section">
                        <div className="ceo-approval-header">
                          <h4>📋 Product Development Report (PDR) Ready!</h4>
                          <p>The Research and Product Agents have completed their work. Review the PDR below and vote to continue the workflow.</p>
                        </div>
                        
                        {/* PDR Display */}
                        <div className="pdr-display">
                          <h5>📊 Product Development Report</h5>
                          <div className="pdr-content">
                            <div className="pdr-section">
                              <h6>Product Name:</h6>
                              <p>{product.product_name}</p>
                            </div>
                            <div className="pdr-section">
                              <h6>Description:</h6>
                              <p>{product.product_description}</p>
                            </div>
                            <div className="pdr-section">
                              <h6>Core Features:</h6>
                              <ul>
                                {product.core_features && product.core_features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="pdr-section">
                              <h6>Target Market:</h6>
                              <p>Primary: {product.target_market?.primary || 'N/A'}</p>
                              <p>Secondary: {product.target_market?.secondary || 'N/A'}</p>
                            </div>
                            <div className="pdr-section">
                              <h6>Value Proposition:</h6>
                              <p>{product.value_proposition}</p>
                            </div>
                            <div className="pdr-section">
                              <h6>Revenue Model:</h6>
                              <p>{product.revenue_model}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="final-voting-section">
                          <h5>🗳️ Token Holder Decision Required:</h5>
                          <p>Approve this PDR to continue with CMO and CTO agents, or reject to pause the workflow.</p>
                          <p style={{fontSize: '12px', color: '#666'}}>Company ID: {selectedCompany?.id} | Selected: {selectedCompany ? 'Yes' : 'No'}</p>
                          <div className="product-actions">
                            <button 
                              onClick={() => {
                                console.log('🔘 Button click handler fired!');
                                voteOnCompanyWorkflow('approve');
                              }}
                              className="final-approve-btn"
                              style={{
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                minHeight: '50px'
                              }}
                              disabled={loading}
                            >
                              {loading ? '⏳ Processing...' : '✅ APPROVE PDR'}
                            </button>
                            <button 
                              onClick={() => {
                                console.log('🔘 Reject button click handler fired!');
                                voteOnCompanyWorkflow('reject');
                              }}
                              className="final-reject-btn"
                              style={{
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                minHeight: '50px'
                              }}
                              disabled={loading}
                            >
                              {loading ? '⏳ Processing...' : '❌ REJECT PDR'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {marketingStrategy && technicalStrategy && !boltPrompt && (
                      <div className="workflow-complete">
                        <span className="complete-text">🎉 WORKFLOW COMPLETE! Product approved and ready for development!</span>
                      </div>
                    )}
                  </div>

                  {research && (
                    <div className="research-section">
                      <h4>📊 Research Agent Status:</h4>
                      <div className="research-status">
                        <span className="status-badge">✅ Research Complete - Data Shared with Product Agent</span>
                      </div>
                    </div>
                  )}

                  {product && (
                    <div className="product-section">
                      <h4>🚀 Complete Product Concept (CEO Approved):</h4>
                      <div className="product-details">
                        <div className="product-header">
                          <h5>🎯 {product.product_name || 'Product Name'}</h5>
                          <div className="ceo-approval-badge">
                            <span>✅ CEO Agent Approved</span>
                          </div>
                        </div>
                        
                        <div className="product-description">
                          <h6>📝 Product Description:</h6>
                          <p>{String(product.product_description || 'Product description will be added here.')}</p>
                        </div>
                        
                        <div className="product-features">
                          <h6>⚡ Core Features ({product.features?.length || 0}):</h6>
                          <ul className="features-list">
                            {product.features?.map((feature, index) => (
                              <li key={index}>{String(feature)}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="product-market">
                          <h6>🎯 Target Market:</h6>
                          <div className="market-details">
                            {typeof product.target_market === 'object' ? (
                              <>
                                <p><strong>Primary:</strong> {formatSegment(product.target_market.primary)}</p>
                                <p><strong>Secondary:</strong> {formatSegment(product.target_market.secondary)}</p>
                              </>
                            ) : (
                              <p>{formatSegment(product.target_market)}</p>
                            )}
                          </div>
                        </div>
                        
                        {product.value_proposition && (
                          <div className="product-value">
                            <h6>💎 Value Proposition:</h6>
                            <p>{String(product.value_proposition)}</p>
                          </div>
                        )}
                        
                        {product.revenue_model && (
                          <div className="product-revenue">
                            <h6>💰 Revenue Model:</h6>
                            <div>
                              {typeof product.revenue_model === 'object' ? (
                                <ul>
                                  {Object.entries(product.revenue_model).map(([key, value]) => (
                                    <li key={key}>
                                      <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>{String(product.revenue_model)}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Simplified Status Indicators */}
                  {marketingStrategy && (
                    <div className="workflow-status">
                      <span className="status-text">✅ Marketing Strategy Complete</span>
                    </div>
                  )}

                  {boltPrompt && (
                    <div className="workflow-complete">
                      <div className="workflow-status">
                        <span className="status-text">✅ Website Development Prompt Ready - Click Developer Agent to check progress!</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {!currentIdea && !loading && (
              <div className="empty-state">
                <p>No idea currently being worked on. Click "Generate New Idea" to start the AI Company workflow!</p>
              </div>
            )}

            {!currentIdea && loading && currentAgent && currentAgent.includes('CEO Agent') && (
              <div className="empty-state">
                <p>🤔 CEO Agent is thinking of a new business idea...</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
                  Please wait while we generate something amazing!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <RevenueDashboard />
        )}
      </div>
    );
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Company Platform</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Token Holder ID: {tokenHolderId}</p>
        
        {/* Main Navigation */}
        <div className="main-navigation">
          <button 
            className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Portfolio
          </button>
          <button 
            className={`nav-button ${currentPage === 'create' ? 'active' : ''}`}
            onClick={() => setCurrentPage('create')}
          >
            🚀 Create CEO Agent
          </button>
          <button 
            className={`nav-button ${currentPage === 'ceo-agents' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ceo-agents')}
          >
            🤖 CEO Agents
          </button>
          <button 
            className={`nav-button ${currentPage === 'companies' ? 'active' : ''}`}
            onClick={() => setCurrentPage('companies')}
          >
            🏢 AI Companies
          </button>
        </div>

        {/* Sub Navigation for individual company view */}
        {currentPage === 'company-dashboard' && (
          <div className="sub-navigation">
                        <button 
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
                        >
              🤖 Agent Dashboard
                        </button>
                        <button 
              className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
                        >
              💰 Revenue Dashboard
                        </button>
                  </div>
                )}
      </header>

      <main className="main-content">
        {/* Render different pages based on currentPage */}
        {currentPage === 'dashboard' && renderDashboardPage()}
        {currentPage === 'create' && renderCreatePage()}
        {currentPage === 'ceo-agents' && renderCeoAgentsPage()}
        {currentPage === 'agent-detail' && renderAgentDetailPage()}
        {currentPage === 'companies' && renderCompaniesPage()}
        {currentPage === 'company-dashboard' && renderCompanyDashboard()}
        
      </main>

    </div>
  );
}

export default App; 