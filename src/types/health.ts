export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  vitalSigns?: {
    bloodPressure?: string;
    heightCm?: number;
    weightKg?: number;
    abdominalCircumferenceCm?: number;
    hypertensionDiagnosed?: boolean;
    diabetesDiagnosed?: boolean;
  };
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice' | 'scale' | 'text';
  options?: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Answer {
  questionId: string;
  value: string | number | boolean;
  timestamp: Date;
}

export interface Diagnosis {
  condition: string;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  symptoms: string[];
  recommendations: string[];
  urgency: 'immediate' | 'urgent' | 'moderate' | 'low';
  nextSteps: string[];
}

export interface AIAnalysis {
  initialAssessment: string;
  possibleConditions: Diagnosis[];
  generatedQuestions: Question[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface DiagnosticSession {
  id: string;
  patientId: string;
  patientData: PatientData;
  questions: Question[];
  answers: Answer[];
  analysis: AIAnalysis;
  currentStep: 'data_entry' | 'questions' | 'analysis' | 'report';
  createdAt: Date;
  completedAt?: Date;
}
