import { useState, useEffect, useRef } from 'react';
import { fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { downloadCSV, readFile } from '../utils/helpers';
import { Masthead, Block, UploadBar, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';

export default function YoyTool({ switchTab }) {
  const showToast = useToast();
  const [years, setYears] = usePersistedState('yoy_years', 'FY22, FY23, FY24, FY25, FY26');
  const [csv, setCsv] = usePersistedState('yoy_csv', 'Metric, FY22, FY23, FY24, FY25, FY26\nRevenue, 1000, 1150, 1240, 1380, 1530\nNet Profit, 160, 155, 142, 130, 119\nEBITDA, 280, 295, 310, 290, 270');
  const [rows, setRows] = useState([]);
  const csvRef = useRef(null);

  async function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFile(file);
      setCsv(text);
      parseWithText(text);
    } catch(err) { showToast('Error reading file: ' + err.message); }
    e.target.value = '';
  }

  function parseWithText(text) {
    const yrList = years.split(',').map(s => s.trim()).filter(Boolean);
    const lines = text.split('\n').filter(Boolean);
    setRows(lines.map(l => {
      const cols = l.split(',').map(s => s.trim());
      const vals = cols.slice(1).map(Number);
      const growth = vals.map((v, i) => (i > 0 && vals[i - 1]) ? ((v - vals[i - 1]) / Math.abs(vals[i - 1])) * 100 : null);
      return { label: cols[0], vals, growth };
    }));
  }

  useEffect(() => { if (csv) parse(); }, [csv]);
  function parse() { const lines = csv.split('\n').filter(Boolean); parseWithText(csv); showToast('Loaded ' + lines.length + ' metrics'); }
  function clear() { if (!confirm('Clear all data and results?')) return; setCsv(''); setYears(''); setRows([]); }

  return (
    <div>
      <Masthead title="Growth rates" desc="See whether revenue, profit, and other metrics are accelerating or slowing — year over year." />
      <div className="body">
        <UploadBar onUpload={handleCsvFile} hint="CSV: Metric, Year1, Year2, Year3, ..." />
        <Block label="Data">
          <div style={{ padding: '14px 20px' }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Years:</span>
              <input type="text" className="period-label-input" style={{ width: '100%', marginTop: 4 }} value={years} onChange={e => setYears(e.target.value)} />
            </div>
            <textarea rows={6} className="num-input" style={{ width: '100%', lineHeight: 1.7, fontSize: 12, fontFamily: 'var(--font-mono)' }} value={csv} onChange={e => setCsv(e.target.value)} />
            <Toolbar onClear={clear} onAction={parse} actionLabel="Calculate growth" />
          </div>
        </Block>

        {rows.length > 0 && (
          <Block label="Growth rates (YoY %)" style={{ marginTop: 2 }}>
            <table className="diff-table">
              <thead><tr><th>Metric</th>{rows[0].growth.slice(1).map((_, i) => <th key={i}>FY{i + 2}→FY{i + 3}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.label}</strong></td>
                    {r.growth.slice(1).map((g, j) => (
                      <td key={j} style={{ color: g > 0 ? 'var(--green)' : g < 0 ? 'var(--red)' : 'var(--text)' }}>
                        {g !== null ? (g > 0 ? '+' : '') + g.toFixed(1) + '%' : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => {
                const yrHeaders = rows[0].growth.slice(1).map((_, i) => `FY${i + 2}→FY${i + 3}`);
                const hdrs = ['Metric', ...yrHeaders];
                const data = rows.map(r => [r.label, ...r.growth.slice(1).map(g => g !== null ? (g > 0 ? '+' : '') + g.toFixed(1) + '%' : '')]);
                downloadCSV('yoy_growth.csv', [hdrs, ...data]);
              }}>
                Download CSV
              </button>
            </div>
          </Block>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <NextLinks links={[
              { label: 'Trend charts', onClick: () => switchTab('tab-trends') },
              { label: 'Review filings', onClick: () => switchTab('tab-filing') },
            ]} />
            <TrustBadge />
          </div>
        )}

        {!rows.length && <EmptyState title="Enter years and metrics above, then click Calculate growth." desc="Format: Metric, Year1, Year2, Year3, ..." />}
      </div>
    </div>
  );
}
