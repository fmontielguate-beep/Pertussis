import * as React from 'react';
import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import QuizModal from './components/QuizModal';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [gameKey, setGameKey] = useState(0); // Force remount to reset game

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setHealth(100);
    setLevel(1);
    setWeaponLevel(1);
    setQuestionIndex(0);
    setGameKey(prev => prev + 1);
  };

  const handleLevelComplete = () => {
    setGameState(GameState.QUIZ);
  };

  const handleQuizComplete = (correct: boolean) => {
    if (correct) {
      setWeaponLevel(prev => Math.min(prev + 1, 3));
      setHealth(Math.min(health + 30, 100)); // Heal on correct answer
    }
    setQuestionIndex(prev => prev + 1);
    setLevel(prev => prev + 1);
    setGameState(GameState.PLAYING);
  };

  const handleReviveQuizComplete = (correct: boolean) => {
    if (correct) {
      // Revive Success
      setHealth(50); // Restore 50% HP
      setGameState(GameState.PLAYING);
    } else {
      // Revive Failed
      setGameState(GameState.GAME_OVER);
    }
    // Advance question so they don't get the same one immediately next time
    setQuestionIndex(prev => prev + 1);
  };

  const renderStageName = () => {
    switch (level) {
      case 1: return "ETAPA 1: INCUBACIÓN";
      case 2: return "ETAPA 2: CATARRAL";
      case 3: return "ETAPA 3: PAROXÍSTICA";
      default: return "ETAPA 4: CONVALECIENTE";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      
      {/* HUD */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-2 text-white font-arcade z-10">
        <div className="flex flex-col">
          <span className="text-yellow-400 text-xs">PUNTUACIÓN</span>
          <span className="text-xl">{score.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 text-xs tracking-widest">{renderStageName()}</span>
          <div className="flex space-x-2 mt-1">
             {weaponLevel > 1 && <span className="bg-cyan-500 text-[10px] px-1 rounded text-black font-bold">MACRÓLIDOS ACTIVOS</span>}
             {weaponLevel > 2 && <span className="bg-purple-500 text-[10px] px-1 rounded text-black font-bold">ESCUDO CAPULLO</span>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-red-400 text-xs">INTEGRIDAD PULMONAR</span>
          <div className="w-32 h-4 bg-gray-700 border border-gray-500 mt-1">
            <div 
              className={`h-full transition-all duration-300 ${health > 50 ? 'bg-green-500' : (health > 20 ? 'bg-yellow-500' : 'bg-red-600')}`} 
              style={{ width: `${Math.max(0, health)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Game Layer */}
      <div className="relative">
        <GameCanvas 
          key={gameKey}
          gameState={gameState} 
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          health={health}
          setHealth={setHealth}
          setLevel={setLevel}
          onLevelComplete={handleLevelComplete}
          weaponLevel={weaponLevel}
        />

        {/* Main Menu Overlay */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-lg backdrop-blur-sm z-20 p-8">
            <h1 className="text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 mb-2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] text-center leading-tight">
              PATRULLA<br/>PERTUSSIS
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-8">
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-yellow-400 font-arcade mb-3 text-sm">ENEMIGOS (Bordetella)</h3>
                <ul className="text-gray-300 text-xs space-y-3 font-mono">
                  <li className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-green-400 mr-3 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
                    <span>Verde: Infección Estándar</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-yellow-400 mr-3 shadow-[0_0_5px_rgba(250,204,21,0.8)]"></span>
                    <span>Amarilla: Tos Rápida (Veloces)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
                    <span>Roja: Grupo Resistente (Tanques)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-blue-400 font-arcade mb-3 text-sm">CONTROLES Y MISIÓN</h3>
                <ul className="text-gray-300 text-xs space-y-3 font-mono">
                  <li className="flex items-center">
                    <span className="text-xl mr-3">🖱️</span>
                    <span>Mover: Usa el MOUSE (La nave te sigue)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-xl mr-3">💥</span>
                    <span className="text-yellow-200 font-bold">Disparar: CLIC o ESPACIO</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-xl mr-3">🛡️</span>
                    <span>Destruye bacterias antes de que bajen</span>
                  </li>
                </ul>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-500 text-white font-arcade py-4 px-8 rounded shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1 transition-transform animate-pulse"
            >
              COMENZAR MISIÓN
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 rounded-lg backdrop-blur-sm z-20">
            <h2 className="text-4xl font-arcade text-white mb-4">FALLO CRÍTICO</h2>
            <div className="text-center mb-8 space-y-2">
              <p className="text-red-200">La infección ha abrumado el sistema respiratorio.</p>
              <p className="text-white text-xl">PUNTUACIÓN FINAL: {score}</p>
            </div>
            <button 
              onClick={startGame}
              className="bg-white hover:bg-gray-200 text-red-900 font-arcade py-4 px-8 rounded shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1"
            >
              REINTENTAR TRATAMIENTO
            </button>
          </div>
        )}

        {/* Level Up Quiz */}
        {gameState === GameState.QUIZ && (
          <QuizModal 
            questionIndex={questionIndex} 
            onComplete={handleQuizComplete} 
          />
        )}

        {/* Revive Quiz - Second Chance */}
        {gameState === GameState.REVIVE_QUIZ && (
          <QuizModal 
            questionIndex={questionIndex} 
            onComplete={handleReviveQuizComplete}
            title="PROTOCOLO DE EMERGENCIA"
            subtitle="Identifica correctamente la solución para restaurar signos vitales"
          />
        )}
      </div>
      
      <footer className="mt-4 text-gray-600 text-xs font-mono">
        Basado en "Fifteen-minute consultation: A guide to pertussis" (Purcell et al. 2025)
      </footer>
    </div>
  );
};

export default App;