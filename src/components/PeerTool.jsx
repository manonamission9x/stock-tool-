import { useState, useEffect, useRef } from 'react';
import { fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { downloadCSV, readFile } from '../utils/helpers';
import { Masthead, Block, UploadBar, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';

const DEFAULT = ['Company A, 5000, 3000, 500, 8000', 'Company B, 4200, 2800, 380, 7200', 'Company C, 3800, 2100, 420, 6500'].join('\n');

export default function PeerTool({ switchTab }) {
  const showToast = useToast();
  const [csv, setCsv] = usePersistedState('peer_csv', DEFAULT);
  const [rows, setRows] = useState([]);
  const labels = ['Revenue', 'Profit', 'Assets', 'Debt'];
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
    const lines = text.split('\n').filter(Boolean);
    setRows(lines.map(l => {
      const cols = l.split(',').map(s => s.trim());
      return { name: cols[0], vals: cols.slice(1).map(Number) };
    }));
  }

  useEffect(() => { if (csv) parse(); }, [csv]);
  function parse() { const lines = csv.split('\n').filter(Boolean); parseWithText(csv); showToast('Loaded ' + lines.length + ' companies'); }
  function clear() { if (!confirm('Clear all data and results?')) return; setCsv(''); setRows([]); }
  function best(ci) { const n = rows.map(r => r.vals[ci]).filter(v => !isNaN(v)); return n.length ? Math.max(...n) : null; }
  function worst(ci) { const n = rows.map(r => r.vals[ci]).filter(v => !isNaN(v)); return n.length ? Math.min(...n) : null; }

  return (
    <div>
      <Masthead title="Peer comparison" desc="Compare up to 5 companies side-by-side. Best and worst values are auto-highlighted." />
      <div className="body">
        <UploadBar onUpload={handleCsvFile} hint="CSV: Company, Revenue, Profit, Assets, Debt" />
        <Block label="Company data (Company, Revenue, Profit, Assets, Debt)">
          <div style={{ padding: '14px 20px' }}>
            <textarea rows={6} className="num-input" style={{ width: '100%', lineHeight: 1.7, fontSize: 12, fontFamily: 'var(--font-mono)' }} value={csv} onChange={e => setCsv(e.target.value)} />
            <Toolbar onClear={clear} onAction={parse} actionLabel="Compare" />
          </div>
        </Block>

        {rows.length > 0 && (
          <Block label="Results" style={{ marginTop: 2 }}>
            <table className="diff-table">
              <thead><tr><th>Company</th>{labels.map((l, i) => <th key={i}>{l}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.name}</strong></td>
                    {r.vals.map((v, j) => {
                      const b = best(j), w = worst(j);
                      return <td key={j} className={v === b ? 'good' : v === w ? 'warn' : ''}>{isNaN(v) ? '—' : fmtNum(v)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => {
                const headers = ['Company', ...labels];
                const data = rows.map(r => [r.name, ...r.vals.map(v => isNaN(v) ? '' : v)]);
                downloadCSV('peer_comparison.csv', [headers, ...data]);
              }}>
                Download CSV
              </button>
            </div>
          </Block>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <NextLinks links={[
              { label: 'Cash efficiency', onClick: () => switchTab('tab-wc') },
              { label: 'Estimate value', onClick: () => switchTab('tab-dcf') },
            ]} />
            <TrustBadge />
          </div>
        )}

        {!rows.length && <EmptyState title="Enter companies and metrics above, then click Compare." desc="Format: Company Name, Revenue, Profit, Assets, Debt — one per line." />}
      </div>
    </div>
  );
}
