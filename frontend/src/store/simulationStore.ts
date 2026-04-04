import { create } from 'zustand';
import { apiClient, getWebSocketUrl } from '../api/client';
import type { NodeData, LinkData } from '../components/visualization/NetworkTopology';
import toast from 'react-hot-toast';

interface SimulationState {
  simulationId: string | null;
  isConnected: boolean;
  nodes: NodeData[];
  links: LinkData[];
  logs: any[];
  step: number;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  startSimulation: () => Promise<void>;
  generateStep: () => void;
  _socket: WebSocket | null;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  simulationId: null,
  isConnected: false,
  nodes: [],
  links: [],
  logs: [],
  step: 0,
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  _socket: null,

  setApiBaseUrl: (url: string) => {
    set({ apiBaseUrl: url });
    apiClient.defaults.baseURL = url;
  },

  startSimulation: async () => {
    try {
      const response = await apiClient.post('/api/simulation/create');
      const simId = response.data.simulation_id;
      set({ simulationId: simId });

      const wssUrl = getWebSocketUrl(simId);
      const ws = new WebSocket(wssUrl);
      
      ws.onopen = () => {
        set({ isConnected: true, _socket: ws });
        toast.success("WebSocket Connected", { icon: "🔌" });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init' || data.type === 'step') {
            const { network_topology, host_status, traffic_matrix } = data.observation;
            
            const newNodes: NodeData[] = [];
            for(let i=0; i<20; i++) {
                let status: NodeData['status'] = 'normal';
                if (host_status[i] === 1) status = 'detected';
                else if (data.info?.compromised_hosts?.includes(i)) status = 'compromised';
                if (data.info?.isolated_hosts?.includes(i)) status = 'isolated';

                newNodes.push({ id: i, type: 0, status });
            }

            const newLinks: LinkData[] = [];
            for (let i = 0; i < 20; i++) {
                for (let j = i + 1; j < 20; j++) {
                    if (network_topology[i][j] > 0) {
                        newLinks.push({
                            source: i,
                            target: j,
                            traffic: traffic_matrix[i][j]
                        });
                    }
                }
            }

            set(state => ({
                nodes: newNodes,
                links: newLinks,
                step: data.type === 'step' ? data.step : state.step,
                logs: data.info?.logs || []
            }));

            if (data.terminated) {
                toast("Simulation Terminated!", { icon: "🏁" });
            }
        }
      };

      ws.onclose = () => set({ isConnected: false, _socket: null });

    } catch (error) {
      console.error(error);
      toast.error("Failed to start simulation. Check API URL.");
    }
  },

  generateStep: () => {
    const { _socket } = get();
    if (_socket && _socket.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify({ command: 'step' }));
    } else {
      toast.error("Not connected to simulation stream");
    }
  }
}));
