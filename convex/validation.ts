export const LIMITS = {
  CAPTION_MAX: 2200,
  COMMENT_MAX: 1000,
  USERNAME_MAX: 30,
  BIO_MAX: 150,
} as const;

export function validateNonEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

export function validateMaxLength(
  value: string,
  max: number,
  fieldName: string
): void {
  if (value.length > max) {
    throw new Error(
      `${fieldName} exceeds maximum length of ${max} characters`
    );
  }
}

export function validateField(
  value: string,
  max: number,
  fieldName: string
): void {
  validateNonEmpty(value, fieldName);
  validateMaxLength(value, max, fieldName);
}
