import { useState } from 'react';
import { Play, Code, Zap, Shield, Key, Database, AlertTriangle } from 'lucide-react';

interface Query {
  id: string;
  name: string;
  description: string;
  category: 'vulnerability' | 'secret' | 'supply-chain' | 'evo' | 'ai';
  cypher: string;
  icon: any;
}

const PREDEFINED_QUERIES: Query[] = [
  {
    id: 'log4shell',
    name: 'Log4Shell Blast Radius',
    description: '10-hop transitive dependency analysis for CVE-2021-44228',
    category: 'vulnerability',
    icon: AlertTriangle,
    cypher: `MATCH (v:Vulnerability {cve: 'CVE-2021-44228'})-[:AFFECTS]->(pkg:Package)
-[:DEPENDENCY*1..10]->(dep:Package)<-[:USES]-(proj:Project)<-[:OWNS]-(org:Organization)
RETURN org, proj, pkg, dep, v`
  },
  {
    id: 'exposed-secrets',
    name: 'Exposed Secrets to Production',
    description: 'Trace secrets from code to production cloud resources',
    category: 'secret',
    icon: Key,
    cypher: `MATCH path = (s:Secret {status: 'active'})-[:FOUND_IN]->(repo:Repository)
-[:DEPLOYS_TO]->(svc:Service {environment: 'production'})
-[:ACCESSES]->(cloud:CloudResource)
RETURN path`
  },
  {
    id: 'license-violations',
    name: 'License Risk Propagation',
    description: 'Find GPL violations in proprietary projects',
    category: 'supply-chain',
    icon: Shield,
    cypher: `MATCH (proj:Project {license_type: 'PROPRIETARY'})-[:USES]->(pkg:Package)
-[:DEPENDENCY*1..10]->(dep:Package)-[:HAS_LICENSE]->(lic:License)
WHERE lic.category = 'COPYLEFT'
RETURN proj, pkg, dep, lic`
  },
  {
    id: 'evo-asset-inventory',
    name: 'EVO Asset Inventory',
    description: 'Map all EVO-managed assets and their security posture',
    category: 'evo',
    icon: Database,
    cypher: `MATCH (asset:EVOAsset)
OPTIONAL MATCH (asset)-[:HAS_ISSUE]->(issue:Issue {status: 'open'})
RETURN asset, count(issue) as open_issues
ORDER BY open_issues DESC`
  },
  {
    id: 'ai-model-vulnerabilities',
    name: 'AI Model Supply Chain Risks',
    description: 'Identify vulnerabilities in AI/ML model dependencies',
    category: 'ai',
    icon: Zap,
    cypher: `MATCH (model:AIModel)-[:DEPENDS_ON]->(pkg:Package)
<-[:AFFECTS]-(vuln:Vulnerability)
WHERE vuln.severity IN ['critical', 'high']
RETURN model, pkg, vuln`
  },
  {
    id: 'cross-surface-correlation',
    name: 'Code-to-Cloud Attack Paths',
    description: 'Find attack paths from code vulns to cloud resources',
    category: 'vulnerability',
    icon: Shield,
    cypher: `MATCH path = (issue:Issue {issue_type: 'vuln'})-[:VULNERABILITY]->(v:Vulnerability)
<-[:AFFECTS]-(pkg:Package)<-[:USES]-(proj:Project)-[:SOURCE_FROM]->(repo:Repository)
-[:DEPLOYS_TO]->(svc:Service)-[:RUNS]->(container:Container)
-[:ACCESSES]->(cloud:CloudResource {environment: 'production'})
RETURN path`
  }
];

interface QueryPanelProps {
  onQuerySelect: (query: Query) => void;
  onExecute: (data: any) => void;
}

export default function QueryPanel({ onQuerySelect, onExecute }: QueryPanelProps) {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleExecuteQuery = async (query: Query) => {
    setIsExecuting(true);
    setSelectedQuery(query);
    onQuerySelect(query);

    // Simulate query execution
    setTimeout(() => {
      onExecute({ query, results: [] });
      setIsExecuting(false);
    }, 800);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      vulnerability: 'bg-red-500/10 text-red-400 border-red-500/30',
      secret: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      'supply-chain': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      evo: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      ai: 'bg-green-500/10 text-green-400 border-green-500/30',
    };
    return colors[category as keyof typeof colors] || colors.vulnerability;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Security Queries</h2>
        <p className="text-sm text-slate-400">
          Run graph traversals to uncover security risks across your infrastructure
        </p>
      </div>

      {/* Query Categories */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Predefined Queries</h3>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showCustom ? 'Show Presets' : 'Custom Query'}
          </button>
        </div>

        {!showCustom ? (
          <div className="space-y-2">
            {PREDEFINED_QUERIES.map((query) => {
              const Icon = query.icon;
              const isSelected = selectedQuery?.id === query.id;

              return (
                <button
                  key={query.id}
                  onClick={() => handleExecuteQuery(query)}
                  disabled={isExecuting}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${isSelected
                      ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/30'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 hover:bg-slate-900'
                    }
                    ${isExecuting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${getCategoryColor(query.category)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {query.name}
                        </h4>
                        {isSelected && isExecuting && (
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {query.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Enter custom Cypher query..."
              className="w-full h-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
            />
            <button
              onClick={() => {
                // Execute custom query
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Execute Query
            </button>
          </div>
        )}
      </div>

      {/* Query Stats */}
      {selectedQuery && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Current Query</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Query Type:</span>
              <span className={`px-2 py-1 rounded ${getCategoryColor(selectedQuery.category)}`}>
                {selectedQuery.category}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Execution Time:</span>
              <span className="text-green-400 font-mono">23ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Nodes Scanned:</span>
              <span className="text-blue-400 font-mono">1,247</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Results:</span>
              <span className="text-purple-400 font-mono">18</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tip */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Zero-ETL Performance</h4>
            <p className="text-xs text-slate-400">
              Queries run directly on Postgres with optimized recursive CTEs.
              No separate graph database or ETL required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
