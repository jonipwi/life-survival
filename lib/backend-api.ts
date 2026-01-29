// lib/backend-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8084';

// Types based on backend structs
export interface Character {
  id: string;
  user_id?: string;
  name: string;
  age_days: number;
  resources: Record<string, number>;
  traits: Record<string, number>;
  skills: Record<string, number>;
  relationships: Record<string, number>;
  stage: string;
  spouse_id?: string;
  children_ids?: string[];
  parent_ids?: string[];
  completed_quests?: string[];
  active_quests?: Record<string, number>;
  legacy_score: number;
  ending_type?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// Generic fetch wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Character API functions
export const characterApi = {
  // GET /api/v1/characters
  listCharacters: (): Promise<Character[]> =>
    apiRequest('/api/v1/characters'),

  // POST /api/v1/character
  createCharacter: (data: { name: string }): Promise<Character> =>
    apiRequest('/api/v1/character', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/v1/character/{id}
  getCharacter: (id: string): Promise<Character> =>
    apiRequest(`/api/v1/character/${id}`),

  // GET /api/v1/character/events/{id}
  getCharacterEvents: (id: string): Promise<any> =>
    apiRequest(`/api/v1/character/events/${id}`),

  // POST /api/v1/character/reset
  resetCharacter: (data: { characterId: string }): Promise<any> =>
    apiRequest('/api/v1/character/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Time/Simulation API functions
export const simulationApi = {
  // POST /api/v1/time/advance
  advanceTime: (characterId: string, days: number = 1): Promise<any> =>
    apiRequest('/api/v1/time/advance', {
      method: 'POST',
      body: JSON.stringify({ actorId: characterId, days }),
    }),

  // POST /api/v1/event/trigger
  triggerEvent: (characterId: string, eventType?: string): Promise<any> =>
    apiRequest('/api/v1/event/trigger', {
      method: 'POST',
      body: JSON.stringify({ actorId: characterId, eventType }),
    }),

  // POST /api/v1/life/simulate
  simulateLife: (characterId: string): Promise<any> =>
    apiRequest('/api/v1/life/simulate', {
      method: 'POST',
      body: JSON.stringify({ actorId: characterId }),
    }),

  // POST /api/v1/action/perform
  performAction: (characterId: string, action: string): Promise<any> =>
    apiRequest('/api/v1/action/perform', {
      method: 'POST',
      body: JSON.stringify({ actionId: action, actorId: characterId }),
    }),
};

// Auth API functions
export const authApi = {
  // GET /auth/google/login
  googleLogin: (): Promise<any> =>
    apiRequest('/auth/google/login'),

  // GET /auth/google/callback
  googleCallback: (code: string): Promise<any> =>
    apiRequest(`/auth/google/callback?code=${code}`),

  // POST /auth/logout
  logout: (): Promise<any> =>
    apiRequest('/auth/logout', { method: 'POST' }),

  // GET /auth/me
  getCurrentUser: (): Promise<User> =>
    apiRequest('/auth/me'),
};