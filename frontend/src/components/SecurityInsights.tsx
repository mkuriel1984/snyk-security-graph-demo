import { AlertTriangle, Shield, Key, Package, TrendingUp, CheckCircle } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  affectedAssets: number;
  recommendation: string;
  automationAvailable: boolean;
}

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: '1',
    title: 'Log4Shell Exposure in Production Services',
    severity: 'critical',
    category: 'Vulnerability',
    description: 'CVE-2021-44228 affects 3 production services through transitive dependencies in log4j-core 2.14.1. Services acme-api-prod, techstart-backend, and payment-processor have direct network exposure.',
    affectedAssets: 3,
    recommendation: 'Upgrade log4j-core to 2.17.1 or apply virtual patching. Supply Chain Defense Agent can auto-generate fix PRs.',
    automationAvailable: true,
  },
  {
    id: '2',
    title: 'AWS Access Keys Exposed in Public Repositories',
    severity: 'critical',
    category: 'Secrets',
    description: 'Active AWS access key (45 days old) found in acme-corp/api-service config file. Key has write access to production RDS database and S3 bucket containing PII data.',
    affectedAssets: 2,
    recommendation: 'Rotate key immediately and enable AWS Secrets Manager. Secrets Remediation Agent can automate rotation workflow.',
    automationAvailable: true,
  },
  {
    id: '3',
    title: 'GPL License Violations in Proprietary Software',
    severity: 'high',
    category: 'License',
    description: 'Proprietary projects acme-frontend and techstart-dashboard depend on GPL-3.0 licensed packages through 8-hop dependency chains. Legal compliance risk detected.',
    affectedAssets: 12,
    recommendation: 'Replace GPL dependencies or relicense projects. License Risk Agent identified 5 compatible alternatives.',
    automationAvailable: true,
  },
  {
    id: '4',
    title: 'Unpatched Container Base Images',
    severity: 'high',
    category: 'Container',
    description: '18 container images using node:14-alpine base contain 47 known vulnerabilities (12 critical). Images deployed to staging and development environments.',
    affectedAssets: 18,
    recommendation: 'Update to node:20-alpine and rebuild images. Container Agent can automate base image updates.',
    automationAvailable: true,
  },
  {
    id: '5',
    title: 'AI Model Dependencies with Known Exploits',
    severity: 'high',
    category: 'AI Security',
    description: 'ML models fraud-detection-v2 and recommendation-engine depend on TensorFlow 2.8.0 with active exploit code (CVE-2022-29216). Models process sensitive customer data.',
    affectedAssets: 2,
    recommendation: 'Upgrade TensorFlow to 2.11.0. AI Security Agent can validate model integrity post-upgrade.',
    automationAvailable: true,
  },
  {
    id: '6',
    title: 'Excessive IAM Permissions in Production Roles',
    severity: 'medium',
    category: 'EVO Asset',
    description: 'Service role api-prod-role has sts:AssumeRole permissions on 47 other roles including admin roles. Violates least-privilege principle.',
    affectedAssets: 1,
    recommendation: 'Scope down to required permissions only. EVO Asset Manager can auto-generate minimal IAM policies.',
    automationAvailable: true,
  },
];

interface SecurityInsightsProps {
  insights?: Insight[];
}

export default function SecurityInsights({ insights = SAMPLE_INSIGHTS }: SecurityInsightsProps) {
  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' },
      high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500' },
      medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500' },
      low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Vulnerability': AlertTriangle,
      'Secrets': Key,
      'License': Shield,
      'Container': Package,
      'AI Security': TrendingUp,
      'EVO Asset': CheckCircle,
    };
    return icons[category as keyof typeof icons] || AlertTriangle;
  };

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const highCount = insights.filter(i => i.severity === 'high').length;
  const automationCount = insights.filter(i => i.automationAvailable).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-300">Critical</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">{criticalCount}</div>
          <div className="text-xs text-red-300 mt-1">Immediate action required</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-300">High</span>
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white">{highCount}</div>
          <div className="text-xs text-orange-300 mt-1">Requires attention</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-300">Total Issues</span>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{insights.length}</div>
          <div className="text-xs text-blue-300 mt-1">Across all categories</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-300">Auto-Fixable</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{automationCount}</div>
          <div className="text-xs text-green-300 mt-1">Agent automation available</div>
        </div>
      </div>

      {/* Insights List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Security Insights</h2>
          <p className="text-sm text-slate-400 mt-1">
            Powered by multi-agent graph analysis
          </p>
        </div>

        <div className="divide-y divide-slate-700">
          {insights.map((insight) => {
            const colors = getSeverityColor(insight.severity);
            const Icon = getCategoryIcon(insight.category);

            return (
              <div
                key={insight.id}
                className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded ${colors.bg} ${colors.text} font-medium`}>
                            {insight.severity.toUpperCase()}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{insight.category}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{insight.affectedAssets} assets affected</span>
                        </div>
                      </div>

                      {insight.automationAvailable && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          Auto-Fix Available
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 mb-3">
                      {insight.description}
                    </p>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-blue-400 mb-1">Recommended Action</div>
                          <div className="text-sm text-slate-300">{insight.recommendation}</div>
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
