export class LocalStorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'LocalStorageError';
  }
}

export function getItem<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new LocalStorageError('Storage quota exceeded. Please clear browser storage or use a different browser.', error);
    }
    throw new LocalStorageError(`Failed to read from localStorage: ${key}`, error);
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new LocalStorageError('Storage quota exceeded. Please clear browser storage or use a different browser.', error);
    }
    throw new LocalStorageError(`Failed to write to localStorage: ${key}`, error);
  }
}

export function removeItem(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch (error) {
    throw new LocalStorageError(`Failed to remove from localStorage: ${key}`, error);
  }
}

export function clear(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  } catch (error) {
    throw new LocalStorageError('Failed to clear localStorage', error);
  }
}









