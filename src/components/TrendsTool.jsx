import { useState, useEffect, useRef } from 'react';
import { fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { downloadCSV } from '../utils/helpers';
import { Masthead, Block, UploadBar, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';
import { useAnalysis } from './AnalysisContext';

export default function TrendsTool({ switchTab }) {
  const showToast = useToast();
  const { filingData } = useAnalysis();
  const [csv, setCsv] = usePersistedState('trends_csv', 'Period, FY22, FY23, FY24, FY25, FY26\nRevenue, 1000, 1150, 1240, 1380, 1530\nCOGS, 700, 800, 870, 980, 1100\nNet Profit, 160, 155, 142, 130, 119');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const csvRef = useRef(null);

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { setCsv(ev.target.result); parseWithText(ev.target.result); } catch(err) { showToast('Error reading file: ' + err.message); } };
    reader.readAsText(file);
    e.target.value = '';
  }

  function parseWithText(text) {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length < 2) return;
    setHeaders(lines[0].split(',').map(s => s.trim()));
    setRows(lines.slice(1).map(l => {
      const cols = l.split(',').map(s => s.trim());
      return { label: cols[0], vals: cols.slice(1).map(Number) };
    }));
  }

  // When filingData changes, pre-fill CSV with filing diffs
  useEffect(() => {
    if (filingData && filingData.diffs && filingData.diffs.length > 0) {
      const headerLine = 'Metric, Earlier, Latest';
      const dataLines = filingData.diffs.map(d => `${d.label}, ${d.a ?? ''}, ${d.b ?? ''}`);
      setCsv([headerLine, ...dataLines].join('\n'));
    }
  }, [filingData]);

  useEffect(() => { if (csv) { const t = setTimeout(() => parse(), 0); return () => clearTimeout(t); } }, [csv]);
  function parse() { const lines = csv.split('\n').filter(Boolean); parseWithText(csv); showToast('Loaded ' + (lines.length - 1) + ' metrics'); }

  function clear() { if (!confirm('Clear all data and results?')) return; setCsv(''); setHeaders([]); setRows([]); }

  return (
    <div>
      <Masthead title="Trend charts" desc="Paste data below. First row: period names (FY22, FY23...). Following rows: metric name followed by values." />
      <div className="body">
        <UploadBar onUpload={handleCsvFile} hint="CSV: Metric, Period1, Period2, Period3, ..." />
        <Block label="Data">
          <div style={{ padding: '14px 20px' }}>
            <textarea rows={6} className="num-input" style={{ width: '100%', lineHeight: 1.7, fontSize: 12, fontFamily: 'var(--font-mono)' }} value={csv} onChange={e => setCsv(e.target.value)} />
            <Toolbar onClear={clear} onAction={parse} actionLabel="Plot" />
          </div>
        </Block>

        {rows.length > 0 && (
          <Block label="Data table" style={{ marginTop: 2 }}>
            <table className="diff-table">
              <thead><tr><th>Metric</th>{headers.slice(1).map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.label}</strong></td>
                    {r.vals.map((v, j) => <td key={j}>{isNaN(v) ? '—' : fmtNum(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => {
                const hdrs = ['Metric', ...headers.slice(1)];
                const data = rows.map(r => [r.label, ...r.vals.map(v => isNaN(v) ? '' : v)]);
                downloadCSV('trends.csv', [hdrs, ...data]);
              }}>
                Download CSV
              </button>
            </div>
          </Block>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <NextLinks links={[
              { label: 'Growth rates', onClick: () => switchTab('tab-yoy') },
              { label: 'Estimate value', onClick: () => switchTab('tab-dcf') },
            ]} />
            <TrustBadge />
          </div>
        )}

        {!rows.length && <EmptyState title="Enter period labels as the first row and metrics below, then click Plot." desc="Format: Metric, Period1, Period2, Period3, ..." />}
      </div>
    </div>
  );
}
