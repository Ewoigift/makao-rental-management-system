import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a readable format
 * @param dateString - The date string to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(dateString);
  
  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('en-KE', defaultOptions);
}

/**
 * Calculate the difference between two dates in days
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Number of days between dates
 */
export function daysBetweenDates(startDate: string | Date, endDate: string | Date): number {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Convert to UTC to avoid timezone issues
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  // Calculate difference in milliseconds and convert to days
  const diffMs = endUtc - startUtc;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the occupancy rate
 * @param occupiedUnits - Number of occupied units
 * @param totalUnits - Total number of units
 * @returns Occupancy rate as a percentage
 */
export function calculateOccupancyRate(occupiedUnits: number, totalUnits: number): number {
  if (totalUnits === 0) return 0;
  return Math.round((occupiedUnits / totalUnits) * 100);
}

/**
 * Get the current month name
 * @returns Current month name
 */
export function getCurrentMonthName(): string {
  return new Date().toLocaleString('en-KE', { month: 'long' });
}

/**
 * Get the current year
 * @returns Current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Format a number as a percentage
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generate a random ID
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Get initials from a name
 * @param name - The full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
