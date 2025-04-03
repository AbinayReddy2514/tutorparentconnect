
import { promises as fs } from 'fs';
import path from 'path';
import { parse, stringify } from 'csv-string';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Generic function to read CSV data
export async function readCSV<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.csv`);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = parse(data);
    
    if (parsed.length <= 1) {
      return [];
    }
    
    const headers = parsed[0];
    return parsed.slice(1).map(row => {
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item as T;
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

// Generic function to write CSV data
export async function writeCSV<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.csv`);
  
  if (data.length === 0) {
    await fs.writeFile(filePath, '', 'utf8');
    return;
  }
  
  const headers = Object.keys(data[0] as object);
  const rows = [headers];
  
  data.forEach(item => {
    const row: string[] = [];
    headers.forEach(header => {
      const value = (item as any)[header];
      row.push(value !== undefined && value !== null ? String(value) : '');
    });
    rows.push(row);
  });
  
  const csvContent = stringify(rows);
  await fs.writeFile(filePath, csvContent, 'utf8');
}

// Function to append to CSV without reading the whole file
export async function appendToCSV<T>(filename: string, item: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.csv`);
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Read just the first line to get headers
    const fileHandle = await fs.open(filePath, 'r');
    const firstLine = await readFirstLine(fileHandle);
    await fileHandle.close();
    
    const headers = parse(firstLine)[0];
    const row: string[] = [];
    
    headers.forEach(header => {
      const value = (item as any)[header];
      row.push(value !== undefined && value !== null ? String(value) : '');
    });
    
    const csvLine = stringify([row]);
    await fs.appendFile(filePath, csvLine, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, create it with headers and data
      const headers = Object.keys(item as object);
      const row = headers.map(header => (item as any)[header] || '');
      const csvContent = stringify([headers, row]);
      await fs.writeFile(filePath, csvContent, 'utf8');
    } else {
      throw err;
    }
  }
}

// Helper to read just the first line of a file
async function readFirstLine(fileHandle: fs.FileHandle): Promise<string> {
  const buffer = Buffer.alloc(1024);
  const { bytesRead } = await fileHandle.read(buffer, 0, 1024, 0);
  const content = buffer.toString('utf8', 0, bytesRead);
  const endOfLine = content.indexOf('\n');
  return endOfLine !== -1 ? content.slice(0, endOfLine) : content;
}
