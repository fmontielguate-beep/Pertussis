import * as React from 'react';
import { useState } from 'react';
import { QUESTIONS } from '../constants';
import { Question } from '../types';

interface QuizModalProps {
  questionIndex: number;
  onComplete: (correct: boolean) => void;
  title?: string;
  subtitle?: string;
}

const QuizModal: React.FC<QuizModalProps> = ({ 
  questionIndex, 
  onComplete, 
  title = "NIVEL COMPLETADO", 
  subtitle = "Analiza los datos para mejorar defensas" 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Wrap index to prevent crash if we run out of questions
  const safeIndex = questionIndex % QUESTIONS.length;
  const currentQ: Question = QUESTIONS[safeIndex];

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentQ.correctAnswer;
    onComplete(isCorrect);
  };

  const isCritical = title.includes("FALLO") || title.includes("EMERGENCIA");

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-gray-900 border-4 ${isCritical ? 'border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'} rounded-lg max-w-2xl w-full p-6`}>
        <div className="text-center mb-6">
          <h2 className={`${isCritical ? 'text-red-500 animate-pulse' : 'text-yellow-400'} font-arcade text-xl mb-2`}>{title}</h2>
          <p className={`${isCritical ? 'text-red-300 font-bold' : 'text-blue-300'} text-sm`}>{subtitle}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-white text-lg font-bold mb-4">{currentQ.question}</h3>
          <div className="space-y-2">
            {currentQ.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 rounded border-2 transition-all ";
              
              if (showResult) {
                if (idx === currentQ.correctAnswer) {
                  btnClass += "bg-green-900/50 border-green-500 text-green-100";
                } else if (idx === selectedOption) {
                  btnClass += "bg-red-900/50 border-red-500 text-red-100";
                } else {
                  btnClass += "bg-gray-800 border-gray-700 text-gray-500";
                }
              } else {
                btnClass += "bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-blue-400 text-white cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={btnClass}
                  disabled={showResult}
                >
                  <span className="inline-block w-6 font-mono text-gray-400">{idx + 1}.</span> {option}
                </button>
              );
            })}
          </div>
        </div>

        {showResult && (
          <div className="animate-fade-in">
            <div className={`p-4 rounded mb-4 ${selectedOption === currentQ.correctAnswer ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-red-900/30 border-l-4 border-red-500'}`}>
              <p className="text-sm text-gray-200">
                <span className="font-bold block mb-1">{selectedOption === currentQ.correctAnswer ? 'ANÁLISIS CORRECTO' : 'INCORRECTO'}</span>
                {currentQ.explanation}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 text-white font-arcade py-3 px-6 rounded shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1"
              >
                {selectedOption === currentQ.correctAnswer ? (isCritical ? 'SISTEMA RESTAURADO' : 'ACEPTAR MEJORA') : (isCritical ? 'FALLO DEL SISTEMA' : 'CONTINUAR PATRULLA')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;