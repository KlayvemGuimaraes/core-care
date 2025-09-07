import React, { useState } from 'react';
import { PatientData } from '../types/health';
import { Heart, User, FileText, Pill, Thermometer } from 'lucide-react';

interface PatientDataFormProps {
  onSubmit: (data: PatientData) => void;
}

export const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<PatientData>>({
    name: '',
    age: 0,
    gender: 'M',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    vitalSigns: {
      bloodPressure: '',
      heightCm: 0,
      weightKg: 0,
      abdominalCircumferenceCm: 0,
      hypertensionDiagnosed: false,
      diabetesDiagnosed: false
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.age || formData.age < 0 || formData.age > 120) {
      newErrors.age = 'Idade deve ser entre 0 e 120 anos';
    }

    if (!formData.symptoms?.trim()) {
      newErrors.symptoms = 'Descrição dos sintomas é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const patientData: PatientData = {
        id: `patient_${Date.now()}`,
        name: formData.name!,
        age: formData.age!,
        gender: formData.gender!,
        symptoms: formData.symptoms!,
        medicalHistory: formData.medicalHistory || '',
        currentMedications: formData.currentMedications || '',
        vitalSigns: formData.vitalSigns,
        createdAt: new Date()
      };

      onSubmit(patientData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleVitalSignChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  return (
    <div className="card fade-in">
      <div className="form-section-title">
        <div className="form-section-icon">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2>Dados do Paciente</h2>
          <p className="text-sm text-gray-600 font-normal">Preencha as informações básicas do paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Digite o nome completo"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Idade *
            </label>
            <input
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              className={`input ${errors.age ? 'border-red-500' : ''}`}
              placeholder="Idade em anos"
              min="0"
              max="120"
            />
            {errors.age && <p className="error-message">{errors.age}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sexo
          </label>
          <div className="flex gap-6">
            {[
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
              { value: 'O', label: 'Outro' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sintomas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-2" />
            Descrição dos Sintomas *
          </label>
          <textarea
            value={formData.symptoms || ''}
            onChange={(e) => handleInputChange('symptoms', e.target.value)}
            className={`textarea ${errors.symptoms ? 'border-red-500' : ''}`}
            placeholder="Descreva detalhadamente os sintomas relatados pelo paciente. Ex: 'Aperto no peito, tontura ao levantar, falta de ar'"
            rows={4}
          />
          {errors.symptoms && <p className="text-red-500 text-sm mt-1">{errors.symptoms}</p>}
        </div>

        {/* Histórico Médico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Histórico Médico
          </label>
          <textarea
            value={formData.medicalHistory || ''}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            className="textarea"
            placeholder="Doenças pré-existentes, cirurgias, alergias conhecidas..."
            rows={3}
          />
        </div>

        {/* Medicações Atuais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Pill className="w-4 h-4 inline mr-2" />
            Medicações Atuais
          </label>
          <textarea
            value={formData.currentMedications || ''}
            onChange={(e) => handleInputChange('currentMedications', e.target.value)}
            className="textarea"
            placeholder="Medicamentos que o paciente está tomando atualmente..."
            rows={2}
          />
        </div>

        {/* Sinais Vitais e Medidas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Thermometer className="w-4 h-4 inline mr-2" />
            Sinais Vitais e Medidas (Opcional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pressão Arterial</label>
              <input
                type="text"
                value={formData.vitalSigns?.bloodPressure || ''}
                onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value)}
                className="input"
                placeholder="Ex: 120/80"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Altura (cm)</label>
              <input
                type="number"
                value={formData.vitalSigns?.heightCm || ''}
                onChange={(e) => handleVitalSignChange('heightCm', parseFloat(e.target.value) || 0)}
                className="input"
                placeholder="Ex: 170"
                min="30"
                max="250"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Peso (kg)</label>
              <input
                type="number"
                value={formData.vitalSigns?.weightKg || ''}
                onChange={(e) => handleVitalSignChange('weightKg', parseFloat(e.target.value) || 0)}
                className="input"
                placeholder="Ex: 70"
                min="1"
                max="500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Circunferência Abdominal (cm)</label>
              <input
                type="number"
                value={formData.vitalSigns?.abdominalCircumferenceCm || ''}
                onChange={(e) => handleVitalSignChange('abdominalCircumferenceCm', parseFloat(e.target.value) || 0)}
                className="input"
                placeholder="Ex: 95"
                min="20"
                max="250"
                step="0.1"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm text-gray-600">Diagnóstico de Hipertensão?</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="hypertensionDiagnosed"
                    checked={formData.vitalSigns?.hypertensionDiagnosed === true}
                    onChange={() => handleVitalSignChange('hypertensionDiagnosed', true)}
                  />
                  Sim
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="hypertensionDiagnosed"
                    checked={formData.vitalSigns?.hypertensionDiagnosed === false}
                    onChange={() => handleVitalSignChange('hypertensionDiagnosed', false)}
                  />
                  Não
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm text-gray-600">Diagnóstico de Diabetes?</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="diabetesDiagnosed"
                    checked={formData.vitalSigns?.diabetesDiagnosed === true}
                    onChange={() => handleVitalSignChange('diabetesDiagnosed', true)}
                  />
                  Sim
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="diabetesDiagnosed"
                    checked={formData.vitalSigns?.diabetesDiagnosed === false}
                    onChange={() => handleVitalSignChange('diabetesDiagnosed', false)}
                  />
                  Não
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn btn-primary">
            <Heart className="w-4 h-4" />
            Analisar Sintomas
          </button>
        </div>
      </form>
    </div>
  );
};
