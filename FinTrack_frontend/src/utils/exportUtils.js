/**
 * Escapes a cell value for standard RFC 4180 CSV compliance
 */
const escapeCSVCell = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Exports an array of transaction objects into a downloadable CSV file.
 * @param {Array<Object>} transactions
 * @param {string} filenamePrefix
 */
export const exportTransactionsToCSV = (transactions = [], filenamePrefix = 'fintrack-transactions') => {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions available to export for the selected period.');
  }

  const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];

  const rows = transactions.map((t) => {
    const formattedDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    const formattedType = t.type ? t.type.toUpperCase() : '';
    const formattedAmount = typeof t.amount === 'number' ? t.amount.toFixed(2) : t.amount;

    return [
      escapeCSVCell(t._id || ''),
      escapeCSVCell(formattedDate),
      escapeCSVCell(formattedType),
      escapeCSVCell(t.category || ''),
      escapeCSVCell(formattedAmount),
      escapeCSVCell(t.description || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');

  // Create Blob with UTF-8 BOM so Excel opens special characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}-${timestamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
};

/**
 * Triggers native browser print dialog for PDF generation
 */
export const printReport = () => {
  window.print();
};
