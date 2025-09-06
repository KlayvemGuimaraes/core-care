import React, { useState } from 'react';
import { Question, Answer } from '../types/health';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

interface QuestionInterfaceProps {
  questions: Question[];
  onAnswer: (answer: Answer) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const QuestionInterface: React.FC<QuestionInterfaceProps> = ({
  questions,
  onAnswer,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswer = (value: any) => {
    setIsAnimating(true);
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      value,
      timestamp: new Date()
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    onAnswer(answer);

    // Pequeno delay para animação
    setTimeout(() => {
      if (isLastQuestion) {
        onComplete();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnimating(false);
      }
    }, 300);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onBack();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    return (
      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        {/* Header da Pergunta */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Pergunta {currentQuestionIndex + 1} de {questions.length}
                </h3>
                <p className="text-sm text-gray-600">Responda com base no que o paciente relatou</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getPriorityColor(currentQuestion.priority)}`}>
              {getPriorityIcon(currentQuestion.priority)}
              {currentQuestion.priority === 'high' ? 'Alta' : currentQuestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
            </div>
          </div>

          {/* Categoria */}
          <div className="text-sm text-gray-500 mb-4">
            Categoria: <span className="font-medium capitalize">{currentQuestion.category}</span>
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Opções de Resposta */}
          <div className="space-y-4">
            {currentQuestion.type === 'yes_no' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                    answers[currentQuestion.id] === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Sim</span>
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                    answers[currentQuestion.id] === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Não</span>
                </button>
              </div>
            )}

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'scale' && (
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Avalie a intensidade (1 = muito leve, 10 = muito intenso)
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                        answers[currentQuestion.id] === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {answers[currentQuestion.id] && (
                  <div className="text-center text-sm text-gray-600">
                    Selecionado: {answers[currentQuestion.id]}
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  className="textarea"
                  placeholder="Digite sua resposta..."
                  rows={4}
                />
                <button
                  onClick={() => handleAnswer(answers[currentQuestion.id])}
                  disabled={!answers[currentQuestion.id]?.trim()}
                  className="btn btn-primary mt-4"
                >
                  Confirmar Resposta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Avaliação Adicional</h2>
          <div className="text-sm text-gray-600">
            {currentQuestionIndex + 1} de {questions.length} perguntas
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {renderQuestionContent()}

      {/* Navegação */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          className="btn btn-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          {isFirstQuestion ? 'Voltar aos Dados' : 'Anterior'}
        </button>

        <div className="flex gap-2">
          {!isFirstQuestion && (
            <button
              onClick={handlePrevious}
              className="btn btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
          
          {!isLastQuestion && answers[currentQuestion.id] !== undefined && (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dica */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dica para o Agente de Saúde:</p>
            <p>Faça as perguntas diretamente ao paciente e registre as respostas com base no que ele relatar. Se houver dúvidas, peça para o paciente esclarecer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
