import { useState, useRef, useEffect } from 'react';
import { computeDCF, fmtINR, fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function DCFTool({ switchTab }) {
  const [fcf, setFcf] = usePersistedState('dcf_fcf', 1240);
  const [growth, setGrowth] = usePersistedState('dcf_growth', 10);
  const [years, setYears] = usePersistedState('dcf_years', 5);
  const [discount, setDiscount] = usePersistedState('dcf_discount', 10);
  const [terminal, setTerminal] = usePersistedState('dcf_terminal', 3);
  const [netDebt, setNetDebt] = usePersistedState('dcf_netdebt', 180);
  const [shares, setShares] = usePersistedState('dcf_shares', 100);
  const [price, setPrice] = usePersistedState('dcf_price', 450);
  const [show, setShow] = useState(false);
  const [summary, setSummary] = useState(null);
  const [sens, setSens] = useState([]);
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => { if (fcf && shares) runDCF(); }, []);

  function runDCF() {
    setLoading(true);
    if (!fcf || shares <= 0) { setLoading(false); return; }
    if (terminal >= discount) { showToast('Terminal growth must be less than WACC'); setLoading(false); return; }
    if (fcf < 0) showToast('Negative FCF will produce negative intrinsic value. Check assumptions.');
    const r = computeDCF(fcf, growth, years, discount, terminal, netDebt, shares, price);
    if (!r) { showToast('Terminal growth too close to WACC — widening gap required'); setLoading(false); return; }
    setShow(true);
    setSummary(r);

    // Sensitivity table: vary growth vs discount
    const gs = [1, 2, 3, 4, 5]; // terminal growth rates
    const ds = [8, 10, 12, 14, 16]; // discount rates / WACC
    const rows = gs.map(g => ({
      g,
      cols: ds.map(d => {
        const iv = computeDCF(fcf, growth, years, d, g / 100, netDebt, shares, price).iv;
        return { d, iv };
      })
    }));
    setSens(rows);

    // Draw chart after state settles
    setTimeout(() => {
      if (!chartRef.current) return;
      if (chartInst.current) chartInst.current.destroy();
      const lbs = r.projected.map(p => 'Yr ' + p.year); lbs.push('Terminal');
      const fcfD = r.projected.map(p => Math.round(p.fcf)); fcfD.push(Math.round(r.tv));
      const pvD = r.projected.map(p => Math.round(p.pv)); pvD.push(Math.round(r.pvTv));
      try { chartInst.current = new Chart(chartRef.current, {
        type: 'bar',
        data: { labels: lbs, datasets: [
          { label: 'Projected FCF', data: fcfD, backgroundColor: '#4F6EF799', borderColor: '#4F6EF7', borderWidth: 1, borderRadius: 3 },
          { label: 'PV of FCF', data: pvD, backgroundColor: '#34A86C99', borderColor: '#34A86C', borderWidth: 1, borderRadius: 3 }
        ]},
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#A8AAB8', font: { family: 'IBM Plex Mono, monospace', size: 10 }, padding: 14, usePointStyle: true, boxWidth: 10 } },
            tooltip: { backgroundColor: '#111217', titleColor: '#F0EFEA', bodyColor: '#F0EFEA', borderColor: '#242632', borderWidth: 1, padding: 10, bodyFont: { family: 'IBM Plex Mono, monospace' } }
          },
          scales: { x: { ticks: { color: '#74768A', font: { family: 'IBM Plex Mono, monospace', size: 10 } }, grid: { color: '#242632' } }, y: { ticks: { color: '#74768A', font: { family: 'IBM Plex Mono, monospace', size: 10 } }, grid: { color: '#242632' } } }
        }
      }); } catch(err) { showToast('Chart render error'); }
    }, 50);
    setTimeout(() => setLoading(false), 300);
  }

  function handleClear() {
    if (!confirm('Clear all data and results?')) return;
    setFcf(0); setGrowth(0); setYears(5); setDiscount(0); setTerminal(0);
    setNetDebt(0); setShares(0); setPrice(0);
    setShow(false); setSummary(null); setSens([]);
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
  }

  return (
    <div>
      <div className="masthead">
        <div>
          <h1>DCF Valuation</h1>
          <div className="tool-desc">Enter free cash flow, growth rate, and WACC. Projects cash flows for 5 years and calculates intrinsic value per share.</div>
        </div>
      </div>
      <div className="body">
        <div className="block">
          <div className="block-header"><span className="block-label">Assumptions</span></div>
          <div className="wc-grid" style={{ padding: '14px 20px' }}>
            {[
              { id: 'dcf-fcf', label: 'Free Cash Flow (₹ Cr)', val: fcf, set: setFcf, hint: 'TTM free cash flow to firm' },
              { id: 'dcf-growth', label: 'Growth Rate (%)', val: growth, set: setGrowth, hint: 'Projected annual FCF growth' },
              { id: 'dcf-years', label: 'Projection Years', val: years, set: setYears, hint: 'Years of projected cash flows' },
              { id: 'dcf-discount', label: 'WACC (%)', val: discount, set: setDiscount, hint: 'Weighted avg cost of capital' },
              { id: 'dcf-terminal', label: 'Terminal Growth (%)', val: terminal, set: setTerminal, hint: 'Perpetual growth rate (must be less than WACC)' },
              { id: 'dcf-netdebt', label: 'Net Debt (₹ Cr)', val: netDebt, set: setNetDebt, hint: 'Total debt minus cash' },
              { id: 'dcf-shares', label: 'Shares Outstanding (Cr)', val: shares, set: setShares, hint: 'Fully diluted share count' },
              { id: 'dcf-price', label: 'Current Price (₹)', val: price, set: setPrice, hint: 'Market price per share' },
            ].map((f, i) => (
              <div className="wc-field" key={i}>
                <div className="wc-field-label">{f.label}</div>
                <input type="number" id={f.id} className="num-input" value={f.val} onChange={e => f.set(parseFloat(e.target.value) || 0)} />
                <div className="wc-field-hint">{f.hint}</div>
              </div>
            ))}
          </div>
          <div className="run-row">
            <button type="button" onClick={handleClear}>Clear</button>
            <span className="hint">Defaults pre-filled — adjust as needed</span>
            <button type="button" className="primary" disabled={loading} style={{ marginLeft: 'auto' }} onClick={runDCF}>{loading ? 'Calculating...' : 'Calculate value'}</button>
          </div>
        </div>

        {show && summary && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="block">
              <div className="block-header"><span className="block-label">Intrinsic value summary</span></div>
              <div className="wc-results-grid">
                {[
                  { l: 'Enterprise Value', v: '₹' + fmtNum(Math.round(summary.ev)) },
                  { l: 'Equity Value', v: '₹' + fmtNum(Math.round(summary.eq)) },
                  { l: 'Intrinsic Value / Share', v: '₹' + fmtNum(summary.iv.toFixed(2)), cls: summary.iv > price ? 'good' : 'warn' },
                  { l: 'Current Price', v: '₹' + fmtNum(price) },
                  { l: 'Margin of Safety', v: summary.mos.toFixed(1) + '%', cls: summary.mos > 20 ? 'good' : summary.mos > 0 ? '' : 'warn' },
                  { l: 'Verdict', v: summary.iv > price ? 'Undervalued ✓' : 'Overvalued ✗', cls: summary.iv > price ? 'good' : 'warn' },
                ].map((m, i) => (
                  <div className={'wc-metric' + (m.cls ? ' ' + m.cls : '')} key={i}>
                    <div className="wc-metric-label">{m.l}</div>
                    <div className={'wc-metric-value' + (m.cls ? ' ' + m.cls : '')}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="block" style={{ marginTop: 2 }}>
              <div className="block-header"><span className="block-label">Projected cash flows</span></div>
              <table className="diff-table">
                <thead><tr><th>Year</th><th>Projected FCF</th><th>Discount Factor</th><th>PV of FCF</th></tr></thead>
                <tbody>
                  {summary.projected.map(p => (
                    <tr key={p.year}>
                      <td>Year {p.year}</td>
                      <td>{'₹' + fmtNum(Math.round(p.fcf))}</td>
                      <td>{p.df.toFixed(4)}</td>
                      <td>{'₹' + fmtNum(Math.round(p.pv))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Terminal value</strong></td>
                    <td>{'₹' + fmtNum(Math.round(summary.tv))} →</td>
                    <td>{(1 / Math.pow(1 + discount / 100, years)).toFixed(4)}</td>
                    <td>{'₹' + fmtNum(Math.round(summary.pvTv))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="block" style={{ marginTop: 2 }}>
              <div className="block-header"><span className="block-label">Chart</span></div>
              <div style={{ padding: 20, height: 300 }}><canvas ref={chartRef}></canvas></div>
            </div>

            {sens.length > 0 && (
              <div className="block" style={{ marginTop: 2 }}>
                <div className="block-header"><span className="block-label">Sensitivity analysis</span></div>
                <div style={{fontSize:11,color:'var(--text-secondary)',marginBottom:12}}>Intrinsic value per share at varying terminal growth rates (rows) vs discount rates (columns)</div>
                <div style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Growth ↓ / Disc →</th>
                        {sens[0].cols.map(c => <th key={c.d} style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{c.d}%</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sens.map(row => (
                        <tr key={row.g}>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 11 }}>{row.g}%</td>
                          {row.cols.map(c => (
                            <td key={c.d} style={{
                              padding: '6px 8px', borderBottom: '1px solid var(--border)',
                              fontFamily: 'var(--font-mono)', fontSize: 12,
                              color: c.iv > price ? 'var(--green)' : 'var(--red)'
                            }}>
                              {'₹' + fmtNum(c.iv.toFixed(1))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: '1rem', padding: '10px 0' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Next:</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => switchTab('tab-peer')}>Compare peers →</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => switchTab('tab-filing')}>Review filings →</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Calculated in browser · No data uploaded</span>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Method: DCF with Gordon Growth terminal value</span>
            </div>
          </div>
        )}

        {!show && (
          <div className="block empty-state" style={{ marginTop: '1.5rem' }}>
            <strong>Enter assumptions above, then click Calculate value.</strong>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Adjust the default values or enter your own — the sensitivity table shows how changes in assumptions affect intrinsic value.</div>
          </div>
        )}
      </div>
    </div>
  );
}
