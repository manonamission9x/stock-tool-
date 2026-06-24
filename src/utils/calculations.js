// Filing comparison calculations
export function parseLines(text) {
  if (!text) return [];
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.includes(':'))
    .map(line => {
      const idx = line.indexOf(':');
      const raw = line.slice(idx + 1).trim();
      // Remove Indian-style commas and convert to number
      const cleaned = raw.replace(/,/g, '');
      return { label: line.slice(0, idx).trim(), value: cleaned };
    })
    .filter(item => item.label && item.value);
}

export function computeDiff(periodA, periodB) {
  const mapA = {}, mapB = {};
  periodA.forEach(p => mapA[p.label.toLowerCase()] = parseFloat(p.value));
  periodB.forEach(p => mapB[p.label.toLowerCase()] = parseFloat(p.value));

  const allLabels = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])];
  const diffs = [];

  allLabels.forEach(label => {
    const a = mapA[label];
    const b = mapB[label];
    const aVal = a !== undefined ? a : null;
    const bVal = b !== undefined ? b : null;
    const absA = aVal !== null ? Math.abs(aVal) : 0;
    const pct = (aVal !== null && bVal !== null && absA > 0) ? ((bVal - aVal) / absA) * 100 : null;
    const isPct = /margin|holding|ratio|rate|margin|tax|yield|return|cost.ratio|efficiency/i.test(label);
    diffs.push({
      label,
      a: aVal,
      b: bVal,
      pct,
      abs: aVal !== null && bVal !== null ? bVal - aVal : null,
      dir: pct !== null ? (pct > 1 ? 'up' : pct < -1 ? 'down' : 'flat') : 'flat',
      isPct: isPct && aVal !== null && aVal < 100
    });
  });

  diffs.sort((x, y) => Math.abs(y.pct || 0) - Math.abs(x.pct || 0));
  return diffs;
}

// DCF calculations
export function computeDCF(fcf, growth, years, discount, terminal, netDebt, shares, price) {
  const dr = discount / 100;
  const g = growth / 100;
  const tr = terminal / 100;
  // Guard: terminal growth must be less than WACC (with float safety)
  if (dr - tr < 0.0001) return null;
  const projected = [];

  let pvSum = 0;
  for (let y = 1; y <= years; y++) {
    const pfcf = fcf * Math.pow(1 + g, y);
    const df = 1 / Math.pow(1 + dr, y);
    const pv = pfcf * df;
    projected.push({ year: y, fcf: pfcf, df, pv });
    pvSum += pv;
  }

  const tv = (fcf * Math.pow(1 + g, years) * (1 + tr)) / (dr - tr);
  const pvTv = tv / Math.pow(1 + dr, years);
  const ev = pvSum + pvTv;
  const eq = ev - netDebt;
  const iv = eq / shares;
  const mos = price > 0 ? ((iv - price) / price) * 100 : 0;

  return { projected, pvSum, tv, pvTv, ev, eq, iv, mos };
}

// Working capital calculations
export function computeWC(revenue, cogs, receivables, inventory, payables, cash) {
  const dso = receivables !== null && revenue > 0 ? (receivables / revenue) * 365 : null;
  const dio = inventory !== null && cogs > 0 ? (inventory / cogs) * 365 : null;
  const dpo = payables !== null && cogs > 0 ? (payables / cogs) * 365 : null;
  const ccc = (dso || 0) + (dio || 0) - (dpo || 0);
  const nwc = ((receivables || 0) + (inventory || 0) + (cash || 0)) - (payables || 0);
  return { dso, dio, dpo, ccc, nwc };
}

// Ratio calculations
export function computeRatios(values) {
  const { revenue, cogs, netProfit, totalAssets, totalEquity, totalDebt,
    currentAssets, currentLiab, inventory, interest, ebit } = values;
  const results = [];

  const grossProfit = revenue !== null && cogs !== null ? revenue - cogs : null;

  // Liquidity
  if (currentAssets !== null && currentLiab !== null && currentLiab !== 0) {
    const cr = currentAssets / currentLiab;
    results.push({ section: 'Liquidity', label: 'Current Ratio', value: cr.toFixed(2) + 'x', cls: cr >= 1.5 ? 'good' : cr < 1 ? 'warn' : '' });
  }
  if (currentAssets !== null && currentLiab !== null && inventory !== null && currentLiab !== 0) {
    const qr = (currentAssets - inventory) / currentLiab;
    results.push({ section: 'Liquidity', label: 'Quick Ratio', value: qr.toFixed(2) + 'x', cls: qr >= 1 ? 'good' : qr < 0.5 ? 'warn' : '' });
  }

  // Leverage
  if (totalDebt !== null && totalEquity !== null && totalEquity !== 0) {
    const dte = totalDebt / totalEquity;
    results.push({ section: 'Leverage', label: 'Debt/Equity', value: dte.toFixed(2) + 'x', cls: dte < 1 ? 'good' : dte > 2 ? 'warn' : '' });
  }
  if (totalDebt !== null && totalAssets !== null && totalAssets !== 0) {
    const dar = totalDebt / totalAssets;
    results.push({ section: 'Leverage', label: 'Debt/Assets', value: (dar * 100).toFixed(1) + '%', cls: dar < 0.5 ? 'good' : dar > 0.7 ? 'warn' : '' });
  }
  if (ebit !== null && interest !== null && interest !== 0) {
    const icr = ebit / interest;
    results.push({ section: 'Leverage', label: 'Interest Coverage', value: icr.toFixed(1) + 'x', cls: icr > 3 ? 'good' : icr < 1.5 ? 'warn' : '' });
  }

  // Profitability
  if (grossProfit !== null && revenue !== null && revenue !== 0) {
    const gm = grossProfit / revenue;
    results.push({ section: 'Profitability', label: 'Gross Margin', value: (gm * 100).toFixed(1) + '%', cls: gm > 0.3 ? 'good' : gm < 0.15 ? 'warn' : '' });
  }
  if (netProfit !== null && revenue !== null && revenue !== 0) {
    const npm = netProfit / revenue;
    results.push({ section: 'Profitability', label: 'Net Profit Margin', value: (npm * 100).toFixed(1) + '%', cls: npm > 0.1 ? 'good' : npm < 0.03 ? 'warn' : '' });
  }
  if (netProfit !== null && totalEquity !== null && totalEquity !== 0) {
    const roe = netProfit / totalEquity;
    results.push({ section: 'Profitability', label: 'ROE', value: (roe * 100).toFixed(1) + '%', cls: roe > 0.15 ? 'good' : roe < 0.05 ? 'warn' : '' });
  }

  // Efficiency
  if (revenue !== null && totalAssets !== null && totalAssets !== 0) {
    const at = revenue / totalAssets;
    results.push({ section: 'Efficiency', label: 'Asset Turnover', value: at.toFixed(2) + 'x', cls: at > 1 ? 'good' : at < 0.5 ? 'warn' : '' });
  }

  return results;
}

// Helper: format number in Indian style
export function fmtINR(n) {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e7) return sign + '₹' + (abs / 1e7).toFixed(1) + ' Cr';
  if (abs >= 1e5) return sign + '₹' + (abs / 1e5).toFixed(1) + ' L';
  return sign + '₹' + abs.toLocaleString('en-IN');
}

export function fmtNum(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
