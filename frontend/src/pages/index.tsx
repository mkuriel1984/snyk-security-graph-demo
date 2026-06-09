import { useState, useEffect } from 'react';
import Head from 'next/head';
import GraphVisualization from '../components/GraphVisualization';
import QueryPanel from '../components/QueryPanel';
import SecurityInsights from '../components/SecurityInsights';
import EVOAssets from '../components/EVOAssets';
import AISecurityPanel from '../components/AISecurityPanel';
import { Shield, Network, Brain, Database, Target, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'graph' | 'insights' | 'evo' | 'ai'>('graph');
  const [graphData, setGraphData] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [insights, setInsights] = useState([]);

  return (
    <>
      <Head>
        <title>Snyk Security Graph | Agentic AppSec Platform</title>
        <meta name="description" content="Interactive Security Graph for Zero-ETL Security Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Snyk Security Graph</h1>
                  <p className="text-sm text-slate-400">Zero-ETL Graph Analytics for Agentic AppSec</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">Live</span>
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-slate-500">Postgres</span> • <span className="text-slate-500">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-slate-700 bg-slate-900/30">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex gap-1">
              {[
                { id: 'graph', label: 'Security Graph', icon: Network },
                { id: 'insights', label: 'Security Insights', icon: Target },
                { id: 'evo', label: 'EVO Assets', icon: Database },
                { id: 'ai', label: 'AI Security', icon: Brain },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-3 font-medium transition-all
                    ${activeView === id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Query & Controls */}
            <div className="col-span-3 space-y-6">
              <QueryPanel
                onQuerySelect={setSelectedQuery}
                onExecute={(data) => setGraphData(data)}
              />
            </div>

            {/* Center Panel - Main View */}
            <div className="col-span-9">
              {activeView === 'graph' && (
                <GraphVisualization
                  data={graphData}
                  selectedQuery={selectedQuery}
                  onNodeSelect={(node) => console.log('Selected:', node)}
                />
              )}
              {activeView === 'insights' && (
                <SecurityInsights insights={insights} />
              )}
              {activeView === 'evo' && (
                <EVOAssets />
              )}
              {activeView === 'ai' && (
                <AISecurityPanel />
              )}
            </div>
          </div>
        </main>

        {/* Footer Stats */}
        <footer className="border-t border-slate-700 bg-slate-900/50 mt-8">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="grid grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">23</div>
                <div className="text-xs text-slate-500">Organizations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">127</div>
                <div className="text-xs text-slate-500">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">1.2K</div>
                <div className="text-xs text-slate-500">Packages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">48</div>
                <div className="text-xs text-slate-500">Critical Issues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">12</div>
                <div className="text-xs text-slate-500">Exposed Secrets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">2.3s</div>
                <div className="text-xs text-slate-500">Avg Query Time</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
