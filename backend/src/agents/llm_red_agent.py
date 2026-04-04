from typing import Dict, Any
from .llm_agent_base import LLMAgentBase
from ..config.constants import RED_ACTIONS

class LLMRedAgent(LLMAgentBase):
    def __init__(self, model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"):
        super().__init__(role="Attacker", model_id=model_id)

    def format_prompt(self, observation: Dict[str, Any]) -> str:
        """Format Red agent prompt"""
        
        prompt = f"""
You are the Red Team Attacker in a cyber simulation against a 20 host network (Host 0 to 19).
Your goal is to exfiltrate data and spread laterally.

Available actions: {RED_ACTIONS}

Based on the network state, respond with your action formatted exactly as:
Action: [target_host_id, action_id]

Example: Target host 5 with exploit (action 1) -> Action: [5, 1]

Select a target host ID between 0 and 19, and an action ID between 0 and 5.
Action: 
"""
        return prompt
