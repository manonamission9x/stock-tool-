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

// Parse Excel (.xlsx) file and return text as CSV
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const csv = json.filter(r => r.length > 0).map(r => r.join(',')).join('\n');
        resolve(csv);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Read a file (CSV or Excel) and return text content
export function readFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
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
