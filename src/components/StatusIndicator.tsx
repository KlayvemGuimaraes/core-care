import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  isGeminiConfigured: boolean;
  isOnline: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  isGeminiConfigured, 
  isOnline 
}) => {
  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: XCircle,
        text: 'Offline',
        className: 'status-indicator offline'
      };
    }
    
    if (isGeminiConfigured) {
      return {
        icon: CheckCircle,
        text: 'Gemini Ativo',
        className: 'status-indicator online'
      };
    }
    
    return {
      icon: AlertCircle,
      text: 'Modo Local',
      className: 'status-indicator local'
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className={status.className}>
      <Icon className="status-icon" />
      <span>{status.text}</span>
    </div>
  );
};
