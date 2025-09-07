import React from 'react';
import { AIAnalysis, PatientData, Answer } from '../types/health';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Heart, 
  FileText, 
  ArrowRight,
  Phone,
  MapPin,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';

interface DiagnosticReportProps {
  patientData: PatientData;
  analysis: AIAnalysis;
  answers: Answer[];
  onNewAssessment: () => void;
  onBackToQuestions: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  patientData,
  analysis,
  answers,
  onNewAssessment,
  onBackToQuestions
}) => {
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyBorderColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'border-l-red-500';
      case 'urgent': return 'border-l-orange-500';
      case 'moderate': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return <AlertTriangle className="w-5 h-5" />;
      case 'urgent': return <Clock className="w-5 h-5" />;
      case 'moderate': return <Activity className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatProbability = (probability: number) => {
    return Math.round(probability * 100);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-red-600';
    if (probability >= 0.6) return 'text-orange-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header do Relatório */}
      <div className="card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Relatório de Diagnóstico</h2>
              <p className="text-gray-600">Paciente: {patientData.name} | Idade: {patientData.age} anos</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${getRiskLevelColor(analysis.riskLevel)}`}>
            <Shield className="w-4 h-4" />
            Risco {analysis.riskLevel === 'critical' ? 'Crítico' : analysis.riskLevel === 'high' ? 'Alto' : analysis.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
          </div>
        </div>

        {/* Avaliação Inicial */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Avaliação Inicial
          </h3>
          <p className="text-gray-700 leading-relaxed">{analysis.initialAssessment}</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Condições Identificadas</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{analysis.possibleConditions.length}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Perguntas Respondidas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{answers.length}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Nível de Confiança</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {analysis.possibleConditions[0]?.confidence === 'high' ? 'Alto' : 
               analysis.possibleConditions[0]?.confidence === 'medium' ? 'Médio' : 'Baixo'}
            </div>
          </div>
        </div>
      </div>

      {/* Possíveis Condições */}
      <div className="card fade-in">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Possíveis Condições Identificadas
        </h3>

        <div className="space-y-5">
          {analysis.possibleConditions.map((condition, index) => (
            <div key={index} className={`border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow border-l-4 ${getUrgencyBorderColor(condition.urgency)}`}>
              {/* Header da condição */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h4 className="text-xl font-bold text-gray-900">{index + 1}. {condition.condition}</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getUrgencyColor(condition.urgency)}`}>{getUrgencyIcon(condition.urgency)}
                  <span className="ml-1">{condition.urgency === 'immediate' ? 'Imediato' : condition.urgency === 'urgent' ? 'Urgente' : condition.urgency === 'moderate' ? 'Moderado' : 'Baixo'}</span></span>
                  <div className="flex items-baseline gap-2">
                    <span className="uppercase tracking-wide text-xs text-gray-500">Probabilidade</span>
                    <span className={`text-2xl leading-none font-extrabold ${getProbabilityColor(condition.probability)}`}>{formatProbability(condition.probability)}%</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo em grid para maior clareza */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sintomas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-xs font-bold tracking-wide text-gray-900 uppercase mb-3">Sintomas Relacionados</h5>
                  <div className="flex flex-wrap gap-2">
                    {condition.symptoms.map((symptom, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recomendações */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-xs font-bold tracking-wide text-gray-900 uppercase mb-3">Recomendações</h5>
                  <ul className="space-y-2 leading-relaxed">
                    {condition.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="text-sm md:text-[15px] text-gray-800 flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-1.5 text-gray-400 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Próximos Passos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-xs font-bold tracking-wide text-gray-900 uppercase mb-3">Próximos Passos</h5>
                  <ul className="space-y-2 leading-relaxed">
                    {condition.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-sm md:text-[15px] text-gray-800 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-1.5 text-green-500 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações Gerais */}
      <div className="card fade-in">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Recomendações Gerais
        </h3>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                {recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Informações de Contato de Emergência */}
      {analysis.riskLevel === 'critical' || analysis.riskLevel === 'high' ? (
        <div className="card fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contatos de Emergência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Phone className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">SAMU</p>
                  <p className="text-red-700">192</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Hospital Mais Próximo</p>
                  <p className="text-red-700">Localizar via GPS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Ações */}
      <div className="card fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-sm text-gray-600">
            Relatório gerado em {new Date().toLocaleString('pt-BR')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBackToQuestions}
              className="btn btn-secondary"
            >
              Voltar às Perguntas
            </button>
            <button
              onClick={onNewAssessment}
              className="btn btn-primary"
            >
              Nova Avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
