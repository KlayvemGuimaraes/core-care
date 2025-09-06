import { PatientData, Question, AIAnalysis, Diagnosis, Answer } from '../types/health';
import { geminiService } from './geminiService';

// Base de conhecimento médico simplificada para demonstração (fallback)
const MEDICAL_KNOWLEDGE = {
  cardiovascular: {
    symptoms: ['aperto no peito', 'dor no peito', 'tontura', 'falta de ar', 'palpitação', 'desmaio'],
    conditions: [
      {
        name: 'Angina de Peito',
        probability: 0.7,
        symptoms: ['aperto no peito', 'tontura', 'falta de ar'],
        questions: [
          'A dor piora com esforço físico?',
          'A dor irradia para o braço esquerdo?',
          'Você tem histórico de diabetes?',
          'Você fuma?',
          'A dor melhora com repouso?'
        ]
      },
      {
        name: 'Infarto Agudo do Miocárdio',
        probability: 0.8,
        symptoms: ['aperto no peito', 'tontura', 'sudorese'],
        questions: [
          'A dor é intensa e constante?',
          'Você sente náuseas ou vômitos?',
          'A dor irradia para o pescoço ou mandíbula?',
          'Você tem histórico familiar de problemas cardíacos?'
        ]
      }
    ]
  },
  neurological: {
    symptoms: ['dor de cabeça', 'tontura', 'desmaio', 'convulsão', 'perda de consciência'],
    conditions: [
      {
        name: 'Enxaqueca',
        probability: 0.6,
        symptoms: ['dor de cabeça', 'tontura'],
        questions: [
          'A dor de cabeça é latejante?',
          'Você tem sensibilidade à luz?',
          'A dor dura mais de 4 horas?',
          'Você tem histórico de enxaqueca?'
        ]
      },
      {
        name: 'Ataque Isquêmico Transitório (AIT)',
        probability: 0.4,
        symptoms: ['tontura', 'perda de consciência'],
        questions: [
          'Você teve perda de força em um lado do corpo?',
          'Você teve dificuldade para falar?',
          'Você tem pressão alta?',
          'Os sintomas duraram menos de 24 horas?'
        ]
      }
    ]
  },
  respiratory: {
    symptoms: ['falta de ar', 'tosse', 'chiado no peito', 'dor no peito ao respirar'],
    conditions: [
      {
        name: 'Asma',
        probability: 0.5,
        symptoms: ['falta de ar', 'chiado no peito'],
        questions: [
          'Você tem histórico de asma?',
          'Os sintomas pioram à noite?',
          'Você tem alergias?',
          'Os sintomas melhoram com medicamento inalatório?'
        ]
      }
    ]
  }
};

export class AIService {
  static async analyzeSymptoms(patientData: PatientData): Promise<AIAnalysis> {
    // Tentar usar Gemini primeiro, fallback para análise local
    try {
      return await geminiService.analyzeSymptoms(patientData);
    } catch (error) {
      console.error('Erro ao usar Gemini, usando análise local:', error);
      return this.getLocalAnalysis(patientData);
    }
  }

  static async refineDiagnosis(answers: Answer[], currentAnalysis: AIAnalysis): Promise<AIAnalysis> {
    // Tentar usar Gemini primeiro, fallback para análise local
    try {
      return await geminiService.refineDiagnosis(answers, currentAnalysis);
    } catch (error) {
      console.error('Erro ao usar Gemini, usando análise local:', error);
      return this.getLocalRefinement(answers, currentAnalysis);
    }
  }

  private static getLocalAnalysis(patientData: PatientData): AIAnalysis {
    const symptoms = patientData.symptoms.toLowerCase();
    const possibleConditions: Diagnosis[] = [];
    const generatedQuestions: Question[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Analisar sintomas e identificar possíveis condições
    Object.entries(MEDICAL_KNOWLEDGE).forEach(([category, data]) => {
      data.conditions.forEach(condition => {
        const matchingSymptoms = condition.symptoms.filter(symptom => 
          symptoms.includes(symptom.toLowerCase())
        );
        
        if (matchingSymptoms.length > 0) {
          const probability = this.calculateProbability(condition, matchingSymptoms, symptoms);
          
          if (probability > 0.3) {
            possibleConditions.push({
              condition: condition.name,
              probability,
              confidence: probability > 0.7 ? 'high' : probability > 0.5 ? 'medium' : 'low',
              symptoms: matchingSymptoms,
              recommendations: this.getRecommendations(condition.name, probability),
              urgency: this.determineUrgency(condition.name, probability),
              nextSteps: this.getNextSteps(condition.name, probability)
            });

            // Gerar perguntas específicas para esta condição
            condition.questions.forEach((questionText, index) => {
              generatedQuestions.push({
                id: `${condition.name.toLowerCase().replace(/\s+/g, '_')}_q${index}`,
                text: questionText,
                type: 'yes_no',
                category,
                priority: probability > 0.7 ? 'high' : 'medium'
              });
            });
          }
        }
      });
    });

    // Determinar nível de risco
    if (possibleConditions.some(c => c.urgency === 'immediate')) {
      riskLevel = 'critical';
    } else if (possibleConditions.some(c => c.urgency === 'urgent')) {
      riskLevel = 'high';
    } else if (possibleConditions.some(c => c.probability > 0.6)) {
      riskLevel = 'medium';
    }

    // Ordenar condições por probabilidade
    possibleConditions.sort((a, b) => b.probability - a.probability);

    // Gerar perguntas gerais se não houver condições específicas
    if (generatedQuestions.length === 0) {
      generatedQuestions.push(
        {
          id: 'general_1',
          text: 'Você está com febre?',
          type: 'yes_no',
          category: 'general',
          priority: 'medium'
        },
        {
          id: 'general_2',
          text: 'Os sintomas começaram há quanto tempo?',
          type: 'multiple_choice',
          options: ['Menos de 1 hora', '1-6 horas', '6-24 horas', 'Mais de 24 horas'],
          category: 'general',
          priority: 'high'
        }
      );
    }

    return {
      initialAssessment: this.generateInitialAssessment(patientData, possibleConditions),
      possibleConditions,
      generatedQuestions: generatedQuestions.slice(0, 5), // Limitar a 5 perguntas iniciais
      riskLevel,
      recommendations: this.getGeneralRecommendations(riskLevel)
    };
  }

  private static getLocalRefinement(answers: Answer[], currentAnalysis: AIAnalysis): AIAnalysis {
    const updatedConditions = currentAnalysis.possibleConditions.map(condition => {
      let newProbability = condition.probability;
      
      // Ajustar probabilidade baseado nas respostas
      answers.forEach(answer => {
        const question = currentAnalysis.generatedQuestions.find(q => q.id === answer.questionId);
        if (question && question.category === condition.condition.toLowerCase().replace(/\s+/g, '_')) {
          if (answer.value === true || answer.value === 'Sim') {
            newProbability += 0.1;
          } else if (answer.value === false || answer.value === 'Não') {
            newProbability -= 0.05;
          }
        }
      });

      return {
        ...condition,
        probability: Math.max(0, Math.min(1, newProbability)),
        confidence: newProbability > 0.7 ? 'high' : newProbability > 0.5 ? 'medium' : 'low'
      };
    });

    // Ordenar por nova probabilidade
    updatedConditions.sort((a, b) => b.probability - a.probability);

    return {
      ...currentAnalysis,
      possibleConditions: updatedConditions
    };
  }

  private static calculateProbability(condition: any, matchingSymptoms: string[], allSymptoms: string): number {
    const baseProbability = condition.probability;
    const symptomMatchRatio = matchingSymptoms.length / condition.symptoms.length;
    const additionalFactors = this.getAdditionalFactors(allSymptoms);
    
    return Math.min(0.95, baseProbability * symptomMatchRatio + additionalFactors);
  }

  private static getAdditionalFactors(symptoms: string): number {
    let factors = 0;
    
    if (symptoms.includes('intenso') || symptoms.includes('forte')) factors += 0.1;
    if (symptoms.includes('constante')) factors += 0.1;
    if (symptoms.includes('piora')) factors += 0.1;
    
    return factors;
  }

  private static determineUrgency(condition: string, probability: number): 'immediate' | 'urgent' | 'moderate' | 'low' {
    const urgentConditions = ['Infarto Agudo do Miocárdio', 'Ataque Isquêmico Transitório'];
    
    if (urgentConditions.includes(condition) && probability > 0.7) {
      return 'immediate';
    }
    if (urgentConditions.includes(condition) || probability > 0.8) {
      return 'urgent';
    }
    if (probability > 0.6) {
      return 'moderate';
    }
    return 'low';
  }

  private static getRecommendations(condition: string, probability: number): string[] {
    const recommendations: { [key: string]: string[] } = {
      'Angina de Peito': [
        'Repouso imediato',
        'Evitar esforço físico',
        'Procurar atendimento médico urgente',
        'Considerar uso de nitroglicerina se prescrita'
      ],
      'Infarto Agudo do Miocárdio': [
        'ATENÇÃO: Procure atendimento médico IMEDIATAMENTE',
        'Chame SAMU (192) ou vá ao hospital mais próximo',
        'Não dirija sozinho',
        'Mantenha repouso absoluto'
      ],
      'Enxaqueca': [
        'Repouso em ambiente escuro e silencioso',
        'Hidratação adequada',
        'Evitar estímulos visuais e sonoros',
        'Considerar analgésico se prescrito'
      ],
      'Asma': [
        'Usar inalador de resgate se disponível',
        'Manter posição confortável',
        'Respiração lenta e profunda',
        'Procurar atendimento se não melhorar'
      ]
    };

    return recommendations[condition] || ['Procurar atendimento médico para avaliação'];
  }

  private static getNextSteps(condition: string, probability: number): string[] {
    if (probability > 0.8) {
      return [
        'Encaminhar para atendimento médico urgente',
        'Coletar sinais vitais',
        'Documentar todos os sintomas',
        'Preparar para transporte se necessário'
      ];
    } else if (probability > 0.6) {
      return [
        'Agendar consulta médica em 24-48 horas',
        'Monitorar sintomas',
        'Orientar sobre sinais de alerta',
        'Fornecer orientações de cuidado'
      ];
    } else {
      return [
        'Monitorar evolução dos sintomas',
        'Orientar sobre cuidados gerais',
        'Retornar se sintomas piorarem',
        'Manter acompanhamento'
      ];
    }
  }

  private static getGeneralRecommendations(riskLevel: string): string[] {
    const recommendations = {
      critical: [
        'ATENÇÃO: Risco crítico identificado',
        'Encaminhar IMEDIATAMENTE para atendimento médico',
        'Chamar SAMU (192) se necessário',
        'Manter paciente em repouso absoluto'
      ],
      high: [
        'Encaminhar para atendimento médico urgente',
        'Monitorar sinais vitais constantemente',
        'Documentar todos os sintomas',
        'Preparar para transporte médico'
      ],
      medium: [
        'Agendar consulta médica em 24-48 horas',
        'Monitorar evolução dos sintomas',
        'Orientar sobre sinais de alerta',
        'Fornecer orientações de cuidado'
      ],
      low: [
        'Monitorar evolução dos sintomas',
        'Orientar sobre cuidados gerais',
        'Retornar se sintomas piorarem',
        'Manter acompanhamento regular'
      ]
    };

    return recommendations[riskLevel as keyof typeof recommendations] || recommendations.low;
  }

  private static generateInitialAssessment(patientData: PatientData, conditions: Diagnosis[]): string {
    const topCondition = conditions[0];
    
    if (topCondition) {
      return `Baseado nos sintomas relatados ("${patientData.symptoms}"), há uma probabilidade de ${Math.round(topCondition.probability * 100)}% de que o paciente apresente ${topCondition.condition}. ${topCondition.urgency === 'immediate' ? 'ATENÇÃO: Esta condição requer atendimento médico IMEDIATO.' : ''}`;
    }
    
    return `Os sintomas relatados ("${patientData.symptoms}") requerem investigação adicional. Será necessário fazer algumas perguntas específicas para melhor avaliar a condição do paciente.`;
  }
}
