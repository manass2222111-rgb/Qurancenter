
import { Student } from '../types';

const SHEET_ID = '1idfCJE2jQLzZzIyU8C0JN0Na0PxfoKq-mAP6_7Pz-L4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

/**
 * محرك معالجة CSV احترافي يتعامل مع النصوص المقتبسة والأسطر المتعددة داخل الخلية الواحدة
 */
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // إزالة رموز BOM المخفية التي قد توجد في ملفات جوجل
  const cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentField += '"';
      i++; // تخطي الاقتباس المزدوج
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (currentRow.length > 0 || currentField !== '') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
      }
      currentField = '';
      currentRow = [];
      if (char === '\r' && nextChar === '\n') i++; // تخطي \n في حال كان \r\n
    } else {
      currentField += char;
    }
  }

  // إضافة السطر الأخير إذا لم ينتهِ بفاصل سطر
  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
};

export const fetchSheetData = async (): Promise<Student[]> => {
  try {
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`فشل الاتصال بجدول البيانات: ${response.statusText}`);
    }

    const csvText = await response.text();
    const allRows = parseCSV(csvText);

    if (allRows.length === 0) return [];

    // فحص السطر الأول: إذا كان يحتوي على "اسم الدارس" أو "م" فهو سطر عناوين ويجب تخطيه
    const firstRowStr = JSON.stringify(allRows[0]);
    const hasHeader = firstRowStr.includes('اسم') || firstRowStr.includes('الدارس') || firstRowStr.includes('"م"');
    
    const dataRows = hasHeader ? allRows.slice(1) : allRows;

    // تصفية الأسطر التي قد تكون فارغة تماماً (نتيجة مساحات زائدة في جوجل شيت)
    const validRows = dataRows.filter(row => row.some(cell => cell.length > 0));

    console.log(`تم تحميل ${validRows.length} سجل طالب بنجاح.`);

    return validRows.map((row) => {
      return {
        id: row[0] || '',
        name: row[1] || '',
        nationality: row[2] || '',
        dob: row[3] || '',
        phone: row[4] || '',
        age: row[5] || '',
        qualification: row[6] || '',
        job: row[7] || '',
        address: row[8] || '',
        regDate: row[9] || '',
        level: row[10] || '',
        part: row[11] || '',
        nationalId: row[12] || '',
        category: row[13] || '',
        period: row[14] || '',
        expiryId: row[15] || '',
        teacher: row[16] || '',
        fees: row[17] || '',
        circle: row[18] || '',
        completion: row[19] || '',
      };
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};
