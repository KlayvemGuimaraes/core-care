import React, { useState } from 'react';
import { PatientData, AIAnalysis, Answer, DiagnosticSession } from './types/health';
import { AIService } from './services/aiService';
import { PatientDataForm } from './components/PatientDataForm';
import { QuestionInterface } from './components/QuestionInterface';
import { DiagnosticReport } from './components/DiagnosticReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StatusIndicator } from './components/StatusIndicator';
import { ThemeToggle } from './components/ThemeToggle';
import { Heart, Brain, Shield, Activity } from 'lucide-react';

type AppStep = 'welcome' | 'data_entry' | 'questions' | 'analysis' | 'report';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar se o Gemini está configurado
  const isGeminiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY && 
    import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';

  const handlePatientDataSubmit = async (patientData: PatientData) => {
    console.log('📋 Dados do paciente recebidos:', patientData);
    setIsLoading(true);
    try {
      const analysis = await AIService.analyzeSymptoms(patientData);
      console.log('✅ Análise concluída:', analysis);
      
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
      console.log('🔄 Navegando para perguntas...');
    } catch (error) {
      console.error('❌ Erro ao analisar sintomas:', error);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
                <Heart className="w-20 h-20 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="hero-title">
            HealthAI
          </h1>
          
          <p className="hero-subtitle">
            Diagnóstico Assistido por IA
          </p>
          
          <p className="hero-description">
            Sistema inteligente para agentes de saúde em locais remotos do Brasil. 
            Análise de sintomas, perguntas direcionadas e relatórios médicos precisos.
          </p>
          
          <div className="button-container">
            <button
              onClick={() => {
                console.log('🔄 Iniciando nova avaliação...');
                setCurrentStep('data_entry');
              }}
              className="hero-button"
            >
              <Heart className="w-6 h-6" />
              <span>Iniciar Nova Avaliação</span>
            </button>
            
            <StatusIndicator 
              isGeminiConfigured={isGeminiConfigured} 
              isOnline={true} 
            />
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="feature-title">IA Inteligente</h3>
            <p className="feature-description">
              Análise avançada de sintomas com base em conhecimento médico especializado e Google Gemini
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h3 className="feature-title">Perguntas Dinâmicas</h3>
            <p className="feature-description">
              Sistema de perguntas adaptativas geradas por IA para diagnóstico preciso
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="feature-title">Relatórios Detalhados</h3>
            <p className="feature-description">
              Relatórios completos com probabilidades, urgência e recomendações específicas
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="how-it-works-title">
            Como Funciona
          </h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number blue">
                <span>1</span>
              </div>
              <h3 className="step-title">Dados do Paciente</h3>
              <p className="step-description">Insira informações básicas, sintomas e histórico médico</p>
            </div>
            <div className="step-item">
              <div className="step-number green">
                <span>2</span>
              </div>
              <h3 className="step-title">Análise IA</h3>
              <p className="step-description">Google Gemini analisa e gera perguntas específicas</p>
            </div>
            <div className="step-item">
              <div className="step-number yellow">
                <span>3</span>
              </div>
              <h3 className="step-title">Perguntas</h3>
              <p className="step-description">Responda perguntas direcionadas com SIM/NÃO</p>
            </div>
            <div className="step-item">
              <div className="step-number purple">
                <span>4</span>
              </div>
              <h3 className="step-title">Relatório</h3>
              <p className="step-description">Receba diagnóstico com probabilidades e recomendações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    console.log('🔄 Renderizando step:', currentStep);
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeScreen();
      
      case 'data_entry':
        return (
          <div className="min-h-screen py-8">
            <div className="container">
              {isLoading ? (
                <div className="card">
                  <LoadingSpinner 
                    message="Analisando sintomas com Google Gemini..." 
                    size="lg" 
                    showGemini={true}
                  />
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
                  <LoadingSpinner 
                    message="Refinando diagnóstico com Google Gemini..." 
                    size="lg" 
                    showGemini={true}
                  />
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
