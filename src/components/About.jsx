import { Masthead, Block, NextLinks } from './ui';

export default function About() {
  return (
    <div>
      <Masthead title="About" desc="Fundalyst is a browser-based financial analysis tool. All calculations run locally — no server uploads." />
      <div className="body">
        <Block label="How it works">
          <div style={{ padding: '14px 20px', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 8px' }}>Fundalyst runs entirely in your browser. You paste or upload financial data, and the tools compute the analysis locally using standard financial formulas. Nothing is sent to a server.</p>
            <p style={{ margin: 0 }}>The numbers you see are based on your data and your assumptions. Always verify calculations independently before making investment decisions.</p>
          </div>
        </Block>

        <Block label="Tools">
          <div style={{ padding: '14px 20px', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {[
              { t: 'Filing comparison', d: 'Compares two reporting periods line by line. Calculates absolute and percentage changes. Risk flags are generated for large shifts in debt, margins, pledges, and revenue.' },
              { t: 'DCF Valuation', d: 'Discounts projected free cash flows (5 years) and a Gordon Growth terminal value back to present. Shows intrinsic value per share, margin of safety, and a sensitivity table varying growth vs discount rate.' },
              { t: 'Working capital', d: 'Computes Days Sales Outstanding, Days Inventory Outstanding, Days Payable Outstanding, and the Cash Conversion Cycle. Flags are raised when DSO exceeds 90 days or DPO falls below 20 days.' },
              { t: 'Financial ratios', d: 'Nine standard ratios across liquidity (Current, Quick), leverage (D/E, D/A, Interest Coverage), profitability (Gross Margin, Net Margin, ROE), and efficiency (Asset Turnover). Colour-coded warnings outside healthy ranges.' },
              { t: 'Peer comparison', d: 'Compare up to 5 companies across revenue, profit, assets, and debt. Best and worst values are auto-highlighted in green and red.' },
              { t: 'Trend charts', d: 'Plot metrics across multiple periods. Enter data as CSV rows — the tool parses and displays a table. (Chart rendering via Chart.js planned.)' },
              { t: 'Growth rates', d: 'Computes year-over-year percentage change for each metric. Positive growth in green, negative in red.' },
            ].map((tool, i) => (
              <div key={i} className="run-row" style={{ marginBottom: i < 6 ? 10 : 0 }}>
                <strong style={{ color: 'var(--text)', fontSize: 12 }}>{tool.t}</strong>
                <div style={{ marginTop: 3 }}>{tool.d}</div>
              </div>
            ))}
          </div>
        </Block>

        <Block label="Disclaimer">
          <div style={{ padding: '14px 20px', fontSize: 11, lineHeight: 1.7, color: 'var(--text-muted)' }}>
            Fundalyst is a research tool. It does not provide financial advice. All outputs are based on user-provided data and standard financial formulas. Always consult a qualified financial advisor before making investment decisions. Past performance is not indicative of future results. The Gordon Growth Model assumes perpetual stable growth; real businesses do not grow at constant rates forever.
          </div>
        </Block>
        <NextLinks links={[{ label: 'Start analyzing', onClick: () => switchTab('tab-research') }]} />
      </div>
    </div>
  );
}
