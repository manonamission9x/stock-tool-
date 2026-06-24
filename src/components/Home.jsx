import { useRef } from 'react';
import DotMap from './DotMap';

const features = [
  { id: 'tab-filing', title: 'Compare Periods', desc: 'Compare two reporting periods. Filing comparison shows revenue up 23%, net profit down 16%, debt up 44%. Risk flags catch margin compression, pledge increases, and sudden debt jumps.', cta: 'Analyze →', svg: '<rect x="3" y="7" width="5" height="9" rx="1"/><rect x="12" y="4" width="5" height="12" rx="1"/><path d="M5.5 12l2-2 2 2"/><path d="M14.5 8l2 2-2 2"/>' },
  { id: 'tab-trends', title: 'Spot Business Momentum', desc: 'Plot any metric across 5 years and spot inflection points. Enter revenue, profit, or debt data — interactive line and bar charts update instantly as you edit.', cta: 'Visualize →', svg: '<path d="M2 17l5-7 5 3 6-8"/><circle cx="7" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="5" r="1.5" fill="currentColor" stroke="none"/>' },
  { id: 'tab-dcf', title: 'Estimate Intrinsic Value', desc: 'Estimate what a business is worth. Enter free cash flow, growth rate, and discount assumptions. The model projects cash flows and calculates intrinsic value per share with a sensitivity table.', cta: 'Value →', svg: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/>' },
  { id: 'tab-yoy', title: 'Track Growth Rates', desc: 'See whether revenue and profit are accelerating or slowing. Enter data across 5 years — growth rates are computed automatically with colour-coded bars.', cta: 'Measure →', svg: '<path d="M3 17l3-6 4 3 7-10"/><circle cx="6" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="13" r="1.5" fill="currentColor" stroke="none"/><circle cx="17" cy="4" r="1.5" fill="currentColor" stroke="none"/>' },
  { id: 'tab-peer', title: 'Find Industry Leaders', desc: 'See how a company stacks up against competitors. Compare up to 5 companies side-by-side across revenue, profit, and margins. Best and worst values are auto-highlighted.', cta: 'Compare →', svg: '<rect x="2" y="5" width="5" height="10" rx="1"/><rect x="8" y="8" width="5" height="7" rx="1"/><rect x="14" y="3" width="4" height="12" rx="1"/><path d="M4.5 12l3-3 3 3"/>' },
  { id: 'tab-wc', title: 'Analyze Cash Flow', desc: 'See if cash is getting trapped in inventory or receivables. Enter revenue, COGS, receivables, inventory, and payables — the tool calculates DSO, DIO, DPO, and the cash conversion cycle.', cta: 'Review →', svg: '<circle cx="10" cy="11" r="6"/><path d="M10 4v7l3 2.5"/>' },
  { id: 'tab-ratios', title: 'Measure Financial Health', desc: 'Assess overall financial health. Enter balance sheet and income data — the tool computes liquidity, leverage, profitability, and efficiency ratios with colour-coded warnings outside healthy ranges.', cta: 'Assess →', svg: '<rect x="3" y="4" width="5" height="5" rx="1"/><rect x="12" y="4" width="5" height="5" rx="1"/><rect x="3" y="12" width="5" height="5" rx="1"/><rect x="12" y="12" width="5" height="5" rx="1"/><circle cx="5.5" cy="6.5" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>' },
];

export default function Home({ switchTab }) {
  return (
    <div className="home-hero">
      <DotMap />
      <h1>Upload financial statements. Get a complete company analysis in seconds.</h1>
      <p className="home-subtitle">Compare periods, detect risks, estimate intrinsic value, and benchmark competitors — all from data you control. No uploads to external servers.</p>

      <div className="home-cta-row">
        <button className="home-cta-primary" onClick={() => switchTab && switchTab('tab-trends')}>Analyze a company</button>
      </div>

      {/* Preview card */}
      <div className="hero-preview">
        <div className="hero-preview-header">
          <span className="hero-preview-dot"></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '1px 6px', border: '1px solid var(--border)', borderRadius: 2, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Example</span>
            Workflow: Upload → Compare → Value → Decide
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sample Co.</span>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 24 }}>
          <div style={{ flex: 1.4 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Step 2 · Period Comparison</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Sample Co. · Q4 FY25 → Q4 FY26</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Revenue (TTM)', value: '₹1,530 Cr', sub: '+23.4% YoY · accelerating', cls: 'good' },
                { label: 'Net Profit', value: '₹119 Cr', sub: '−16.2% YoY · under pressure', cls: 'warn' },
                { label: 'EBITDA Margin', value: '14.6%', sub: '−3.6pp · compressed', cls: 'warn' },
                { label: 'Market Cap', value: '₹24,446 Cr', sub: 'Sector: Industrials' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{m.value}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: m.cls === 'good' ? 'var(--green)' : m.cls === 'warn' ? 'var(--red)' : 'var(--text-tertiary)', marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Revenue Trend (₹ Cr)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 40 }}>
                {[{l:'FY22',h:55},{l:'FY23',h:65},{l:'FY24',h:72},{l:'FY25',h:82},{l:'FY26',h:100}].map((b,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <div style={{ width:'100%', height:`${b.h}%`, background:'rgba(79,110,247,0.4)', borderRadius:2 }}></div>
                    <span style={{ fontSize:8, fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{b.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Step 3 · DCF Valuation</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Intrinsic value vs market price</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>DCF Valuation</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>Intrinsic Value</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>₹612</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>Current Price</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>₹450</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>Margin of Safety</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>+35.9%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>Rating</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>Undervalued ✓</span>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Investment Thesis</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                "Revenue growing but margin compression and rising debt flagged. Intrinsic value ₹612 vs ₹450 suggests +36% upside. Monitor pledge."
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Key Risks</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(229,72,77,0.05)', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 500, padding: '1px 6px', border: '1px solid var(--red)', borderRadius: 2 }}>High</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Debt +43.9% · Margin −3.6pp</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(203,163,68,0.05)', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--yellow)', fontWeight: 500, padding: '1px 6px', border: '1px solid var(--yellow)', borderRadius: 2 }}>Med</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Promoter pledge increased</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow steps */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: '2rem', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
        {['Upload filings', 'Compare periods', 'DCF value company', 'Investment decision'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '1px 6px', border: '1px solid var(--border)', borderRadius: 2, color: i === 3 ? 'var(--green)' : 'var(--text-muted)' }}>{i + 1}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: i === 3 ? 'var(--green)' : 'var(--text-tertiary)', fontWeight: i === 3 ? 500 : 400 }}>{step}</span>
            {i < 3 && <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>→</span>}
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div id="home-features" className="home-grid">
        {features.map(f => (
          <div key={f.id} className="home-card" onClick={() => switchTab(f.id)}>
            <span className="home-card-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: f.svg }} />
            </span>
            <span className="home-card-title">{f.title}</span>
            <span className="home-card-desc">{f.desc}</span>
            <span className="home-card-cta">{f.cta}</span>
          </div>
        ))}
      </div>

      {/* Continue where you left off */}
      <ContinueSection switchTab={switchTab} />
    </div>
  );
}

function ContinueSection({ switchTab }) {
  const stored = (() => {
    try {
      const raw = localStorage.getItem('fundalyst_last_tab');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  })();

  if (!stored || stored.id === 'tab-home') return null;

  const label = stored.id
    .replace('tab-', '')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/-/g, ' ');

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '12px 20px',
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <button
        onClick={() => switchTab(stored.id)}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '8px 18px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        ↳ Continue your analysis · {label}
      </button>
    </div>
  );
}
