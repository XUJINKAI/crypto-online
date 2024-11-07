import moment from "moment";

export function FormatTimestamp(timestamp: number | null): string {
    if (timestamp === null) {
        return "";
    }
    const date = new Date(timestamp);
    return FormatDate(date);
}

export function FormatDate(date: Date): string {
    // yyyy-MM-dd HH:mm:ss
    return (moment(date)).format('YYYY-MM-DD HH:mm:ss');
}