import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Check if the code is running on the server
// This is a simple check that works in most cases
// For more robust detection, consider using a library like 'detect-node'
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

// Get the appropriate storage object (localStorage or sessionStorage)
// with fallback to memory storage if neither is available
export const getStorage = (type: 'local' | 'session' = 'local'): Storage => {
  if (isServer()) {
    // Return a mock storage object for server-side rendering
    const storage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    };
    return storage;
  }

  try {
    // Try to access the specified storage
    const storage = type === 'local' ? window.localStorage : window.sessionStorage;
    // Test if storage is accessible
    const testKey = '__test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    // If storage access throws (e.g., Safari in private mode), use memory storage
    console.warn(`Failed to access ${type}Storage, using memory storage as fallback`);
    
    // In-memory storage implementation
    const data: Record<string, string> = {};
    let length = 0;
    
    const storage: Storage = {
      get length() {
        return length;
      },
      clear: () => {
        Object.keys(data).forEach(key => delete data[key]);
        length = 0;
      },
      getItem: (key: string) => data[key] || null,
      key: (index: number) => Object.keys(data)[index] || null,
      removeItem: (key: string) => {
        if (key in data) {
          delete data[key];
          length = Object.keys(data).length;
        }
      },
      setItem: (key: string, value: string) => {
        if (!(key in data)) {
          length++;
        }
        data[key] = String(value);
      },
    };
    
    return storage;
  }
};
