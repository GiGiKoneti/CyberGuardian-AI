from typing import Dict, Any
from .llm_agent_base import LLMAgentBase
from ..config.constants import RED_ACTIONS

class LLMRedAgent(LLMAgentBase):
    def __init__(self, model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"):
        super().__init__(role="Attacker", model_id=model_id)

    def format_prompt(self, observation: Dict[str, Any]) -> str:
        """Format Red agent prompt"""
        
        prompt = f"""
You are the Attacker (Red Team) in a 20-node network simulation (Hosts 0-19).
Current available actions: {RED_ACTIONS}

Based on the network state, select your next move.
You MUST respond ONLY with the action in this format: Action: [target_host_id, action_id]

Example: To exploit host 5 (action 1), reply: Action: [5, 1]
Action: """
        return prompt
