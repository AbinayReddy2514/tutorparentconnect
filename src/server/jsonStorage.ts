
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Generic function to read JSON data
export async function readJSON<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

// Generic function to write JSON data
export async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Function to append to JSON without reading the whole file
export async function appendToJSON<T>(filename: string, item: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Read existing data
    const data = await readJSON<T>(filename);
    
    // Append new item
    data.push(item);
    
    // Write data back
    await writeJSON(filename, data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, create it with the item
      await writeJSON(filename, [item]);
    } else {
      throw err;
    }
  }
}
