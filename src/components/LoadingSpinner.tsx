import React from 'react';
import { Loader2, Brain, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showGemini?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Analisando sintomas...', 
  size = 'md',
  showGemini = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Brain className="w-10 h-10 text-white animate-pulse" />
        </div>
        {showGemini && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
          {showGemini && (
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Google Gemini
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {showGemini ? 'IA Analisando...' : 'Processando...'}
        </h3>
        
        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          {message}
        </p>
        
        {showGemini && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Usando inteligência artificial avançada</span>
          </div>
        )}
      </div>
    </div>
  );
};
