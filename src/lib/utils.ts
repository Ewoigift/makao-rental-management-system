import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}

export function calculatePropertyRevenue(properties: any[]): number {
  return properties.reduce((total, property) => {
    if (property.units) {
      return total + property.units
        .filter((unit: any) => unit.status === "occupied")
        .reduce((sum: number, unit: any) => sum + unit.rent_amount, 0);
    }
    return total;
  }, 0);
}
