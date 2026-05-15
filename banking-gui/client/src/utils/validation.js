/**
 * ============================================
 *  EUI Banking System — Validation Utilities
 * ============================================
 *  All validators return an error message string.
 *  An empty string '' means the value is valid.
 */

// ─── PHONE (Egyptian) ───────────────────────────────────────

export function validateEgyptianPhone(phone) {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required.';
  }

  const cleaned = phone.trim();

  // Check for non-digit characters
  if (!/^\d+$/.test(cleaned)) {
    return 'Phone must contain only digits (0-9).';
  }

  // Mobile: exactly 11 digits, starts with 010, 011, 012, or 015
  const isMobile = /^01[0125]\d{8}$/.test(cleaned);

  // Landline: 9 to 10 digits, starts with 0 followed by 2-9 (e.g., 02, 03)
  const isLandline = /^0[2-9]\d{7,8}$/.test(cleaned);

  if (!isMobile && !isLandline) {
    if (cleaned.startsWith('01')) {
      return 'Mobile numbers must be exactly 11 digits (e.g., 01012345678).';
    }
    return 'Invalid phone number. Landlines must be 9-10 digits, mobiles must be 11.';
  }

  return '';
}

export function validatePhones(phones) {
  return phones.map(phone => validateEgyptianPhone(phone));
}

// ─── EMAIL ───────────────────────────────────────────────────

export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return 'Email is required.';
  }
  const cleaned = email.trim();
  // Basic email regex
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return '';
}

// ─── NAME (First / Last) ────────────────────────────────────

export function validateName(name, label = 'Name') {
  if (!name || name.trim() === '') {
    return `${label} is required.`;
  }
  if (name.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }
  if (!/^[a-zA-Z\u00C0-\u024F\s'-]+$/.test(name.trim())) {
    return `${label} should only contain letters.`;
  }
  return '';
}

// ─── USERNAME ────────────────────────────────────────────────

export function validateUsername(username) {
  if (!username || username.trim() === '') {
    return 'Username is required.';
  }
  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters.';
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
    return 'Username may only contain letters, numbers, dots, underscores, and hyphens.';
  }
  return '';
}

// ─── PASSWORD ────────────────────────────────────────────────

export function validatePassword(password, label = 'Password') {
  if (!password) {
    return `${label} is required.`;
  }
  if (password.length < 3) {
    return `${label} must be at least 3 characters.`;
  }
  return '';
}

// ─── CONFIRM PASSWORD ────────────────────────────────────────

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your new password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
}

// ─── POSITIVE AMOUNT ─────────────────────────────────────────

export function validateAmount(amount, label = 'Amount', max = null) {
  if (amount === '' || amount === null || amount === undefined) {
    return `${label} is required.`;
  }
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return `${label} must be a positive number.`;
  }
  if (max !== null && num > max) {
    return `${label} cannot exceed $${max.toLocaleString()}.`;
  }
  return '';
}

// ─── ACCOUNT NUMBER ──────────────────────────────────────────

export function validateAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.trim() === '') {
    return 'Account number is required.';
  }
  if (!/^\d+$/.test(accountNumber.trim())) {
    return 'Account number must contain only digits.';
  }
  if (accountNumber.trim().length < 3) {
    return 'Account number seems too short.';
  }
  return '';
}

// ─── NATIONAL ID (Egyptian, 14 digits) ──────────────────────

export function validateNationalId(id) {
  if (!id || id.trim() === '') {
    return 'National ID is required.';
  }
  if (!/^\d{14}$/.test(id.trim())) {
    return 'National ID must be exactly 14 digits.';
  }
  return '';
}

// ─── REQUIRED FIELD ──────────────────────────────────────────

export function validateRequired(value, label = 'This field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${label} is required.`;
  }
  return '';
}

// ─── NON-NEGATIVE NUMBER ─────────────────────────────────────

export function validateNonNegative(value, label = 'Value') {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return `${label} must be a non-negative number.`;
  }
  return '';
}

// ─── CREDIT LIMIT ────────────────────────────────────────────

export function validateCreditLimit(limit) {
  if (limit === '' || limit === null || limit === undefined) {
    return 'Credit limit is required.';
  }
  const num = Number(limit);
  if (isNaN(num) || num < 100) {
    return 'Credit limit must be at least $100.';
  }
  if (num > 100000) {
    return 'Credit limit cannot exceed $100,000.';
  }
  return '';
}

// ─── SALARY ───────────────────────────────────────────────────

export function validateSalary(value, role, salaryRanges = {}) {
  if (value === '' || value === null || value === undefined) {
    return 'Salary is required.';
  }
  const num = Number(value);
  const range = salaryRanges[role] || { min: 0, max: Infinity };
  if (isNaN(num) || num < range.min || num > range.max) {
    if (range.max === Infinity) {
      return `Salary for ${role} must be at least $${range.min.toLocaleString()}.`;
    }
    return `Salary for ${role} must be between $${range.min.toLocaleString()} and $${range.max.toLocaleString()}.`;
  }
  return '';
}
