import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Play, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react';

// Register dagre layout
if (typeof cytoscape !== 'undefined') {
  cytoscape.use(dagre);
}

interface GraphVisualizationProps {
  data: any;
  selectedQuery: any;
  onNodeSelect: (node: any) => void;
}

export default function GraphVisualization({ data, selectedQuery, onNodeSelect }: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, executionTime: '0ms' });

  // Sample graph data for demo
  const sampleGraphData = {
    nodes: [
      // Vulnerabilities
      { data: { id: 'vuln-1', label: 'CVE-2021-44228\n(Log4Shell)', type: 'vulnerability', severity: 'critical' } },
      { data: { id: 'vuln-2', label: 'CVE-2021-23337\n(Lodash)', type: 'vulnerability', severity: 'high' } },

      // Packages
      { data: { id: 'pkg-1', label: 'log4j-core\n2.14.1', type: 'package', ecosystem: 'maven' } },
      { data: { id: 'pkg-2', label: 'spring-core\n5.3.9', type: 'package', ecosystem: 'maven' } },
      { data: { id: 'pkg-3', label: 'lodash\n4.17.19', type: 'package', ecosystem: 'npm' } },
      { data: { id: 'pkg-4', label: 'express\n4.17.1', type: 'package', ecosystem: 'npm' } },
      { data: { id: 'pkg-5', label: 'react\n17.0.2', type: 'package', ecosystem: 'npm' } },

      // Projects
      { data: { id: 'proj-1', label: 'acme-api', type: 'project', risk: 'high' } },
      { data: { id: 'proj-2', label: 'acme-frontend', type: 'project', risk: 'medium' } },
      { data: { id: 'proj-3', label: 'techstart-api', type: 'project', risk: 'critical' } },

      // Organizations
      { data: { id: 'org-1', label: 'Acme Corp', type: 'organization' } },
      { data: { id: 'org-2', label: 'TechStart Inc', type: 'organization' } },

      // Secrets
      { data: { id: 'secret-1', label: 'AWS Key\n(45d old)', type: 'secret', severity: 'critical' } },

      // Repositories
      { data: { id: 'repo-1', label: 'api-service', type: 'repository' } },

      // Services
      { data: { id: 'svc-1', label: 'acme-api-prod', type: 'service', env: 'production' } },

      // Cloud Resources
      { data: { id: 'cloud-1', label: 'RDS Database', type: 'cloud', resource: 'rds' } },
      { data: { id: 'cloud-2', label: 'S3 Bucket', type: 'cloud', resource: 's3' } },
    ],
    edges: [
      // Vulnerability relationships
      { data: { source: 'vuln-1', target: 'pkg-1', label: 'AFFECTS', type: 'affects' } },
      { data: { source: 'vuln-2', target: 'pkg-3', label: 'AFFECTS', type: 'affects' } },

      // Package dependencies
      { data: { source: 'pkg-2', target: 'pkg-1', label: 'DEPENDS_ON', type: 'dependency' } },
      { data: { source: 'pkg-4', target: 'pkg-3', label: 'DEPENDS_ON', type: 'dependency' } },
      { data: { source: 'pkg-5', target: 'pkg-3', label: 'DEPENDS_ON', type: 'dependency' } },

      // Project uses packages
      { data: { source: 'proj-1', target: 'pkg-2', label: 'USES', type: 'uses' } },
      { data: { source: 'proj-1', target: 'pkg-1', label: 'USES', type: 'uses' } },
      { data: { source: 'proj-2', target: 'pkg-5', label: 'USES', type: 'uses' } },
      { data: { source: 'proj-2', target: 'pkg-4', label: 'USES', type: 'uses' } },
      { data: { source: 'proj-3', target: 'pkg-1', label: 'USES', type: 'uses' } },

      // Organization owns projects
      { data: { source: 'org-1', target: 'proj-1', label: 'OWNS', type: 'owns' } },
      { data: { source: 'org-1', target: 'proj-2', label: 'OWNS', type: 'owns' } },
      { data: { source: 'org-2', target: 'proj-3', label: 'OWNS', type: 'owns' } },

      // Secret exposure path
      { data: { source: 'secret-1', target: 'repo-1', label: 'FOUND_IN', type: 'found_in' } },
      { data: { source: 'repo-1', target: 'svc-1', label: 'DEPLOYS_TO', type: 'deploys' } },
      { data: { source: 'svc-1', target: 'cloud-1', label: 'ACCESSES', type: 'accesses' } },
      { data: { source: 'svc-1', target: 'cloud-2', label: 'ACCESSES', type: 'accesses' } },
    ]
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: sampleGraphData,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => {
              const type = ele.data('type');
              const colors: any = {
                vulnerability: '#ef4444',
                package: '#8b5cf6',
                project: '#3b82f6',
                organization: '#10b981',
                secret: '#f59e0b',
                repository: '#6366f1',
                service: '#06b6d4',
                cloud: '#ec4899',
              };
              return colors[type] || '#64748b';
            },
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': (ele: any) => {
              const type = ele.data('type');
              return type === 'organization' ? 60 : type === 'vulnerability' ? 50 : 40;
            },
            'height': (ele: any) => {
              const type = ele.data('type');
              return type === 'organization' ? 60 : type === 'vulnerability' ? 50 : 40;
            },
            'border-width': 2,
            'border-color': (ele: any) => {
              const severity = ele.data('severity');
              const risk = ele.data('risk');
              if (severity === 'critical' || risk === 'critical') return '#dc2626';
              if (severity === 'high' || risk === 'high') return '#f97316';
              return 'rgba(255,255,255,0.3)';
            },
            'text-outline-width': 2,
            'text-outline-color': '#0f172a',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': (ele: any) => {
              const type = ele.data('type');
              const colors: any = {
                affects: '#ef4444',
                dependency: '#8b5cf6',
                uses: '#3b82f6',
                owns: '#10b981',
                found_in: '#f59e0b',
                deploys: '#06b6d4',
                accesses: '#ec4899',
              };
              return colors[type] || '#475569';
            },
            'target-arrow-color': (ele: any) => {
              const type = ele.data('type');
              const colors: any = {
                affects: '#ef4444',
                dependency: '#8b5cf6',
                uses: '#3b82f6',
                owns: '#10b981',
                found_in: '#f59e0b',
                deploys: '#06b6d4',
                accesses: '#ec4899',
              };
              return colors[type] || '#475569';
            },
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#94a3b8',
            'text-outline-width': 1,
            'text-outline-color': '#0f172a',
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#60a5fa',
            'overlay-opacity': 0.2,
            'overlay-color': '#3b82f6',
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 80,
        padding: 30,
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    // Event handlers
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      onNodeSelect(node.data());

      // Highlight connected nodes
      cy.elements().removeClass('highlighted');
      node.addClass('highlighted');
      node.neighborhood().addClass('highlighted');
    });

    cyRef.current = cy;

    // Update stats
    setStats({
      nodes: cy.nodes().length,
      edges: cy.edges().length,
      executionTime: '23ms'
    });

    return () => {
      cy.destroy();
    };
  }, [data]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(50);
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      cyRef.current?.layout({ name: 'dagre', rankDir: 'TB' }).run();
      setIsLoading(false);
    }, 500);
  };
  const handleDownload = () => {
    const png = cyRef.current?.png({ full: true, scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = 'security-graph.png';
    link.click();
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-white">Security Graph Visualization</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Nodes:</span>
            <span className="font-mono text-blue-400">{stats.nodes}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Edges:</span>
            <span className="font-mono text-purple-400">{stats.edges}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Query:</span>
            <span className="font-mono text-green-400">{stats.executionTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            title="Refresh Layout"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[700px] bg-gradient-to-br from-slate-900 to-slate-800"
      />

      {/* Legend */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-400">Vulnerability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-400">Package</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Organization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-400">Secret</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-slate-400">Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-slate-400">Cloud Resource</span>
          </div>
        </div>
      </div>
    </div>
  );
}
