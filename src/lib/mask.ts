// ==========================================
// Data Masking Utilities
// Role-based masking for sensitive data
// ==========================================

import type { Role } from '../types';

// Roles that can see unmasked sensitive data
const UNMASK_ROLES: Role[] = ['SUPERVISOR', 'ADMIN'];

/**
 * Check if role can view unmasked data
 */
export function canViewUnmasked(role: Role): boolean {
  return UNMASK_ROLES.includes(role);
}

/**
 * Mask NIK (16 digits) - show first 4 and last 2
 * Example: 1234567890123456 → 1234**********56
 */
export function maskNIK(nik: string, role: Role): string {
  if (canViewUnmasked(role)) return nik;
  if (!nik || nik.length < 6) return '****';
  return nik.slice(0, 4) + '*'.repeat(nik.length - 6) + nik.slice(-2);
}

/**
 * Mask account number - show last 4 digits only
 * Example: 1234567890 → ******7890
 */
export function maskAccount(account: string, role: Role): string {
  if (canViewUnmasked(role)) return account;
  if (!account || account.length < 4) return '****';
  return '*'.repeat(account.length - 4) + account.slice(-4);
}

/**
 * Mask email - show first 2 chars and domain
 * Example: john.doe@example.com → jo***@example.com
 */
export function maskEmail(email: string, role: Role): string {
  if (canViewUnmasked(role)) return email;
  if (!email || !email.includes('@')) return '***@***';
  
  const [local, domain] = email.split('@');
  if (local.length <= 2) return local + '***@' + domain;
  return local.slice(0, 2) + '***@' + domain;
}

/**
 * Mask phone number - show first 4 and last 2
 * Example: 081234567890 → 0812******90
 */
export function maskPhone(phone: string, role: Role): string {
  if (canViewUnmasked(role)) return phone;
  if (!phone || phone.length < 6) return '****';
  return phone.slice(0, 4) + '*'.repeat(phone.length - 6) + phone.slice(-2);
}

/**
 * Mask customer name - show first name only
 * Example: John Doe Smith → John ***
 */
export function maskName(name: string, role: Role): string {
  if (canViewUnmasked(role)) return name;
  if (!name) return '***';
  
  const parts = name.split(' ');
  if (parts.length === 1) return name;
  return parts[0] + ' ' + parts.slice(1).map(() => '***').join(' ');
}

// === Utility for masking all sensitive fields ===
export interface MaskedCustomer {
  id: string;
  cif: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  account_numbers: string[];
}

export function maskCustomerData(
  customer: {
    id: string;
    cif: string;
    name: string;
    nik: string;
    email: string;
    phone: string;
    account_numbers: string[];
  },
  role: Role
): MaskedCustomer {
  return {
    id: customer.id,
    cif: customer.cif,
    name: maskName(customer.name, role),
    nik: maskNIK(customer.nik, role),
    email: maskEmail(customer.email, role),
    phone: maskPhone(customer.phone, role),
    account_numbers: customer.account_numbers.map(acc => maskAccount(acc, role)),
  };
}
