import { Database, Server, Cloud, HardDrive, Lock, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface EVOAsset {
  id: string;
  name: string;
  type: 'application' | 'service' | 'database' | 'storage' | 'infrastructure';
  owner: string;
  environment: 'production' | 'staging' | 'development';
  securityScore: number;
  criticalIssues: number;
  highIssues: number;
  lastScanned: string;
  tags: string[];
}

const SAMPLE_EVO_ASSETS: EVOAsset[] = [
  {
    id: '1',
    name: 'payment-service',
    type: 'service',
    owner: 'Platform Team',
    environment: 'production',
    securityScore: 62,
    criticalIssues: 2,
    highIssues: 5,
    lastScanned: '5 minutes ago',
    tags: ['pci-compliant', 'customer-data', 'critical-path'],
  },
  {
    id: '2',
    name: 'user-database',
    type: 'database',
    owner: 'Data Team',
    environment: 'production',
    securityScore: 45,
    criticalIssues: 4,
    highIssues: 8,
    lastScanned: '12 minutes ago',
    tags: ['pii', 'encryption-required', 'backup-enabled'],
  },
  {
    id: '3',
    name: 'auth-service',
    type: 'application',
    owner: 'Security Team',
    environment: 'production',
    securityScore: 88,
    criticalIssues: 0,
    highIssues: 1,
    lastScanned: '2 minutes ago',
    tags: ['sso', 'mfa-enabled', 'audit-logged'],
  },
  {
    id: '4',
    name: 's3-customer-uploads',
    type: 'storage',
    owner: 'Platform Team',
    environment: 'production',
    securityScore: 71,
    criticalIssues: 1,
    highIssues: 3,
    lastScanned: '18 minutes ago',
    tags: ['public-facing', 'versioning-enabled'],
  },
  {
    id: '5',
    name: 'api-gateway',
    type: 'infrastructure',
    owner: 'DevOps Team',
    environment: 'production',
    securityScore: 79,
    criticalIssues: 0,
    highIssues: 2,
    lastScanned: '7 minutes ago',
    tags: ['rate-limiting', 'waf-enabled'],
  },
  {
    id: '6',
    name: 'ml-training-cluster',
    type: 'infrastructure',
    owner: 'ML Team',
    environment: 'development',
    securityScore: 54,
    criticalIssues: 3,
    highIssues: 6,
    lastScanned: '25 minutes ago',
    tags: ['gpu-enabled', 'spot-instances'],
  },
];

export default function EVOAssets() {
  const [selectedAsset, setSelectedAsset] = useState<EVOAsset | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    const icons = {
      application: Server,
      service: Server,
      database: Database,
      storage: HardDrive,
      infrastructure: Cloud,
    };
    return icons[type as keyof typeof icons] || Server;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/10';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getEnvironmentColor = (env: string) => {
    const colors = {
      production: 'bg-red-500/10 text-red-400 border-red-500/30',
      staging: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      development: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
    return colors[env as keyof typeof colors] || colors.development;
  };

  const filteredAssets = filterEnv === 'all'
    ? SAMPLE_EVO_ASSETS
    : SAMPLE_EVO_ASSETS.filter(a => a.environment === filterEnv);

  const totalCritical = filteredAssets.reduce((sum, a) => sum + a.criticalIssues, 0);
  const totalHigh = filteredAssets.reduce((sum, a) => sum + a.highIssues, 0);
  const avgScore = Math.round(filteredAssets.reduce((sum, a) => sum + a.securityScore, 0) / filteredAssets.length);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Assets</span>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{filteredAssets.length}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg Security Score</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(avgScore).split(' ')[0]}`}>{avgScore}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Critical Issues</span>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">{totalCritical}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">High Issues</span>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400">{totalHigh}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Compliant</span>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">
            {filteredAssets.filter(a => a.securityScore >= 80).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Filter by Environment</h3>
          <div className="flex gap-2">
            {['all', 'production', 'staging', 'development'].map((env) => (
              <button
                key={env}
                onClick={() => setFilterEnv(env)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-all
                  ${filterEnv === env
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }
                `}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredAssets.map((asset) => {
          const Icon = getTypeIcon(asset.type);

          return (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`
                bg-slate-800 border rounded-lg p-4 cursor-pointer transition-all
                ${selectedAsset?.id === asset.id
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-slate-700 hover:border-slate-600'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{asset.name}</h4>
                    <p className="text-xs text-slate-400">{asset.owner}</p>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded text-xs font-medium border ${getEnvironmentColor(asset.environment)}`}>
                  {asset.environment}
                </div>
              </div>

              {/* Security Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Security Score</span>
                  <span className={`text-sm font-bold ${getScoreColor(asset.securityScore)}`}>
                    {asset.securityScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(asset.securityScore).includes('green') ? 'bg-green-400' : getScoreColor(asset.securityScore).includes('yellow') ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${asset.securityScore}%` }}
                  />
                </div>
              </div>

              {/* Issues */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-slate-400">Critical:</span>
                  <span className="text-red-400 font-medium">{asset.criticalIssues}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-slate-400">High:</span>
                  <span className="text-orange-400 font-medium">{asset.highIssues}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {asset.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {asset.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                    +{asset.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Last Scanned */}
              <div className="text-xs text-slate-500">
                Last scanned: {asset.lastScanned}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Asset Details */}
      {selectedAsset && (
        <div className="bg-slate-800 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Details: {selectedAsset.name}</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white">{selectedAsset.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="text-white">{selectedAsset.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getEnvironmentColor(selectedAsset.environment)}`}>
                    {selectedAsset.environment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Score:</span>
                  <span className={`font-bold ${getScoreColor(selectedAsset.securityScore)}`}>
                    {selectedAsset.securityScore}/100
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Security Findings</h4>
              <div className="space-y-2">
                {selectedAsset.criticalIssues > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-white">
                      {selectedAsset.criticalIssues} Critical Issues
                    </span>
                  </div>
                )}
                {selectedAsset.highIssues > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-white">
                      {selectedAsset.highIssues} High Priority Issues
                    </span>
                  </div>
                )}
                {selectedAsset.securityScore >= 80 && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Meets Security Standards</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
              View Full Report
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors">
              Remediate Issues
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
