/**
 * Currency utility functions for the Makao Rental Management System
 */

/**
 * Format a number as currency (alias for formatKSh)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string): string {
  return formatKSh(amount);
}

/**
 * Format a number as Kenyan Shilling (KSh)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatKSh(amount: number | string, options: { 
  decimals?: number,
  includeSymbol?: boolean 
} = {}): string {
  const { 
    decimals = 2,
    includeSymbol = true
  } = options;
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return includeSymbol ? 'KSh 0.00' : '0.00';
  }
  
  const formatted = numAmount.toFixed(decimals);
  const parts = formatted.split('.');
  const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedAmount = parts.length > 1 ? `${wholePart}.${parts[1]}` : wholePart;
  
  return includeSymbol ? `KSh ${formattedAmount}` : formattedAmount;
}

/**
 * Parse a Kenyan Shilling string to a number
 * @param value - The KSh string to parse
 * @returns The numeric value
 */
export function parseKSh(value: string): number {
  // Remove KSh symbol and commas
  const cleanValue = value.replace(/KSh\s?|,/g, '');
  return parseFloat(cleanValue);
}
