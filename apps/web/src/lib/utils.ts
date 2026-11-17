import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract the first letter of the first word for user avatars.
 * e.g., "Nico" -> "N", "Nico Pratama" -> "N", "  alexander  " -> "A"
 */
export function getAvatarInitial(name?: string | null, fallback = 'U'): string {
  if (!name) return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const firstWord = trimmed.split(/\s+/)[0] || '';
  const firstChar = firstWord.charAt(0) || fallback;
  return firstChar.toUpperCase();
}
