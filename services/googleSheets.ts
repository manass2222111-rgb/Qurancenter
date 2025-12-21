
import { Student } from '../types';

const SHEET_ID = '1idfCJE2jQLzZzIyU8C0JN0Na0PxfoKq-mAP6_7Pz-L4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

// الحصول على رابط السكريبت من ذاكرة المتصفح
export const getScriptUrl = () => localStorage.getItem('google_script_url') || '';
export const setScriptUrl = (url: string) => localStorage.setItem('google_script_url', url);

const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentField += '"';
      i++;
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
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }

  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
};

export const fetchSheetData = async (): Promise<Student[]> => {
  try {
    const response = await fetch(`${CSV_URL}&t=${Date.now()}`); // إضافة timestamp لمنع الكاش
    if (!response.ok) throw new Error(`فشل الاتصال: ${response.statusText}`);
    const csvText = await response.text();
    const allRows = parseCSV(csvText);
    if (allRows.length === 0) return [];

    const firstRowStr = JSON.stringify(allRows[0]);
    const hasHeader = firstRowStr.includes('اسم') || firstRowStr.includes('الدارس');
    const dataRows = hasHeader ? allRows.slice(1) : allRows;

    return dataRows.filter(row => row.some(cell => cell.length > 0)).map((row) => ({
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
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const addStudentToSheet = async (student: Student): Promise<boolean> => {
  const SCRIPT_URL = getScriptUrl();
  
  if (!SCRIPT_URL) {
    console.error("لم يتم ضبط رابط Google Apps Script.");
    return false;
  }

  try {
    // إرسال البيانات كـ FormData لسهولة التعامل مع Apps Script
    const formData = new URLSearchParams();
    Object.entries(student).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    // في وضع no-cors لا نستطيع قراءة الاستجابة، سنفترض النجاح إذا لم يحدث Error
    return true;
  } catch (error) {
    console.error('Error saving to sheet:', error);
    return false;
  }
};
