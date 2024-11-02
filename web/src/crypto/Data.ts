export type Utf8String = string;
export type HexString = string;
export type Base64String = string;

export function IsValidHexString(hex: string) {
    return /^([0-9a-fA-F][0-9a-fA-F])+$/.test(hex);
}
