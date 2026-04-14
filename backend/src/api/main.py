from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uuid
import numpy as np
from typing import Dict, Any

from .websocket import ConnectionManager
from ..environment.cyber_env import CyberSecurityEnv
from ..agents.llm_red_agent import LLMRedAgent
from ..agents.llm_blue_agent import LLMBlueAgent

app_state = {
    "red_model": None,
    "blue_model": None,
    "active_simulations": {},
    "connection_manager": ConnectionManager(),
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading models via LLM Proxy...")
    app_state["red_model"] = LLMRedAgent()
    
    # Check if the PPO model exists
    import os
    ppo_path = "blue_ppo_bot"
    if not os.path.exists(ppo_path) and not os.path.exists(f"{ppo_path}.zip"):
        ppo_path = "../blue_ppo_bot"
        
    if os.path.exists(ppo_path) or os.path.exists(f"{ppo_path}.zip"):
        print(f"Deploying Autonomous Deep RL Defender from {ppo_path}...")
        
        # Stable Baselines3's load() strictly requires a .zip file format
        # If GitHub synced the unzipped folder, we instantly re-compress it!
        if os.path.isdir(ppo_path):
            import shutil
            print(f"Compressing GitHub directory {ppo_path} into a .zip payload for SB3...")
            shutil.make_archive(ppo_path, 'zip', ppo_path)
            ppo_path = f"{ppo_path}.zip"
        elif not ppo_path.endswith('.zip') and os.path.exists(f"{ppo_path}.zip"):
            ppo_path = f"{ppo_path}.zip"
            
        from stable_baselines3 import PPO
        try:
            app_state["blue_model"] = PPO.load(ppo_path)
        except Exception as e:
            print(f"Error loading PPO: {e}. Falling back to LLM Proxy...")
            app_state["blue_model"] = LLMBlueAgent()
    else:
        print("PPO Model not found. Falling back to LLM Proxy for Defender...")
        app_state["blue_model"] = LLMBlueAgent()
        
    yield
    print("Shutting down...")

app = FastAPI(title="CyberGuardian AI Cloud API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _serialize(obj: Any) -> Any:
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, set):
        return list(obj)
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(v) for v in obj]
    return obj

@app.post("/api/simulation/create")
async def create_simulation():
    sim_id = str(uuid.uuid4())
    env = CyberSecurityEnv(num_hosts=20, max_steps=100)
    app_state["active_simulations"][sim_id] = {
        "env": env,
        "step": 0,
        "done": False,
    }
    return {"simulation_id": sim_id, "status": "created"}

@app.websocket("/ws/simulation/{simulation_id}")
async def websocket_simulation(websocket: WebSocket, simulation_id: str):
    await app_state["connection_manager"].connect(simulation_id, websocket)
    try:
        if simulation_id not in app_state["active_simulations"]:
            await websocket.send_json({"error": "Simulation not found"})
            return
            
        sim = app_state["active_simulations"][simulation_id]
        env = sim["env"]
        
        obs, info = env.reset()
        await app_state["connection_manager"].send_json(simulation_id, {
            "type": "init",
            "observation": _serialize(obs),
            "info": _serialize(info),
        })
        
        while not sim["done"]:
            data = await websocket.receive_json()
            if data.get("command") == "step":
                red_action, _ = app_state["red_model"].predict(obs)
                blue_action, _ = app_state["blue_model"].predict(obs)
                action = {"red_action": red_action, "blue_action": blue_action}
                
                obs, rewards, terminated, truncated, info = env.step(action)
                sim["step"] += 1
                sim["done"] = terminated or truncated
                
                await app_state["connection_manager"].send_json(simulation_id, {
                    "type": "step",
                    "step": sim["step"],
                    "observation": _serialize(obs),
                    "actions": {"red": _serialize(red_action), "blue": _serialize(blue_action)},
                    "rewards": rewards,
                    "terminated": terminated,
                    "truncated": truncated,
                    "info": _serialize(info),
                })
    except WebSocketDisconnect:
        app_state["connection_manager"].disconnect(simulation_id)
    except Exception as e:
        await app_state["connection_manager"].send_json(simulation_id, {"type": "error", "message": str(e)})

@app.get("/")
def health_check():
    return {"status": "ok", "cloud_mode": True}

@app.post("/api/simulation/{simulation_id}/start")
async def start_simulation(simulation_id: str):
    if simulation_id not in app_state["active_simulations"]:
        return {"error": "Simulation not found"}
    return {"status": "started", "message": "Simulation running"}

@app.get("/api/agents/info")
async def get_agents_info():
    return {
        "red_agent": {"model": "HuggingFace-Inference-Red", "type": "Attacker"},
        "blue_agent": {"model": "HuggingFace-Inference-Blue", "type": "Defender"}
    }

@app.get("/api/detection/alerts")
async def get_alerts():
    if app_state["active_simulations"]:
        sim_id = list(app_state["active_simulations"].keys())[0]
        return {"alerts": app_state["active_simulations"][sim_id]["env"].logs[-10:]}
    return {"alerts": []}

@app.post("/api/playbooks/generate")
async def generate_playbook(request: Dict[Any, Any]):
    return {"status": "generated", "playbook": "1. Isolate Node.\\n2. Patch Vulnerability."}

