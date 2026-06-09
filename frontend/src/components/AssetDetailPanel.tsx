import { X, AlertTriangle, Shield, CheckCircle, Info, ExternalLink, FileCode, Package, Container, FileJson, File } from 'lucide-react';

interface AssetDetail {
  id: string;
  label: string;
  type: string;
  assetType?: string;
  environment?: string;
  severity?: string;
  risk?: string;
  ecosystem?: string;
  version?: string;
  owner?: string;
  repository?: string;
  path?: string;
  language?: string;
  framework?: string;
  lastScanned?: string;
  issues?: Array<{
    id: string;
    title: string;
    severity: string;
    type: string;
    status: string;
  }>;
  metadata?: Record<string, any>;
}

interface AssetDetailPanelProps {
  asset: AssetDetail | null;
  onClose: () => void;
}

export default function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  if (!asset) return null;

  const getAssetIcon = (type: string, assetType?: string) => {
    if (assetType === 'dockerfile') return File;
    if (assetType === 'iac-file') return FileJson;
    if (assetType === 'source-file') return FileCode;

    const icons: Record<string, any> = {
      vulnerability: AlertTriangle,
      package: Package,
      dependency: Package,
      'container-image': Container,
      repository: FileCode,
      project: Shield,
      organization: Shield,
      secret: AlertTriangle,
      service: Shield,
      cloud: Shield,
      'iac-file': FileJson,
      dockerfile: File,
    };
    return icons[type] || Info;
  };

  const getSeverityColor = (severity?: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
    return colors[severity || ''] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const getEnvironmentColor = (env?: string) => {
    const colors: Record<string, string> = {
      production: 'bg-red-500/10 text-red-400 border-red-500/30',
      staging: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      development: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
    return colors[env || ''] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const Icon = getAssetIcon(asset.type, asset.assetType);

  // Mock issues data based on asset type
  const mockIssues = asset.issues || [
    ...(asset.severity === 'critical' || asset.type === 'vulnerability' ? [
      { id: '1', title: 'Remote Code Execution vulnerability', severity: 'critical', type: 'vulnerability', status: 'open' },
      { id: '2', title: 'SQL Injection possible', severity: 'high', type: 'vulnerability', status: 'open' },
    ] : []),
    ...(asset.type === 'secret' ? [
      { id: '3', title: 'Exposed AWS Access Key', severity: 'critical', type: 'secret', status: 'open' },
    ] : []),
    ...(asset.type === 'container-image' ? [
      { id: '4', title: 'Outdated base image', severity: 'high', type: 'container', status: 'open' },
      { id: '5', title: 'Missing security patches', severity: 'medium', type: 'container', status: 'open' },
    ] : []),
    ...(asset.type === 'package' || asset.type === 'dependency' ? [
      { id: '6', title: 'Known vulnerability in dependency', severity: 'high', type: 'vulnerability', status: 'open' },
      { id: '7', title: 'License compliance issue', severity: 'medium', type: 'license', status: 'open' },
    ] : []),
  ];

  const criticalCount = mockIssues.filter(i => i.severity === 'critical').length;
  const highCount = mockIssues.filter(i => i.severity === 'high').length;
  const mediumCount = mockIssues.filter(i => i.severity === 'medium').length;

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-slate-800 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg border ${getSeverityColor(asset.severity || asset.risk)}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{asset.label}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{asset.type.replace('-', ' ').toUpperCase()}</span>
                {asset.assetType && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{asset.assetType.replace('-', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Environment & Severity Badges */}
        <div className="flex gap-2">
          {asset.environment && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEnvironmentColor(asset.environment)}`}>
              {asset.environment.toUpperCase()}
            </span>
          )}
          {(asset.severity || asset.risk) && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(asset.severity || asset.risk)}`}>
              {(asset.severity || asset.risk || '').toUpperCase()} RISK
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Overview Section */}
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Overview
          </h3>
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
            {asset.ecosystem && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ecosystem:</span>
                <span className="text-white font-medium">{asset.ecosystem}</span>
              </div>
            )}
            {asset.version && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Version:</span>
                <span className="text-white font-mono">{asset.version}</span>
              </div>
            )}
            {asset.language && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Language:</span>
                <span className="text-white">{asset.language}</span>
              </div>
            )}
            {asset.framework && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Framework:</span>
                <span className="text-white">{asset.framework}</span>
              </div>
            )}
            {asset.owner && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Owner:</span>
                <span className="text-white">{asset.owner}</span>
              </div>
            )}
            {asset.repository && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Repository:</span>
                <span className="text-blue-400 font-mono text-xs">{asset.repository}</span>
              </div>
            )}
            {asset.path && (
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Path:</span>
                <span className="text-slate-300 font-mono text-xs break-all">{asset.path}</span>
              </div>
            )}
            {asset.lastScanned && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Last Scanned:</span>
                <span className="text-slate-300">{asset.lastScanned}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Asset ID:</span>
              <span className="text-slate-500 font-mono text-xs">{asset.id.slice(0, 8)}...</span>
            </div>
          </div>
        </section>

        {/* Security Posture */}
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Posture
          </h3>

          {/* Issue Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
              <div className="text-xs text-red-300 mt-1">Critical</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{highCount}</div>
              <div className="text-xs text-orange-300 mt-1">High</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{mediumCount}</div>
              <div className="text-xs text-yellow-300 mt-1">Medium</div>
            </div>
          </div>

          {/* Issue List */}
          {mockIssues.length > 0 ? (
            <div className="space-y-2">
              {mockIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium mb-1">{issue.title}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{issue.type}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{issue.status}</span>
                      </div>
                    </div>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ml-2 ${
                      issue.severity === 'critical' ? 'text-red-400' :
                      issue.severity === 'high' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-medium text-green-400">No Issues Found</div>
                <div className="text-xs text-green-300 mt-0.5">This asset is secure</div>
              </div>
            </div>
          )}
        </section>

        {/* Additional Metadata */}
        {asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Additional Information</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
              {Object.entries(asset.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-white">{String(value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View in Snyk
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors">
              Remediate
            </button>
          </div>
        </section>

        {/* Relationships */}
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Connected Assets</h3>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400">
              Click on connected nodes in the graph to explore relationships
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
