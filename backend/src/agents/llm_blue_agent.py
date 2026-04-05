from typing import Dict, Any
from .llm_agent_base import LLMAgentBase
from ..config.constants import BLUE_ACTIONS

class LLMBlueAgent(LLMAgentBase):
    def __init__(self, model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"):
        super().__init__(role="Defender", model_id=model_id)

    def format_prompt(self, observation: Dict[str, Any]) -> str:
        """Format Blue agent prompt"""
        
        prompt = f"""
You are the Defender (Blue Team) in a 20-node network simulation (Hosts 0-19).
Current available actions: {BLUE_ACTIONS}

Based on the network alerts, select your next move.
You MUST respond ONLY with the action in this format: Action: [target_host_id, action_id]

Example: To isolate host 2 (action 1), reply: Action: [2, 1]
Action: """
        return prompt
