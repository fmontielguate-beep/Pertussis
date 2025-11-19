export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  QUIZ = 'QUIZ',
  REVIVE_QUIZ = 'REVIVE_QUIZ',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum EnemyType {
  NORMAL = 'NORMAL', // Standard Bordetella
  FAST = 'FAST', // Paroxysmal surge
  TANK = 'TANK' // Clumped bacteria
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface GameEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  type?: EnemyType;
}