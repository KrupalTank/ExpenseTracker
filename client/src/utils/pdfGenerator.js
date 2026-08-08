import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (expenses, startDate, endDate) => {
  // 1. Group Data for Summary
  const monthlyTotals = {};
  const yearlyTotals = {};
  let grandTotal = 0;

  expenses.forEach((exp) => {
    const amt = parseFloat(exp.amount);
    grandTotal += amt;

    const dateStr = exp.expense_date.substring(0, 10);
    const monthKey = dateStr.substring(0, 7);
    const yearKey = dateStr.substring(0, 4);

    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amt;
    yearlyTotals[yearKey] = (yearlyTotals[yearKey] || 0) + amt;
  });

  const monthKeys = Object.keys(monthlyTotals);
  const yearKeys = Object.keys(yearlyTotals);

  // 2. Create a temporary HTML container for PDF rendering
  const reportContainer = document.createElement('div');
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.top = '-9999px';
  reportContainer.style.width = '800px';
  reportContainer.style.padding = '30px';
  reportContainer.style.backgroundColor = '#ffffff';
  reportContainer.style.fontFamily = 'sans-serif';
  reportContainer.style.color = '#1e293b';

  // Build Report HTML markup preserving Gujarati text
  reportContainer.innerHTML = `
    <div style="border-bottom: 2px solid #1d4ed8; padding-bottom: 15px; margin-bottom: 20px;">
      <h1 style="color: #1d4ed8; font-size: 24px; margin: 0 0 5px 0;">KharchBook - Expense Summary Report</h1>
      <p style="font-size: 13px; color: #64748b; margin: 2px 0;">Period: <strong>${startDate}</strong> to <strong>${endDate}</strong></p>
      <p style="font-size: 13px; color: #64748b; margin: 2px 0;">Generated on: ${new Date().toLocaleDateString()}</p>
    </div>

    <!-- Expenses Table -->
    <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 10px;">Itemized Expenses</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
      <thead>
        <tr style="background-color: #1d4ed8; color: #ffffff; text-align: left;">
          <th style="padding: 10px; border: 1px solid #1d4ed8;">Date</th>
          <th style="padding: 10px; border: 1px solid #1d4ed8;">Title / Description</th>
          <th style="padding: 10px; border: 1px solid #1d4ed8;">Category</th>
          <th style="padding: 10px; border: 1px solid #1d4ed8; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${expenses
          .map(
            (exp, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 10px;">${exp.expense_date.substring(0, 10)}</td>
            <td style="padding: 8px 10px; font-weight: 500;">${exp.title}</td>
            <td style="padding: 8px 10px;">${exp.category || 'General'}</td>
            <td style="padding: 8px 10px; text-align: right; font-weight: bold;">₹${parseFloat(exp.amount).toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    ${
      monthKeys.length > 0
        ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 8px;">Month-Wise Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #334155; color: #ffffff; text-align: left;">
              <th style="padding: 8px 10px;">Month</th>
              <th style="padding: 8px 10px; text-align: right;">Total Expense</th>
            </tr>
          </thead>
          <tbody>
            ${monthKeys
              .map(
                (m) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 10px;">${m}</td>
                <td style="padding: 8px 10px; text-align: right; font-weight: bold;">₹${monthlyTotals[m].toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
        : ''
    }

    ${
      yearKeys.length > 1
        ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 8px;">Year-Wise Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #475569; color: #ffffff; text-align: left;">
              <th style="padding: 8px 10px;">Year</th>
              <th style="padding: 8px 10px; text-align: right;">Total Expense</th>
            </tr>
          </thead>
          <tbody>
            ${yearKeys
              .map(
                (y) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 10px;">${y}</td>
                <td style="padding: 8px 10px; text-align: right; font-weight: bold;">₹${yearlyTotals[y].toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
        : ''
    }

    <!-- Grand Total Card -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: right;">
      <span style="font-size: 14px; color: #1e40af; font-weight: 600;">Grand Total Expense: </span>
      <span style="font-size: 18px; color: #1d4ed8; font-weight: 800; margin-left: 10px;">₹${grandTotal.toFixed(2)}</span>
    </div>
  `;

  document.body.appendChild(reportContainer);

  try {
    // 3. Render container to high-res canvas image
    const canvas = await html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // 4. Calculate layout pages in jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
  } finally {
    // Clean up temporary DOM element
    document.body.removeChild(reportContainer);
  }
};