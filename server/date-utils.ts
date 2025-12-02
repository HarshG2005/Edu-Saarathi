// Safe date helper utility
export function toSafeISO(value: any): string | null {
    if (!value) return null;

    // If already a Date object
    if (value instanceof Date) {
        if (isNaN(value.getTime())) return null;
        return value.toISOString();
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toISOString();
        return null;
    }

    // If it's a number (timestamp)
    if (typeof value === 'number') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toISOString();
        return null;
    }

    return null;
}
