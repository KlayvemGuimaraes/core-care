import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini';
import { PatientData, Question, AIAnalysis, Diagnosis, Answer } from '../types/health';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.model,
      generationConfig: GEMINI_CONFIG.generationConfig,
      safetySettings: GEMINI_CONFIG.safetySettings,
    });
  }

  async analyzeSymptoms(patientData: PatientData): Promise<AIAnalysis> {
    try {
      console.log('🤖 Usando Google Gemini para análise de sintomas...');
      console.log('📋 Dados do paciente:', patientData);
      
      const prompt = this.buildAnalysisPrompt(patientData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Resposta do Gemini recebida:', text.substring(0, 200) + '...');
      
      return this.parseAnalysisResponse(text, patientData);
    } catch (error) {
      console.error('❌ Erro ao analisar sintomas com Gemini:', error);
      console.log('🔄 Usando análise local como fallback...');
      // Fallback para análise local em caso de erro
      return this.getFallbackAnalysis(patientData);
    }
  }

  async refineDiagnosis(answers: Answer[], currentAnalysis: AIAnalysis): Promise<AIAnalysis> {
    try {
      console.log('🤖 Refinando diagnóstico com Google Gemini...');
      console.log('📝 Respostas recebidas:', answers);
      
      const prompt = this.buildRefinementPrompt(answers, currentAnalysis);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Diagnóstico refinado pelo Gemini:', text.substring(0, 200) + '...');
      
      return this.parseRefinementResponse(text, currentAnalysis);
    } catch (error) {
      console.error('❌ Erro ao refinar diagnóstico com Gemini:', error);
      console.log('🔄 Mantendo análise atual...');
      return currentAnalysis;
    }
  }

  private buildAnalysisPrompt(patientData: PatientData): string {
    return `
Você é um assistente médico especializado em diagnóstico para agentes de saúde em locais remotos do Brasil. 
Analise os sintomas do paciente e forneça uma análise médica estruturada.

DADOS DO PACIENTE:
- Nome: ${patientData.name}
- Idade: ${patientData.age} anos
- Sexo: ${patientData.gender}
- Sintomas: ${patientData.symptoms}
- Histórico médico: ${patientData.medicalHistory || 'Não informado'}
- Medicações atuais: ${patientData.currentMedications || 'Nenhuma'}
- Sinais vitais: ${JSON.stringify(patientData.vitalSigns || {})}

INSTRUÇÕES:
1. Analise os sintomas e identifique possíveis condições médicas
2. Para cada condição, calcule uma probabilidade (0-1)
3. Determine o nível de urgência (immediate, urgent, moderate, low)
4. Gere 3-5 perguntas específicas para confirmar o diagnóstico
5. Forneça recomendações baseadas na condição

FORMATO DE RESPOSTA (JSON):
{
  "initialAssessment": "Avaliação inicial baseada nos sintomas",
  "possibleConditions": [
    {
      "condition": "Nome da condição",
      "probability": 0.8,
      "confidence": "high|medium|low",
      "symptoms": ["sintoma1", "sintoma2"],
      "recommendations": ["recomendação1", "recomendação2"],
      "urgency": "immediate|urgent|moderate|low",
      "nextSteps": ["passo1", "passo2"]
    }
  ],
  "generatedQuestions": [
    {
      "id": "question_1",
      "text": "Pergunta específica",
      "type": "yes_no|multiple_choice|scale|text",
      "options": ["opção1", "opção2"] (apenas para multiple_choice),
      "category": "cardiovascular|neurological|respiratory|general",
      "priority": "high|medium|low"
    }
  ],
  "riskLevel": "critical|high|medium|low",
  "recommendations": ["recomendação geral 1", "recomendação geral 2"]
}

IMPORTANTE:
- Seja conservador com diagnósticos críticos
- Priorize condições que requerem atenção imediata
- Use linguagem clara para agentes de saúde
- Considere o contexto de locais remotos do Brasil
- Foque em condições comuns e tratáveis
    `;
  }

  private buildRefinementPrompt(answers: Answer[], currentAnalysis: AIAnalysis): string {
    const answersText = answers.map(answer => {
      const question = currentAnalysis.generatedQuestions.find(q => q.id === answer.questionId);
      return `Pergunta: ${question?.text}\nResposta: ${answer.value}`;
    }).join('\n\n');

    return `
Com base nas respostas adicionais do paciente, refine o diagnóstico inicial.

ANÁLISE INICIAL:
${JSON.stringify(currentAnalysis, null, 2)}

RESPOSTAS ADICIONAIS:
${answersText}

INSTRUÇÕES:
1. Ajuste as probabilidades das condições baseado nas novas respostas
2. Atualize o nível de confiança
3. Mantenha o mesmo formato JSON da análise inicial
4. Se necessário, adicione novas condições identificadas
5. Atualize as recomendações baseado na nova informação

Retorne apenas o JSON atualizado.
    `;
  }

  private parseAnalysisResponse(text: string, patientData: PatientData): AIAnalysis {
    try {
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        initialAssessment: parsed.initialAssessment || this.generateInitialAssessment(patientData, parsed.possibleConditions || []),
        possibleConditions: parsed.possibleConditions || [],
        generatedQuestions: parsed.generatedQuestions || [],
        riskLevel: parsed.riskLevel || 'low',
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Erro ao parsear resposta do Gemini:', error);
      return this.getFallbackAnalysis(patientData);
    }
  }

  private parseRefinementResponse(text: string, currentAnalysis: AIAnalysis): AIAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return currentAnalysis;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        initialAssessment: parsed.initialAssessment || currentAnalysis.initialAssessment,
        possibleConditions: parsed.possibleConditions || currentAnalysis.possibleConditions,
        generatedQuestions: parsed.generatedQuestions || currentAnalysis.generatedQuestions,
        riskLevel: parsed.riskLevel || currentAnalysis.riskLevel,
        recommendations: parsed.recommendations || currentAnalysis.recommendations
      };
    } catch (error) {
      console.error('Erro ao parsear refinamento do Gemini:', error);
      return currentAnalysis;
    }
  }

  private getFallbackAnalysis(patientData: PatientData): AIAnalysis {
    // Análise de fallback usando conhecimento médico básico
    const symptoms = patientData.symptoms.toLowerCase();
    const possibleConditions: Diagnosis[] = [];
    const generatedQuestions: Question[] = [];

    // Detecção básica de condições críticas
    if (symptoms.includes('aperto no peito') || symptoms.includes('dor no peito')) {
      possibleConditions.push({
        condition: 'Possível Angina ou Infarto',
        probability: 0.7,
        confidence: 'medium' as const,
        symptoms: ['aperto no peito'],
        recommendations: [
          'ATENÇÃO: Procure atendimento médico IMEDIATAMENTE',
          'Chame SAMU (192) se necessário',
          'Mantenha repouso absoluto'
        ],
        urgency: 'urgent' as const,
        nextSteps: [
          'Encaminhar para atendimento médico urgente',
          'Coletar sinais vitais',
          'Preparar para transporte se necessário'
        ]
      });

      generatedQuestions.push(
        {
          id: 'chest_pain_1',
          text: 'A dor piora com esforço físico?',
          type: 'yes_no',
          category: 'cardiovascular',
          priority: 'high'
        },
        {
          id: 'chest_pain_2',
          text: 'A dor irradia para o braço esquerdo?',
          type: 'yes_no',
          category: 'cardiovascular',
          priority: 'high'
        }
      );
    }

    if (symptoms.includes('tontura') || symptoms.includes('desmaio')) {
      possibleConditions.push({
        condition: 'Possível Hipotensão ou Problema Neurológico',
        probability: 0.5,
        confidence: 'medium' as const,
        symptoms: ['tontura'],
        recommendations: [
          'Verificar pressão arterial',
          'Manter paciente deitado com pernas elevadas',
          'Procurar atendimento médico'
        ],
        urgency: 'moderate' as const,
        nextSteps: [
          'Verificar sinais vitais',
          'Orientar sobre hidratação',
          'Agendar consulta médica'
        ]
      });

      generatedQuestions.push({
        id: 'dizziness_1',
        text: 'A tontura acontece ao levantar?',
        type: 'yes_no',
        category: 'neurological',
        priority: 'medium'
      });
    }

    // Perguntas gerais se não houver condições específicas
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
      generatedQuestions,
      riskLevel: possibleConditions.some(c => c.urgency === 'urgent') ? 'high' : 'medium',
      recommendations: this.getGeneralRecommendations(possibleConditions.some(c => c.urgency === 'urgent') ? 'high' : 'medium')
    };
  }

  private generateInitialAssessment(patientData: PatientData, conditions: Diagnosis[]): string {
    const topCondition = conditions[0];
    
    if (topCondition) {
      return `Baseado nos sintomas relatados ("${patientData.symptoms}"), há uma probabilidade de ${Math.round(topCondition.probability * 100)}% de que o paciente apresente ${topCondition.condition}. ${topCondition.urgency === 'urgent' ? 'ATENÇÃO: Esta condição requer atendimento médico IMEDIATO.' : ''}`;
    }
    
    return `Os sintomas relatados ("${patientData.symptoms}") requerem investigação adicional. Será necessário fazer algumas perguntas específicas para melhor avaliar a condição do paciente.`;
  }

  private getGeneralRecommendations(riskLevel: string): string[] {
    const recommendations = {
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
}

export const geminiService = new GeminiService();
