/**
 * Secure error handling and logging
 * Prevents sensitive information leaks while providing useful feedback
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public publicMessage?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, publicMessage?: string) {
    super(message, 400, publicMessage || message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'Authentication failed')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, 'Not authorized to perform this action')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'Too many requests. Please try again later.')
    this.name = 'RateLimitError'
  }
}

/**
 * Handles errors and returns appropriate response
 */
export function handleError(error: unknown) {
  console.error('[Error]', error)

  if (error instanceof AppError) {
    return {
      message: error.publicMessage || error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    // Log detailed error but return generic message to client
    console.error('[Unexpected Error]', error.message)
    return {
      message: 'An unexpected error occurred',
      statusCode: 500,
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  }
}

/**
 * Log action for audit trail
 */
export function logAudit(
  userId: string,
  action: string,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString()
  console.log(`[Audit] ${timestamp} | User: ${userId} | Action: ${action}`, details)
  // In production, this should be logged to a proper logging service
}

/**
 * Validate that user owns resource
 */
export function validateOwnership(
  resourceUserId: string,
  currentUserId: string
): void {
  if (resourceUserId !== currentUserId) {
    throw new AuthorizationError('Not authorized to access this resource')
  }
}
