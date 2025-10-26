# Head of Engineering & Developer Agent Fix

## Problem
After approving the PDR, the workflow would show:
- ✅ CMO Agent (completed - green)
- ✅ CTO Agent (completed - green) 
- ⏳ Head of Engineering (stuck on "waiting")
- ⏳ Developer Agent (stuck on "waiting")

The Head of Engineering and Developer Agent never executed after CTO completed.

## Root Cause
The backend `triggerMarketingAndTechnicalWorkflow()` function only ran CMO and CTO agents, then immediately set the workflow to 'complete' without triggering the Head of Engineering agent to create the Bolt prompt.

## Solution Implemented

### Backend Changes (`routes/company-workflow.js`)

1. **Added HeadOfEngineeringAgent import**:
   ```javascript
   const HeadOfEngineeringAgent = require('../agents/HeadOfEngineeringAgent');
   const headOfEngineeringAgent = new HeadOfEngineeringAgent(process.env.ASI_ONE_API_KEY);
   ```

2. **Extended workflow automation** in `triggerMarketingAndTechnicalWorkflow()`:
   - After CMO and CTO complete, set workflow step to `'engineering'` (instead of `'complete'`)
   - Call Head of Engineering agent to create Bolt prompt
   - Save Bolt prompt to `bolt_prompts` table
   - Set workflow step to `'complete'` only after Bolt prompt is created

3. **Workflow steps now**:
   - `'research'` → Research Agent working
   - `'product'` → Product Agent working
   - `'voting'` → Waiting for PDR approval
   - `'approved'` → CMO and CTO working
   - `'engineering'` → Head of Engineering working (NEW)
   - `'complete'` → All agents done, Developer Agent ready

### Frontend Changes

#### `client/src/App.js`

1. **Added workflow step tracking**:
   ```javascript
   const [workflowStep, setWorkflowStep] = useState('initial');
   ```

2. **Updated `loadCompanyWorkflow()`**:
   - Set `workflowStep` state from `workflow.current_step`
   - Added handling for `'engineering'` step to show Head of Engineering activity
   - Added `fetchBoltPromptForCompany()` function to fetch bolt prompt when workflow is complete
   - Pass `workflowStep` prop to `<AgentFlow />` component

3. **Enhanced activity feed**:
   ```javascript
   if (workflow.current_step === 'engineering' || workflow.current_step === 'complete') {
     activity.push({
       agent: 'Head of Engineering',
       activity: workflow.current_step === 'complete' 
         ? 'Bolt prompt created! Developer Agent ready.' 
         : 'Creating Bolt prompt for website development...'
     });
   }
   ```

#### `client/src/AgentFlow.js`

1. **Added `workflowStep` prop** to component signature

2. **Updated `getAgentState()` logic**:
   - CMO: Shows 'active' when `workflowStep === 'approved'`, 'completed' when done
   - CTO: Shows 'active' when `workflowStep === 'approved'`, 'completed' when done
   - **Head of Engineering**: Shows 'active' when `workflowStep === 'engineering'`, 'completed' when bolt prompt exists
   - **Developer Agent**: Shows 'active' when `workflowStep === 'complete'` OR bolt prompt exists

## Workflow Flow

```
User clicks "Approve PDR"
  ↓
Backend: Update workflow to 'approved'
  ↓
Backend: Trigger CMO Agent → marketing_strategy saved
  ↓
Backend: Trigger CTO Agent → technical_strategy saved
  ↓
Backend: Update workflow to 'engineering'
  ↓
Backend: Trigger Head of Engineering → bolt_prompt saved to bolt_prompts table
  ↓
Backend: Update workflow to 'complete'
  ↓
Frontend: Polls workflow state every 3 seconds
  ↓
Frontend: Detects 'engineering' → Shows Head of Engineering as "active"
  ↓
Frontend: Detects 'complete' → Shows Head of Engineering as "completed", Developer Agent as "active"
  ↓
Frontend: Fetches bolt_prompt from /api/ideas/:id endpoint
  ↓
User can click Developer Agent to open Bolt.diy with the generated prompt
```

## Files Modified

1. `/routes/company-workflow.js` - Backend workflow orchestration
2. `/client/src/App.js` - Frontend state management and workflow loading
3. `/client/src/AgentFlow.js` - Visual agent status display

## Testing

To verify the fix:
1. Restart backend: `PORT=5001 node server.js`
2. Refresh frontend: Hard reload (Cmd+Shift+R)
3. Navigate to a company dashboard
4. Click "Approve PDR"
5. Watch the workflow progress:
   - CMO and CTO should turn green (completed)
   - Head of Engineering should show as "active" (yellow/orange)
   - Then Head of Engineering turns green (completed)
   - Developer Agent should show as "active" and clickable
6. Check backend logs for confirmation:
   ```
   ✅ [WORKFLOW] CMO completed for company X
   ✅ [WORKFLOW] CTO completed for company X
   🔧 [WORKFLOW] Starting Head of Engineering Agent for company X...
   ✅ [WORKFLOW] Head of Engineering completed for company X
   ✅ [WORKFLOW] Bolt prompt saved with ID Y for company X
   🎉 [WORKFLOW] Complete workflow finished for company X! Developer Agent ready.
   ```

## Notes

- The Head of Engineering agent uses the ASI:One API to generate a comprehensive Bolt prompt
- The Bolt prompt includes website structure, design specs, functional requirements, etc.
- If the API call fails, a fallback Bolt prompt is generated with basic structure
- The bolt prompt is stored in the `bolt_prompts` table with a foreign key to the company/idea ID
- Frontend fetches the bolt prompt via `/api/ideas/:id` endpoint when workflow is complete
