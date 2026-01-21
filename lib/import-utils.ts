import ExcelJS from 'exceljs';
import type { NewPallet } from './db/schema';

/**
 * Parses an Excel file buffer and returns pallet data
 */
export async function parseExcelFile(buffer: ArrayBuffer): Promise<NewPallet[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet('PalletTracker') || workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('No worksheet found in Excel file');
  }

  const pallets: NewPallet[] = [];

  // Skip header row (row 1)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const jobNumber = row.getCell(1).text.trim();
    const releaseNumber = row.getCell(2).text.trim();
    const palletNumber = row.getCell(3).text.trim();

    if (!jobNumber || !releaseNumber || !palletNumber) {
      return; // Skip rows with missing required fields
    }

    const madeCell = row.getCell(6).text.trim();
    const made = madeCell.toLowerCase() === 'x' || madeCell.toLowerCase() === 'true';

    pallets.push({
      jobNumber,
      releaseNumber,
      palletNumber,
      size: row.getCell(4).text.trim() || '',
      elevation: row.getCell(5).text.trim() || '',
      made,
      accList: row.getCell(7).text.trim() || '',
      shippedDate: row.getCell(8).text.trim() || '',
      notes: row.getCell(9).text.trim() || '',
    });
  });

  console.log('[parseExcelFile] Parsed', pallets.length, 'pallets');
  return pallets;
}

/**
 * Parses a CSV file and returns pallet data
 */
export function parseCSV(csvText: string): NewPallet[] {
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const pallets: NewPallet[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    const jobNumber = values[0]?.trim();
    const releaseNumber = values[1]?.trim();
    const palletNumber = values[2]?.trim();

    if (!jobNumber || !releaseNumber || !palletNumber) {
      continue; // Skip rows with missing required fields
    }

    const madeValue = values[5]?.trim() || '';
    const made = madeValue.toLowerCase() === 'x' || madeValue.toLowerCase() === 'true';

    pallets.push({
      jobNumber,
      releaseNumber,
      palletNumber,
      size: values[3]?.trim() || '',
      elevation: values[4]?.trim() || '',
      made,
      accList: values[6]?.trim() || '',
      shippedDate: values[7]?.trim() || '',
      notes: values[8]?.trim() || '',
    });
  }

  console.log('[parseCSV] Parsed', pallets.length, 'pallets');
  return pallets;
}

/**
 * Parses a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
