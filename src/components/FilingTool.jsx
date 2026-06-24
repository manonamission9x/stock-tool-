import { useState, useRef, useEffect } from 'react';
import { parseLines, computeDiff, fmtINR, fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { useAnalysis } from './AnalysisContext';
import { Masthead, Block, UploadBar, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';
import { downloadCSV, safeNum, readFile } from '../utils/helpers';

export default function FilingTool({ switchTab }) {
  const showToast = useToast();
  const { setFiling } = useAnalysis();
  const [labelA, setLabelA] = usePersistedState('filing_labelA', 'Q4 FY25');
  const [labelB, setLabelB] = usePersistedState('filing_labelB', 'Q4 FY26');
  const [periodA, setPeriodA] = usePersistedState('filing_periodA', 'Revenue: 1240\nNet Profit: 142\nEBITDA Margin: 18.2\nTotal Debt: 410\nPromoter Holding: 72.5');
  const [periodB, setPeriodB] = usePersistedState('filing_periodB', 'Revenue: 1530\nNet Profit: 119\nEBITDA Margin: 14.6\nTotal Debt: 590\nPromoter Holding: 68.3');
  const [diffs, setDiffs] = usePersistedState('filing_diffs', []);
  const [flags, setFlags] = usePersistedState('filing_flags', []);
  const [showResults, setShowResults] = useState(diffs.length > 0);
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const csvInputRef = useRef(null);
  const hasRestored = useRef(false);

  // Auto-run on first mount if we have data and results were shown
  useEffect(() => {
    if (!hasRestored.current && showResults && diffs.length === 0) {
      hasRestored.current = true;
      handleCompare();
    } else if (!hasRestored.current && diffs.length > 0) {
      hasRestored.current = true;
    }
  }, []);

  async function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFile(file);
      const rows = text.split('\n').filter(Boolean);
      if (rows.length < 3) { showToast('Need at least 2 data rows'); return; }
      const headers = rows[0].split(',').map(s => s.trim());
      const labels = [], valsA = [], valsB = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(s => s.trim());
        if (cols.length >= 3) { labels.push(cols[0]); valsA.push(cols[1]); valsB.push(cols[2]); }
      }
      setLabelA(headers[1] || 'Earlier'); setLabelB(headers[2] || 'Latest');
      setPeriodA(labels.map((l, i) => l + ': ' + valsA[i]).join('\n'));
      setPeriodB(labels.map((l, i) => l + ': ' + valsB[i]).join('\n'));
      showToast('Loaded ' + labels.length + ' line items');
    } catch(err) { showToast('Error reading file: ' + err.message); }
    e.target.value = '';
  }

  function handleCompare() {
    setLoading(true);
    setErrMsg('');
    const pA = parseLines(periodA);
    const pB = parseLines(periodB);
    if (pA.length === 0 || pB.length === 0) { setErrMsg('Add at least one line item to each period.'); return; }
    const result = computeDiff(pA, pB);
    setDiffs(result);
    setShowResults(true);

    const flagList = [];
    result.forEach(d => {
      const lc = d.label.toLowerCase();
      if (d.pct !== null) {
        if ((lc.includes('pledge') || lc.includes('promoter')) && d.pct > 5) flagList.push({ level: 'warn', label: d.label, text: 'Promoter pledge increased ' + d.pct.toFixed(1) + '%.' });
        if ((lc.includes('debt') || lc.includes('borrow')) && d.pct > 20) flagList.push({ level: 'danger', label: d.label, text: 'Debt surged ' + d.pct.toFixed(1) + '%.' });
        if ((lc.includes('margin') || lc.includes('ebitda')) && d.pct < -10) flagList.push({ level: 'danger', label: d.label, text: 'Margin compressed by ' + Math.abs(d.pct).toFixed(1) + '%.' });
        if ((lc.includes('revenue') || lc.includes('sales')) && d.pct < -5) flagList.push({ level: 'warn', label: d.label, text: 'Revenue declined ' + Math.abs(d.pct).toFixed(1) + '%.' });
        if ((lc.includes('profit') || lc.includes('net')) && !lc.includes('margin') && d.pct < -15) flagList.push({ level: 'warn', label: d.label, text: 'Net profit dropped ' + Math.abs(d.pct).toFixed(1) + '%.' });
        if (lc.includes('cash') && d.pct < -20) flagList.push({ level: 'warn', label: d.label, text: 'Cash dropped ' + Math.abs(d.pct).toFixed(1) + '%.' });
      }
    });
    setFlags(flagList);
    setFiling({ labels: periodA.split('\n').filter(Boolean).length + periodB.split('\n').filter(Boolean).length, diffs: result, flags: flagList });
    setTimeout(() => setLoading(false), 300);
  }

  function handleClear() {
    if (!confirm('Clear all data and results?')) return;
    setPeriodA(''); setPeriodB(''); setLabelA(''); setLabelB('');
    setShowResults(false); setDiffs([]); setFlags([]); setErrMsg('');
  }

  function handleExportCSV() {
    downloadCSV('filing-comparison.csv', [
      ['Line item', labelA || 'Earlier', labelB || 'Latest', 'Change %'],
      ...diffs.map(d => [d.label, d.a ?? '', d.b ?? '', d.pct !== null ? d.pct.toFixed(1) + '%' : '']),
    ]);
    showToast('CSV downloaded');
  }

  return (
    <div>
      <Masthead title="Filing comparison" desc="Compare two reporting periods. See changes in revenue, profit, debt, and margins — risk flags are generated automatically." />
      <div className="body">
        <UploadBar onUpload={handleCsvFile} hint="CSV: Label, Period1, Period2 or paste Label: value below" />

        <Block>
          <div className="inputs">
            {[
              { label: labelA, setLabel: setLabelA, period: periodA, setPeriod: setPeriodA, phLabel: 'e.g. Q4 FY25', phPeriod: 'Revenue: 1240' },
              { label: labelB, setLabel: setLabelB, period: periodB, setPeriod: setPeriodB, phLabel: 'e.g. Q4 FY26', phPeriod: 'Revenue: 1530' },
            ].map((col, ci) => (
              <div className="input-col" key={ci}>
                <div className="input-col-label">{ci === 0 ? 'Earlier period' : 'Latest period'}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Label: value per line</div>
                <input type="text" className="period-label-input" placeholder={col.phLabel} value={col.label} onChange={e => col.setLabel(e.target.value)} />
                <textarea rows={8} className="num-input" style={{ width: '100%', lineHeight: 1.7, fontSize: 12, fontFamily: 'var(--font-mono)' }} placeholder={col.phPeriod} value={col.period} onChange={e => col.setPeriod(e.target.value)} />
              </div>
            ))}
          </div>
          {errMsg && <div style={{ padding: '0 14px 10px' }}><span className="err-msg">{errMsg}</span></div>}
          <Toolbar onClear={handleClear} onAction={handleCompare} actionLabel={loading ? 'Comparing...' : 'Compare'} isLoading={loading} />
        </Block>

        {showResults && diffs.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <Block label="Results — what changed">
              <table className="diff-table">
                <thead><tr><th>Line item</th><th>{labelA || 'Earlier'}</th><th>{labelB || 'Latest'}</th><th>Change</th></tr></thead>
                <tbody>
                  {diffs.map((d, i) => (
                    <tr key={i}>
                      <td>{d.label}</td>
                      <td>{d.a !== null ? (d.isPct ? d.a + '%' : fmtINR(d.a)) : '—'}</td>
                      <td>{d.b !== null ? (d.isPct ? d.b + '%' : fmtINR(d.b)) : '—'}</td>
                      <td style={{ color: d.dir === 'up' ? 'var(--green)' : d.dir === 'down' ? 'var(--red)' : 'var(--text-tertiary)' }}>
                        {d.dir === 'up' ? '↑' : d.dir === 'down' ? '↓' : '→'} {d.pct !== null ? Math.abs(d.pct).toFixed(1) + '%' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Block>

            {flags.length > 0 && (
              <Block label="Risk flags" style={{ marginTop: 2 }}>
                {flags.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: f.level === 'danger' ? 'rgba(229,72,77,0.05)' : 'rgba(203,163,68,0.05)', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: f.level === 'danger' ? 'var(--red)' : 'var(--yellow)', fontWeight: 500, padding: '1px 6px', border: `1px solid ${f.level === 'danger' ? 'var(--red)' : 'var(--yellow)'}`, borderRadius: 2 }}>{f.level === 'danger' ? 'High' : 'Note'}</span>
                    <div>
                      <strong style={{ fontSize: 12, color: 'var(--text)' }}>{f.label}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{f.text}</div>
                    </div>
                  </div>
                ))}
              </Block>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="primary" onClick={handleExportCSV} style={{ fontSize: 11, padding: '6px 14px' }}>Download CSV</button>
            </div>

            <NextLinks links={[
              { label: 'Plot trends', onClick: () => switchTab('tab-trends') },
              { label: 'Estimate value', onClick: () => switchTab('tab-dcf') },
            ]} />
            <TrustBadge extra="Pct change = ((B−A)/|A|)×100" />
          </div>
        )}

        {!showResults && <EmptyState title="See what changed between two reporting periods." desc="Paste line items as Label: value in both columns above, then click Compare. Sample data is pre-loaded — click Clear to start fresh." />}
      </div>
    </div>
  );
}
