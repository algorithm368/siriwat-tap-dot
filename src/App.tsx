import React, { useState, useEffect, useCallback } from 'react';

const COLORS = {
  pink: 'bg-pink-200 border-pink-300 text-pink-800',
  blue: 'bg-blue-200 border-blue-300 text-blue-800',
  green: 'bg-green-200 border-green-300 text-green-800',
  purple: 'bg-purple-200 border-purple-300 text-purple-800',
  yellow: 'bg-yellow-200 border-yellow-300 text-yellow-800',
  indigo: 'bg-indigo-200 border-indigo-300 text-indigo-800'
};

const COLOR_KEYS = Object.keys(COLORS);

const CUTE_EMOJIS = ['🌸', '✨', '💕', '🌟', '🦄', '🌈', '💖', '⭐', '🎀', '🧚‍♀️'];
const SUCCESS_EMOJIS = ['🎉', '✨', '💫', '🌟', '🎊'];

interface Button {
  id: number;
  color: string;
  x: number;
  y: number;
  timeLeft: number;
  maxTime: number;
  emoji: string;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export default function TapComboGame() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [nextButtonId, setNextButtonId] = useState(1);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [nextTextId, setNextTextId] = useState(1);
  const [screenShake, setScreenShake] = useState(false);
  const [comboAnimation, setComboAnimation] = useState(false);

  const spawnButton = useCallback(() => {
    const newButton: Button = {
      id: nextButtonId,
      color: COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)],
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 25,
      timeLeft: Math.max(2000, 3500 - level * 200),
      maxTime: Math.max(2000, 3500 - level * 200),
      emoji: CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)]
    };
    
    setButtons(prev => [...prev, newButton]);
    setNextButtonId(prev => prev + 1);
  }, [nextButtonId, level]);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const newText: FloatingText = {
      id: nextTextId,
      text,
      x,
      y,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    setNextTextId(prev => prev + 1);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  };

  const handleButtonTap = (buttonId: number, event: React.MouseEvent) => {
    const button = buttons.find(b => b.id === buttonId);
    if (!button) return;
    
    setButtons(prev => prev.filter(b => b.id !== buttonId));
    
    const baseScore = 10 + (combo * 2);
    setScore(prev => prev + baseScore);
    setCombo(prev => prev + 1);
    
    // เพิ่ม floating text
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    addFloatingText(
      `+${baseScore} ${SUCCESS_EMOJIS[Math.floor(Math.random() * SUCCESS_EMOJIS.length)]}`,
      (rect.left / window.innerWidth) * 100,
      (rect.top / window.innerHeight) * 100,
      'text-green-600'
    );
    
    // Combo animation
    if ((combo + 1) % 5 === 0) {
      setComboAnimation(true);
      setScreenShake(true);
      setTimeout(() => {
        setComboAnimation(false);
        setScreenShake(false);
      }, 500);
    }
    
    // เพิ่ม level ทุก 10 combo
    if ((combo + 1) % 10 === 0) {
      setLevel(prev => prev + 1);
      addFloatingText(
        `LEVEL UP! 🎊`,
        50,
        30,
        'text-purple-600'
      );
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setButtons([]);
    setLevel(1);
    setLives(3);
    setNextButtonId(1);
    setFloatingTexts([]);
    setNextTextId(1);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setButtons([]);
    setLevel(1);
    setLives(3);
    setNextButtonId(1);
    setFloatingTexts([]);
    setNextTextId(1);
  };

  // Spawn buttons
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const spawnInterval = setInterval(() => {
      spawnButton();
    }, Math.max(800, 1500 - level * 100));
    
    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, spawnButton, level]);

  // Update button timers
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setButtons(prev => {
        const updated = prev.map(button => ({
          ...button,
          timeLeft: button.timeLeft - 50
        }));
        
        const expiredButtons = updated.filter(b => b.timeLeft <= 0);
        if (expiredButtons.length > 0) {
          // เพิ่ม sad floating text
          expiredButtons.forEach(button => {
            addFloatingText(
              '💔 MISS!',
              button.x,
              button.y,
              'text-red-500'
            );
          });
          
          setLives(current => {
            const newLives = current - expiredButtons.length;
            if (newLives <= 0) {
              setGameOver(true);
              return 0;
            }
            return newLives;
          });
          setCombo(0);
        }
        
        return updated.filter(b => b.timeLeft > 0);
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const getComboColor = () => {
    if (combo >= 50) return 'text-purple-600';
    if (combo >= 30) return 'text-pink-600';
    if (combo >= 20) return 'text-blue-600';
    if (combo >= 10) return 'text-green-600';
    return 'text-gray-600';
  };

  const getComboText = () => {
    if (combo >= 50) return '🦄 LEGENDARY!';
    if (combo >= 30) return '✨ AMAZING!';
    if (combo >= 20) return '🌟 GREAT!';
    if (combo >= 10) return '💖 GOOD!';
    return combo > 0 ? `🎀 COMBO x${combo}` : '';
  };

  if (!gameStarted) {
    return (
      <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <span className="text-2xl opacity-30">
                {CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)]}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-6 z-10">
          <div className="animate-bounce">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
              🌸 Tap Rush 🌸
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 animate-pulse">กดปุ่มให้ทันก่อนหมดเวลา! 💫</p>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 mb-8 border-2 border-white/60 shadow-xl transform hover:scale-105 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">🎮 วิธีเล่น</h2>
            <ul className="text-left text-gray-600 space-y-3">
              <li className="flex items-center">
                <span className="mr-2">🎯</span>
                กดปุ่มน่ารักๆ ก่อนที่จะหมดเวลา
              </li>
              <li className="flex items-center">
                <span className="mr-2">🔥</span>
                ยิ่งกด combo ติดต่อกันยิ่งได้แต้มเยอะ
              </li>
              <li className="flex items-center">
                <span className="mr-2">💔</span>
                พลาดปุ่มจะเสียชีวิตและรีเซ็ต combo
              </li>
              <li className="flex items-center">
                <span className="mr-2">⚡</span>
                เกมจะเร็วขึ้นเรื่อยๆ
              </li>
            </ul>
          </div>
          
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold py-5 px-10 rounded-3xl text-2xl shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse border-4 border-white/50"
          >
            🚀 เริ่มเกม 🚀
          </button>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
        {/* Sad floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              <span className="text-3xl opacity-20">💔</span>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-6 z-10">
          <div className="animate-bounce">
            <h1 className="text-5xl font-bold text-red-400 mb-4">😭 Game Over! 😭</h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/60 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="space-y-6">
              <div className="text-3xl font-bold text-gray-700 animate-pulse">🎯 คะแนนสุดท้าย</div>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-bounce">
                {score.toLocaleString()}
              </div>
              <div className="grid grid-cols-2 gap-4 text-lg text-gray-600">
                <div className="flex items-center justify-center">
                  <span className="mr-2">🏆</span>
                  Level: {level}
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-2">🔥</span>
                  Max Combo: {combo}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 hover:from-green-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-xl transform hover:scale-110 transition-all duration-300 border-4 border-white/50"
            >
              💪 เล่นอีกครั้ง 💪
            </button>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-xl transform hover:scale-110 transition-all duration-300 border-4 border-white/50"
            >
              🏠 กลับหน้าหลัก 🏠
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(-10deg); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-gradient-to-br from-blue-50 via-green-50 to-pink-50 relative overflow-hidden font-mono ${screenShake ? 'animate-shake' : ''}`}>
      {/* Floating background hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            <span className="text-3xl">💖</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/70 backdrop-blur-lg border-b-2 border-white/60 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💎 {score.toLocaleString()}
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🏆 Level {level}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transform transition-all duration-500 ${
                  i < lives 
                    ? 'bg-gradient-to-br from-red-300 to-pink-400' 
                    : 'bg-gray-200 scale-90'
                }`}
              >
                {i < lives ? '💖' : '🤍'}
              </div>
            ))}
          </div>
          
          {combo > 0 && (
            <div className={`text-2xl font-bold ${getComboColor()} ${comboAnimation ? 'animate-bounce scale-125' : ''} transition-all duration-300`}>
              {getComboText()}
            </div>
          )}
        </div>
      </div>

      {/* Floating Score Texts */}
      {floatingTexts.map(text => (
        <div
          key={text.id}
          className={`absolute pointer-events-none text-2xl font-bold ${text.color} animate-float-up z-20`}
          style={{
            left: `${text.x}%`,
            top: `${text.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {text.text}
        </div>
      ))}

      {/* Game Area */}
      <div className="absolute inset-0 pt-32">
        {buttons.map(button => {
          const progress = button.timeLeft / button.maxTime;
          const scale = 0.9 + (progress * 0.3);
          const isUrgent = progress < 0.3;
          
          return (
            <button
              key={button.id}
              onClick={(e) => handleButtonTap(button.id, e)}
              className={`absolute w-20 h-20 rounded-full border-4 font-bold text-lg shadow-2xl transform transition-all duration-150 hover:scale-125 active:scale-95 ${
                COLORS[button.color as keyof typeof COLORS]
              } ${isUrgent ? 'animate-wiggle' : ''}`}
              style={{
                left: `${button.x}%`,
                top: `${button.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: progress > 0.3 ? 1 : 0.7 + (progress * 0.8),
                boxShadow: isUrgent ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">{button.emoji}</span>
                <span className="text-sm font-bold">
                  {Math.ceil(button.timeLeft / 1000)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mega Combo Animation */}
      {comboAnimation && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          <div className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-bounce">
            🎊 COMBO! 🎊
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-5deg) scale(1.1); }
          75% { transform: translate(-50%, -50%) rotate(5deg) scale(1.1); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
        .animate-wiggle {
          animation: wiggle 0.3s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}