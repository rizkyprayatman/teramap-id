import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function generateLetterNumber(
  prefix: string,
  counter: number,
  middle?: string,
  suffix?: string
): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const num = String(counter).padStart(4, "0");
  const parts = [num];
  if (prefix) parts.push(prefix);
  if (middle) parts.push(middle);
  parts.push(`${month}/${year}`);
  if (suffix) parts.push(suffix);
  return parts.join("/");
}

export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: Date | string): "active" | "warning" | "expired" {
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 0) return "expired";
  if (days <= 30) return "warning";
  return "active";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function generateBarcode(): string {
  const prefix = "TERA";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
