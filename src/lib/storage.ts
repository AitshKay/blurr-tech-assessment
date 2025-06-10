export const createSafeStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: (name: string): string | null => null,
      setItem: (name: string, value: string) => {},
      removeItem: (name: string) => {},
      length: 0,
      clear: () => {},
      key: (index: number) => null,
    };
  }
  
  try {
    // Test if localStorage is available
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    // Fallback to memory storage
    const data: Record<string, string> = {};
    return {
      getItem: (key: string) => data[key] || null,
      setItem: (key: string, value: string) => {
        data[key] = String(value);
      },
      removeItem: (key: string) => {
        delete data[key];
      },
      length: Object.keys(data).length,
      clear: () => {
        Object.keys(data).forEach(key => delete data[key]);
      },
      key: (index: number) => Object.keys(data)[index] || null,
    };
  }
};
