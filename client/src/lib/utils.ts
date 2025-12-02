import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "Unknown date";

  // Handle the specific corruption reported by user, just in case
  if (typeof date === 'string' && (date === "value.tolSOString" || date.includes("tolSOString") || date.includes("TOLSOString"))) {
    return "Unknown date";
  }

  try {
    let d: Date;

    // If already a Date object
    if (date instanceof Date) {
      d = date;
    }
    // If it's a string
    else if (typeof date === 'string') {
      d = new Date(date);
    }
    // If it's a number (timestamp)
    else if (typeof date === 'number') {
      d = new Date(date);
    }
    // Otherwise, unsupported type
    else {
      return "Unknown date";
    }

    // Check if the date is valid
    if (isNaN(d.getTime())) return "Unknown date";

    return d.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return "Unknown date";
  }
}
