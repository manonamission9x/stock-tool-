import { Masthead } from './ui';

export default function ToolsHub({ switchTab }) {
  const toolItems = [
    { id: 'tab-peer', title: 'Peer comparison', desc: 'Compare metrics across up to 5 companies side by side.', cta: 'Open →' },
    { id: 'tab-wc', title: 'Cash efficiency', desc: 'Full working capital analysis with DSO, DIO, DPO.', cta: 'Open →' },
    { id: 'tab-ratios', title: 'Financial ratios', desc: '9 ratios across liquidity, leverage, profitability.', cta: 'Open →' },
  ];

  return (
    <div>
      <Masthead title="Tools" desc="Analysis tools" />
      <div className="body" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {toolItems.map(t => (
            <div key={t.id} onClick={() => switchTab(t.id)} style={{ cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.desc}</div>
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{t.cta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
