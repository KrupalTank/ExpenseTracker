import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to remove non-Latin/non-ASCII characters for clean PDF output
const sanitizeTextForPDF = (text) => {
  if (!text) return '';
  // Replaces non-ASCII characters (like Gujarati script) and cleans up trailing slashes/spaces
  return text
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s*\/\s*$/, '')
    .trim();
};

export const generatePDFReport = (expenses, startDate, endDate) => {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(29, 78, 216); // Blue color
  doc.text('Expense Summary Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Period: ${startDate} to ${endDate}`, 14, 27);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 33);

  const monthlyTotals = {};
  const yearlyTotals = {};
  let grandTotal = 0;

  const tableData = expenses.map((exp) => {
    const amt = parseFloat(exp.amount);
    grandTotal += amt;

    const dateStr = exp.expense_date.substring(0, 10);
    const monthKey = dateStr.substring(0, 7); // YYYY-MM
    const yearKey = dateStr.substring(0, 4);  // YYYY

    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amt;
    yearlyTotals[yearKey] = (yearlyTotals[yearKey] || 0) + amt;

    return [
      dateStr,
      sanitizeTextForPDF(exp.title) || exp.title,
      sanitizeTextForPDF(exp.category) || 'General',
      `Rs. ${amt.toFixed(2)}`
    ];
  });

  // 1. Detailed Expenses Table
  doc.autoTable({
    startY: 38,
    head: [['Date', 'Title / Description', 'Category', 'Amount']],
    body: tableData,
    headStyles: { fillColor: [29, 78, 216] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 38 },
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  const monthKeys = Object.keys(monthlyTotals);
  const yearKeys = Object.keys(yearlyTotals);

  // 2. Month-wise Breakdown
  if (monthKeys.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text('Month-Wise Summary:', 14, finalY);

    const monthTableBody = monthKeys.map((m) => [m, `Rs. ${monthlyTotals[m].toFixed(2)}`]);

    doc.autoTable({
      startY: finalY + 4,
      head: [['Month (YYYY-MM)', 'Total Expense']],
      body: monthTableBody,
      headStyles: { fillColor: [51, 65, 85] },
      margin: { left: 14, right: 14 },
    });

    finalY = doc.lastAutoTable.finalY + 8;
  }

  // 3. Year-wise Breakdown
  if (yearKeys.length > 1) {
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text('Year-Wise Summary:', 14, finalY);

    const yearTableBody = yearKeys.map((y) => [y, `Rs. ${yearlyTotals[y].toFixed(2)}`]);

    doc.autoTable({
      startY: finalY + 4,
      head: [['Year (YYYY)', 'Total Expense']],
      body: yearTableBody,
      headStyles: { fillColor: [71, 85, 105] },
      margin: { left: 14, right: 14 },
    });

    finalY = doc.lastAutoTable.finalY + 8;
  }

  // 4. Grand Total Summary Card
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text(`Grand Total Expense: Rs. ${grandTotal.toFixed(2)}`, 14, finalY + 4);

  doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
};