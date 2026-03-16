/**
 * Frontend logging utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: this.context,
      message,
      ...data,
    };
  }

  debug(message, data = {}) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.debug('[DEBUG]', this.formatMessage('DEBUG', message, data));
    }
  }

  info(message, data = {}) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.info('[INFO]', this.formatMessage('INFO', message, data));
    }
  }

  warn(message, data = {}) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', this.formatMessage('WARN', message, data));
    }
  }

  error(message, error = null, data = {}) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const errorData = {
        ...data,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : null,
      };
      console.error('[ERROR]', this.formatMessage('ERROR', message, errorData));
      
      // Send to error tracking service in production
      if (process.env.NODE_ENV === 'production') {
        this.sendToErrorTracking(message, error, errorData);
      }
    }
  }

  sendToErrorTracking(message, error, data) {
    // Implement error tracking service integration (e.g., Sentry)
    // For now, just log to console
    console.log('Would send to error tracking:', { message, error, data });
  }
}

// Create logger instances for different contexts
export const createLogger = (context) => new Logger(context);

// Default logger
export default new Logger('App');
