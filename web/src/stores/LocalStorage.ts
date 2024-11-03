import { computed, ref, toRaw, type UnwrapRef } from "vue";

function ensureSuffix(path: string, suffix: string = '_') {
    if (path.length === 0) {
        return "";
    }
    if (path[path.length - 1] === suffix) {
        return path;
    }
    return path + suffix;
}

export function SetLocalStorage<T>(key: string, value: T | null) {
    if (value === null) {
        localStorage.removeItem(key);
        return;
    }
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
}

export function GetLocalStorage<T>(key: string): T | null {
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
}

export class LocalStorageSection {
    private _prefix: string;

    constructor(prefix: string) {
        this._prefix = ensureSuffix(prefix);
    }

    get prefix() { return this._prefix; }

    get data() {
        const data = {};
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith(this._prefix)) {
                data[key] = GetLocalStorage(key);
            }
        }
        return data;
    }

    getKey(key: string) {
        return this._prefix + key;
    }

    clear() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith(this._prefix)) {
                localStorage.removeItem(key);
            }
        }
    }

    setItem<T>(key: string, value: T | null): void {
        const real_key = this.getKey(key);
        SetLocalStorage(real_key, value);
    }

    getItem<T>(key: string): T | null {
        const real_key = this.getKey(key);
        return GetLocalStorage<T>(real_key);
    }

    getSubSection(key: string) {
        const real_key = this.getKey(key);
        return new LocalStorageSection(real_key);
    }

    getValueRef<T>(key: string) {
        const real_key = this.getKey(key);
        return computed<T | null>({
            get: () => {
                return GetLocalStorage<T>(real_key);
            },
            set: (value: T | null) => {
                SetLocalStorage(real_key, value);
            }
        });
    }

    getSortedUniqueArrayRef<T>(key: string, limit: number = 10, fn_ItemEqual?: (a: T, b: T) => boolean) {
        const real_key = this.getKey(key);
        return new LocalStorageSortedUniqueArray<T>(real_key, limit, fn_ItemEqual);
    }
};

type ArrayItem<T> = {
    value: T;
    timestamp: number;
}

export class LocalStorageSortedUniqueArray<T> {
    private _key: string;
    private _limit: number;
    private _fn_ItemEqual: (a: T, b: T) => boolean;
    private _data = ref<ArrayItem<T>[]>([]);

    private RetriveData() {
        return GetLocalStorage<ArrayItem<T>[]>(this._key) || [];
    }
    private SortData() {
        this._data.value.sort((a, b) => -(a.timestamp - b.timestamp));
    }
    private LimitData() {
        this._data.value.splice(0, this._data.value.length - this._limit);
    }
    private SaveData() {
        SetLocalStorage(this._key, this._data.value);
    }

    get key() { return this._key; }
    get data() { return this._data; }

    Find(predict: (value: T) => boolean): T | null {
        const item = this._data.value.find(item => predict(item.value as T));
        return item ? item.value as T : null;
    }

    Push(value: T) {
        this._data.value = this._data.value.filter(item => !this._fn_ItemEqual(item.value as T, value));
        this._data.value.push({ value: toRaw(value) as UnwrapRef<T>, timestamp: Date.now() });
        this.SortData();
        this.LimitData();
        this.SaveData();
    }

    Remove(value: T) {
        this._data.value = this._data.value.filter(item => item.value !== value);
        this.SaveData();
    }

    Clear() {
        this._data.value = [];
        this.SaveData();
    }

    constructor(key: string, limit: number, fn_ItemEqual?: (a: T, b: T) => boolean) {
        this._key = key;
        this._limit = limit;
        this._fn_ItemEqual = fn_ItemEqual ?? ((a, b) => a === b);
        const _data = this.RetriveData();
        this.SortData();
        this._data.value = _data;
    };
}
