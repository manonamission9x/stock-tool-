import { useState, useRef, useEffect } from 'react';
import { computeWC, fmtNum } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { useToast } from './Toast';
import { Masthead, Block, UploadBar, FieldGrid, Field, Toolbar, NextLinks, TrustBadge, EmptyState, MetricGrid } from './ui';
export default function WCTool({ switchTab }) {
  const showToast = useToast();
  const [rev, setRev] = usePersistedState('wc_rev', 5000);
  const [cogs, setCogs] = usePersistedState('wc_cogs', 3000);
  const [rec, setRec] = usePersistedState('wc_rec', 1200);
  const [inv, setInv] = usePersistedState('wc_inv', 800);
  const [pay, setPay] = usePersistedState('wc_pay', 600);
  const [cash, setCash] = usePersistedState('wc_cash', 200);
  const [res, setRes] = usePersistedState('wc_res', null);
  const csvRef = useRef(null);

  useEffect(() => { analyze(); }, []);

  function handleCsv(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const rows = text.split('\n').filter(Boolean);
        if (rows.length < 2) return;
        const vals = rows[1].split(',').map(s => parseFloat(s.trim()));
        if (vals.length >= 6) {
          setRev(vals[0] || 0); setCogs(vals[1] || 0); setRec(vals[2] || 0);
          setInv(vals[3] || 0); setPay(vals[4] || 0); setCash(vals[5] || 0);
          showToast('Loaded ' + vals.length + ' values');
        }
      } catch(err) { showToast('Error reading file: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function analyze() { setRes(computeWC(rev, cogs, rec, inv, pay, cash)); }
  function clear() { if (!confirm('Clear all data and results?')) return; setRev(0); setCogs(0); setRec(0); setInv(0); setPay(0); setCash(0); setRes(null); }

  return (
    <div>
      <Masthead title="Cash efficiency" desc="See how quickly cash moves through the business — DSO, DIO, DPO, and cash conversion cycle." />
      <div className="body">
        <UploadBar onUpload={handleCsv} hint="CSV: Revenue, COGS, Receivables, Inventory, Payables, Cash" />
        <Block label="Inputs (₹ Cr)">
          <FieldGrid>
            {[
              { l: 'Revenue (annual)', v: rev, s: setRev },
              { l: 'Cost of goods sold', v: cogs, s: setCogs },
              { l: 'Trade receivables', v: rec, s: setRec },
              { l: 'Inventory', v: inv, s: setInv },
              { l: 'Payables', v: pay, s: setPay },
              { l: 'Cash & equivalents', v: cash, s: setCash },
            ].map((f, i) => <Field key={i} label={f.l} value={f.v} onChange={f.s} />)}
          </FieldGrid>
          <Toolbar onClear={clear} onAction={analyze} actionLabel="Analyze" />
        </Block>

        {res && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{padding:'0 20px',fontSize:10,color:'var(--text-muted)',fontWeight:400,marginBottom:4}}>[Example] Replace with your company data</div>
            <Block label="Results">
              <MetricGrid metrics={[
                { label: 'DSO', value: Math.round(res.dso) + 'd', sub: 'Days to collect from customers', cls: res.dso > 90 ? 'warn' : '' },
                { label: 'DIO', value: Math.round(res.dio) + 'd', sub: 'Days inventory sits before sold', cls: res.dio > 120 ? 'warn' : '' },
                { label: 'DPO', value: Math.round(res.dpo) + 'd', sub: 'Days to pay suppliers', cls: res.dpo < 20 ? 'warn' : 'good' },
                { label: 'CCC', value: Math.round(res.ccc) + 'd', sub: 'DSO + DIO − DPO. Lower is better.' },
              ]} />
            </Block>
            <NextLinks links={[
              { label: 'Financial ratios', onClick: () => switchTab('tab-ratios') },
              { label: 'Estimate value', onClick: () => switchTab('tab-dcf') },
            ]} />
            <TrustBadge extra="CCC = DSO + DIO − DPO" />
          </div>
        )}

        {!res && <EmptyState title="Enter revenue, COGS, and balance sheet figures above, then click Analyze." desc="Or upload a CSV with: Revenue, COGS, Receivables, Inventory, Payables, Cash" />}
      </div>
    </div>
  );
}
