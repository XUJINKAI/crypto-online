export function Base64Encode(str: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            resolve(btoa(str));
        }
        catch (e) {
            reject(e);
        }
    });
}

export function Base64Decode(str: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            resolve(atob(str));
        }
        catch (e) {
            reject(e);
        }
    });
}
