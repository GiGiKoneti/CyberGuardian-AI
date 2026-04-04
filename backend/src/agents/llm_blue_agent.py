from typing import Dict, Any
from .llm_agent_base import LLMAgentBase
from ..config.constants import BLUE_ACTIONS

class LLMBlueAgent(LLMAgentBase):
    def __init__(self, model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"):
        super().__init__(role="Defender", model_id=model_id)

    def format_prompt(self, observation: Dict[str, Any]) -> str:
        """Format Blue agent prompt"""
        
        prompt = f"""
You are the Blue Team Defender in a cyber simulation.
Your goal is to detect and isolate compromised hosts out of a 20 host network (Host 0 to 19).

Available actions: {BLUE_ACTIONS}

Based on the network alerts, respond with your action formatted exactly as:
Action: [target_host_id, action_id]

Example: Target host 2 with isolate (action 1) -> Action: [2, 1]

Select a target host ID between 0 and 19, and an action ID between 0 and 5.
Action: 
"""
        return prompt
