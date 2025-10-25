export function exportToCsv(data, filename = 'transactions.csv') {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        // Escape quotes and wrap in quotes
        const value = row[fieldName]?.toString()?.replace(/"/g, '""') || '';
        return `"${value}"`;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDateForExport(date) {
  return new Date(date).toISOString();
}

export function formatTransactionForExport(tx) {
  return {
    'Transaction Hash': tx.hash,
    'Type': tx.type,
    'Amount': tx.amount,
    'Token': tx.token,
    'Status': tx.status,
    'Timestamp': formatDateForExport(tx.timestamp),
    'Block Number': tx.blockNumber || 'N/A',
    'From': tx.from || 'N/A',
    'To': tx.to || 'N/A',
    'Gas Used': tx.gasUsed || 'N/A',
    'Transaction Index': tx.transactionIndex || 'N/A'
  };
}
