import React, { useState } from 'react';
import { PatientData, AIAnalysis, Answer, DiagnosticSession } from './types/health';
import { AIService } from './services/aiService';
import { PatientDataForm } from './components/PatientDataForm';
import { QuestionInterface } from './components/QuestionInterface';
import { DiagnosticReport } from './components/DiagnosticReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Heart, Brain, Shield, Activity } from 'lucide-react';

type AppStep = 'welcome' | 'data_entry' | 'questions' | 'analysis' | 'report';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePatientDataSubmit = async (patientData: PatientData) => {
    setIsLoading(true);
    try {
      const analysis = await AIService.analyzeSymptoms(patientData);
      
      const newSession: DiagnosticSession = {
        id: `session_${Date.now()}`,
        patientId: patientData.id,
        patientData,
        questions: analysis.generatedQuestions,
        answers: [],
        analysis,
        currentStep: 'questions',
        createdAt: new Date()
      };

      setSession(newSession);
      setAnswers([]);
      setCurrentStep('questions');
    } catch (error) {
      console.error('Erro ao analisar sintomas:', error);
      // Ainda assim, criar uma sessão com análise básica
      const basicAnalysis = {
        initialAssessment: 'Análise em andamento...',
        possibleConditions: [],
        generatedQuestions: [],
        riskLevel: 'low' as const,
        recommendations: []
      };
      
      const newSession: DiagnosticSession = {
        id: `session_${Date.now()}`,
        patientId: patientData.id,
        patientData,
        questions: [],
        answers: [],
        analysis: basicAnalysis,
        currentStep: 'questions',
        createdAt: new Date()
      };

      setSession(newSession);
      setAnswers([]);
      setCurrentStep('questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: Answer) => {
    setAnswers(prev => [...prev, answer]);
    
    if (session) {
      const updatedSession = {
        ...session,
        answers: [...session.answers, answer]
      };
      setSession(updatedSession);
    }
  };

  const handleQuestionsComplete = async () => {
    if (session) {
      setIsLoading(true);
      try {
        const refinedAnalysis = await AIService.refineDiagnosis(answers, session.analysis);
        const updatedSession = {
          ...session,
          analysis: refinedAnalysis,
          currentStep: 'analysis',
          completedAt: new Date()
        };
        setSession(updatedSession);
        setCurrentStep('report');
      } catch (error) {
        console.error('Erro ao refinar diagnóstico:', error);
        // Usar análise atual mesmo com erro
        const updatedSession = {
          ...session,
          currentStep: 'analysis',
          completedAt: new Date()
        };
        setSession(updatedSession);
        setCurrentStep('report');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewAssessment = () => {
    setCurrentStep('welcome');
    setSession(null);
    setAnswers([]);
  };

  const handleBackToQuestions = () => {
    setCurrentStep('questions');
  };

  const handleBackToDataEntry = () => {
    setCurrentStep('data_entry');
  };

  const renderWelcomeScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <Heart className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            HealthAI
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sistema de Diagnóstico Assistido por IA para Agentes de Saúde em Locais Remotos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('data_entry')}
              className="btn btn-primary text-lg px-8 py-4"
            >
              <Heart className="w-5 h-5" />
              Iniciar Nova Avaliação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="p-4 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">IA Inteligente</h3>
            <p className="text-gray-600">
              Análise avançada de sintomas com base em conhecimento médico especializado
            </p>
          </div>

          <div className="card text-center">
            <div className="p-4 bg-green-100 rounded-lg w-fit mx-auto mb-4">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perguntas Dinâmicas</h3>
            <p className="text-gray-600">
              Sistema de perguntas adaptativas para diagnóstico preciso
            </p>
          </div>

          <div className="card text-center">
            <div className="p-4 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
            <p className="text-gray-600">
              Relatórios completos com probabilidades e recomendações
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Como Funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Dados do Paciente</h3>
              <p className="text-sm text-gray-600">Insira informações básicas e sintomas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Análise IA</h3>
              <p className="text-sm text-gray-600">IA analisa e gera perguntas específicas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Perguntas</h3>
              <p className="text-sm text-gray-600">Responda perguntas direcionadas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Relatório</h3>
              <p className="text-sm text-gray-600">Receba diagnóstico e recomendações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeScreen();
      
      case 'data_entry':
        return (
          <div className="min-h-screen py-8">
            <div className="container">
              {isLoading ? (
                <div className="card">
                  <LoadingSpinner message="Analisando sintomas com IA..." size="lg" />
                </div>
              ) : (
                <PatientDataForm onSubmit={handlePatientDataSubmit} />
              )}
            </div>
          </div>
        );
      
      case 'questions':
        return session ? (
          <div className="min-h-screen py-8">
            <div className="container">
              {isLoading ? (
                <div className="card">
                  <LoadingSpinner message="Processando respostas e refinando diagnóstico..." size="lg" />
                </div>
              ) : (
                <QuestionInterface
                  questions={session.questions}
                  onAnswer={handleAnswer}
                  onComplete={handleQuestionsComplete}
                  onBack={handleBackToDataEntry}
                />
              )}
            </div>
          </div>
        ) : null;
      
      case 'report':
        return session ? (
          <div className="min-h-screen py-8">
            <div className="container">
              <DiagnosticReport
                patientData={session.patientData}
                analysis={session.analysis}
                answers={answers}
                onNewAssessment={handleNewAssessment}
                onBackToQuestions={handleBackToQuestions}
              />
            </div>
          </div>
        ) : null;
      
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <div className="App">
      {renderCurrentStep()}
    </div>
  );
}

export default App;
