import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from .network import NetworkTopology
from ..simulation.log_generator import LogGenerator

class CyberSecurityEnv(gym.Env):
    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 4}
    
    def __init__(self, num_hosts: int = 20, max_steps: int = 100, render_mode: Optional[str] = None):
        super().__init__()
        self.num_hosts = num_hosts
        self.max_steps = max_steps
        self.render_mode = render_mode
        self.network = NetworkTopology(num_hosts=num_hosts)
        self.log_generator = LogGenerator()
        
        self.action_space = spaces.Dict({
            "red_action": spaces.MultiDiscrete([num_hosts, 6]),
            "blue_action": spaces.MultiDiscrete([num_hosts, 6]),
        })
        
        self.observation_space = spaces.Dict({
            "network_topology": spaces.Box(low=0, high=1, shape=(num_hosts, num_hosts), dtype=np.float32),
            "host_status": spaces.MultiBinary(num_hosts),
            "traffic_matrix": spaces.Box(low=0, high=1000, shape=(num_hosts, num_hosts), dtype=np.float32),
            "alert_scores": spaces.Box(low=0, high=1, shape=(num_hosts, 4), dtype=np.float32),
            "time_step": spaces.Box(low=0, high=max_steps, shape=(1,), dtype=np.int32),
        })
        
        self.reset()
    
    def reset(self, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None) -> Tuple[Dict, Dict]:
        super().reset(seed=seed)
        self.network.reset()
        self.current_step = 0
        self.compromised_hosts = set()
        self.isolated_hosts = set()
        self.patched_hosts = set()
        self.detected_compromises = set()
        
        self.red_position = self.network.get_entry_point()
        self.compromised_hosts.add(self.red_position)
        self.data_exfiltrated = 0
        self.red_caught = False
        
        self.alerts_raised = []
        self.false_positives = 0
        self.true_positives = 0
        self.logs = []
        
        return self._get_observation(), self._get_info()
    
    def step(self, action: Dict[str, np.ndarray]) -> Tuple[Dict, Dict, bool, bool, Dict]:
        self.current_step += 1
        red_target, red_type = action["red_action"]
        blue_target, blue_type = action["blue_action"]
        
        red_reward, red_logs = self._execute_red_action(int(red_target), int(red_type))
        blue_reward, blue_logs = self._execute_blue_action(int(blue_target), int(blue_type))
        
        self.logs.extend(red_logs)
        self.logs.extend(blue_logs)
        
        self._update_network_state()
        
        terminated = self._check_termination()
        truncated = self.current_step >= self.max_steps
        
        rewards = {"red": red_reward, "blue": blue_reward}
        return self._get_observation(), rewards, terminated, truncated, self._get_info()
    
    def _execute_red_action(self, target: int, action_type: int) -> Tuple[float, List[Dict]]:
        reward = 0
        logs = []
        if action_type == 0:  # Scan
            if self.network.can_reach(self.red_position, target):
                vulns = self.network.get_vulnerabilities(target)
                reward = 1
                logs.append(self.log_generator.generate_scan_log(self.red_position, target, vulns))
        elif action_type == 1:  # Exploit
            success_prob = 0.1 if target in self.patched_hosts else self.network.get_exploit_success_rate(target)
            if np.random.random() < success_prob:
                self.compromised_hosts.add(target)
                reward = 20
                logs.append(self.log_generator.generate_exploit_log(self.red_position, target, True))
            else:
                reward = -2
                logs.append(self.log_generator.generate_exploit_log(self.red_position, target, False))
        elif action_type == 2:  # Lateral movement
            if target in self.compromised_hosts and target != self.red_position:
                neighbors = self.network.get_neighbors(target)
                for neighbor in neighbors:
                    if neighbor not in self.compromised_hosts:
                        self.compromised_hosts.add(neighbor)
                        reward = 15
                        logs.append(self.log_generator.generate_lateral_movement_log(target, neighbor))
                        break
        elif action_type == 3:  # Exfiltrate
            if target in self.compromised_hosts:
                data_value = self.network.get_data_value(target)
                self.data_exfiltrated += data_value
                reward = data_value * 10
                logs.append(self.log_generator.generate_exfiltration_log(target, data_value * 1000000))
        elif action_type == 4:  # C2 Beacon
            if target in self.compromised_hosts:
                reward = 0.5
                logs.append(self.log_generator.generate_beacon_log(target))
        elif action_type == 5:  # Wait
            reward = 0.1
        return reward, logs
    
    def _execute_blue_action(self, target: int, action_type: int) -> Tuple[float, List[Dict]]:
        reward = 0
        logs = []
        if action_type == 0:  # Monitor
            reward = 0
            logs.append({"type": "monitor", "target": target})
        elif action_type == 1:  # Isolate
            self.isolated_hosts.add(target)
            if target in self.compromised_hosts:
                self.detected_compromises.add(target)
                self.true_positives += 1
                reward = 50
            else:
                self.false_positives += 1
                reward = -30
            logs.append({"type": "isolate", "target": target})
        elif action_type == 2:  # Patch
            self.patched_hosts.add(target)
            reward = 5
            logs.append({"type": "patch", "target": target})
        elif action_type == 3:  # Block IP
            if target in self.compromised_hosts:
                reward = 30
                self.detected_compromises.add(target)
                self.true_positives += 1
            else:
                reward = -10
                self.false_positives += 1
            logs.append({"type": "block_ip", "target": target})
        elif action_type == 4:  # Reset credentials
            if target in self.compromised_hosts:
                self.compromised_hosts.remove(target)
                reward = 40
                self.detected_compromises.add(target)
                self.true_positives += 1
            else:
                reward = -5
            logs.append({"type": "reset_creds", "target": target})
        elif action_type == 5:  # Investigate
            if target in self.compromised_hosts:
                reward = 10
            else:
                reward = -2
            logs.append({"type": "investigate", "target": target})
        
        if self.true_positives > 0:
            early_bonus = max(0, 50 - self.current_step)
            reward += early_bonus
        return reward, logs
    
    def _update_network_state(self):
        self.network.update_traffic(compromised=self.compromised_hosts, isolated=self.isolated_hosts)
        self.network.update_alerts(self.logs[-10:])
    
    def _check_termination(self) -> bool:
        if self.data_exfiltrated >= 1000:
            return True
        if len(self.compromised_hosts) > self.num_hosts * 0.75:
            return True
        if set(self.compromised_hosts).issubset(self.detected_compromises) and len(self.compromised_hosts) > 2:
            self.red_caught = True
            return True
        if self.current_step > 50 and len(self.compromised_hosts) == 1:
            return True
        return False
    
    def _get_observation(self) -> Dict:
        observed_status = np.zeros(self.num_hosts)
        for host in self.detected_compromises:
            observed_status[host] = 1
        return {
            "network_topology": self.network.get_adjacency_matrix(),
            "host_status": observed_status,
            "traffic_matrix": self.network.get_traffic_matrix(),
            "alert_scores": self.network.get_alert_scores(),
            "time_step": np.array([self.current_step]),
        }
    
    def _get_info(self) -> Dict:
        return {
            "compromised_hosts": list(self.compromised_hosts),
            "detected_compromises": list(self.detected_compromises),
            "isolated_hosts": list(self.isolated_hosts),
            "data_exfiltrated": self.data_exfiltrated,
            "true_positives": self.true_positives,
            "false_positives": self.false_positives,
            "red_caught": self.red_caught,
            "logs": self.logs[-5:],
        }
