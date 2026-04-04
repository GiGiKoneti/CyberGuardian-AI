import axios from 'axios';

// Fallback to local if env mapping is empty (Abhishek will paste ngrok url here or in UI)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWebSocketUrl = (simId: string) => {
  const currentBase = apiClient.defaults.baseURL || baseURL;
  const wsProtocol = currentBase.startsWith('https') ? 'wss' : 'ws';
  const cleanBase = currentBase.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${cleanBase}/ws/simulation/${simId}`;
};
