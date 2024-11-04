export function GetFileDialog() {
    return new Promise<{ data: ArrayBuffer, name: string }>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const ori = e.target?.result as ArrayBuffer;
                    resolve({
                        data: ori,
                        name: file.name
                    });
                };
                reader.readAsArrayBuffer(file);
            } else {
                reject('No file selected');
            }
        };
        input.click();
    });
}

export function DownloadFile(data: ArrayBuffer, filename: string) {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}