export function Base64Encode(str: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            const array = new TextEncoder().encode(str);
            const binString = Array.from(array, (byte) =>
                String.fromCodePoint(byte),
            ).join("");
            const b64 = btoa(binString);
            resolve(b64);
        }
        catch (e) {
            reject(e);
        }
    });
}

export function Base64Decode(str: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            const binString = atob(str);
            const array = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
            const text = new TextDecoder().decode(array);
            resolve(text);
        }
        catch (e) {
            reject(e);
        }
    });
}
