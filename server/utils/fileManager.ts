import fs from 'fs/promises';
import path from 'path';

// Get data directory path from environment variable, fallback to data folder in current working directory
export const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');

export const readJSONFile = async <T = unknown>(filename: string): Promise<T[]> => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error(`Error reading file ${filename}:`, error);
    throw error;
  }
};

export const writeJSONFile = async <T = unknown>(filename: string, data: T[]): Promise<void> => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error);
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error(`Permission denied: Cannot write to ${filePath}. Check directory permissions.`);
    }
    throw error;
  }
};
