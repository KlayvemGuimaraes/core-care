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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-white/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-7xl w-full relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-20 max-w-4xl animate-slide-in-up">
          <div className="flex justify-center mb-12">
            <div className="relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>
          
          <h1 className="hero-title mb-8">
            CoreCare
          </h1>

          <p className="hero-description mb-12">
            Sistema inteligente para agentes de saúde em locais remotos do Brasil. 
            Análise de sintomas, perguntas direcionadas e relatórios médicos precisos.
          </p>
          
          <div className="button-container mb-16">
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

        {/* Features Section */}
        <div className="w-full max-w-6xl mb-20">
          <div className="features-grid">
            <div className="feature-card group animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <div className="feature-icon blue group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h3 className="feature-title">IA Inteligente</h3>
              <p className="feature-description">
                Análise avançada de sintomas com base em conhecimento médico especializado e Google Gemini
              </p>
            </div>

            <div className="feature-card group animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              <div className="feature-icon green group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <h3 className="feature-title">Perguntas Dinâmicas</h3>
              <p className="feature-description">
                Sistema de perguntas adaptativas geradas por IA para diagnóstico preciso
              </p>
            </div>

            <div className="feature-card group animate-slide-in-right" style={{animationDelay: '0.6s'}}>
              <div className="feature-icon purple group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h3 className="feature-title">Relatórios Detalhados</h3>
              <p className="feature-description">
                Relatórios completos com probabilidades, urgência e recomendações específicas
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="w-full max-w-6xl">
          <div className="card animate-slide-in-up" style={{animationDelay: '0.8s'}}>
            <h2 className="how-it-works-title">
              Como Funciona
            </h2>
            <div className="steps-grid">
              <div className="step-item group animate-slide-in-up" style={{animationDelay: '1s'}}>
                <div className="step-number blue group-hover:scale-110 transition-transform duration-300">
                  <span>1</span>
                </div>
                <h3 className="step-title">Dados do Paciente</h3>
                <p className="step-description">Insira informações básicas, sintomas e histórico médico</p>
              </div>
              <div className="step-item group animate-slide-in-up" style={{animationDelay: '1.2s'}}>
                <div className="step-number green group-hover:scale-110 transition-transform duration-300">
                  <span>2</span>
                </div>
                <h3 className="step-title">Análise IA</h3>
                <p className="step-description">Google Gemini analisa e gera perguntas específicas</p>
              </div>
              <div className="step-item group animate-slide-in-up" style={{animationDelay: '1.4s'}}>
                <div className="step-number yellow group-hover:scale-110 transition-transform duration-300">
                  <span>3</span>
                </div>
                <h3 className="step-title">Perguntas</h3>
                <p className="step-description">Responda perguntas direcionadas com SIM/NÃO</p>
              </div>
              <div className="step-item group animate-slide-in-up" style={{animationDelay: '1.6s'}}>
                <div className="step-number purple group-hover:scale-110 transition-transform duration-300">
                  <span>4</span>
                </div>
                <h3 className="step-title">Relatório</h3>
                <p className="step-description">Receba diagnóstico com probabilidades e recomendações</p>
              </div>
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
