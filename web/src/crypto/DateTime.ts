export function FormatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return FormatDate(date);
}

export function FormatDate(date: Date): string {
    // yyyy-MM-dd HH:mm:ss
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}