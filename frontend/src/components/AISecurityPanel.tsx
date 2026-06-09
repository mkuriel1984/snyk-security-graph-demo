import { Brain, Shield, AlertTriangle, TrendingUp, Package, CheckCircle, Zap } from 'lucide-react';
import { useState } from 'react';

interface AIModel {
  id: string;
  name: string;
  framework: string;
  version: string;
  riskScore: number;
  vulnerabilities: number;
  dataExposure: 'high' | 'medium' | 'low';
  lastAudited: string;
}

interface AIRisk {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'model-poisoning' | 'prompt-injection' | 'data-leakage' | 'supply-chain' | 'bias';
  description: string;
  affectedModels: string[];
  mitigation: string;
}

const SAMPLE_AI_MODELS: AIModel[] = [
  {
    id: '1',
    name: 'fraud-detection-v2',
    framework: 'TensorFlow',
    version: '2.8.0',
    riskScore: 72,
    vulnerabilities: 3,
    dataExposure: 'high',
    lastAudited: '12 hours ago',
  },
  {
    id: '2',
    name: 'recommendation-engine',
    framework: 'PyTorch',
    version: '1.12.0',
    riskScore: 45,
    vulnerabilities: 7,
    dataExposure: 'medium',
    lastAudited: '2 days ago',
  },
  {
    id: '3',
    name: 'sentiment-analyzer',
    framework: 'Hugging Face Transformers',
    version: '4.24.0',
    riskScore: 88,
    vulnerabilities: 0,
    dataExposure: 'low',
    lastAudited: '6 hours ago',
  },
  {
    id: '4',
    name: 'image-classifier-prod',
    framework: 'TensorFlow',
    version: '2.11.0',
    riskScore: 91,
    vulnerabilities: 0,
    dataExposure: 'medium',
    lastAudited: '1 hour ago',
  },
];

const SAMPLE_AI_RISKS: AIRisk[] = [
  {
    id: '1',
    title: 'Model Poisoning Risk in Training Pipeline',
    severity: 'critical',
    category: 'model-poisoning',
    description: 'Fraud detection model training data sourced from untrusted S3 bucket without integrity validation. Attackers could inject malicious samples to manipulate model behavior.',
    affectedModels: ['fraud-detection-v2'],
    mitigation: 'Implement cryptographic signatures for training data, use ML provenance tracking, and enable anomaly detection in training metrics.',
  },
  {
    id: '2',
    title: 'Prompt Injection Vulnerability in LLM API',
    severity: 'high',
    category: 'prompt-injection',
    description: 'Recommendation engine accepts user input directly into prompts without sanitization. Enables jailbreaking and data exfiltration attacks.',
    affectedModels: ['recommendation-engine'],
    mitigation: 'Implement input validation, use constrained generation, deploy prompt firewall (Lakera/Rebuff), and enable output filtering.',
  },
  {
    id: '3',
    title: 'Sensitive Data Leakage in Model Embeddings',
    severity: 'high',
    category: 'data-leakage',
    description: 'Sentiment analyzer trained on customer support tickets. Model embeddings may leak PII through membership inference attacks.',
    affectedModels: ['sentiment-analyzer'],
    mitigation: 'Apply differential privacy during training, implement federated learning, and audit model outputs for PII exposure.',
  },
  {
    id: '4',
    title: 'ML Supply Chain Vulnerability (CVE-2022-29216)',
    severity: 'critical',
    category: 'supply-chain',
    description: 'TensorFlow 2.8.0 contains exploitable RCE vulnerability. Fraud detection model dependencies are affected.',
    affectedModels: ['fraud-detection-v2'],
    mitigation: 'Upgrade TensorFlow to 2.11.0+. Validate model integrity post-upgrade using ML model signing (Sigstore).',
  },
];

export default function AISecurityPanel() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDataExposureColor = (level: string) => {
    const colors = {
      high: 'bg-red-500/10 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/10 text-green-400 border-green-500/30',
    };
    return colors[level as keyof typeof colors];
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };
    return colors[severity as keyof typeof colors];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'model-poisoning': AlertTriangle,
      'prompt-injection': Shield,
      'data-leakage': Package,
      'supply-chain': TrendingUp,
      bias: Brain,
    };
    return icons[category as keyof typeof icons] || AlertTriangle;
  };

  return (
    <div className="space-y-6">
      {/* AI Security Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">AI Security & ML Model Protection</h2>
            <p className="text-sm text-slate-300 mb-4">
              Comprehensive security analysis for AI/ML models, training pipelines, and LLM applications.
              Detects model poisoning, prompt injection, data leakage, and supply chain vulnerabilities.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-300">Real-time monitoring enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">MLSecOps integrated</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Auto-remediation available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">AI Models</span>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{SAMPLE_AI_MODELS.length}</div>
          <div className="text-xs text-slate-400 mt-1">Production models</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Critical Risks</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">
            {SAMPLE_AI_RISKS.filter(r => r.severity === 'critical').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Immediate action required</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Vulnerabilities</span>
            <Package className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {SAMPLE_AI_MODELS.reduce((sum, m) => sum + m.vulnerabilities, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">In ML dependencies</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg Risk Score</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className={`text-3xl font-bold ${getRiskColor(Math.round(SAMPLE_AI_MODELS.reduce((sum, m) => sum + m.riskScore, 0) / SAMPLE_AI_MODELS.length))}`}>
            {Math.round(SAMPLE_AI_MODELS.reduce((sum, m) => sum + m.riskScore, 0) / SAMPLE_AI_MODELS.length)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Security posture</div>
        </div>
      </div>

      {/* AI Models Grid */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">AI/ML Models</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          {SAMPLE_AI_MODELS.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedModel?.id === model.id
                  ? 'border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/30'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium mb-1">{model.name}</h4>
                  <p className="text-xs text-slate-400">{model.framework} {model.version}</p>
                </div>
                <div className={`text-2xl font-bold ${getRiskColor(model.riskScore)}`}>
                  {model.riskScore}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vulnerabilities:</span>
                  <span className={model.vulnerabilities > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                    {model.vulnerabilities || 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Data Exposure:</span>
                  <span className={`px-2 py-0.5 rounded border text-xs ${getDataExposureColor(model.dataExposure)}`}>
                    {model.dataExposure.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Last audited: {model.lastAudited}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Security Risks */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">AI Security Risks</h3>
          <p className="text-sm text-slate-400 mt-1">Model-specific vulnerabilities and attack vectors</p>
        </div>

        <div className="divide-y divide-slate-700">
          {SAMPLE_AI_RISKS.map((risk) => {
            const Icon = getCategoryIcon(risk.category);

            return (
              <div key={risk.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium mb-1">{risk.title}</h4>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded border ${getSeverityColor(risk.severity)}`}>
                            {risk.severity.toUpperCase()}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{risk.category.replace('-', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{risk.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-slate-400">Affected models:</span>
                      {risk.affectedModels.map((model) => (
                        <span key={model} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
                          {model}
                        </span>
                      ))}
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-green-400 mb-1">Mitigation</div>
                          <div className="text-sm text-slate-300">{risk.mitigation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
