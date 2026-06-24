import { useRef, useEffect } from 'react';
import { computeRatios } from '../utils/calculations';
import { useToast } from './Toast';
import { usePersistedState } from '../hooks/usePersistedState';
import { downloadCSV } from '../utils/helpers';
import { Masthead, Block, UploadBar, FieldGrid, Field, Toolbar, NextLinks, TrustBadge, EmptyState } from './ui';
export default function RatiosTool({ switchTab }) {
  const showToast = useToast();
  const [d, setD] = usePersistedState('ratios_d', { revenue: 5000, cogs: 3000, netProfit: 500, totalAssets: 8000, totalEquity: 4000, totalDebt: 1500, currentAssets: 3000, currentLiab: 1500, inventory: 800, interest: 200, ebit: 800 });
  const [res, setRes] = usePersistedState('ratios_res', null);

  useEffect(() => { analyze(); }, []);

  const fields = [
    { k: 'revenue', l: 'Revenue' }, { k: 'cogs', l: 'COGS' }, { k: 'netProfit', l: 'Net profit' },
    { k: 'totalAssets', l: 'Total assets' }, { k: 'totalEquity', l: 'Total equity' }, { k: 'totalDebt', l: 'Total debt' },
    { k: 'currentAssets', l: 'Current assets' }, { k: 'currentLiab', l: 'Current liabilities' }, { k: 'inventory', l: 'Inventory' },
    { k: 'interest', l: 'Interest expense' }, { k: 'ebit', l: 'EBIT' },
  ];

  function handleCsv(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = ev.target.result.split('\n').filter(Boolean);
        if (rows.length < 2) return;
        const vals = rows[1].split(',').map(s => parseFloat(s.trim()));
        const keys = ['revenue','cogs','netProfit','totalAssets','totalEquity','totalDebt','currentAssets','currentLiab','inventory','interest','ebit'];
        if (vals.length >= 11) {
          const nd = {}; keys.forEach((k, i) => nd[k] = vals[i] || 0);
          setD(nd); showToast('Loaded all values');
        }
      } catch(err) { showToast('Error reading file: ' + err.message); }
    };
    reader.readAsText(file); e.target.value = '';
  }

  function analyze() { setRes(computeRatios(d)); }
  function clear() {
    if (!confirm('Clear all data and results?')) return;
    setD({ revenue: 0, cogs: 0, netProfit: 0, totalAssets: 0, totalEquity: 0, totalDebt: 0, currentAssets: 0, currentLiab: 0, inventory: 0, interest: 0, ebit: 0 });
    setRes(null);
  }

  const sections = res ? [...new Set(res.map(r => r.section))] : [];

  return (
    <div>
      <Masthead title="Financial ratios" desc="Liquidity, leverage, profitability, and efficiency — 9 ratios with colour-coded warnings." />
      <div className="body">
        <UploadBar onUpload={handleCsv} hint="CSV: Revenue, COGS, Net Profit, Assets, Equity, Debt, Current Assets, Current Liab, Inventory, Interest, EBIT" />

        <Block label="Inputs">
          <FieldGrid>
            {fields.map(f => <Field key={f.k} label={f.l} value={d[f.k]} onChange={v => setD({ ...d, [f.k]: v })} />)}
          </FieldGrid>
          <Toolbar onClear={clear} onAction={analyze} actionLabel="Calculate" />
        </Block>

        {res && sections.map(s => (
          <Block key={s} label={s} style={{ marginTop: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '14px 20px' }}>
              {res.filter(r => r.section === s).map((r, i) => (
                <div className={'wc-metric' + (r.cls ? ' ' + r.cls : '')} key={i}>
                  <div className="wc-metric-label">{r.label}</div>
                  <div className={'wc-metric-value' + (r.cls ? ' ' + r.cls : '')}>{r.value}</div>
                </div>
              ))}
            </div>
          </Block>
        ))}

        {res && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => downloadCSV('ratios.csv', [['Section', 'Metric', 'Value'], ...res.map(r => [r.section, r.label, r.value])])}>
              Download CSV
            </button>
          </div>
        )}

        {res && (
          <div style={{ marginTop: '1.5rem' }}>
            <NextLinks links={[
              { label: 'Cash efficiency', onClick: () => switchTab('tab-wc') },
              { label: 'Estimate value', onClick: () => switchTab('tab-dcf') },
            ]} />
            <TrustBadge />
          </div>
        )}

        {!res && <EmptyState title="Enter balance sheet and income data above, then click Calculate." desc="Or upload a CSV with all 11 values in the order shown above." />}
      </div>
    </div>
  );
}
