import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SPEED, BULLET_SPEED, SPAWN_RATE_BASE } from '../constants';
import { EnemyType, GameEntity, GameState, Particle } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  health: number;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  onLevelComplete: () => void;
  weaponLevel: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  score: propScore, // We use a ref for internal loop, but sync with this if needed
  setScore, 
  health,
  setHealth,
  onLevelComplete,
  weaponLevel 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Mutable Game State (Refs for performance in loop)
  const playerRef = useRef<GameEntity>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, width: 40, height: 40, vx: 0, vy: 0, hp: 100 });
  const bulletsRef = useRef<GameEntity[]>([]);
  const enemiesRef = useRef<GameEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isMouseDownRef = useRef(false); // Track mouse click state
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const levelProgressRef = useRef(0);
  const hasRevivedRef = useRef(false); // Track if second chance was used

  // Sync props to refs (important for when game restarts or revives)
  useEffect(() => {
    if (health > 0 && playerRef.current.hp <= 0) {
      // Player was revived by parent component
      playerRef.current.hp = health;
      // Brief invulnerability visual or clear nearby enemies could go here
      enemiesRef.current = enemiesRef.current.filter(e => e.y < CANVAS_HEIGHT - 200);
    }
  }, [health]);

  useEffect(() => {
    // Reset logic when starting a fresh game from MENU
    if (gameState === GameState.MENU) {
      hasRevivedRef.current = false;
      scoreRef.current = 0;
      levelProgressRef.current = 0;
      enemiesRef.current = [];
      bulletsRef.current = [];
      playerRef.current.hp = 100;
    }
  }, [gameState]);

  // Initialize controls (Keyboard + Mouse)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    
    const handleMouseDown = () => { isMouseDownRef.current = true; };
    const handleMouseUp = () => { isMouseDownRef.current = false; };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== GameState.PLAYING) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      // Calculate scale in case canvas is resized via CSS
      const scaleX = canvas.width / rect.width;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      
      // Update player position directly based on mouse
      // Center player on mouse cursor
      const p = playerRef.current;
      p.x = mouseX - p.width / 2;
      
      // Clamp
      p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, p.x));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const spawnEnemy = () => {
      const typeRoll = Math.random();
      let type = EnemyType.NORMAL;
      let speed = 2;
      let hp = 1;
      let size = 30;
      
      // Difficulty scaling
      const difficultyMult = 1 + (levelProgressRef.current / 1000);

      if (typeRoll > 0.8) {
        type = EnemyType.FAST;
        speed = 4 * difficultyMult;
        size = 20;
      } else if (typeRoll > 0.95) {
        type = EnemyType.TANK;
        speed = 1;
        hp = 5;
        size = 50;
      }

      enemiesRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - size),
        y: -size,
        width: size,
        height: size,
        vx: (Math.random() - 0.5) * speed,
        vy: speed,
        hp: hp,
        type
      });
    };

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          color
        });
      }
    };

    const update = () => {
      frameCountRef.current++;
      levelProgressRef.current++;

      // Check Level Complete
      if (levelProgressRef.current > 1500) { // Approx 25 seconds per wave
        levelProgressRef.current = 0;
        // Clear screen
        bulletsRef.current = [];
        enemiesRef.current = [];
        onLevelComplete();
        return;
      }

      // Player Movement (Keyboard fallback - Mouse is handled in event listener)
      const player = playerRef.current;
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) player.x -= PLAYER_SPEED;
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) player.x += PLAYER_SPEED;
      
      // Clamp Player (Keyboard)
      player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));

      // Shooting logic
      // Checks for Space Key OR Mouse Click
      if ((keysRef.current['Space'] || isMouseDownRef.current) && frameCountRef.current % 10 === 0) {
         // Weapon logic based on quiz upgrades
         if (weaponLevel === 1) {
           bulletsRef.current.push({ x: player.x + player.width / 2 - 4, y: player.y, width: 8, height: 16, vx: 0, vy: -BULLET_SPEED, hp: 1 });
         } else if (weaponLevel >= 2) {
            // Macrolide Spread Shot
            bulletsRef.current.push({ x: player.x + player.width / 2 - 4, y: player.y, width: 8, height: 16, vx: 0, vy: -BULLET_SPEED, hp: 1 });
            bulletsRef.current.push({ x: player.x + player.width / 2 - 4, y: player.y, width: 8, height: 16, vx: -2, vy: -BULLET_SPEED * 0.9, hp: 1 });
            bulletsRef.current.push({ x: player.x + player.width / 2 - 4, y: player.y, width: 8, height: 16, vx: 2, vy: -BULLET_SPEED * 0.9, hp: 1 });
         }
      }

      // Spawning
      // More enemies as progress increases
      if (frameCountRef.current % Math.max(20, SPAWN_RATE_BASE - Math.floor(levelProgressRef.current / 100)) === 0) {
        spawnEnemy();
      }

      // Update Projectiles
      bulletsRef.current.forEach(b => { b.y += b.vy; b.x += b.vx; });
      bulletsRef.current = bulletsRef.current.filter(b => b.y > -50);

      // Update Enemies
      enemiesRef.current.forEach(e => { e.y += e.vy; e.x += e.vx; });

      // Collision Detection
      // 1. Bullet hit Enemy
      bulletsRef.current.forEach(b => {
        enemiesRef.current.forEach(e => {
          if (b.hp > 0 && e.hp > 0 && 
              b.x < e.x + e.width && b.x + b.width > e.x &&
              b.y < e.y + e.height && b.y + b.height > e.y) {
            b.hp = 0;
            e.hp--;
            if (e.hp <= 0) {
              createExplosion(e.x + e.width/2, e.y + e.height/2, e.type === EnemyType.TANK ? '#f87171' : '#4ade80');
              scoreRef.current += 100;
              setScore(scoreRef.current);
            }
          }
        });
      });

      // 2. Enemy hit Player or Bottom
      enemiesRef.current.forEach(e => {
        // Hit Player
        if (e.hp > 0 && 
            player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
          e.hp = 0;
          player.hp -= 20;
          setHealth(player.hp);
          createExplosion(player.x + player.width/2, player.y, '#ef4444');
        }
        // Hit Bottom (Infect Lungs)
        else if (e.y > CANVAS_HEIGHT) {
          e.hp = 0;
          player.hp -= 10; // Infection damage
          setHealth(player.hp);
        }
      });

      if (player.hp <= 0) {
        if (!hasRevivedRef.current) {
          // Trigger Second Chance
          hasRevivedRef.current = true;
          setGameState(GameState.REVIVE_QUIZ);
        } else {
          // True Death
          setGameState(GameState.GAME_OVER);
        }
      }

      // Cleanup
      enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);
      bulletsRef.current = bulletsRef.current.filter(b => b.hp > 0);

      // Update Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    };

    const draw = () => {
      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw "Lungs" background effect (subtle)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i=0; i<CANVAS_HEIGHT; i+=40) {
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
      }
      ctx.stroke();

      // Player (Antibody Shield Ship)
      const p = playerRef.current;
      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      // Draw a plus shape (medical/antibody)
      ctx.fillRect(p.x + p.width/2 - 5, p.y, 10, p.height);
      ctx.fillRect(p.x, p.y + p.height/2 - 5, p.width, 10);
      ctx.shadowBlur = 0;

      // Enemies (Bordetella)
      enemiesRef.current.forEach(e => {
        ctx.fillStyle = e.type === EnemyType.TANK ? '#ef4444' : (e.type === EnemyType.FAST ? '#facc15' : '#4ade80');
        ctx.beginPath();
        ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw little cilia/hairs
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Bullets (Antibiotics)
      ctx.fillStyle = '#06b6d4'; // Cyan pill color
      bulletsRef.current.forEach(b => {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();
      });

      // Particles
      particlesRef.current.forEach(part => {
        ctx.globalAlpha = part.life;
        ctx.fillStyle = part.color;
        ctx.fillRect(part.x, part.y, 4, 4);
        ctx.globalAlpha = 1.0;
      });
    };

    const tick = () => {
      update();
      draw();
      if (gameState === GameState.PLAYING) {
        requestRef.current = requestAnimationFrame(tick);
      }
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, onLevelComplete, setGameState, setHealth, setScore, weaponLevel]);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT}
      className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 mx-auto cursor-none touch-none"
    />
  );
};

export default GameCanvas;