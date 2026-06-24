export function Masthead({ title, desc }) {
  return (
    <div className="masthead">
      <div>
        <h1>{title}</h1>
        <div className="tool-desc">{desc}</div>
      </div>
    </div>
  );
}

export function Block({ label, children, style }) {
  return (
    <div className="block" style={style}>
      {label && <div className="block-header"><span className="block-label">{label}</span></div>}
      {children}
    </div>
  );
}

export function UploadBar({ onUpload, hint }) {
  return (
    <div className="upload-bar">
      <label className="upload-label">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7 2v10M2 7h10"/></svg>
        Upload CSV
        <input type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={onUpload} />
      </label>
      <span className="sep">·</span>
      <span className="hint">{hint || 'Select a CSV file'}</span>
    </div>
  );
}

export function Field({ label, value, onChange, hint }) {
  return (
    <div className="wc-field">
      <div className="wc-field-label">{label}</div>
      <input type="number" className="num-input" value={value !== null && value !== '' ? value : ''} onChange={e => onChange(e.target.value === '' ? '' : +e.target.value)} />
      {hint && <div className="wc-field-hint">{hint}</div>}
    </div>
  );
}

export function FieldGrid({ children }) {
  return <div className="wc-grid" style={{ padding: '14px 20px' }}>{children}</div>;
}

export function Toolbar({ onClear, onAction, actionLabel, hint, isLoading }) {
  return (
    <div className="run-row">
      {onClear && <button type="button" onClick={onClear}>Clear</button>}
      {hint && <span className="hint">{hint}</span>}
      {onAction && <button type="button" className="primary" disabled={isLoading} style={{ marginLeft: 'auto' }} onClick={onAction}>{isLoading ? 'Working...' : actionLabel}</button>}
    </div>
  );
}

export function NextLinks({ links }) {
  return (
    <div className="next-links">
      <span className="label">Next:</span>
      {links.map((l, i) => (
        <span key={i}>
          <a onClick={l.onClick}>{l.label} →</a>
        </span>
      ))}
    </div>
  );
}

export function TrustBadge({ extra }) {
  return (
    <div className="trust-badge">
      <span>Calculated in browser · No data uploaded</span>
      {extra && <span>{extra}</span>}
    </div>
  );
}

export function EmptyState({ title, desc }) {
  return (
    <Block style={{ marginTop: '1.5rem' }}>
      <div className="empty-state-guide">
        <strong>{title}</strong>
        <div>{desc}</div>
      </div>
    </Block>
  );
}

export function MetricGrid({ metrics }) {
  return (
    <div className="wc-results-grid">
      {metrics.map((m, i) => (
        <div className={'wc-metric' + (m.cls ? ' ' + m.cls : '')} key={i}>
          <div className="wc-metric-label">{m.label}</div>
          <div className={'wc-metric-value' + (m.cls ? ' ' + m.cls : '')}>{m.value}</div>
          {m.sub && <div className="wc-metric-sub">{m.sub}</div>}
        </div>
      ))}
    </div>
  );
}
