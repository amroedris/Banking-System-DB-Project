/**
 * Validates Egyptian phone numbers.
 * Rules:
 * - Mobile: Must be exactly 11 digits starting with 010, 011, 012, or 015
 * - Landline: Must be 9-10 digits starting with 0 (but not 01)
 *
 * Returns an error message string, or empty string if valid.
 */
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

/**
 * Validates an array of phone numbers, returning an array of error messages
 * (empty string for valid entries).
 */
export function validatePhones(phones) {
  return phones.map(phone => validateEgyptianPhone(phone));
}