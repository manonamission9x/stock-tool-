import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import Nav from './components/Nav';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { AnalysisProvider } from './components/AnalysisContext';

const Home = lazy(() => import('./components/Home'));
const FilingTool = lazy(() => import('./components/FilingTool'));
const DCFTool = lazy(() => import('./components/DCFTool'));
const WCTool = lazy(() => import('./components/WCTool'));
const RatiosTool = lazy(() => import('./components/RatiosTool'));
const PeerTool = lazy(() => import('./components/PeerTool'));
const TrendsTool = lazy(() => import('./components/TrendsTool'));
const YoyTool = lazy(() => import('./components/YoyTool'));
const About = lazy(() => import('./components/About'));
const ResearchHub = lazy(() => import('./components/ResearchHub'));
const ToolsHub = lazy(() => import('./components/ToolsHub'));

const TOOLS = {
  'tab-home': Home, 'tab-research': ResearchHub, 'tab-filing': FilingTool,
  'tab-trends': TrendsTool, 'tab-yoy': YoyTool, 'tab-peer': PeerTool,
  'tab-dcf': DCFTool, 'tab-tools': ToolsHub, 'tab-wc': WCTool,
  'tab-ratios': RatiosTool, 'tab-about': About
};

function Loading() {
  return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading...</div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      // Hash takes priority over localStorage
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      return localStorage.getItem('fundalyst_tab') || 'tab-home';
    } catch { return 'tab-home'; }
  });

  const switchTab = useCallback((id) => {
    setActiveTab(id);
    window.location.hash = id;
    try { localStorage.setItem('fundalyst_tab', id); } catch {}
    try { localStorage.setItem('fundalyst_last_tab', JSON.stringify({id, time: Date.now()})); } catch {}
    const titles = {'tab-home':'Fundalyst','tab-research':'Research - Fundalyst','tab-filing':'Filing Comparison - Fundalyst','tab-trends':'Trend Analysis - Fundalyst','tab-yoy':'Growth Rates - Fundalyst','tab-peer':'Peer Comparison - Fundalyst','tab-dcf':'DCF Valuation - Fundalyst','tab-tools':'Tools - Fundalyst','tab-wc':'Cash Efficiency - Fundalyst','tab-ratios':'Financial Ratios - Fundalyst','tab-about':'About - Fundalyst'};
    try { document.title = titles[id] || 'Fundalyst'; } catch {}
    // Focus the tabpanel for accessibility
    const panel = document.getElementById(id);
    if (panel) setTimeout(() => { try { panel.focus({preventScroll:true}); } catch {} }, 50);
  }, []);

  // Listen for hash changes (browser back/forward, direct hash entry)
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h && TOOLS[h]) setActiveTab(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keyboard shortcuts: 1-5 to switch tabs
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const map = {'1':'tab-home','2':'tab-research','3':'tab-dcf','4':'tab-tools','5':'tab-about'};
      if (map[e.key]) switchTab(map[e.key]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [switchTab]);

  const tc = (id) => `tool${activeTab === id ? ' active' : ''}`;

  return (
    <ToastProvider>
      <AnalysisProvider><div className="page">
        <Nav activeTab={activeTab} switchTab={switchTab} />
        {Object.entries(TOOLS).map(([id, Component]) => (
          <div key={id} className={tc(id)} id={id} role="tabpanel" aria-labelledby={id.replace('tab-', '') + '-tab'} hidden={activeTab !== id} tabIndex="-1">
            <Suspense fallback={<Loading />}>
              <ErrorBoundary key={id}>
                {activeTab === id ? <Component switchTab={switchTab} /> : null}
              </ErrorBoundary>
            </Suspense>
          </div>
        ))}
      </div></AnalysisProvider>
    </ToastProvider>
  );
}
