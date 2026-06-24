import { useState, useEffect, useRef } from 'react';
import { fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { downloadCSV, readFile } from '../utils/helpers';
import { Masthead, Block, UploadBar, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';
import { useAnalysis } from './AnalysisContext';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function TrendsTool({ switchTab }) {
  const showToast = useToast();
  const { filingData } = useAnalysis();
  const [csv, setCsv] = usePersistedState('trends_csv', 'Period, FY22, FY23, FY24, FY25, FY26\nRevenue, 1000, 1150, 1240, 1380, 1530\nCOGS, 700, 800, 870, 980, 1100\nNet Profit, 160, 155, 142, 130, 119');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const csvRef = useRef(null);
  const chartRef = useRef(null);
  const chartInst = useRef(null);
  const [chartMetric, setChartMetric] = useState(0);

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

  // Build line chart when rows change
  useEffect(() => {
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    if (!chartRef.current || rows.length === 0) return;
    const metric = rows[chartMetric] || rows[0];
    if (!metric) return;
    const labels = headers.slice(1);
    const colors = ['#4F6EF7', '#34A86C', '#CBA344', '#E5484D', '#8B5CF6'];
    try {
      chartInst.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: rows.map((r, i) => ({
            label: r.label,
            data: r.vals,
            borderColor: colors[i % colors.length],
            backgroundColor: colors[i % colors.length] + '20',
            pointBackgroundColor: colors[i % colors.length],
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.3,
            fill: false,
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#D0D1DC', font: { size: 11, family: 'IBM Plex Sans' }, boxWidth: 12, padding: 12 } },
            tooltip: { backgroundColor: '#1C1E2A', titleColor: '#F0EFEA', bodyColor: '#D0D1DC', borderColor: '#2A2D3E', borderWidth: 1, padding: 10, bodyFont: { size: 12 }, titleFont: { size: 12, weight: '600' } },
          },
          scales: {
            x: { ticks: { color: '#74768A', font: { size: 11 } }, grid: { color: '#2A2D3E33' } },
            y: { ticks: { color: '#74768A', font: { size: 11 }, callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: '#2A2D3E33' } },
          },
        }
      });
    } catch(err) { showToast('Chart render error'); }
    return () => { if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; } };
  }, [rows, chartMetric, headers]);

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
            <div style={{ padding: '10px 20px 4px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{rows[chartMetric]?.label || 'Revenue'} Trend (₹ Cr)</div>
              <div style={{ position: 'relative', height: 250 }}>
                <canvas ref={chartRef} />
              </div>
            </div>
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
