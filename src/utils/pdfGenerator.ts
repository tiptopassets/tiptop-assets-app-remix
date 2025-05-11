
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend the jsPDF types for the autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (data: any, fileName: string = 'download.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('TipTop Property Report', 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Convert data to table format
  if (data.properties) {
    doc.setFontSize(14);
    doc.text('Properties', 14, 45);
    
    doc.autoTable({
      startY: 50,
      head: [['Address', 'Type', 'Status', 'Revenue']],
      body: data.properties.map((prop: any) => [
        prop.address,
        prop.type,
        prop.status,
        `$${prop.revenue}`
      ]),
    });
  }
  
  if (data.earnings) {
    const startY = doc.previousAutoTable?.finalY || 50;
    doc.setFontSize(14);
    doc.text('Affiliate Earnings', 14, startY + 15);
    
    doc.autoTable({
      startY: startY + 20,
      head: [['Service', 'Earnings', 'Last Updated']],
      body: data.earnings.map((item: any) => [
        item.service,
        `$${item.earnings}`,
        new Date(item.updated_at).toLocaleDateString()
      ]),
    });
  }
  
  // Save the PDF
  doc.save(fileName);
};
