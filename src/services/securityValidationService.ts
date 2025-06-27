
export class SecurityValidationService {
  
  /**
   * Validate user ID format
   */
  static isValidUserId(userId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  }

  /**
   * Sanitize address input
   */
  static sanitizeAddress(address: string): string {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address format');
    }
    
    // Remove potentially dangerous characters
    return address
      .trim()
      .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
      .substring(0, 500); // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Rate limiting check (basic implementation)
   */
  static checkRateLimit(userId: string, action: string): boolean {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const rateLimitWindow = 60000; // 1 minute
    const maxRequests = 10;

    // Get stored requests for this user/action
    const stored = localStorage.getItem(key);
    let requests: number[] = stored ? JSON.parse(stored) : [];

    // Remove old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < rateLimitWindow);

    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return false;
    }

    // Add current request
    requests.push(now);
    localStorage.setItem(key, JSON.stringify(requests));

    return true;
  }

  /**
   * Validate JSON input for potential injection
   */
  static sanitizeJsonInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeAddress(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJsonInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (typeof key === 'string' && key.length < 100) {
          sanitized[key.replace(/[<>'"]/g, '')] = this.sanitizeJsonInput(value);
        }
      }
      return sanitized;
    }
    
    return input;
  }
}
