const LocalStorage = {
    setItem<T>(key: string, value: T): void {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    },

    getItem<T>(key: string): T | null {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return null;
        }
        try {
            return JSON.parse(serializedValue) as T;
        } catch (e) {
            console.error(`Error parsing value for key "${key}":`, e);
            return null;
        }
    },

    removeItem(key: string): void {
        localStorage.removeItem(key);
    },

    clear(): void {
        localStorage.clear();
    },

    getKeys(): string[] {
        return Object.keys(localStorage);
    },

    getLength(): number {
        return localStorage.length;
    }
};

export default LocalStorage;