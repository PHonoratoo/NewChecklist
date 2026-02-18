/**
 * Input validation and sanitization utilities
 * Ensures all user inputs are properly validated and safe
 */

export const VALIDATION_RULES = {
  MIN_TASK_LENGTH: 1,
  MAX_TASK_LENGTH: 500,
  MIN_GROUP_NAME: 1,
  MAX_GROUP_NAME: 50,
  MIN_PASSWORD_LENGTH: 8,
  COLOR_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .slice(0, 1000) // Hard limit on length
}

/**
 * Validate task title
 */
export function validateTaskTitle(title: string): {
  isValid: boolean
  error?: string
} {
  const sanitized = sanitizeInput(title)

  if (sanitized.length < VALIDATION_RULES.MIN_TASK_LENGTH) {
    return { isValid: false, error: 'Task title is required' }
  }

  if (sanitized.length > VALIDATION_RULES.MAX_TASK_LENGTH) {
    return {
      isValid: false,
      error: `Task title must be less than ${VALIDATION_RULES.MAX_TASK_LENGTH} characters`,
    }
  }

  return { isValid: true }
}

/**
 * Validate group name
 */
export function validateGroupName(name: string): {
  isValid: boolean
  error?: string
} {
  const sanitized = sanitizeInput(name)

  if (sanitized.length < VALIDATION_RULES.MIN_GROUP_NAME) {
    return { isValid: false, error: 'Group name is required' }
  }

  if (sanitized.length > VALIDATION_RULES.MAX_GROUP_NAME) {
    return {
      isValid: false,
      error: `Group name must be less than ${VALIDATION_RULES.MAX_GROUP_NAME} characters`,
    }
  }

  return { isValid: true }
}

/**
 * Validate color hex code
 */
export function validateColor(color: string): {
  isValid: boolean
  error?: string
} {
  if (!VALIDATION_RULES.COLOR_REGEX.test(color)) {
    return { isValid: false, error: 'Invalid color format' }
  }

  return { isValid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  isValid: boolean
  error?: string
} {
  const sanitized = sanitizeInput(email)

  if (!VALIDATION_RULES.EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  error?: string
  strength: 'weak' | 'medium' | 'strong'
} {
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      strength: 'weak',
      error: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`,
    }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*]/.test(password)

  const strengthScore =
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumbers ? 1 : 0) +
    (hasSpecialChar ? 1 : 0)

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (strengthScore >= 3) strength = 'strong'
  else if (strengthScore >= 2) strength = 'medium'

  return { isValid: strength !== 'weak', strength }
}

/**
 * Sanitize and validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Escape special characters in database queries
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/"/g, '\\"')
}

/**
 * Rate limiting helper (can be extended with Redis)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
