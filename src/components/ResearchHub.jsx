import { Masthead } from './ui';

const researchTools = [
  { id: 'tab-filing', title: 'Filing comparison', desc: 'Compare two periods in detail with risk flags.', cta: 'Open →' },
  { id: 'tab-trends', title: 'Trend charts', desc: 'Plot revenue, profit, or debt across 5+ periods.', cta: 'Open →' },
  { id: 'tab-yoy', title: 'Growth rates', desc: 'See which metrics are accelerating or slowing year over year.', cta: 'Open →' },
];

export default function ResearchHub({ switchTab }) {
  return (
    <div>
      <Masthead title="Research" desc="Research tools" />
      <div className="body" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {researchTools.map(t => (
            <div key={t.id} onClick={() => switchTab(t.id)} className="run-row" style={{ cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
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
