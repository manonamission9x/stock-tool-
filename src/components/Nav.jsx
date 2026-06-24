export default function Nav({ activeTab, switchTab }) {
  const items = [
    { id: 'tab-home', label: 'Home' },
    { id: 'tab-research', label: 'Research' },
    { id: 'tab-dcf', label: 'Valuation' },
    { id: 'tab-tools', label: 'Tools' },
    { id: 'tab-about', label: 'About' },
  ];

  return (
    <nav className="nav" role="tablist" aria-label="Tool navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <svg className="nav-brand-logo" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect width="20" height="20" rx="5" fill="#4F6EF7"/>
            <path d="M5 14V6L10 10L15 6V14" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Fundalyst
        </div>
        {items.map(item => (
          <button
            key={item.id}
            className={`nav-tab${activeTab === item.id ? ' active' : ''}`}
            id={item.id.replace('tab-', '') + '-tab'}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={item.id}
            onClick={() => switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 13 }}>
          Sign in
        </div>
      </div>
    </nav>
  );
}
