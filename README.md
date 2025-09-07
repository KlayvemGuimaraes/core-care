# CoreCare - Sistema de Diagnóstico Assistido por IA

## 🏥 Sobre o Projeto

O **CoreCare** é um sistema de diagnóstico assistido por inteligência artificial desenvolvido para o **Hackathon Hacking Medicine do MIT** em parceria com o **Hospital Albert Einstein**. O projeto visa auxiliar agentes de saúde em locais remotos do Brasil, onde há poucos médicos especializados, fornecendo ferramentas de diagnóstico baseadas em IA.

## 🎯 Objetivo

Criar uma solução que permita a agentes de saúde em locais afastados:
- Analisar sintomas de pacientes através de entrada de dados
- Gerar perguntas específicas e direcionadas para diagnóstico
- Fornecer relatórios com probabilidades de condições médicas
- Oferecer recomendações baseadas em evidências médicas

## ✨ Funcionalidades

### 🤖 Inteligência Artificial Avançada
- **Integração com Google Gemini**: Análise de sintomas usando IA de última geração
- **Fallback Inteligente**: Sistema de backup com conhecimento médico local
- **Análise Contextual**: Considera histórico médico, medicações e sinais vitais
- **Logs Detalhados**: Console mostra quando está usando Gemini vs. análise local

### 📋 Interface Intuitiva e Moderna
- **Design Glassmorphism**: Interface com efeitos de vidro e blur
- **Animações Suaves**: Transições e hover effects profissionais
- **Formulário de Dados do Paciente**: Coleta informações básicas e sintomas
- **Sistema de Perguntas Dinâmicas**: Perguntas adaptativas baseadas nos sintomas
- **Interface Responsiva**: Funciona perfeitamente em dispositivos móveis e desktop
- **Indicadores Visuais**: Status do Gemini, loading states, progress bars

### 📊 Relatórios Detalhados
- **Probabilidades de Diagnóstico**: Percentuais baseados em análise de IA
- **Níveis de Urgência**: Classificação de risco (crítico, alto, médio, baixo)
- **Recomendações Específicas**: Orientações baseadas em cada condição
- **Próximos Passos**: Ações recomendadas para o agente de saúde
- **Contatos de Emergência**: SAMU e orientações para casos críticos

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **IA**: Google Gemini API
- **Styling**: CSS Modules + Tailwind-inspired
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Chave de API do Google Gemini

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd project-mit-hacking-medicine
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure a API do Gemini**
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env e adicione sua chave de API
VITE_GEMINI_API_KEY=sua_chave_api_aqui
```

4. **Obtenha sua chave de API do Gemini**
   - Acesse: https://makersuite.google.com/app/apikey
   - Crie uma nova chave de API
   - Cole a chave no arquivo `.env`

5. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

6. **Acesse a aplicação**
   - Abra http://localhost:3000 no seu navegador

7. **Verifique se o Gemini está funcionando**
   - No canto superior direito, você verá o status: "Gemini Ativo" (verde) ou "Modo Local" (amarelo)
   - Abra o console do navegador (F12) para ver logs detalhados da IA
   - Se estiver usando Gemini, verá: "🤖 Usando Google Gemini para análise de sintomas..."

## 🔧 Configuração da API

### Google Gemini API

1. Acesse o [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada
5. Cole no arquivo `.env` como `VITE_GEMINI_API_KEY`

### Fallback Local

O sistema possui um sistema de fallback que funciona mesmo sem a API do Gemini, usando conhecimento médico básico para:
- Detecção de condições críticas (infarto, angina)
- Análise de sintomas comuns
- Geração de perguntas básicas
- Recomendações gerais

## 📱 Como Usar

### 1. Iniciar Nova Avaliação
- Clique em "Iniciar Nova Avaliação" na tela inicial
- Preencha os dados do paciente
- Descreva os sintomas detalhadamente

### 2. Análise de Sintomas
- A IA analisa os sintomas automaticamente
- Gera perguntas específicas baseadas na análise
- Identifica possíveis condições médicas

### 3. Responder Perguntas
- Faça as perguntas geradas ao paciente
- Registre as respostas usando os botões SIM/NÃO
- O sistema adapta as perguntas conforme as respostas

### 4. Relatório Final
- Visualize o relatório com probabilidades de diagnóstico
- Consulte recomendações específicas
- Siga os próximos passos indicados

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── PatientDataForm.tsx
│   ├── QuestionInterface.tsx
│   ├── DiagnosticReport.tsx
│   └── LoadingSpinner.tsx
├── services/           # Serviços de IA
│   ├── aiService.ts
│   └── geminiService.ts
├── types/              # Definições TypeScript
│   └── health.ts
├── config/             # Configurações
│   └── gemini.ts
└── App.tsx            # Componente principal
```

## 🔒 Segurança e Privacidade

- **Dados Locais**: Todas as informações ficam no navegador do usuário
- **Sem Armazenamento**: Não há persistência de dados do paciente
- **API Segura**: Comunicação criptografada com Google Gemini
- **Conformidade**: Desenvolvido seguindo boas práticas de saúde digital

## 🎯 Casos de Uso

### Agentes de Saúde em Locais Remotos
- **Diagnóstico Inicial**: Avaliação rápida de sintomas
- **Triagem Inteligente**: Identificação de casos urgentes
- **Orientações Clínicas**: Recomendações baseadas em evidências

### Postos de Saúde
- **Suporte ao Diagnóstico**: Auxílio na tomada de decisões
- **Padronização**: Processo consistente de avaliação
- **Documentação**: Relatórios estruturados para prontuários

### Telemedicina
- **Pré-avaliação**: Coleta de dados antes da consulta
- **Priorização**: Identificação de casos que precisam de atenção imediata
- **Histórico**: Registro de sintomas e evolução

## 🚨 Limitações e Avisos

⚠️ **IMPORTANTE**: Este sistema é uma ferramenta de apoio e não substitui o julgamento clínico profissional.

- **Não é um diagnóstico definitivo**: Sempre consulte um médico
- **Emergências**: Em casos críticos, procure atendimento imediato
- **Validação**: Sempre valide com profissionais qualificados
- **Atualização**: Conhecimento médico deve ser atualizado regularmente

## 🤝 Contribuição

Este projeto foi desenvolvido para o Hackathon Hacking Medicine do MIT. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido pela equipe do **MIT Hacking Medicine** em parceria com o **Hospital Albert Einstein**.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Entre em contato com a equipe do hackathon

---

**Desenvolvido com ❤️ para melhorar o acesso à saúde em locais remotos do Brasil**
