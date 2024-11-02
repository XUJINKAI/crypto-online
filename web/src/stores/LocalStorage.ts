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

    getSortedUniqueArrayRef<T>(key: string) {
        const real_key = this.getKey(key);
        return new LocalStorageSortedUniqueArray<T>(real_key);
    }
};

type ArrayItem<T> = {
    value: T;
    timestamp: number;
}

function SortData<T>(data: ArrayItem<T>[]) {
    data.sort((a, b) => -(a.timestamp - b.timestamp));
}
function LimitData<T>(data: ArrayItem<T>[], limit: number) {
    data.splice(0, data.length - limit);
}

export class LocalStorageSortedUniqueArray<T> {
    private _key: string;
    private _data = ref<ArrayItem<T>[]>([]);
    private _limit = 10;

    private RetriveData() {
        return GetLocalStorage<ArrayItem<T>[]>(this._key) || [];
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
        this._data.value = this._data.value.filter(item => item.value !== value);
        this._data.value.push({ value: toRaw(value) as UnwrapRef<T>, timestamp: Date.now() });
        // const find = this._data.value.find(item => item.value === value);
        // if (find) {
        //     find.timestamp = Date.now();
        // } else {
        //     this._data.value.push({ value: value as UnwrapRef<T>, timestamp: Date.now() });
        // }
        SortData(this._data.value);
        LimitData(this._data.value, this._limit);
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

    constructor(key: string) {
        this._key = key;
        const _data = this.RetriveData();
        SortData(_data);
        this._data.value = _data;
    };
}
