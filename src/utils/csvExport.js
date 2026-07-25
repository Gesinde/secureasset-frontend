export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = ['Name', 'Category', 'Serial Number', 'Asset Tag', 'Department', 'Location', 'Status', 'Condition'];
  const rows = data.map((a) => [
    a.name, a.category, a.serialNumber, a.assetTag || '', a.department, a.location, a.status, a.condition || ''
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
