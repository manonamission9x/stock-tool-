// Download data as a CSV file
export function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Format a number safely
export function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

// Validate a CSV parse and return error message or null
export function validateCSV(text, minCols) {
  if (!text || !text.trim()) return 'No data entered';
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return 'Need at least 2 rows (header + data)';
  const cols = lines[1].split(',').length;
  if (cols < minCols) return `Need at least ${minCols} columns, found ${cols}`;
  return null;
}

// Term definitions for inline tooltips
export const TERMS = {
  dso: { label: 'DSO', desc: 'Days Sales Outstanding — average days to collect payment from customers. Lower is better.' },
  dio: { label: 'DIO', desc: 'Days Inventory Outstanding — average days inventory sits before being sold.' },
  dpo: { label: 'DPO', desc: 'Days Payable Outstanding — average days to pay suppliers. Higher can preserve cash.' },
  ccc: { label: 'CCC', desc: 'Cash Conversion Cycle — DSO + DIO − DPO. Days from paying suppliers to collecting from customers.' },
  wacc: { label: 'WACC', desc: 'Weighted Average Cost of Capital — the blended return expected by all capital providers.' },
  ggm: { label: 'GGM', desc: 'Gordon Growth Model — calculates terminal value as FCF × (1+g) / (WACC − g). Assumes perpetual stable growth.' },
  iv: { label: 'Intrinsic Value', desc: 'Estimated fair value per share based on discounted future cash flows. Not a guarantee of market price.' },
  mos: { label: 'Margin of Safety', desc: 'Percentage discount from intrinsic value to current price. Larger margins reduce downside risk.' },
};
