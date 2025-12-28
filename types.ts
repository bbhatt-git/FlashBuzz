export enum GameState {
  IDLE = 'IDLE',
  OPEN = 'OPEN',
  BUZZED = 'BUZZED',
  LOCKED = 'LOCKED', // Manually locked by host
}

export interface Player {
  id: string;
  name: string;
  connectedAt: number;
  rtt?: number; // Round Trip Time in ms
}

export interface BuzzPayload {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface PeerDataMessage {
  type: 'WELCOME' | 'RESET' | 'BUZZ' | 'WINNER' | 'KICK' | 'SYNC_PLAYERS' | 'SYNC_STATE' | 'JOIN';
  payload?: any;
}