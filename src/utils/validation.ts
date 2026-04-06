/**
 * Validation utilities for client-side form validation
 * Matches backend validation rules exactly
 */

// Regex patterns (JavaScript compatible)
export const VALIDATION_PATTERNS = {
  firstName: /^[\p{L}\s'\-]+$/u,     // letters, spaces, hyphens, apostrophes
  lastName:  /^[\p{L}\s'\-]+$/u,     // letters, spaces, hyphens, apostrophes
  username:  /^[a-zA-Z][a-zA-Z0-9_]*$/,  // starts with letter, then letters/numbers/underscores
  alias:     /^[a-zA-Z0-9]+$/,       // alphanumeric only
  otp:       /^[0-9]{6}$/,           // exactly 6 digits
  email:     /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // basic email
  noSpaces:  /^[^\s]+$/,             // no whitespace
  sortDir:   /^(asc|desc)$/i,        // asc or desc (case-insensitive)
} as const;

// Field constraints
export const CONSTRAINTS = {
  firstName: { min: 1, max: 100, required: true },
  lastName: { min: 1, max: 100, required: true },
  username: { min: 3, max: 50, required: true },
  password: { min: 8, max: 255, required: true },
  invitationToken: { max: 255, required: true },
  email: { max: 255, required: true },
  token: { max: 255, required: true },
  alias: { min: 3, max: 10, required: false },
  otp: { min: 6, max: 6, required: true },
  url: { max: 2000, required: true },
} as const;

// Theme options
export const VALID_THEMES = ['LIGHT', 'DARK', 'OCEAN', 'FOREST'] as const;

// Sort options for URL list
export const VALID_SORT_FIELDS = ['id', 'originalUrl', 'shortCode', 'accessCount', 'createdAt'] as const;

/**
 * Validate a field against its pattern
 */
export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

/**
 * Validate first name
 */
export const validateFirstName = (value: string): string | null => {
  if (!value || !value.trim()) return 'First name is required';
  if (value.length > CONSTRAINTS.firstName.max) return `First name must be ${CONSTRAINTS.firstName.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.firstName)) {
    return 'First name must contain only letters, spaces, hyphens, or apostrophes';
  }
  return null;
};

/**
 * Validate last name
 */
export const validateLastName = (value: string): string | null => {
  if (!value || !value.trim()) return 'Last name is required';
  if (value.length > CONSTRAINTS.lastName.max) return `Last name must be ${CONSTRAINTS.lastName.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.lastName)) {
    return 'Last name must contain only letters, spaces, hyphens, or apostrophes';
  }
  return null;
};

/**
 * Validate username
 */
export const validateUsername = (value: string): string | null => {
  if (!value || !value.trim()) return 'Username is required';
  if (value.length < CONSTRAINTS.username.min) return `Username must be at least ${CONSTRAINTS.username.min} characters`;
  if (value.length > CONSTRAINTS.username.max) return `Username must be ${CONSTRAINTS.username.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.username)) {
    return 'Username must start with a letter and contain only letters, numbers, or underscores';
  }
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (value: string): string | null => {
  if (!value) return 'Password is required';
  if (value.length < CONSTRAINTS.password.min) return `Password must be at least ${CONSTRAINTS.password.min} characters`;
  return null;
};

/**
 * Validate email
 */
export const validateEmail = (value: string): string | null => {
  if (!value || !value.trim()) return 'Email is required';
  if (value.length > CONSTRAINTS.email.max) return `Email must be ${CONSTRAINTS.email.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.email)) {
    return 'Must be a valid email address';
  }
  return null;
};

/**
 * Validate OTP
 */
export const validateOtp = (value: string): string | null => {
  if (!value) return 'OTP is required';
  if (!validatePattern(value, VALIDATION_PATTERNS.otp)) {
    return 'OTP must be exactly 6 digits';
  }
  return null;
};

/**
 * Validate alias (optional field)
 */
export const validateAlias = (value: string): string | null => {
  if (!value || !value.trim()) return null; // optional
  if (value.length < CONSTRAINTS.alias.min) return `Alias must be at least ${CONSTRAINTS.alias.min} characters`;
  if (value.length > CONSTRAINTS.alias.max) return `Alias must be ${CONSTRAINTS.alias.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.alias)) {
    return 'Alias must contain only alphanumeric characters (letters and numbers, no special chars or spaces)';
  }
  return null;
};

/**
 * Validate URL
 */
export const validateUrl = (value: string): string | null => {
  if (!value || !value.trim()) return 'URL is required';
  if (value.length > CONSTRAINTS.url.max) return `URL must be ${CONSTRAINTS.url.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.noSpaces)) {
    return 'URL must not contain spaces';
  }
  return null;
};

/**
 * Validate theme
 */
export const validateTheme = (value: string): string | null => {
  if (!VALID_THEMES.includes(value as any)) {
    return `Theme must be one of: ${VALID_THEMES.join(', ')}`;
  }
  return null;
};

/**
 * Validate sort direction
 */
export const validateSortDirection = (value: string): string | null => {
  if (!validatePattern(value, VALIDATION_PATTERNS.sortDir)) {
    return 'Sort direction must be "asc" or "desc"';
  }
  return null;
};

/**
 * Validate sort field
 */
export const validateSortField = (value: string): string | null => {
  if (!VALID_SORT_FIELDS.includes(value as any)) {
    return `Sort field must be one of: ${VALID_SORT_FIELDS.join(', ')}`;
  }
  return null;
};

/**
 * Validate first name (optional, for profile update)
 */
export const validateFirstNameOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null; // optional
  if (value.length > CONSTRAINTS.firstName.max) return `First name must be ${CONSTRAINTS.firstName.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.firstName)) {
    return 'First name must contain only letters, spaces, hyphens, or apostrophes';
  }
  return null;
};

/**
 * Validate last name (optional, for profile update)
 */
export const validateLastNameOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null; // optional
  if (value.length > CONSTRAINTS.lastName.max) return `Last name must be ${CONSTRAINTS.lastName.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.lastName)) {
    return 'Last name must contain only letters, spaces, hyphens, or apostrophes';
  }
  return null;
};

/**
 * Validate email (optional, for profile update)
 */
export const validateEmailOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null; // optional
  if (value.length > CONSTRAINTS.email.max) return `Email must be ${CONSTRAINTS.email.max} characters or less`;
  if (!validatePattern(value, VALIDATION_PATTERNS.email)) {
    return 'Must be a valid email address';
  }
  return null;
};

/**
 * Validate password for delete account (min 8 chars)
 */
export const validatePasswordForDelete = (value: string): string | null => {
  if (!value) return 'Password is required';
  if (value.length < CONSTRAINTS.password.min) return `Password must be at least ${CONSTRAINTS.password.min} characters`;
  return null;
};

/**
 * Validate password for reset (min 8 chars, field name is "newPassword")
 */
export const validateNewPassword = (value: string): string | null => {
  if (!value) return 'New password is required';
  if (value.length < CONSTRAINTS.password.min) return `New password must be at least ${CONSTRAINTS.password.min} characters`;
  return null;
};

/**
 * Validate invitation token
 */
export const validateInvitationToken = (value: string): string | null => {
  if (!value || !value.trim()) return 'Invitation token is required';
  return null;
};

/**
 * Validate username or email (for OTP forms, optional max length check)
 */
export const validateUsernameOrEmail = (value: string): string | null => {
  if (!value || !value.trim()) return 'Username or email is required';
  return null;
};
